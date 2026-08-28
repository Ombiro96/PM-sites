import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/brand/resolve";
import { getListings } from "@/lib/listings/source";
import type { Listing } from "@/lib/listings/types";
import { formatMoney, telHref } from "@/lib/utils";
import { ListingGallery } from "@/components/listings/ListingGallery";
import { ListingCard } from "@/components/listings/ListingCard";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  Section,
} from "@/components/ui/primitives";
import { BreadcrumbSchema, ListingSchema } from "@/components/seo/StructuredData";

type Params = Promise<{ slug: string }>;

async function findListing(slug: string): Promise<{
  listing: Listing | null;
  all: Listing[];
}> {
  const client = await resolveClient();
  const { listings } = await getListings(client.brand, client.listings);
  return {
    listing: listings.find((item) => item.slug === slug) ?? null,
    all: listings,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const { listing } = await findListing(slug);
  if (!listing) return { title: "Property not found" };

  const title = `${listing.title} to rent in ${listing.area}`;
  return {
    title,
    description: listing.description.slice(0, 155),
    alternates: { canonical: `/properties/${listing.slug}` },
    openGraph: {
      title,
      description: listing.description.slice(0, 155),
      images: listing.photos[0] ? [listing.photos[0].url] : undefined,
    },
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

export default async function ListingPage({ params }: { params: Params }) {
  const { slug } = await params;
  const client = await resolveClient();
  const { listing, all } = await findListing(slug);

  if (!listing) notFound();

  const related = all
    .filter((item) => item.slug !== listing.slug && item.areaSlug === listing.areaSlug)
    .slice(0, 3);

  const available = listing.availableUnits > 0;

  return (
    <>
      <Container className="pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-brand">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/properties" className="hover:text-brand">
                Properties
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-ink">{listing.title}</li>
          </ol>
        </nav>
      </Container>

      <Section className="pt-8 pb-16 sm:pt-10">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            <div>
              <ListingGallery photos={listing.photos} />

              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-2">
                  {available ? (
                    <Badge tone="available">
                      {listing.availableUnits === 1
                        ? "1 unit available"
                        : `${listing.availableUnits} units available`}
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Currently fully let</Badge>
                  )}
                  <Badge tone="neutral">{listing.area}</Badge>
                </div>

                <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
                  {listing.title}
                </h1>
                <p className="mt-2 text-lg text-ink-muted">
                  {listing.propertyName}
                  {listing.city ? `, ${listing.city}` : ""}
                </p>

                <div className="mt-8 prose-none max-w-2xl text-base leading-relaxed text-ink-muted">
                  {listing.description}
                </div>

                {listing.amenities.length > 0 ? (
                  <div className="mt-10">
                    <h2 className="font-display text-xl font-semibold text-ink">
                      What is included
                    </h2>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {listing.amenities.map((amenity) => (
                        <li
                          key={amenity}
                          className="flex items-center gap-2.5 text-sm text-ink-muted"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 shrink-0 text-accent"
                            aria-hidden="true"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <Card className="p-6">
                <p className="text-sm text-ink-muted">Rent from</p>
                <p className="mt-1 font-display text-3xl font-semibold text-brand">
                  {formatMoney(listing.rent, listing.currency)}
                  <span className="ml-1 text-base font-normal text-ink-muted">
                    / month
                  </span>
                </p>

                <dl className="mt-6">
                  {listing.bedrooms !== null ? (
                    <DetailRow label="Bedrooms" value={String(listing.bedrooms)} />
                  ) : null}
                  {listing.bathrooms !== null ? (
                    <DetailRow label="Bathrooms" value={String(listing.bathrooms)} />
                  ) : null}
                  {listing.sizeSqm !== null ? (
                    <DetailRow label="Size" value={`${listing.sizeSqm} sqm`} />
                  ) : null}
                  {listing.depositMonths !== null ? (
                    <DetailRow
                      label="Deposit"
                      value={`${listing.depositMonths} month${listing.depositMonths === 1 ? "" : "s"}`}
                    />
                  ) : null}
                  <DetailRow label="Area" value={listing.area} />
                </dl>

                <div className="mt-6 grid gap-2">
                  <ButtonLink href="#enquire" size="lg">
                    {available ? "Book a viewing" : "Register interest"}
                  </ButtonLink>
                  <a
                    href={telHref(client.brand.contact.phone)}
                    className="py-2 text-center text-sm font-semibold text-brand hover:text-accent"
                  >
                    Or call {client.brand.contact.phoneDisplay}
                  </a>
                </div>
              </Card>

              <Card className="mt-6 p-6" id="enquire">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Enquire about this home
                </h2>
                <p className="mt-1.5 mb-5 text-sm text-ink-muted">
                  We reply during office hours, usually the same day.
                </p>
                <EnquiryForm
                  compact
                  listingSlug={listing.slug}
                  listingTitle={`${listing.title} — ${listing.propertyName}`}
                  defaultSubject="viewing"
                />
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="muted">
          <Container>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Other homes in {listing.area}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <ListingSchema client={client} listing={listing} />
      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Properties", href: "/properties" },
          { name: listing.title, href: `/properties/${listing.slug}` },
        ]}
      />
    </>
  );
}
