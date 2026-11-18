import { useMemo } from "react";
import { LOOKS } from "@/lib/site/data";
import type { Look } from "@/lib/site/types";
import { ChoiceCard } from "../../components/ChoiceCard";
import { SitePreview } from "../../components/SitePreview";
import type { Company } from "../../lib/company";
import { LOOK_DETAILS } from "../../lib/looks";
import { exampleSite } from "../../lib/preview";

const THUMBNAIL = { width: 1280, height: 860 };

export function LookStep({
  look,
  brandColour,
  company,
  onChoose,
  opens = false,
}: {
  look: Look;
  brandColour: string;
  company: Company | null;
  onChoose: (look: Look) => void;
  /** In the console a theme opens on the manager's own pages, and there is room for more in a row. */
  opens?: boolean;
}) {
  const sites = useMemo(
    () =>
      LOOKS.map((each) => ({
        look: each,
        site: exampleSite({ look: each, brandColour, company }),
      })),
    [brandColour, company],
  );

  return (
    <fieldset>
      <legend className="sr-only">Theme</legend>
      <div
        className={`grid gap-3.5 ${opens ? "grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "grid-cols-2"}`}
      >
        {sites.map(({ look: each, site }) => (
          <ChoiceCard
            key={each}
            group="look"
            value={each}
            chosen={each === look}
            onChoose={() => onChoose(each)}
            name={LOOK_DETAILS[each].name}
            summary={LOOK_DETAILS[each].summary}
            opens={opens}
          >
            <span className="border-line block border-b">
              <SitePreview
                site={site}
                title={`${LOOK_DETAILS[each].name} theme`}
                {...THUMBNAIL}
              />
            </span>
          </ChoiceCard>
        ))}
      </div>
    </fieldset>
  );
}
