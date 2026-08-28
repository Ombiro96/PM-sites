export type ListingCategory =
  | "apartment"
  | "bedsitter"
  | "studio"
  | "house"
  | "maisonette"
  | "townhouse"
  | "office"
  | "shop"
  | "godown";

export type ListingPhoto = { url: string; alt: string };

/**
 * A listing is a *unit type* within a property ("2 Bedroom Apartment at Riverside
 * Court"), not an individual unit. Availability and rent come from Bomahut;
 * photos, copy and amenities come from the marketing layer.
 */
export type Listing = {
  /** `${propertySlug}--${unitTypeSlug}` — stable across syncs. */
  id: string;
  slug: string;
  title: string;
  propertyName: string;
  propertySlug: string;
  area: string;
  areaSlug: string;
  city: string;
  category: ListingCategory;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: number | null;
  /** Monthly rent in the account's currency. */
  rent: number;
  currency: string;
  depositMonths: number | null;
  availableUnits: number;
  availableFrom: string | null;
  amenities: string[];
  description: string;
  photos: ListingPhoto[];
  featured: boolean;
};

export type ListingFilters = {
  q?: string;
  area?: string;
  category?: ListingCategory;
  bedrooms?: number;
  minRent?: number;
  maxRent?: number;
  sort?: "newest" | "rent-asc" | "rent-desc" | "beds-desc";
};

export type ListingsResult = {
  listings: Listing[];
  /** Where the data came from — surfaced in dev, never rendered in prod. */
  source: "backend" | "fixtures";
  /** Set when the backend was reachable but returned an error. */
  warning: string | null;
};
