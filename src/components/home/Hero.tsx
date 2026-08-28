import Image from "next/image";
import type { Brand } from "@/lib/brand/types";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { QuickSearch } from "./QuickSearch";

export function Hero({ brand }: { brand: Brand }) {
  const { hero } = brand.content;

  return (
    <section className="relative isolate overflow-hidden bg-brand-deep">
      <Image
        src={hero.image}
        alt={hero.imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary-deep)] via-[var(--brand-primary-deep)]/85 to-transparent"
      />

      <Container className="relative py-24 sm:py-32 lg:py-40">
        <div className="max-w-2xl">
          {hero.eyebrow ? (
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              {hero.eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-4xl leading-[1.08] font-semibold text-balance text-white sm:text-5xl lg:text-6xl">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            {hero.subheading}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={hero.primaryCta.href} variant="accent" size="lg">
              {hero.primaryCta.label}
            </ButtonLink>
            {hero.secondaryCta ? (
              <ButtonLink
                href={hero.secondaryCta.href}
                variant="outline"
                size="lg"
                className="text-white"
              >
                {hero.secondaryCta.label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Container>

      <Container className="relative -mb-14 translate-y-14">
        <QuickSearch areas={brand.content.areas.items} />
      </Container>
    </section>
  );
}
