import Image from "next/image";
import { ActionButton } from "@/components/site/ActionButton";
import { Container } from "@/components/ui/primitives";
import { resolveButton } from "@/lib/site/actions";
import { resolvePicture } from "@/lib/site/pictures";
import type { SiteData, TopBannerSection } from "@/lib/site/types";

export function TopBanner({
  section,
  site,
}: {
  section: TopBannerSection;
  site: SiteData;
}) {
  const { heading, text, pictures } = section.fields;
  const primary = resolveButton(section.fields.primary, site);
  const secondary = resolveButton(section.fields.secondary, site);
  const picture = resolvePicture(pictures?.[0], site);
  const overPhoto = section.layout !== "plain" && picture !== null;

  if (overPhoto) {
    return (
      <section
        id={section.id}
        className="relative isolate flex min-h-[460px] items-end text-white md:min-h-[540px]"
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
        <Container className="py-[60px]">
          {heading ? <h1 className="max-w-[17ch]">{heading}</h1> : null}
          {text ? (
            <p className="mt-4 max-w-[60ch] text-[17.5px] text-white/90">
              {text}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            {primary ? <ActionButton button={primary} /> : null}
            {secondary ? (
              <ActionButton button={secondary} variant="outline" />
            ) : null}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id={section.id} className="py-(--pad)">
      <Container>
        {heading ? <h1 className="max-w-[20ch]">{heading}</h1> : null}
        {text ? (
          <p className="mt-4 max-w-[60ch] text-[17.5px] text-ink-muted">
            {text}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap gap-3">
          {primary ? <ActionButton button={primary} /> : null}
          {secondary ? (
            <ActionButton button={secondary} variant="outline" />
          ) : null}
        </div>
        {picture ? (
          <Image
            src={picture.url}
            alt={picture.alt}
            width={picture.width}
            height={picture.height}
            priority
            sizes="(min-width: 1100px) 1056px, 100vw"
            className="mt-10 aspect-[21/9] w-full rounded-brand-lg object-cover"
            style={{ objectPosition: picture.position }}
          />
        ) : null}
      </Container>
    </section>
  );
}
