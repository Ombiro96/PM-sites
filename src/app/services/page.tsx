import type { Metadata } from "next";
import { resolveClient } from "@/lib/brand/resolve";
import { Icon } from "@/components/ui/Icon";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import {
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await resolveClient();
  return {
    title: `Property management services in ${brand.contact.city}`,
    description: `What ${brand.company.name} does for landlords: rent collection, maintenance, reporting, letting and lease management.`,
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesPage() {
  const client = await resolveClient();
  const { services } = client.brand.content;

  return (
    <>
      <div className="border-b border-line bg-surface-muted">
        <Container className="py-12 sm:py-16">
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {services.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">{services.subheading}</p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            {services.items.map((service) => (
              <Card key={service.slug} className="p-8" id={service.slug}>
                <span className="grid h-12 w-12 place-items-center rounded-brand bg-brand/8 text-brand">
                  <Icon name={service.icon} />
                </span>
                <h2 className="mt-6 font-display text-2xl font-semibold text-ink">
                  {service.title}
                </h2>
                <p className="mt-2 text-ink-muted">{service.summary}</p>
                <ul className="mt-6 space-y-3">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm text-ink-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <SectionHeading
              eyebrow="For landlords"
              heading="Hand us the running of your property"
              subheading="Tell us where the property is and how many units it has. We will visit, quote, and give you a straight answer on what it should be earning."
            />
            <div className="rounded-brand-lg border border-line bg-surface p-6 sm:p-8">
              <EnquiryForm
                defaultSubject="landlord"
                defaultMessage="I have a property I would like managed. "
              />
            </div>
          </div>
        </Container>
      </Section>

      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
      />
    </>
  );
}
