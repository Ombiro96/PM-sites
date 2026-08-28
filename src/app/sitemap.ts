import type { MetadataRoute } from "next";
import { resolveClient, canonicalOrigin } from "@/lib/brand/resolve";
import { getListings } from "@/lib/listings/source";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = await resolveClient();
  const origin = canonicalOrigin(client);
  const { listings } = await getListings(client.brand, client.listings);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${origin}/areas`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${origin}/services`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${origin}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${origin}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const areaPages: MetadataRoute.Sitemap = client.brand.content.areas.items.map(
    (area) => ({
      url: `${origin}/areas/${area.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${origin}/properties/${listing.slug}`,
    changeFrequency: "daily",
    priority: listing.availableUnits > 0 ? 0.8 : 0.4,
  }));

  return [...staticPages, ...areaPages, ...listingPages];
}
