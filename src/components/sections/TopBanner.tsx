import { ActionLink, Picture } from "@/components/ui";
import { useListings } from "@/lib/listings/context";
import { resolveButton, useActionContext, useSite } from "@/lib/site/context";
import { houseWords } from "@/lib/site/pages";
import { resolvePicture, type ResolvedPicture } from "@/lib/site/pictures";
import type { TopBannerSection } from "@/lib/site/types";
import { cx } from "@/lib/utils";

const NEEDS_PICTURE = ["split", "photo", "centre"];
const LAYOUTS = ["split", "photo", "centre", "band", "plain"];

/** The live count of houses to let, when the manager switched the badge on and there are some. */
function useBadge(section: TopBannerSection): { count: number; label: string } | null {
  const listings = useListings();
  const words = houseWords(useSite().site.look);
  if (section.fields.badge !== "houses_available") return null;
  if (listings.status !== "ready" || listings.count === 0) return null;
  return {
    count: listings.count,
    label: `${listings.count === 1 ? words.one : words.many} to let`,
  };
}

export function TopBanner({ section }: { section: TopBannerSection }) {
  const site = useSite();
  const context = useActionContext();
  const badge = useBadge(section);
  const { fields } = section;

  const pictures = (Array.isArray(fields.pictures) ? fields.pictures : [])
    .map((ref) => resolvePicture(ref, site.pictures))
    .filter((picture): picture is ResolvedPicture => picture !== null);

  let layout = LAYOUTS.includes(section.layout ?? "") ? section.layout : "plain";
  if (NEEDS_PICTURE.includes(layout ?? "") && pictures.length === 0) layout = "plain";

  const chip = (inline: boolean) =>
    badge ? (
      <div className={cx("chip", inline && "inline")}>
        <b>{badge.count}</b>
        {badge.label}
      </div>
    ) : null;

  const words = (
    <>
      {layout === "split" ? null : chip(true)}
      <h1>{fields.heading}</h1>
      {fields.text ? <p className="lead">{fields.text}</p> : null}
      <div className="row">
        <ActionLink button={resolveButton(fields.primary, context)} />
        <ActionLink button={resolveButton(fields.secondary, context)} className="line" />
      </div>
    </>
  );

  if (layout === "split") {
    return (
      <section id={section.id} className="sec hero-split">
        <div className="in">
          <div className="txt">{words}</div>
          <div className="ph">
            <Picture picture={pictures[0]} size="large" eager />
            {chip(false)}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "photo" || layout === "centre") {
    return (
      <section id={section.id} className={layout === "photo" ? "hero-photo" : "hero-center"}>
        <Picture picture={pictures[0]} size="large" eager />
        <div className="in">{words}</div>
      </section>
    );
  }

  if (layout === "band") {
    const strip = pictures.length >= 2 ? pictures.slice(0, 3) : [];
    const areas = site.facts.areas_served.slice(0, 3).join(" · ");
    return (
      <section id={section.id} className={cx("hero-band", strip.length > 0 && "has-strip")}>
        <div className="in">
          {areas ? <span className="eyebrow">{areas}</span> : null}
          {words}
          {strip.length ? (
            <div className={cx("strip", strip.length === 2 && "of-2")}>
              {strip.map((picture, index) => (
                <Picture key={index} picture={picture} size={index === 0 ? "large" : "small"} eager />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section id={section.id} className={cx("sec hero-plain", pictures.length === 0 && "bare")}>
      <div className="in">
        <div className="txt">{words}</div>
        {pictures[0] ? <Picture picture={pictures[0]} size="large" eager /> : null}
      </div>
    </section>
  );
}
