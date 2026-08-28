import type { Metadata } from "next";
import { resolveClient } from "@/lib/brand/resolve";
import { Icon } from "@/components/ui/Icon";
import {
  ButtonLink,
  Card,
  Container,
  Section,
} from "@/components/ui/primitives";
import { telHref } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await resolveClient();
  return {
    title: "Tenant portal",
    description: `Existing ${brand.company.name} tenants: view invoices, pay rent, report maintenance and access your lease documents.`,
    alternates: { canonical: "/tenant-portal" },
    robots: { index: false, follow: true },
  };
}

const CAPABILITIES = [
  {
    icon: "document" as const,
    title: "Invoices and receipts",
    body: "Every rent invoice, payment and receipt in one statement you can check any time.",
  },
  {
    icon: "phone" as const,
    title: "Pay rent from your phone",
    body: "Pay by M-PESA to your unit's paybill and see the payment reflected against your account.",
  },
  {
    icon: "wrench" as const,
    title: "Report maintenance",
    body: "Log an issue with a photo and follow its status until it is resolved.",
  },
  {
    icon: "key" as const,
    title: "Lease documents",
    body: "Read and sign your lease and notices without a trip to the office.",
  },
];

export default async function TenantPortalPage() {
  const client = await resolveClient();
  const { brand } = client;

  return (
    <Section>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              Existing tenants
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
              Your tenancy, in one place
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
              Sign in with the phone number on your tenancy. We send you a
              one-time code by SMS — there is no password to remember.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={brand.tenantPortalUrl}
                size="lg"
                target="_blank"
                rel="noreferrer noopener"
              >
                Sign in to the portal
              </ButtonLink>
              <ButtonLink href="/contact?subject=maintenance" variant="secondary" size="lg">
                I need help signing in
              </ButtonLink>
            </div>

            <p className="mt-6 text-sm text-ink-muted">
              Trouble getting in? Call us on{" "}
              <a
                href={telHref(brand.contact.phone)}
                className="font-semibold text-brand hover:text-accent"
              >
                {brand.contact.phoneDisplay}
              </a>
              .
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((item) => (
              <Card key={item.title} className="p-5">
                <span className="grid h-10 w-10 place-items-center rounded-brand bg-brand/8 text-brand">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-base font-semibold text-ink">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
