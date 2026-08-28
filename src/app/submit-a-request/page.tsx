import type { Metadata } from "next";
import Link from "next/link";
import { resolveClient } from "@/lib/brand/resolve";
import { REQUEST_TYPES } from "@/lib/requests";
import { Icon } from "@/components/ui/Icon";
import {
  ButtonLink,
  Card,
  Container,
  Section,
} from "@/components/ui/primitives";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { telHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await resolveClient();
  return {
    title: "Submit a request",
    description: `Give notice to vacate, apply to move in or raise a complaint with ${brand.company.name}. Every request is logged and followed up.`,
    alternates: { canonical: "/submit-a-request" },
  };
}

export default async function SubmitARequestPage() {
  const client = await resolveClient();
  const { brand } = client;

  return (
    <>
      <div className="border-b border-line bg-surface-muted">
        <Container className="py-12 sm:py-16">
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Submit a request
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Moving out, moving in, or something that needs putting right. Choose
            the request below and we will take it from there — in writing, with
            a record you can point back to.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {REQUEST_TYPES.map((type) => (
              <Card
                key={type.slug}
                className="relative flex flex-col p-8 transition-colors hover:border-brand/40"
              >
                <span className="grid h-12 w-12 place-items-center rounded-brand bg-brand/8 text-brand">
                  <Icon name={type.icon} />
                </span>
                <h2 className="mt-6 font-display text-xl font-semibold text-ink">
                  <Link
                    href={`/submit-a-request/${type.slug}`}
                    className="after:absolute after:inset-0 hover:text-brand"
                  >
                    {type.title}
                  </Link>
                </h2>
                <p className="mt-2 grow text-sm leading-relaxed text-ink-muted">
                  {type.summary}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  Start this request
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <Card className="p-8">
              <h2 className="font-display text-xl font-semibold text-ink">
                Reporting a repair?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Broken taps, blocked drains, faulty sockets and the like go
                through the tenant portal. They reach the maintenance team
                directly and you can follow the status until the job is closed.
              </p>
              <ButtonLink href="/tenant-portal" variant="secondary" className="mt-6">
                Go to the tenant portal
              </ButtonLink>
            </Card>

            <Card className="p-8">
              <h2 className="font-display text-xl font-semibold text-ink">
                Would rather talk to someone?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Call us on{" "}
                <a
                  href={telHref(brand.contact.phone)}
                  className="font-semibold text-brand hover:text-accent"
                >
                  {brand.contact.phoneDisplay}
                </a>{" "}
                during office hours ({brand.contact.officeHours}), or send a
                message and we will come back to you.
              </p>
              <ButtonLink href="/contact" variant="secondary" className="mt-6">
                Contact us
              </ButtonLink>
            </Card>
          </div>
        </Container>
      </Section>

      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Submit a request", href: "/submit-a-request" },
        ]}
      />
    </>
  );
}
