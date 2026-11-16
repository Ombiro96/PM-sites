import type { Section, SiteData } from "@/lib/site/types";
import { PageTitle } from "./PageTitle";
import { TopBanner } from "./TopBanner";

/** Draws one stored section. A type this site cannot draw yet draws nothing. */
export function SectionRenderer({
  section,
  site,
}: {
  section: Section;
  site: SiteData;
}) {
  if (section.hidden) return null;

  switch (section.type) {
    case "top_banner":
      return <TopBanner section={section} site={site} />;
    case "page_title":
      return <PageTitle section={section} site={site} />;
    default:
      return null;
  }
}
