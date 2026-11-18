import { describe, expect, it } from "vitest";
import { temboHart } from "@/dev/tembo-hart";
import {
  addable,
  addSection,
  documentProblems,
  moveSection,
  newSection,
  picturesUsed,
  sectionErrors,
  sectionsOf,
  withoutNewIds,
} from "./draft";
import { ruleFor, type Rules } from "./rules";
import rulesData from "./standin/rules.json";

const rules = rulesData as unknown as Rules;
const document = temboHart.document;
const home = document.pages[0];
const ids = (pageAt: number, from = document) =>
  from.pages[pageAt].sections.map((section) => section.id);

describe("a draft being edited", () => {
  it("passes the contract's sample without problems", () => {
    expect(documentProblems(document, rules)).toEqual([]);
  });

  it("keeps the opening section first when sections move", () => {
    const [opening, second, third] = ids(0);
    expect(ids(0, moveSection(document, home.id, opening, 1))).toEqual(ids(0));
    expect(ids(0, moveSection(document, home.id, second, -1))).toEqual(ids(0));
    expect(
      ids(0, moveSection(document, home.id, third, -1)).slice(0, 3),
    ).toEqual([opening, third, second]);
  });

  it("offers only the sections a page can still take", () => {
    const offered = addable(rules, home).map((rule) => rule.type);
    expect(offered).not.toContain("top_banner");
    expect(offered).not.toContain("fees");
    for (const section of home.sections)
      if (ruleFor(rules, section.type)?.max_per_page === 1)
        expect(offered).not.toContain(section.type);
  });

  it("sends a new section without the id the editor made up", () => {
    const rule = ruleFor(rules, "questions");
    if (!rule) throw new Error("no questions rule");
    const added = addSection(document, home.id, newSection(rule));
    const sent = sectionsOf(withoutNewIds(added).pages[0]).at(-1);
    expect(sent?.type).toBe("questions");
    expect(sent && "id" in sent).toBe(false);
    expect(sent?.items?.every((item) => !("id" in item))).toBe(true);
    expect(ids(0, withoutNewIds(document))).toEqual(ids(0));
  });

  it("says what a new section still needs before publishing", () => {
    const rule = ruleFor(rules, "testimonials");
    if (!rule) throw new Error("no testimonials rule");
    const errors = sectionErrors(newSection(rule), rules);
    expect(errors.heading).toBeUndefined();
    expect(errors["items.0.quote"]).toBeDefined();
    expect(errors["items.0.permission"]).toBeDefined();
  });

  it("knows which pages use a picture", () => {
    expect(picturesUsed(document).get("as_skyline")).toEqual(["Home"]);
  });
});
