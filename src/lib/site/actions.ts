import { telHref, whatsappHref } from "@/lib/utils";
import { HOUSES_PATH, PAGE_PATHS, TENANT_LOGIN_URL } from "./pages";
import type { Action, ButtonField, SiteData } from "./types";

export type ResolvedButton = {
  label: string;
  href: string;
  external: boolean;
  kind: "link" | "whatsapp" | "call";
};

export type ActionContext = Pick<SiteData, "document" | "facts"> & {
  /** True once the listings feed has answered with no houses at all. */
  noHouses?: boolean;
};

/**
 * Turns a stored button into a link. The destination is never worked out from
 * the label. Facts can change after a page was written, so a WhatsApp button
 * with no number becomes a Call button, a houses button with nothing to let
 * goes to the contact page, and a destination that no longer exists gives no
 * button at all.
 */
export function resolveButton(
  button: ButtonField | undefined | null,
  context: ActionContext,
): ResolvedButton | null {
  if (!button || typeof button.label !== "string" || !button.to) return null;
  return resolveAction(button.to, button.label, context);
}

export function headerContactButton(context: ActionContext): ResolvedButton | null {
  const preferred = context.document.header.contact_action;
  if (preferred === "call") return resolveAction({ kind: "call" }, "Call us", context);
  return resolveAction({ kind: "whatsapp" }, "WhatsApp", context);
}

export function resolveAction(
  to: Action,
  label: string,
  context: ActionContext,
): ResolvedButton | null {
  const { document, facts } = context;
  const link = (href: string): ResolvedButton => ({
    label,
    href,
    external: false,
    kind: "link",
  });

  switch (to.kind) {
    case "houses": {
      const contact = document.pages.find((page) => page.kind === "contact");
      return link(context.noHouses && contact ? PAGE_PATHS.contact : HOUSES_PATH);
    }
    case "page": {
      const page = document.pages.find((candidate) => candidate.id === to.page);
      return page && PAGE_PATHS[page.kind] ? link(PAGE_PATHS[page.kind]) : null;
    }
    case "section": {
      const page = document.pages.find((candidate) => candidate.id === to.page);
      const section = page?.sections.find(
        (candidate) => candidate.id === to.section && !candidate.hidden,
      );
      if (!page || !section || !PAGE_PATHS[page.kind]) return null;
      return link(`${PAGE_PATHS[page.kind]}#${encodeURIComponent(section.id)}`);
    }
    case "whatsapp":
      if (!facts.whatsapp) {
        if (!facts.phone) return null;
        return { label: "Call us", href: telHref(facts.phone), external: false, kind: "call" };
      }
      return {
        label,
        href: whatsappHref(
          facts.whatsapp,
          typeof to.message === "string" ? to.message : undefined,
        ),
        external: true,
        kind: "whatsapp",
      };
    case "call":
      if (!facts.phone) return null;
      return { label, href: telHref(facts.phone), external: false, kind: "call" };
    case "tenant_login":
      return { label, href: TENANT_LOGIN_URL, external: true, kind: "link" };
    default:
      return null;
  }
}
