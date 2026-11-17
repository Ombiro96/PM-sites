import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { startRouter } from "./lib/router";
import { brandVariables } from "./lib/site/brand";
import { readInjectedData } from "./lib/site/data";
import type { SiteData } from "./lib/site/types";
import "./styles/site.css";

async function loadSite(): Promise<SiteData | null> {
  const injected = readInjectedData();
  if (injected) return injected;
  // Only the dev server has sample sites; a build carries none of them.
  if (import.meta.env.DEV) {
    const { devSite } = await import("./dev/setup");
    return devSite();
  }
  return null;
}

function applyLook(site: SiteData): void {
  const root = document.documentElement;
  root.classList.add(`look-${site.site.look}`);
  for (const [name, value] of Object.entries(
    brandVariables(site.site.brand_colour, site.site.look),
  )) {
    root.style.setProperty(name, value);
  }
}

loadSite().then((site) => {
  const container = document.getElementById("root");
  if (!container) return;
  if (!site) {
    document.title = "Site not available";
    container.textContent = "This site is not available.";
    container.style.cssText =
      "padding:40px 22px;font-family:system-ui,sans-serif";
    return;
  }
  // The backend writes each page's own title; without it (or in dev) the app sets one.
  const keepTitle = document.title.trim() !== "";
  applyLook(site);
  startRouter();
  createRoot(container).render(
    <StrictMode>
      <App site={site} keepTitle={keepTitle} />
    </StrictMode>,
  );
});
