import Image from "next/image";
import { Container } from "@/components/ui/primitives";
import { LOOKS } from "@/lib/site/looks";
import { resolvePicture } from "@/lib/site/pictures";
import type { PageTitleSection, SiteData } from "@/lib/site/types";

const HEADING_SIZE = "text-[clamp(26px,3.6vw,40px)]";

export function PageTitle({
  section,
  site,
}: {
  section: PageTitleSection;
  site: SiteData;
}) {
  const { heading, text } = section.fields;
  const picture = LOOKS[site.look].photoPageTitle
    ? resolvePicture(section.fields.picture, site)
    : null;

  if (picture) {
    return (
      <section
        id={section.id}
        className="relative isolate flex min-h-[260px] items-end text-white md:min-h-[330px]"
      >
        <Image
          src={picture.url}
          alt={picture.alt}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
          style={{ objectPosition: picture.position }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.12)_42%,rgba(0,0,0,0.78))]"
        />
        <Container className="py-10">
          {heading ? <h1 className={HEADING_SIZE}>{heading}</h1> : null}
          {text ? (
            <p className="mt-3 max-w-[60ch] text-[17.5px] text-white/90">
              {text}
            </p>
          ) : null}
        </Container>
      </section>
    );
  }

  return (
    <section id={section.id} className="bg-surface-muted py-10">
      <Container>
        {heading ? <h1 className={HEADING_SIZE}>{heading}</h1> : null}
        {text ? (
          <p className="mt-3 max-w-[60ch] text-[17.5px] text-ink-muted">
            {text}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
