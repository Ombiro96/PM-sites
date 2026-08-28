import type { Client } from "@/clients";
import type { Listing } from "@/lib/listings/types";
import { canonicalOrigin } from "@/lib/brand/resolve";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is assembled from our own config, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema({ client }: { client: Client }) {
  const { brand } = client;
  const origin = canonicalOrigin(client);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: brand.company.legalName,
        alternateName: brand.company.name,
        url: origin,
        description: brand.seo.description,
        telephone: brand.contact.phone,
        email: brand.contact.email,
        areaServed: brand.content.areas.items.map((area) => ({
          "@type": "Place",
          name: area.name,
        })),
        address: {
          "@type": "PostalAddress",
          streetAddress: brand.contact.addressLines.join(", "),
          addressLocality: brand.contact.city,
          addressCountry: "KE",
        },
        sameAs: Object.values(brand.social).filter(Boolean),
      }}
    />
  );
}

export function ListingSchema({
  client,
  listing,
}: {
  client: Client;
  listing: Listing;
}) {
  const origin = canonicalOrigin(client);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Apartment",
        name: `${listing.title} — ${listing.propertyName}`,
        description: listing.description,
        url: `${origin}/properties/${listing.slug}`,
        image: listing.photos.map((photo) => photo.url),
        numberOfBedrooms: listing.bedrooms ?? undefined,
        numberOfBathroomsTotal: listing.bathrooms ?? undefined,
        floorSize: listing.sizeSqm
          ? { "@type": "QuantitativeValue", value: listing.sizeSqm, unitCode: "MTK" }
          : undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: listing.area,
          addressRegion: listing.city || client.brand.contact.city,
          addressCountry: "KE",
        },
        offers: {
          "@type": "Offer",
          price: listing.rent,
          priceCurrency: listing.currency,
          availability:
            listing.availableUnits > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          businessFunction: "https://schema.org/LeaseOut",
        },
      }}
    />
  );
}

export function BreadcrumbSchema({
  client,
  trail,
}: {
  client: Client;
  trail: { name: string; href: string }[];
}) {
  const origin = canonicalOrigin(client);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${origin}${item.href}`,
        })),
      }}
    />
  );
}

export function FaqSchema({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  if (faqs.length === 0) return null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}
