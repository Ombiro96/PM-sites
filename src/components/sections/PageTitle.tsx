import { useContext } from "react";
import { Picture } from "@/components/ui";
import { PageKindContext, useSite } from "@/lib/site/context";
import { findPage, navLabel } from "@/lib/site/pages";
import { resolvePicture } from "@/lib/site/pictures";
import type { PageTitleSection } from "@/lib/site/types";
import { opensWithPhoto } from "@/lib/site/wording";

/** The title at the top of every page except home. Photo looks put the picture behind it. */
export function PageTitle({ section }: { section: PageTitleSection }) {
  const site = useSite();
  const page = findPage(site.document, useContext(PageKindContext));
  const { fields } = section;
  const picture = opensWithPhoto(section, site) ? resolvePicture(fields.picture, site.pictures) : null;

  const words = (
    <>
      {page ? <span className="eyebrow">{navLabel(page)}</span> : null}
      <h1 className="ltitle">{fields.heading}</h1>
      {fields.text ? <p className="lead">{fields.text}</p> : null}
    </>
  );

  if (picture) {
    return (
      <section id={section.id} className="hero-photo pagebanner">
        <Picture picture={picture} size="large" eager />
        <div className="in">{words}</div>
      </section>
    );
  }
  return (
    <section id={section.id} className="sec bg-tint pagehd3">
      <div className="in">{words}</div>
    </section>
  );
}
