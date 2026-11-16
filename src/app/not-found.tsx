import { ButtonLink, Container } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="py-(--pad)">
      <Container className="max-w-xl text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-brand uppercase">
          404
        </p>
        <h1 className="mt-4 text-[clamp(26px,3.6vw,40px)]">
          We could not find that page
        </h1>
        <p className="mt-4 text-ink-muted">
          The house you are looking for may have been let. See what is
          available now, or tell us what you need.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/houses">See houses to let</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
