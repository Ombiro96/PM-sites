import { resolveClient } from "@/lib/brand/resolve";
import { getListings } from "@/lib/listings/source";
import { sortListings } from "@/lib/listings/filter";
import { Hero } from "@/components/home/Hero";
import {
  Areas,
  ClosingCta,
  FeaturedListings,
  ServicesPreview,
  Stats,
  Testimonials,
  ValueProps,
} from "@/components/home/sections";
import { FaqSchema } from "@/components/seo/StructuredData";

export default async function HomePage() {
  const client = await resolveClient();
  const { listings } = await getListings(client.brand, client.listings);
  const featured = sortListings(listings, undefined).slice(0, 6);

  return (
    <>
      <Hero brand={client.brand} />
      <Stats brand={client.brand} />
      <FeaturedListings
        listings={featured}
        emptyMessage="Everything we manage is currently let. Send us your requirements and we will call you the moment something opens up."
      />
      <ValueProps brand={client.brand} />
      <Areas brand={client.brand} />
      <ServicesPreview brand={client.brand} />
      <Testimonials brand={client.brand} />
      <ClosingCta brand={client.brand} />
      <FaqSchema faqs={client.brand.content.faqs} />
    </>
  );
}
