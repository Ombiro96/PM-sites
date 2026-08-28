import type { Metadata } from "next";
import Image from "next/image";
import { resolveClient } from "@/lib/brand/resolve";
import {
  Container,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { ClosingCta } from "@/components/home/sections";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await resolveClient();
  return {
    title: `About ${brand.company.name}`,
    description: brand.content.about.lead,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const client = await resolveClient();
  const { about, faqs, stats } = client.brand.content;

  return (
    <>
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                {about.heading}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-ink">{about.lead}</p>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-muted">
                {about.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </div>

            {about.image ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-brand-lg bg-surface-muted">
                <Image
                  src={about.image}
                  alt={about.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>

          {stats.length > 0 ? (
            <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl font-semibold text-brand">
                      {stat.value}
                    </span>
                    <span className="mt-2 block text-sm text-ink-muted">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </Container>
      </Section>

      {faqs.length > 0 ? (
        <Section tone="muted">
          <Container>
            <SectionHeading
              heading="Questions we get asked"
              subheading="If yours is not here, call us — we would rather answer it now than after you move in."
            />
            <div className="mt-10 max-w-3xl divide-y divide-line rounded-brand-lg border border-line bg-surface">
              {faqs.map((faq) => (
                <details key={faq.question} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-ink">
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className="text-accent transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <ClosingCta brand={client.brand} />

      <FaqSchema faqs={faqs} />
      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />
    </>
  );
}
