import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveClient } from "@/lib/brand/resolve";
import { REQUEST_TYPES, getRequestType } from "@/lib/requests";
import { RequestForm } from "@/components/forms/RequestForm";
import { Icon } from "@/components/ui/Icon";
import { Card, Container, Section } from "@/components/ui/primitives";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { telHref } from "@/lib/utils";

type Params = Promise<{ type: string }>;

export async function generateStaticParams() {
  return REQUEST_TYPES.map((type) => ({ type: type.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { type: slug } = await params;
  const type = getRequestType(slug);
  if (!type) return { title: "Request not found" };

  const { brand } = await resolveClient();
  return {
    title: type.title,
    description: `${type.summary} Submit it online to ${brand.company.name}.`,
    alternates: { canonical: `/submit-a-request/${type.slug}` },
  };
}

export default async function RequestTypePage({ params }: { params: Params }) {
  const { type: slug } = await params;
  const type = getRequestType(slug);
  if (!type) notFound();

  const client = await resolveClient();
  const { brand } = client;
  const others = REQUEST_TYPES.filter((item) => item.slug !== type.slug);

  return (
    <>
      <div className="border-b border-line bg-surface-muted">
        <Container className="py-12 sm:py-16">
          <Link
            href="/submit-a-request"
            className="text-sm font-semibold text-brand hover:text-accent"
          >
            &larr; All requests
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
            {type.title}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-muted">{type.intro}</p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div className="space-y-6">
              <Card className="p-6">
                <span className="grid h-11 w-11 place-items-center rounded-brand bg-brand/8 text-brand">
                  <Icon name={type.icon} className="h-5 w-5" />
                </span>
                <h2 className="mt-5 font-display text-lg font-semibold text-ink">
                  {type.notes.heading}
                </h2>
                <ul className="mt-4 space-y-3">
                  {type.notes.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-ink-muted">
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
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-line pt-5 text-sm text-ink-muted">
                  Need a hand? Call{" "}
                  <a
                    href={telHref(brand.contact.phone)}
                    className="font-semibold text-brand hover:text-accent"
                  >
                    {brand.contact.phoneDisplay}
                  </a>{" "}
                  — {brand.contact.officeHours}.
                </p>
              </Card>

              <Card className="p-6">
                <h2 className="font-display text-sm font-semibold tracking-[0.14em] text-ink uppercase">
                  Other requests
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {others.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/submit-a-request/${item.slug}`}
                        className="font-medium text-brand hover:text-accent"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card className="p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-ink">
                Your details
              </h2>
              <p className="mt-1.5 mb-6 text-sm text-ink-muted">
                Fields marked optional can be left blank. Everything else helps
                us act on this faster.
              </p>
              <RequestForm type={type} />
            </Card>
          </div>
        </Container>
      </Section>

      <BreadcrumbSchema
        client={client}
        trail={[
          { name: "Home", href: "/" },
          { name: "Submit a request", href: "/submit-a-request" },
          { name: type.title, href: `/submit-a-request/${type.slug}` },
        ]}
      />
    </>
  );
}
