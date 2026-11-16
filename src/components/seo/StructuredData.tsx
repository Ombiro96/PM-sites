import type { CompanyFacts } from "@/lib/site/types";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is assembled from our own config, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema({
  facts,
  origin,
  description,
}: {
  facts: CompanyFacts;
  origin: string;
  description?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: facts.display_name,
        url: origin,
        description,
        telephone: facts.phone,
        email: facts.email ?? undefined,
        areaServed: facts.areas_served.map((area) => ({
          "@type": "Place",
          name: area,
        })),
        address: facts.office_address
          ? {
              "@type": "PostalAddress",
              streetAddress: facts.office_address,
              addressCountry: "KE",
            }
          : undefined,
        sameAs: Object.values(facts.social_links),
      }}
    />
  );
}

export function BreadcrumbSchema({
  origin,
  trail,
}: {
  origin: string;
  trail: { name: string; href: string }[];
}) {
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
