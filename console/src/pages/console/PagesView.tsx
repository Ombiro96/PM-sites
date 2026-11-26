import { useEffect, useMemo, useState } from "react";
import { DEFAULT_NAV_LABELS, HOUSES_PATH, PAGE_PATHS } from "@/lib/site/pages";
import type { PageKind, SiteDocument } from "@/lib/site/types";
import { Button } from "../../components/fields";
import { PreviewPanel } from "../../components/PreviewPanel";
import { SectionForm } from "../../components/SectionForm";
import type { Company } from "../../lib/company";
import {
  addable,
  addablePages,
  addPage,
  addSection,
  canRemovePage,
  moveSection,
  newPage,
  newSection,
  removePage,
  removeSection,
  replaceSection,
  sectionsOf,
} from "../../lib/draft";
import { tell } from "../../lib/feedback";
import { draftSite } from "../../lib/preview";
import { ruleFor, type Rules } from "../../lib/rules";
import type { Picture, Site } from "../../lib/site";

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** The pages as visitors will see them, beside the list of their sections and the form for the one being changed. */
export function PagesView({
  openPageId = "",
  openSectionId = "",
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
  /** A page to show first, from `/website/pages/<id>`. */
  openPageId?: string;
  /** A section of that page to open for changing, from `/website/pages/<id>/<section id>`. */
  openSectionId?: string;
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
  const known = (id: string) => working.pages.some((each) => each.id === id);
  const [pageId, setPageId] = useState(
    known(openPageId) ? openPageId : (working.pages[0]?.id ?? ""),
  );
  const [selected, setSelected] = useState(openSectionId);
  const [adding, setAdding] = useState(false);
  const [addingPage, setAddingPage] = useState(false);
  // A page added here gets its real id from the backend on save; its kind finds it again.
  const [addedKind, setAddedKind] = useState<PageKind | null>(null);

  useEffect(() => {
    if (!known(openPageId)) return;
    setPageId(openPageId);
    setSelected(openSectionId);
    setAdding(false);
    // Edits replace `working` and must not throw away the section being edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPageId, openSectionId]);

  const page =
    working.pages.find((each) => each.id === pageId) ??
    working.pages.find((each) => each.kind === addedKind) ??
    working.pages[0];
  const pageChoices = addablePages(rules, working);
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

  const openPage = (id: string) => {
    setPageId(id);
    setAddedKind(null);
    setSelected("");
    setAdding(false);
    setAddingPage(false);
  };

  /** A menu or footer link clicked in the preview opens that page here, as its tab would. */
  const followPreviewLink = (clicked: string) => {
    const path = clicked.replace(/\/+$/, "") || "/";
    const target = working.pages.find((each) => PAGE_PATHS[each.kind] === path);
    if (target) openPage(target.id);
    else if (path === HOUSES_PATH || path.startsWith(`${HOUSES_PATH}/`))
      tell({
        tone: "info",
        title: "Houses to let is not edited here",
        text: "That page is drawn from your adverts in the Bomahut dashboard.",
      });
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[27rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        {dirty ? (
          <div className="border-line sticky top-20 z-[5] flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-md">
            <p className="text-sm font-medium">
              Save or discard these changes before leaving Edit pages.
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
              onClick={() => openPage(each.id)}
              className={`min-h-11 rounded-lg px-4 text-[15px] font-semibold ${each.id === page.id ? "bg-brand text-white" : "text-ink-muted"}`}
            >
              {each.title}
            </button>
          ))}
          {pageChoices.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setAddingPage(true);
                setSelected("");
                setAdding(false);
              }}
              className="text-brand min-h-11 rounded-lg px-4 text-[15px] font-semibold"
            >
              + Add page
            </button>
          ) : null}
        </div>

        {addingPage ? (
          <div className="border-line rounded-xl border bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Add a page</h2>
              <Button tone="quiet" onClick={() => setAddingPage(false)}>
                Close
              </Button>
            </div>
            <ul className="divide-line divide-y">
              {pageChoices.map((kind) => (
                <li key={kind}>
                  <button
                    type="button"
                    onClick={() => {
                      const added = newPage(rules, kind);
                      onWorking(addPage(working, rules, added));
                      setPageId(added.id);
                      setAddedKind(kind);
                      setAddingPage(false);
                    }}
                    className="hover:bg-surface w-full px-1 py-2.5 text-left"
                  >
                    <span className="block font-semibold">
                      {DEFAULT_NAV_LABELS[kind]}
                    </span>
                    <span className="text-ink-muted block text-sm">
                      {PAGE_PATHS[kind]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
            {canRemovePage(page) ? (
              <Button
                tone="quiet"
                onClick={() => {
                  onWorking(removePage(working, page.id));
                  setPageId(working.pages[0]?.id ?? "");
                  setAddedKind(null);
                }}
              >
                Remove the {page.title} page
              </Button>
            ) : null}
          </>
        )}
      </div>

      <PreviewPanel
        site={preview}
        caption="Click any part of the page to change it, or a link in its menu to open that page. The houses and figures shown are examples."
        path={PAGE_PATHS[page.kind]}
        selected={selected}
        onPick={select}
        onGo={followPreviewLink}
      />
    </div>
  );
}
