import "server-only";
import type { Brand } from "@/lib/brand/types";
import { fetchVacancies } from "@/lib/backend/vacancies";
import { matchesUnit, type ListingContent } from "./content";
import type { Listing, ListingsResult } from "./types";

function toListing(
  content: ListingContent,
  overrides: { rent: number; currency: string; availableUnits: number; propertyName: string; city: string },
): Listing {
  return {
    id: `${content.propertyMatch}--${content.slug}`,
    slug: content.slug,
    title: content.title,
    propertyName: overrides.propertyName,
    propertySlug: content.propertyMatch
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    area: content.area,
    areaSlug: content.areaSlug,
    city: overrides.city,
    category: content.category,
    bedrooms: content.bedrooms,
    bathrooms: content.bathrooms,
    sizeSqm: content.sizeSqm,
    rent: overrides.rent,
    currency: overrides.currency,
    depositMonths: content.depositMonths,
    availableUnits: overrides.availableUnits,
    availableFrom: null,
    amenities: content.amenities,
    description: content.description,
    photos: content.photos,
    featured: content.featured,
  };
}

/** Everything the marketing layer knows, with no live availability attached. */
function fixtureListings(content: ListingContent[], currency: string): Listing[] {
  return content.map((item) =>
    toListing(item, {
      rent: item.fallbackRent,
      currency,
      availableUnits: 0,
      propertyName: item.propertyMatch,
      city: "",
    }),
  );
}

/**
 * Live vacancies from Bomahut, dressed in the property manager's marketing
 * content. If the backend is unreachable the site still renders the full
 * catalogue — it simply shows nothing as available.
 */
export async function getListings(
  brand: Brand,
  content: ListingContent[],
): Promise<ListingsResult> {
  const currency = "KES";

  try {
    const properties = await fetchVacancies(brand.accountNumber);
    const byName = new Map(properties.map((p) => [p.name.trim().toLowerCase(), p]));

    const listings = content.map((item) => {
      const property = byName.get(item.propertyMatch.trim().toLowerCase());
      const units = (property?.vacantUnits ?? []).filter((unit) =>
        matchesUnit(item, unit),
      );
      const rents = units.map((u) => Number(u.rentAmount)).filter((r) => r > 0);

      return toListing(item, {
        rent: rents.length > 0 ? Math.min(...rents) : item.fallbackRent,
        currency: property?.currency ?? currency,
        availableUnits: units.length,
        propertyName: property?.name ?? item.propertyMatch,
        city: property?.city ?? "",
      });
    });

    return { listings, source: "backend", warning: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend unavailable";
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[PM-Sites] vacancy fetch failed: ${message}`);
    }
    return {
      listings: fixtureListings(content, currency),
      source: "fixtures",
      warning: message,
    };
  }
}
