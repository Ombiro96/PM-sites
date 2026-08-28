import type { Listing, ListingFilters } from "./types";

export function filterListings(
  listings: Listing[],
  filters: ListingFilters,
): Listing[] {
  const q = filters.q?.trim().toLowerCase();

  const filtered = listings.filter((listing) => {
    if (filters.area && listing.areaSlug !== filters.area) return false;
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.bedrooms !== undefined) {
      if (listing.bedrooms === null) return false;
      // A bedrooms filter of 4 means "4 or more".
      if (filters.bedrooms >= 4 ? listing.bedrooms < 4 : listing.bedrooms !== filters.bedrooms) {
        return false;
      }
    }
    if (filters.minRent !== undefined && listing.rent < filters.minRent) return false;
    if (filters.maxRent !== undefined && listing.rent > filters.maxRent) return false;
    if (q) {
      const haystack = [
        listing.title,
        listing.propertyName,
        listing.area,
        listing.city,
        listing.category,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return sortListings(filtered, filters.sort);
}

export function sortListings(
  listings: Listing[],
  sort: ListingFilters["sort"],
): Listing[] {
  const sorted = [...listings];
  switch (sort) {
    case "rent-asc":
      return sorted.sort((a, b) => a.rent - b.rent);
    case "rent-desc":
      return sorted.sort((a, b) => b.rent - a.rent);
    case "beds-desc":
      return sorted.sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0));
    default:
      // Available first, then featured, then cheapest — the order a house
      // hunter actually wants.
      return sorted.sort((a, b) => {
        const available = Number(b.availableUnits > 0) - Number(a.availableUnits > 0);
        if (available !== 0) return available;
        const featured = Number(b.featured) - Number(a.featured);
        if (featured !== 0) return featured;
        return a.rent - b.rent;
      });
  }
}
