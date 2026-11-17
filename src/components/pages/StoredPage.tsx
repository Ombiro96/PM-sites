import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { PageKindContext } from "@/lib/site/context";
import type { Page } from "@/lib/site/types";

/** One of the four pages kept in the site's document, section by section. */
export function StoredPage({ page }: { page: Page }) {
  return (
    <PageKindContext.Provider value={page.kind}>
      {page.sections.map((section, index) => (
        <SectionRenderer key={section?.id ?? index} section={section} />
      ))}
    </PageKindContext.Provider>
  );
}
