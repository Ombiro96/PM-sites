import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/brand/types";
import type { Listing } from "@/lib/listings/types";
import {
  ButtonLink,
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { ListingCard } from "@/components/listings/ListingCard";

export function Stats({ brand }: { brand: Brand }) {
  const { stats } = brand.content;
  if (stats.length === 0) return null;

  return (
    <Container className="pt-24 sm:pt-28">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-line py-10 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block font-display text-3xl font-semibold text-brand sm:text-4xl">
                {stat.value}
              </span>
              <span className="mt-2 block text-sm text-ink-muted">
                {stat.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}

export function FeaturedListings({
  listings,
  emptyMessage,
}: {
  listings: Listing[];
  emptyMessage: string;
}) {
  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Available now"
            heading="Homes ready to move into"
            subheading="Availability is read live from our management system, so what you see here is what is actually free."
          />
          <ButtonLink href="/properties" variant="secondary">
            View all properties
          </ButtonLink>
        </div>

        {listings.length === 0 ? (
          <Card className="mt-10 p-10 text-center">
            <p className="text-ink-muted">{emptyMessage}</p>
            <ButtonLink href="/contact" className="mt-6">
              Tell us what you are looking for
            </ButtonLink>
          </Card>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                priority={index < 3}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

export function ValueProps({ brand }: { brand: Brand }) {
  const { valueProps } = brand.content;

  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          heading={valueProps.heading}
          subheading={valueProps.subheading}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.items.map((item) => (
            <Card key={item.title} className="p-6">
              <span className="grid h-11 w-11 place-items-center rounded-brand bg-brand/8 text-brand">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ServicesPreview({ brand }: { brand: Brand }) {
  const { services } = brand.content;

  return (
    <Section>
      <Container>
        <SectionHeading heading={services.heading} subheading={services.subheading} />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.items.map((service) => (
            <Card key={service.slug} className="flex gap-5 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-brand bg-accent/12 text-accent">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  {service.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink-muted">{service.summary}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
                  {service.bullets.slice(0, 3).map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
        <ButtonLink href="/services" variant="secondary" className="mt-10">
          All our services
        </ButtonLink>
      </Container>
    </Section>
  );
}

export function Areas({ brand }: { brand: Brand }) {
  const { areas } = brand.content;

  return (
    <Section tone="muted">
      <Container>
        <SectionHeading heading={areas.heading} subheading={areas.subheading} />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {areas.items.map((area) => (
            <Link
              key={area.slug}
              href={`/areas/${area.slug}`}
              className="group relative block overflow-hidden rounded-brand-lg"
            >
              <div className="relative aspect-[4/5] bg-brand-deep">
                {area.image ? (
                  <Image
                    src={area.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {area.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-white/75">
                    {area.blurb}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function Testimonials({ brand }: { brand: Brand }) {
  const items = brand.content.testimonials;
  if (items.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((testimonial) => (
            <figure
              key={testimonial.author}
              className="rounded-brand-lg border border-line bg-surface-muted p-8"
            >
              <blockquote className="font-display text-xl leading-relaxed text-ink text-balance">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold text-ink">{testimonial.author}</span>
                <span className="text-ink-muted"> — {testimonial.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function ClosingCta({ brand }: { brand: Brand }) {
  const { cta } = brand.content;

  return (
    <Section tone="brand">
      <Container>
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeading heading={cta.heading} subheading={cta.body} inverted />
          <div className="flex shrink-0 flex-wrap gap-3">
            <ButtonLink href={cta.primary.href} variant="accent" size="lg">
              {cta.primary.label}
            </ButtonLink>
            {cta.secondary ? (
              <ButtonLink
                href={cta.secondary.href}
                variant="outline"
                size="lg"
                className="text-white"
              >
                {cta.secondary.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
