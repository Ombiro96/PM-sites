import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { mockFetcher } from "@/dev/mockListings";
import { setFetcher } from "@/lib/listings/api";
import { navigate, startRouter } from "@/lib/router";
import { brandVariables } from "@/lib/site/brand";
import { LOOKS, parseSiteData } from "@/lib/site/data";
import type { SiteData } from "@/lib/site/types";
import "./preview.css";
import {
  PREVIEW_DRAWN,
  PREVIEW_GO,
  PREVIEW_PICK,
  PREVIEW_READY,
  PREVIEW_SITE,
} from "./lib/preview";

/** Inside the console the page is not a shared link, so the site's note about one is left out. */
const EMBEDDED = window.parent !== window;

function applyLook(site: SiteData): void {
  const root = document.documentElement;
  root.classList.remove(...LOOKS.map((look) => `look-${look}`));
  root.classList.add(`look-${site.site.look}`);
  for (const [name, value] of Object.entries(
    brandVariables(site.site.brand_colour, site.site.look),
  )) {
    root.style.setProperty(name, value);
  }
}

/**
 * Draws whichever site the console sends, with the same code that draws a
 * published one. While the console is editing, a click on a section tells the
 * console which one instead of following a link, and a click on a link in the
 * menu or the footer tells it which page was asked for.
 */
function Preview() {
  const [site, setSite] = useState<SiteData | null>(null);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const show = (sent: SiteData) => {
      applyLook(sent);
      setFetcher(mockFetcher("sample", sent.api.agency));
      setSite(sent);
    };
    // Opened in its own tab, there is no console to send a site.
    if (!EMBEDDED) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== PREVIEW_SITE) return;
      const sent = parseSiteData(event.data.site);
      if (!sent) return;
      show(sent);
      setPicking(event.data.picking === true);
      setSelected(
        typeof event.data.selected === "string" ? event.data.selected : "",
      );
      const path: unknown = event.data.path;
      if (typeof path === "string" && path !== window.location.pathname)
        navigate(path);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const drawn = site !== null;
  useEffect(() => {
    if (!drawn || !EMBEDDED) return;
    let waiting = true;
    void document.fonts.ready.then(() =>
      requestAnimationFrame(() => {
        if (waiting)
          window.parent.postMessage(
            { type: PREVIEW_DRAWN },
            window.location.origin,
          );
      }),
    );
    return () => {
      waiting = false;
    };
  }, [drawn]);

  useEffect(() => {
    if (picking && selected)
      document
        .getElementById(selected)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [picking, selected]);

  const sectionIds = useMemo(
    () =>
      site?.document.pages.flatMap((page) =>
        page.sections.map((section) => section.id),
      ) ?? [],
    [site],
  );

  useEffect(() => {
    if (!picking) return;
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      let element = event.target as Element | null;
      while (element && !sectionIds.includes(element.id))
        element = element.parentElement;
      if (element) {
        window.parent.postMessage(
          { type: PREVIEW_PICK, section: element.id },
          window.location.origin,
        );
        return;
      }
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.origin !== window.location.origin) return;
      window.parent.postMessage(
        { type: PREVIEW_GO, path: link.pathname },
        window.location.origin,
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [picking, sectionIds]);

  if (!site) return null;
  // Written as a rule for each section's id, so it holds however late a section is drawn.
  const all = (suffix: string) =>
    sectionIds.map((id) => `#${CSS.escape(id)}${suffix}`).join(",");
  const marked = [all(":hover"), selected ? `#${CSS.escape(selected)}` : ""]
    .filter(Boolean)
    .join(",");
  return (
    <>
      {EMBEDDED ? <style>{".preview-note{display:none}"}</style> : null}
      {picking && sectionIds.length > 0 ? (
        <style>{`${all("")}{cursor:pointer}${marked}{outline:3px solid #f59e0b;outline-offset:-3px}`}</style>
      ) : null}
      <App site={site} keepTitle />
    </>
  );
}

const container = document.getElementById("root");
if (container) {
  // The site reads its page from the path, and the home page is "/".
  window.history.replaceState(null, "", `/${window.location.search}`);
  startRouter();
  createRoot(container).render(
    <StrictMode>
      <Preview />
    </StrictMode>,
  );
}
