import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/brand/resolve";
import { getListings } from "@/lib/listings/source";
import { sortListings } from "@/lib/listings/filter";
import { ListingCard } from "@/components/listings/ListingCard";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import {
  ButtonLink,
  Card,
  Container,
  Section,
} from "@/components/ui/primitives";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const { clients } = await import("@/clients");
  return clients.flatMap((client) =>
    client.brand.content.areas.items.map((area) => ({ slug: area.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const { brand } = await resolveClient();
  const area = brand.content.areas.items.find((item) => item.slug === slug);
  if (!area) return { title: "Area not found" };

  return {
    // The SEO wedge: "<type> to rent in <area>" is what people actually search.
    title: `Houses & apartments to rent in ${area.name}`,
    description: `${area.blurb} Available rentals in ${area.name} managed by ${brand.company.name}.`,
    alternates: { canonical: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: { params: Params }) {
  const { slug } = await params;
  const client = await resolveClient();
  const area = client.brand.content.areas.items.find((item) => item.slug === slug);
  if (!area) notFound();

  const { listings } = await getListings(client.brand, client.listings);
  const inArea = sortListings(
    listings.filter((listing) => listing.areaSlug === area.slug),
    undefined,
  );

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-deep">
        {area.image ? (
          <Image
            src={area.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
        ) : null}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary-deep)] to-transparent"
        />
        <Container className="relative py-20 sm:py-28">
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            {client.brand.contact.city}
          </p>
          <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">
            Renting in {area.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            {area.blurb}
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          <h2 className="font-display text-2xl font-semibold text-ink">
            {inArea.length > 0
              ? `Homes in ${area.name}`
              : `No homes listed in ${area.name} right now`}
          </h2>

          {inArea.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {inArea.map((listing, index) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  priority={index < 3}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-8 p-10 text-center">
              <p className="text-ink-muted">
                We manage property in {area.name}, but everything is currently
                let. Register your requirements and we will call you first.
              </p>
              <ButtonLink href="/properties" variant="secondary" className="mt-6">
                Browse other areas
              </ButtonLink>
            </Card>
          )}
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Looking for something specific in {area.name}?
          </h2>
          <p className="mt-3 text-ink-muted">
            Tell us your budget and timing. We will call you when a match comes
            up — often before it is advertised.
          </p>
          <div className="mt-8">
            <EnquiryForm
              defaultSubject="general"
              defaultMessage={`I am looking for a home in ${area.name}. `}
            />
          </div>
        </Container>
      </Section>

      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Areas", href: "/areas" },
          { name: area.name, href: `/areas/${area.slug}` },
        ]}
      />
    </>
  );
}
