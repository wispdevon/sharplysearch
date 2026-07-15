import { Action, ActionPanel, Icon, List, openExtensionPreferences } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import catalog from "../assets/catalog.json";
import { loadGearDetails } from "./api";
import type { CatalogItem } from "./types";

const SITE = "https://www.sharplyphoto.com";
const items = (catalog as { items: CatalogItem[] }).items;

function GearSpecifications({ item }: { item: CatalogItem }) {
  const { data, error, isLoading, revalidate } = usePromise(loadGearDetails, [item]);

  if (error) {
    return (
      <List navigationTitle={item.name} isLoading={isLoading}>
        <List.EmptyView
          icon={Icon.Warning}
          title="Could Not Load Specifications"
          description={error.message}
          actions={
            <ActionPanel>
              <Action title="Try Again" icon={Icon.ArrowClockwise} onAction={revalidate} />
              <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  const imageUrl = data?.thumbnailUrl
    ? `${data.thumbnailUrl}${data.thumbnailUrl.includes("?") ? "&" : "?"}raycast-width=520`
    : undefined;
  const markdown = imageUrl
    ? `![${item.name}](${imageUrl})\n\n# ${item.name}\n\n${item.brand || ""}`
    : `# ${item.name}\n\n${item.brand || ""}`;

  return (
    <List
      navigationTitle={item.name}
      searchBarPlaceholder="Filter specifications"
      isLoading={isLoading}
      isShowingDetail
    >
      {data?.specifications.map((specification) => {
        const label = data.labels[specification.id] || specification.id;
        const copyValue = `${label}: ${specification.display}`;
        return (
          <List.Item
            key={specification.id}
            title={label}
            subtitle={specification.display}
            keywords={[specification.display]}
            detail={<List.Item.Detail markdown={markdown} />}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard title="Copy Specification" content={copyValue} />
                <Action.OpenInBrowser title="Open Full Sharply Page" url={`${SITE}/gear/${data.slug}`} />
                <Action title="Reload Specifications" icon={Icon.ArrowClockwise} onAction={revalidate} />
              </ActionPanel>
            }
          />
        );
      })}
      {!isLoading && data?.specifications.length === 0 ? (
        <List.EmptyView
          title="No Published Specifications"
          description="Sharply has no specifications for this item."
        />
      ) : null}
    </List>
  );
}

export default function SearchGear() {
  return (
    <List searchBarPlaceholder="Search cameras, lenses, brands, or mounts" throttle>
      {items.map((item, index) => {
        const mounts = item.mounts?.join(", ") || "";
        return (
          <List.Item
            key={`${item.brand || "unknown"}-${item.name}-${index}`}
            icon={Icon.Camera}
            title={item.name}
            subtitle={item.brand}
            keywords={[item.brand || "", ...(item.mounts || [])]}
            accessories={mounts ? [{ text: mounts }] : undefined}
            actions={
              <ActionPanel>
                <Action.Push
                  title="View Specifications"
                  icon={Icon.Sidebar}
                  target={<GearSpecifications item={item} />}
                />
                <Action.OpenInBrowser
                  title="Search on Sharply"
                  url={`${SITE}/search?q=${encodeURIComponent(item.name)}`}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
