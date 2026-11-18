import { useMemo, useState } from "react";
import type { Look, SiteDocument } from "@/lib/site/types";
import { Button } from "../../components/fields";
import { PreviewPanel } from "../../components/PreviewPanel";
import type { Company } from "../../lib/company";
import { draftSite } from "../../lib/preview";
import type { Picture, Site } from "../../lib/site";
import { LOOK_DETAILS } from "../../lib/looks";
import { ColourStep } from "../website/ColourStep";

/**
 * One of the two design choices from setup, drawn on the manager's own pages.
 * The theme being looked at is held in the address, so it survives a reload
 * and the browser's back button returns to the grid.
 */
export function LookView({
  part,
  opened,
  onClose,
  site,
  working,
  company,
  pictures,
  busy,
  onSave,
}: {
  part: "theme" | "theme-colour";
  opened: Look | null;
  onClose: () => void;
  site: Site;
  working: SiteDocument;
  company: Company | null;
  pictures: readonly Picture[];
  busy: boolean;
  onSave: (look: Look, brandColour: string) => void;
}) {
  const look = opened ?? site.look;
  const [brandColour, setBrandColour] = useState(site.brandColour);
  const changed = look !== site.look || brandColour !== site.brandColour;

  const preview = useMemo(
    () =>
      draftSite({
        id: site.id,
        addressName: site.addressName,
        look,
        brandColour,
        document: working,
        company,
        pictures,
      }),
    [site, look, brandColour, working, company, pictures],
  );

  // The grid of themes is drawn by the console, which keeps it loaded.
  if (part === "theme" && !opened) return null;

  if (part === "theme")
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button onClick={onClose}>All themes</Button>
          <div className="mr-auto">
            <h1 className="text-[26px] leading-tight font-semibold tracking-tight">
              {LOOK_DETAILS[look].name}
            </h1>
            <p className="text-ink-muted">
              {changed
                ? LOOK_DETAILS[look].summary
                : "This is the theme your website uses now."}
            </p>
          </div>
          <Button
            tone="solid"
            disabled={busy || !changed}
            onClick={() => onSave(look, brandColour)}
          >
            Use this theme
          </Button>
        </div>
        <PreviewPanel site={preview} caption="Your own pages in this theme." />
      </div>
    );

  return (
    <div className="grid gap-8 xl:grid-cols-[30rem_minmax(0,1fr)]">
      <div>
        <ColourStep brandColour={brandColour} onChoose={setBrandColour} />
        <div className="mt-6 flex items-center justify-end gap-3">
          {changed ? (
            <p className="text-ink-muted text-sm">Not saved yet.</p>
          ) : null}
          <Button
            tone="solid"
            disabled={busy || !changed}
            onClick={() => onSave(look, brandColour)}
          >
            Save theme colour
          </Button>
        </div>
      </div>
      <PreviewPanel site={preview} caption="Your own pages in this colour." />
    </div>
  );
}
