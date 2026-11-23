import { useMemo } from "react";
import { LOOK_DETAILS } from "../lib/looks";
import { triedSite } from "../lib/preview";
import { BRAND_COLOURS, parseWebsite, readTried } from "../lib/website";
import { SitePreview } from "./SitePreview";

/**
 * The website this account is about to get: what was tried on the landing
 * page, or the theme setup starts on. Never a random one, so setup keeps the promise.
 */
export function NextWebsite({ signingIn = false }: { signingIn?: boolean }) {
  const { tried, site } = useMemo(() => {
    const tried = readTried();
    const { look, brandColour } = parseWebsite(null);
    return {
      tried,
      site: triedSite(tried ?? { look, brandColour, name: "" }),
    };
  }, []);
  const look = LOOK_DETAILS[site.site.look].name;
  const colour =
    BRAND_COLOURS.find((each) => each.value === site.site.brand_colour)?.name ??
    "your colour";

  return (
    <figure>
      <div className="border-line overflow-hidden rounded-2xl border shadow-2xl shadow-black/10">
        <SitePreview
          site={site}
          title="Your website"
          width={1280}
          height={860}
        />
      </div>
      <figcaption className="mt-5">
        <p className="text-lg font-semibold tracking-tight">
          {signingIn
            ? "Your website is waiting for you."
            : tried?.name
              ? `Your ${tried.name} website is one step away.`
              : "Your website is one step away."}
        </p>
        <p className="text-ink-muted mt-1">
          {signingIn
            ? "Sign in to edit your pages, change your theme and publish."
            : tried
              ? `${look} theme in ${colour}. Create your account and we write the first draft.`
              : "Create your account, choose a theme and we write the first draft. Nothing is public until you publish."}
        </p>
      </figcaption>
    </figure>
  );
}
