import { useMemo, useState } from "react";
import type { Look, SiteDocument } from "@/lib/site/types";
import { Button } from "../../components/fields";
import { PreviewPanel } from "../../components/PreviewPanel";
import type { Company } from "../../lib/company";
import { draftSite } from "../../lib/preview";
import type { Picture, Site } from "../../lib/site";
import { ColourStep } from "../website/ColourStep";
import { LookStep } from "../website/LookStep";

/** One of the two design choices from setup, laid out as there: the choices beside the manager's own pages drawn with them. */
export function LookView({
  part,
  site,
  working,
  company,
  pictures,
  busy,
  onSave,
}: {
  part: "theme" | "theme-colour";
  site: Site;
  working: SiteDocument;
  company: Company | null;
  pictures: readonly Picture[];
  busy: boolean;
  onSave: (look: Look, brandColour: string) => void;
}) {
  const [look, setLook] = useState(site.look);
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

  return (
    <div className="grid gap-8 xl:grid-cols-[30rem_minmax(0,1fr)]">
      <div>
        {part === "theme" ? (
          <LookStep
            look={look}
            brandColour={brandColour}
            company={company}
            onChoose={setLook}
          />
        ) : (
          <ColourStep brandColour={brandColour} onChoose={setBrandColour} />
        )}
        <div className="mt-6 flex items-center justify-end gap-3">
          {changed ? (
            <p className="text-ink-muted text-sm">Not saved yet.</p>
          ) : null}
          <Button
            tone="solid"
            disabled={busy || !changed}
            onClick={() => onSave(look, brandColour)}
          >
            {part === "theme" ? "Use this theme" : "Save theme colour"}
          </Button>
        </div>
      </div>
      <PreviewPanel
        site={preview}
        caption={
          part === "theme"
            ? "Your own pages in this theme."
            : "Your own pages in this colour."
        }
      />
    </div>
  );
}
