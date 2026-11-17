import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";
import { mockFetcher } from "@/dev/mockListings";
import { setFetcher } from "@/lib/listings/api";
import { startRouter } from "@/lib/router";
import { brandVariables } from "@/lib/site/brand";
import { LOOKS, parseSiteData } from "@/lib/site/data";
import type { SiteData } from "@/lib/site/types";
import "./preview.css";
import { PREVIEW_READY, PREVIEW_SITE } from "./lib/preview";

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

/** Draws whichever site the console sends, with the same code that draws a published one. */
function Preview() {
  const [site, setSite] = useState<SiteData | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== PREVIEW_SITE) return;
      const sent = parseSiteData(event.data.site);
      if (!sent) return;
      applyLook(sent);
      setFetcher(mockFetcher("sample", sent.api.agency));
      setSite(sent);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return site ? <App site={site} keepTitle /> : null;
}

const container = document.getElementById("root");
if (container) {
  // The site reads its page from the path, and the home page is "/".
  window.history.replaceState(null, "", "/");
  startRouter();
  createRoot(container).render(
    <StrictMode>
      <Preview />
    </StrictMode>,
  );
}
