import { telHref, whatsappHref } from "@/lib/utils";
import { HOUSES_PATH, PAGE_PATHS, TENANT_LOGIN_URL } from "./pages";
import type { Action, ButtonField, SiteData } from "./types";

export type ResolvedButton = { label: string; href: string; external: boolean };

/**
 * Turns a stored button into a link. Company facts are live, so a WhatsApp
 * button whose number has since been removed becomes a Call button, and a
 * destination that no longer exists gives no button at all.
 */
export function resolveButton(
  button: ButtonField | undefined,
  site: SiteData,
): ResolvedButton | null {
  if (!button) return null;
  return resolveAction(button.to, button.label, site);
}

export function headerContactButton(site: SiteData): ResolvedButton {
  const preferred = site.document.header.contact_action;
  const kind = preferred === "call" ? "call" : "whatsapp";
  const label = kind === "call" ? "Call us" : "WhatsApp";
  return resolveAction({ kind }, label, site) as ResolvedButton;
}

function resolveAction(
  to: Action,
  label: string,
  site: SiteData,
): ResolvedButton | null {
  const { document, facts } = site;

  switch (to.kind) {
    case "houses":
      return { label, href: HOUSES_PATH, external: false };
    case "page": {
      const page = document.pages.find((candidate) => candidate.id === to.page);
      if (!page) return null;
      return { label, href: PAGE_PATHS[page.kind], external: false };
    }
    case "section": {
      const page = document.pages.find((candidate) => candidate.id === to.page);
      const section = page?.sections.find(
        (candidate) => candidate.id === to.section && !candidate.hidden,
      );
      if (!page || !section) return null;
      return {
        label,
        href: `${PAGE_PATHS[page.kind]}#${section.id}`,
        external: false,
      };
    }
    case "whatsapp":
      if (!facts.whatsapp_number) {
        return { label: "Call us", href: telHref(facts.phone), external: false };
      }
      return {
        label,
        href: whatsappHref(facts.whatsapp_number, to.message),
        external: true,
      };
    case "call":
      return { label, href: telHref(facts.phone), external: false };
    case "tenant_login":
      return { label, href: TENANT_LOGIN_URL, external: true };
  }
}
