import { Cache, getPreferenceValues } from "@raycast/api";
import type { CatalogItem, GearDetails, SearchItem, Specification, SpecificationRegistry } from "./types";

const API_BASE = "https://www.sharplyphoto.com/api/v1";
const SPEC_FIELDS = [
  "gear.basics",
  "camera.sensor",
  "camera.shutter",
  "camera.fixed-lens",
  "camera.build",
  "camera.focus",
  "camera.power",
  "camera.video",
  "camera.features",
  "lens.optics",
  "lens.aperture",
  "lens.focus",
  "lens.stabilization",
  "lens.build",
  "lens.filters",
  "lens.accessories",
  "lens.tiltShift",
  "analog.camera",
].join(",");

const registryCache = new Cache({ namespace: "sharply-api" });
const REGISTRY_KEY = "specification-registry-v1";

type Preferences = { apiKey: string };
type ApiEnvelope<T> = { data: T };

export class SharplyApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "SharplyApiError";
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const { apiKey } = getPreferenceValues<Preferences>();
  const response = await fetch(`${API_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    let message = `Sharply API request failed (HTTP ${response.status}).`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      message = body.error?.message || message;
    } catch {
      // Keep the status-based message for a non-JSON error response.
    }
    throw new SharplyApiError(message, response.status);
  }

  return (await response.json()) as T;
}

function guessedSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function trySpecifications(slug: string, signal?: AbortSignal): Promise<Specification[] | undefined> {
  try {
    const response = await request<ApiEnvelope<Specification[]>>(
      `gear/${slug}/specs?fields=${encodeURIComponent(SPEC_FIELDS)}`,
      signal,
    );
    return response.data;
  } catch (error) {
    if (error instanceof SharplyApiError && error.status === 404) return undefined;
    throw error;
  }
}

async function exactSearch(item: CatalogItem, signal?: AbortSignal): Promise<SearchItem | undefined> {
  const response = await request<ApiEnvelope<SearchItem[]>>(
    `search?q=${encodeURIComponent(item.name)}&page=1&limit=25`,
    signal,
  );
  const candidates = response.data.filter((entry) => /CAMERA|LENS/.test(entry.gearType || ""));
  return (
    candidates.find((entry) => entry.name === item.name && (!item.brand || entry.brandName === item.brand)) ||
    candidates.find((entry) => entry.name === item.name)
  );
}

async function specificationLabels(signal?: AbortSignal): Promise<Record<string, string>> {
  const cached = registryCache.get(REGISTRY_KEY);
  if (cached) return JSON.parse(cached) as Record<string, string>;

  const registry = await request<SpecificationRegistry>("specs", signal);
  const labels = Object.fromEntries(
    registry.data.categories.flatMap((category) => category.fields.map((field) => [field.id, field.label])),
  );
  registryCache.set(REGISTRY_KEY, JSON.stringify(labels));
  return labels;
}

export async function loadGearDetails(item: CatalogItem, signal?: AbortSignal): Promise<GearDetails> {
  const guess = guessedSlug(item.name);
  const guessedSpecificationsPromise = trySpecifications(guess, signal);
  const searchResultPromise = exactSearch(item, signal);
  const labelsPromise = specificationLabels(signal);
  const [guessedSpecifications, labels] = await Promise.all([guessedSpecificationsPromise, labelsPromise]);

  if (guessedSpecifications) {
    // Search only enriches a successful guessed slug with a thumbnail. It must
    // not make otherwise-valid specifications fail when image lookup is down.
    const searchResult = await searchResultPromise.catch(() => undefined);
    return {
      slug: guess,
      thumbnailUrl: searchResult?.slug === guess ? searchResult.thumbnailUrl : undefined,
      specifications: guessedSpecifications,
      labels,
    };
  }

  const searchResult = await searchResultPromise;
  if (!searchResult?.slug) throw new SharplyApiError("Could not resolve this item to a published gear page.");
  const specifications = await trySpecifications(searchResult.slug, signal);
  if (!specifications) throw new SharplyApiError("Sharply has no published specifications for this item.");

  return {
    slug: searchResult.slug,
    thumbnailUrl: searchResult.thumbnailUrl,
    specifications,
    labels,
  };
}
