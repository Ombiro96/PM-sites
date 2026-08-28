import { ButtonLink, Container, Section } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <Section>
      <Container className="max-w-xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink sm:text-4xl">
          We could not find that page
        </h1>
        <p className="mt-4 text-ink-muted">
          The home you are looking for may have been let. Browse what is
          available now, or tell us what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/properties">View available homes</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
