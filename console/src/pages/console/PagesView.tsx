import { useMemo, useState } from "react";
import { PAGE_PATHS } from "@/lib/site/pages";
import type { SiteDocument } from "@/lib/site/types";
import { Button } from "../../components/fields";
import { PreviewPanel } from "../../components/PreviewPanel";
import { SectionForm } from "../../components/SectionForm";
import type { Company } from "../../lib/company";
import {
  addable,
  addSection,
  moveSection,
  newSection,
  removeSection,
  replaceSection,
  sectionsOf,
} from "../../lib/draft";
import { draftSite } from "../../lib/preview";
import { ruleFor, type Rules } from "../../lib/rules";
import type { Picture, Site } from "../../lib/site";

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** The pages as visitors will see them, beside the list of their sections and the form for the one being changed. */
export function PagesView({
  site,
  rules,
  working,
  dirty,
  busy,
  company,
  pictures,
  onPictureAdded,
  onWorking,
  onSave,
  onDiscard,
}: {
  site: Site;
  rules: Rules;
  working: SiteDocument;
  dirty: boolean;
  busy: boolean;
  company: Company | null;
  pictures: readonly Picture[];
  onPictureAdded: (picture: Picture) => void;
  onWorking: (document: SiteDocument) => void;
  onSave: () => Promise<boolean>;
  onDiscard: () => void;
}) {
  const [pageId, setPageId] = useState(working.pages[0]?.id ?? "");
  const [selected, setSelected] = useState("");
  const [adding, setAdding] = useState(false);

  const page =
    working.pages.find((each) => each.id === pageId) ?? working.pages[0];
  const sections = page ? sectionsOf(page) : [];
  const at = sections.findIndex((each) => each.id === selected);
  const section = at >= 0 ? sections[at] : undefined;
  const rule = section ? ruleFor(rules, section.type) : undefined;
  const choices = page ? addable(rules, page) : [];

  const preview = useMemo(
    () =>
      draftSite({
        id: site.id,
        addressName: site.addressName,
        look: site.look,
        brandColour: site.brandColour,
        document: working,
        company,
        pictures,
      }),
    [site, working, company, pictures],
  );

  if (!page) return null;

  const select = (sectionId: string) => {
    setSelected(sectionId);
    setAdding(false);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[27rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        {dirty ? (
          <div className="border-line sticky top-20 z-[5] flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-md">
            <p className="text-sm font-medium">
              You have changes that are not saved.
            </p>
            <div className="flex gap-2">
              <Button
                tone="quiet"
                disabled={busy}
                onClick={() => {
                  setSelected("");
                  onDiscard();
                }}
              >
                Discard
              </Button>
              <Button
                tone="solid"
                disabled={busy}
                onClick={() =>
                  void onSave().then((saved) => saved && setSelected(""))
                }
              >
                Save to draft
              </Button>
            </div>
          </div>
        ) : null}

        <div
          role="tablist"
          aria-label="Pages"
          className="border-line flex flex-wrap gap-1 self-start rounded-xl border bg-white p-1"
        >
          {working.pages.map((each) => (
            <button
              key={each.id}
              type="button"
              role="tab"
              aria-selected={each.id === page.id}
              onClick={() => {
                setPageId(each.id);
                setSelected("");
                setAdding(false);
              }}
              className={`min-h-11 rounded-lg px-4 text-[15px] font-semibold ${each.id === page.id ? "bg-brand text-white" : "text-ink-muted"}`}
            >
              {each.title}
            </button>
          ))}
        </div>

        {section && rule ? (
          <SectionForm
            section={section}
            rule={rule}
            rules={rules}
            document={working}
            pictures={pictures}
            onPictureAdded={onPictureAdded}
            fixed={at === 0}
            canMoveUp={at > 1}
            canMoveDown={at > 0 && at < sections.length - 1}
            onChange={(changed) =>
              onWorking(replaceSection(working, page.id, changed))
            }
            onMove={(by) =>
              onWorking(moveSection(working, page.id, section.id, by))
            }
            onRemove={() => {
              onWorking(removeSection(working, page.id, section.id));
              setSelected("");
            }}
            onClose={() => setSelected("")}
          />
        ) : (
          <>
            <ol className="flex flex-col gap-2">
              {sections.map((each) => (
                <li key={each.id}>
                  <button
                    type="button"
                    onClick={() => select(each.id)}
                    className={`border-line hover:border-brand flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left ${each.hidden ? "opacity-60" : ""}`}
                  >
                    <span className="min-w-0">
                      <span className="text-ink-muted block text-xs font-bold tracking-wider uppercase">
                        {ruleFor(rules, each.type)?.name ?? each.type}
                        {each.hidden ? " · hidden from visitors" : ""}
                      </span>
                      <span className="block truncate font-semibold">
                        {text(each.fields.heading)}
                      </span>
                    </span>
                    <span className="bg-brand shrink-0 rounded-full px-3 py-1 text-sm font-semibold text-white">
                      Edit
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            {adding ? (
              <div className="border-line rounded-xl border bg-white p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h2 className="font-semibold">Add a section</h2>
                  <Button tone="quiet" onClick={() => setAdding(false)}>
                    Close
                  </Button>
                </div>
                <ul className="divide-line divide-y">
                  {choices.map((each) => (
                    <li key={each.type}>
                      <button
                        type="button"
                        onClick={() => {
                          const added = newSection(each);
                          onWorking(addSection(working, page.id, added));
                          select(added.id);
                        }}
                        className="hover:bg-surface w-full px-1 py-2.5 text-left"
                      >
                        <span className="block font-semibold">{each.name}</span>
                        <span className="text-ink-muted block text-sm">
                          {each.description}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : choices.length > 0 ? (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="text-brand hover:border-brand min-h-12 rounded-xl border-2 border-dashed border-[#b9bdc9] font-semibold"
              >
                + Add a section to this page
              </button>
            ) : null}
          </>
        )}
      </div>

      <PreviewPanel
        site={preview}
        caption="Click any part of the page to change it. The houses and figures shown are examples."
        path={PAGE_PATHS[page.kind]}
        selected={selected}
        onPick={select}
      />
    </div>
  );
}
