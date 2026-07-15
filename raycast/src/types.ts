export type CatalogItem = {
  name: string;
  brand?: string;
  mounts?: string[];
};

export type SearchItem = {
  name?: string;
  brandName?: string;
  gearType?: string;
  slug?: string;
  thumbnailUrl?: string;
};

export type Specification = {
  id: string;
  display: string;
};

export type SpecificationRegistry = {
  data: {
    categories: Array<{
      fields: Array<{ id: string; label: string }>;
    }>;
  };
};

export type GearDetails = {
  slug: string;
  thumbnailUrl?: string;
  specifications: Specification[];
  labels: Record<string, string>;
};
