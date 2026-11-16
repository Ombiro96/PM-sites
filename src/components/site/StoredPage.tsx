import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { findPage } from "@/lib/site/pages";
import { getSite } from "@/lib/site/source";
import type { PageKind } from "@/lib/site/types";

export async function StoredPage({ kind }: { kind: PageKind }) {
  const site = await getSite();
  const page = findPage(site.document, kind);
  if (!page) notFound();

  return (
    <>
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} site={site} />
      ))}
    </>
  );
}
