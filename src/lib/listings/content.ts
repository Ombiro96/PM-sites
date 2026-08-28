import type { ListingCategory, ListingPhoto } from "./types";

/**
 * Marketing content for a unit type. Bomahut is the source of truth for
 * availability and rent; everything a prospective tenant wants to see — photos,
 * copy, amenities, room counts — lives here until the shopfront model ships in
 * the backend, at which point this shape becomes the API response shape.
 */
export type ListingContent = {
  slug: string;
  /** Exact `Property.name` in Bomahut. Used to bind content to live vacancies. */
  propertyMatch: string;
  title: string;
  category: ListingCategory;
  area: string;
  areaSlug: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: number | null;
  depositMonths: number | null;
  amenities: string[];
  description: string;
  photos: ListingPhoto[];
  featured: boolean;
  /**
   * Narrows which vacant units of the property belong to this unit type.
   * Omit to match every vacant unit in the property.
   */
  match?: {
    /** Case-insensitive regex tested against `Unit.unit_name`. */
    unitNamePattern?: string;
    minRent?: number;
    maxRent?: number;
  };
  /** Shown when the backend has no live vacancy for this unit type. */
  fallbackRent: number;
};

export function matchesUnit(
  content: ListingContent,
  unit: { unitName: string; rentAmount: number },
): boolean {
  const rule = content.match;
  if (!rule) return true;
  if (rule.minRent !== undefined && unit.rentAmount < rule.minRent) return false;
  if (rule.maxRent !== undefined && unit.rentAmount > rule.maxRent) return false;
  if (rule.unitNamePattern) {
    try {
      if (!new RegExp(rule.unitNamePattern, "i").test(unit.unitName)) return false;
    } catch {
      return false;
    }
  }
  return true;
}
