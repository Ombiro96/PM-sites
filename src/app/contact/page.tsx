import type { Metadata } from "next";
import { Suspense } from "react";
import { resolveClient } from "@/lib/brand/resolve";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Card, Container, Section } from "@/components/ui/primitives";
import { telHref, whatsappHref } from "@/lib/utils";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import type { EnquiryInput } from "@/lib/enquiry";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await resolveClient();
  return {
    title: `Contact ${brand.company.name}`,
    description: `Call, WhatsApp or email ${brand.company.name}. We reply during office hours, usually the same working day.`,
    alternates: { canonical: "/contact" },
  };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SUBJECTS: EnquiryInput["subject"][] = [
  "viewing",
  "general",
  "landlord",
  "maintenance",
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const client = await resolveClient();
  const params = await searchParams;
  const raw = Array.isArray(params.subject) ? params.subject[0] : params.subject;
  const subject = SUBJECTS.includes(raw as EnquiryInput["subject"])
    ? (raw as EnquiryInput["subject"])
    : "general";

  const { contact } = client.brand;

  return (
    <>
      <div className="border-b border-line bg-surface-muted">
        <Container className="py-12 sm:py-16">
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Talk to us
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Whether you are looking for a home or looking for someone to manage
            yours, start here.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Call or message
                </h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="text-ink-muted">Phone</dt>
                    <dd className="mt-0.5">
                      <a
                        href={telHref(contact.phone)}
                        className="text-base font-semibold text-brand hover:text-accent"
                      >
                        {contact.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                  {contact.whatsapp ? (
                    <div>
                      <dt className="text-ink-muted">WhatsApp</dt>
                      <dd className="mt-0.5">
                        <a
                          href={whatsappHref(
                            contact.whatsapp,
                            `Hello ${client.brand.company.name}, I would like to enquire about a property.`,
                          )}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-base font-semibold text-emerald-700 hover:underline"
                        >
                          Message us on WhatsApp
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-ink-muted">Email</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-base font-semibold text-brand hover:text-accent"
                      >
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Office hours</dt>
                    <dd className="mt-0.5 text-ink">{contact.officeHours}</dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold text-ink">
                  Visit us
                </h2>
                <address className="mt-3 space-y-1 text-sm text-ink-muted not-italic">
                  {contact.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p>{contact.city}</p>
                </address>
                {contact.mapEmbedUrl ? (
                  <iframe
                    src={contact.mapEmbedUrl}
                    title={`Map to ${client.brand.company.name}`}
                    loading="lazy"
                    className="mt-5 h-56 w-full rounded-brand border border-line"
                  />
                ) : null}
              </Card>
            </div>

            <Card className="p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink">
                Send us a message
              </h2>
              <p className="mt-1.5 mb-6 text-sm text-ink-muted">
                Fill this in and we will come back to you during office hours.
              </p>
              <Suspense fallback={null}>
                <EnquiryForm defaultSubject={subject} />
              </Suspense>
            </Card>
          </div>
        </Container>
      </Section>

      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />
    </>
  );
}
