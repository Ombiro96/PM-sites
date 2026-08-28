import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveClient } from "@/lib/brand/resolve";
import { getListings } from "@/lib/listings/source";
import { filterListings } from "@/lib/listings/filter";
import type { ListingCategory, ListingFilters } from "@/lib/listings/types";
import { ListingCard } from "@/components/listings/ListingCard";
import { ListingFilters as FiltersPanel } from "@/components/listings/ListingFilters";
import {
  ButtonLink,
  Card,
  Container,
  Section,
} from "@/components/ui/primitives";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await resolveClient();
  return {
    title: `Houses & apartments to rent in ${brand.contact.city}`,
    description: `Browse available rentals managed by ${brand.company.name}. Live availability, honest rents and a straight enquiry path.`,
    alternates: { canonical: "/properties" },
  };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readString(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const client = await resolveClient();
  const params = await searchParams;
  const { listings, source } = await getListings(client.brand, client.listings);

  const filters: ListingFilters = {
    q: readString(params.q),
    area: readString(params.area),
    category: readString(params.category) as ListingCategory | undefined,
    bedrooms: readNumber(params.bedrooms),
    minRent: readNumber(params.minRent),
    maxRent: readNumber(params.maxRent),
    sort: readString(params.sort) as ListingFilters["sort"],
  };

  const results = filterListings(listings, filters);

  return (
    <>
      <div className="border-b border-line bg-surface-muted">
        <Container className="py-12 sm:py-16">
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Available homes
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Availability and rent are read directly from our management system.
            If a home is listed as available, it is genuinely free.
          </p>
        </Container>
      </div>

      <Section className="py-10 sm:py-14">
        <Container>
          <Suspense fallback={null}>
            <FiltersPanel
              areas={client.brand.content.areas.items}
              resultCount={results.length}
            />
          </Suspense>

          {source === "fixtures" ? (
            <p className="mt-4 rounded-brand border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Live availability is temporarily unavailable. The homes below are
              our full catalogue — please call to confirm what is free.
            </p>
          ) : null}

          {results.length === 0 ? (
            <Card className="mt-8 p-12 text-center">
              <h2 className="font-display text-xl font-semibold text-ink">
                Nothing matches that search yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
                Try widening the area or budget. Or tell us what you need and we
                will call you when something opens up.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/properties" variant="secondary">
                  Clear filters
                </ButtonLink>
                <ButtonLink href="/contact">Register your requirements</ButtonLink>
              </div>
            </Card>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((listing, index) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  priority={index < 3}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Properties", href: "/properties" },
        ]}
      />
    </>
  );
}
