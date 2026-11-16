import "server-only";
import type { Metadata } from "next";
import { findPage, PAGE_PATHS } from "./pages";
import { getSite } from "./source";
import type { PageKind } from "./types";

export async function storedPageMetadata(kind: PageKind): Promise<Metadata> {
  const site = await getSite();
  const page = findPage(site.document, kind);
  if (!page) return {};

  return {
    title: kind === "home" ? undefined : page.title,
    description: page.search_description,
    alternates: { canonical: PAGE_PATHS[kind] },
  };
}
