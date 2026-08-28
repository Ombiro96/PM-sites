import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { resolveClient } from "@/lib/brand/resolve";
import { getListings } from "@/lib/listings/source";
import { Container, Section } from "@/components/ui/primitives";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await resolveClient();
  return {
    title: `Areas we manage property in ${brand.contact.city}`,
    description: `The ${brand.contact.city} neighbourhoods ${brand.company.name} knows best, and what it is like to live in each.`,
    alternates: { canonical: "/areas" },
  };
}

export default async function AreasPage() {
  const client = await resolveClient();
  const { listings } = await getListings(client.brand, client.listings);

  const countByArea = new Map<string, number>();
  for (const listing of listings) {
    if (listing.availableUnits > 0) {
      countByArea.set(
        listing.areaSlug,
        (countByArea.get(listing.areaSlug) ?? 0) + listing.availableUnits,
      );
    }
  }

  return (
    <>
      <div className="border-b border-line bg-surface-muted">
        <Container className="py-12 sm:py-16">
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {client.brand.content.areas.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            {client.brand.content.areas.subheading}
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid gap-8 sm:grid-cols-2">
            {client.brand.content.areas.items.map((area) => {
              const available = countByArea.get(area.slug) ?? 0;
              return (
                <Link
                  key={area.slug}
                  href={`/areas/${area.slug}`}
                  className="group overflow-hidden rounded-brand-lg border border-line bg-surface"
                >
                  <div className="relative aspect-[16/9] bg-surface-muted">
                    {area.image ? (
                      <Image
                        src={area.image}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <h2 className="font-display text-xl font-semibold text-ink group-hover:text-brand">
                      {area.name}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {area.blurb}
                    </p>
                    <p className="mt-4 text-sm font-semibold text-accent">
                      {available > 0
                        ? `${available} available now`
                        : "No vacancies right now"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Areas", href: "/areas" },
        ]}
      />
    </>
  );
}
