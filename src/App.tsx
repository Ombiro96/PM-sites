import { lazy, Suspense, useEffect, useRef, useSyncExternalStore } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileContactBar } from "@/components/layout/MobileContactBar";
import { HousePage } from "@/components/pages/HousePage";
import { HousesPage } from "@/components/pages/HousesPage";
import { NotFoundPage } from "@/components/pages/NotFoundPage";
import { StoredPage } from "@/components/pages/StoredPage";
import { ListingsProvider } from "@/lib/listings/context";
import {
  locationKey,
  matchRoute,
  subscribe,
  takeScrollIntent,
} from "@/lib/router";
import { SiteContext } from "@/lib/site/context";
import { findPage, houseWords } from "@/lib/site/pages";
import type { SiteData } from "@/lib/site/types";
import { headerOverlays } from "@/lib/site/wording";

// The test page for every section exists in the dev server only; a build leaves it out.
const SectionsTestPage = import.meta.env.DEV
  ? lazy(() => import("@/dev/SectionsTestPage"))
  : null;

function scrollToId(id: string): boolean {
  const element = document.getElementById(id);
  element?.scrollIntoView({ block: "start" });
  return element !== null;
}

/**
 * One manager's whole website. `keepTitle` is true when the backend already
 * wrote this page's own title into the HTML.
 */
export function App({
  site,
  keepTitle,
}: {
  site: SiteData;
  keepTitle: boolean;
}) {
  const key = useSyncExternalStore(subscribe, locationKey);
  const { pathname, search, hash } = window.location;
  const route = matchRoute(pathname);
  const page =
    route.name === "page" ? findPage(site.document, route.kind) : undefined;
  const firstDraw = useRef(true);

  const title =
    route.name === "page" && page
      ? page.kind === "home"
        ? site.facts.name
        : `${page.title} | ${site.facts.name}`
      : route.name === "houses"
        ? `${houseWords(site.site.look).title} | ${site.facts.name}`
        : route.name === "house"
          ? null
          : `Page not found | ${site.facts.name}`;

  useEffect(() => {
    const first = firstDraw.current;
    firstDraw.current = false;
    if (title && !(first && keepTitle && page)) document.title = title;

    const intent = takeScrollIntent();
    if (intent === "keep") return;
    const target = decodeURIComponent(hash.slice(1));
    if (target) {
      scrollToId(target);
      // Live sections above the target can still change height once their data arrives.
      const again = window.setTimeout(() => scrollToId(target), 500);
      return () => window.clearTimeout(again);
    }
    if (intent === "top")
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // `key` changes whenever the address does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  let content;
  if (route.name === "page" && page)
    content = <StoredPage key={page.id} page={page} />;
  else if (route.name === "houses") content = <HousesPage search={search} />;
  else if (route.name === "house") content = <HousePage id={route.id} />;
  else if (route.name === "sections" && SectionsTestPage) {
    content = (
      <Suspense fallback={null}>
        <SectionsTestPage />
      </Suspense>
    );
  } else content = <NotFoundPage />;

  const visible = page?.sections.find((section) => section && !section.hidden);
  const hasBar = Boolean(site.facts.phone || site.facts.whatsapp);

  return (
    <SiteContext.Provider value={site}>
      <ListingsProvider api={site.api}>
        <div className={hasBar ? "site has-mbar" : "site"}>
          {site.site.preview ? (
            <div className="preview-note">
              Preview. This page is not public.
            </div>
          ) : null}
          <Header pathname={pathname} over={headerOverlays(visible, site)} />
          <main>{content}</main>
          <Footer />
          {route.name === "house" ? null : <MobileContactBar />}
        </div>
      </ListingsProvider>
    </SiteContext.Provider>
  );
}
