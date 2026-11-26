import { DEFAULT_NAV_LABELS } from "@/lib/site/pages";
import type { Page, PageKind, Section, SiteDocument } from "@/lib/site/types";
import { fieldLabel } from "./labels";
import {
  ruleFor,
  type FieldRule,
  type ItemsRule,
  type Rules,
  type SectionRule,
} from "./rules";

/** A section as the editor handles it: whatever its type, its fields are read by name from the rules. */
export type Fields = Record<string, unknown>;
export type Item = Fields & { id?: string };
export type EditSection = {
  id: string;
  type: string;
  layout?: string;
  background?: string;
  hidden?: boolean;
  fields: Fields;
  items?: Item[];
};

/** Ids are made by the backend. Until a save answers, a new section or item carries one of these. */
const NEW = "new_";
let made = 0;
export const newId = () => `${NEW}${Date.now().toString(36)}${made++}`;

export const asEdit = (section: Section) => section as unknown as EditSection;

const text = (value: unknown) => (typeof value === "string" ? value : "");

export function sectionsOf(page: Page): EditSection[] {
  return page.sections.map(asEdit);
}

function withSections(
  document: SiteDocument,
  pageId: string,
  change: (sections: EditSection[]) => EditSection[],
): SiteDocument {
  return {
    ...document,
    pages: document.pages.map((page) =>
      page.id === pageId
        ? {
            ...page,
            sections: change(sectionsOf(page)) as unknown as Section[],
          }
        : page,
    ),
  };
}

export function replaceSection(
  document: SiteDocument,
  pageId: string,
  section: EditSection,
): SiteDocument {
  return withSections(document, pageId, (sections) =>
    sections.map((each) => (each.id === section.id ? section : each)),
  );
}

export function removeSection(
  document: SiteDocument,
  pageId: string,
  sectionId: string,
): SiteDocument {
  return withSections(document, pageId, (sections) =>
    sections.filter((each) => each.id !== sectionId),
  );
}

/** Moves a section one place. The opening section stays first, so nothing moves above the second place. */
export function moveSection(
  document: SiteDocument,
  pageId: string,
  sectionId: string,
  by: -1 | 1,
): SiteDocument {
  return withSections(document, pageId, (sections) => {
    const from = sections.findIndex((each) => each.id === sectionId);
    const to = from + by;
    if (from < 1 || to < 1 || to >= sections.length) return sections;
    const moved = [...sections];
    [moved[from], moved[to]] = [moved[to], moved[from]];
    return moved;
  });
}

export function addSection(
  document: SiteDocument,
  pageId: string,
  section: EditSection,
): SiteDocument {
  return withSections(document, pageId, (sections) => [...sections, section]);
}

/** The section types this page can still take. */
export function addable(rules: Rules, page: Page): SectionRule[] {
  if (page.sections.length >= rules.max_sections_per_page) return [];
  const opening = rules.page.opening_section[page.kind];
  return rules.sections.filter(
    (rule) =>
      rule.type !== opening &&
      rule.pages.includes(page.kind) &&
      page.sections.filter((each) => each.type === rule.type).length <
        rule.max_per_page,
  );
}

export function newItem(items: ItemsRule): Item {
  return items.standard_key
    ? { id: newId(), [items.standard_key]: items.standard_options[0] }
    : { id: newId() };
}

/** A section of this type with the least it needs to be drawn. */
export function newSection(rule: SectionRule): EditSection {
  const fields: Fields = {};
  for (const field of rule.fields) {
    if (field.name === "heading") fields.heading = rule.name;
    else if (field.kind === "choice" && field.required)
      fields[field.name] = field.options[0];
    else if (field.kind === "choices")
      fields[field.name] = field.options.slice(0, field.min_count);
    else if (field.kind === "button" && field.required)
      fields[field.name] = { label: "Contact us", to: { kind: "call" } };
  }
  const section: EditSection = { id: newId(), type: rule.type, fields };
  if (rule.layouts.length > 0) section.layout = rule.layouts[0];
  if (rule.backgrounds.length > 0) section.background = rule.backgrounds[0];
  if (rule.items)
    section.items = Array.from({ length: rule.items.min_count }, () =>
      newItem(rule.items as ItemsRule),
    );
  return section;
}

/** The pages a site cannot be published without, as the backend's publish check has them. */
const REQUIRED_PAGES: readonly PageKind[] = ["home", "contact"];

/** The pages the rules know that this document does not have yet. */
export function addablePages(rules: Rules, document: SiteDocument): PageKind[] {
  return rules.page_kinds.filter(
    (kind) => !document.pages.some((page) => page.kind === kind),
  );
}

/** A page of this kind: its opening section and, where one is named after the page, that section. */
export function newPage(rules: Rules, kind: PageKind): Page {
  const title = DEFAULT_NAV_LABELS[kind];
  const sections: EditSection[] = [];
  const opening = ruleFor(rules, rules.page.opening_section[kind]);
  if (opening) {
    const section = newSection(opening);
    if ("heading" in section.fields) section.fields.heading = title;
    sections.push(section);
  }
  const own = ruleFor(rules, kind);
  if (own && own !== opening && own.pages.includes(kind))
    sections.push(newSection(own));
  return {
    id: newId(),
    kind,
    title,
    nav_label: title,
    search_description: "",
    sections: sections as unknown as Section[],
  };
}

/** Adds a page, keeping the pages in the order the rules list them. */
export function addPage(
  document: SiteDocument,
  rules: Rules,
  page: Page,
): SiteDocument {
  const place = (kind: PageKind) => rules.page_kinds.indexOf(kind);
  return {
    ...document,
    pages: [...document.pages, page].sort(
      (first, second) => place(first.kind) - place(second.kind),
    ),
  };
}

export const canRemovePage = (page: Page) =>
  !REQUIRED_PAGES.includes(page.kind);

export function removePage(
  document: SiteDocument,
  pageId: string,
): SiteDocument {
  return {
    ...document,
    pages: document.pages.filter((page) => page.id !== pageId),
  };
}

/** The document as it is sent: ids the editor made up are left out, for the backend to give real ones. */
export function withoutNewIds(document: SiteDocument): SiteDocument {
  const clean = <Holder extends { id?: string }>(holder: Holder): Holder => {
    if (!holder.id?.startsWith(NEW)) return holder;
    const kept = { ...holder };
    delete kept.id;
    return kept;
  };
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...clean(page),
      sections: sectionsOf(page).map((section) => ({
        ...clean(section),
        ...(section.items ? { items: section.items.map(clean) } : {}),
      })) as unknown as Section[],
    })),
  };
}

/** For each picture a document uses, the titles of the pages that use it. */
export function picturesUsed(document: SiteDocument): Map<string, string[]> {
  const used = new Map<string, string[]>();
  const note = (value: unknown, page: Page) => {
    const asset =
      typeof value === "object" && value !== null
        ? (value as { asset?: unknown }).asset
        : undefined;
    if (typeof asset !== "string") return;
    const pages = used.get(asset) ?? [];
    if (!pages.includes(page.title)) pages.push(page.title);
    used.set(asset, pages);
  };
  for (const page of document.pages)
    for (const section of sectionsOf(page))
      for (const fields of [section.fields, ...(section.items ?? [])])
        for (const value of Object.values(fields))
          for (const each of Array.isArray(value) ? value : [value])
            note(each, page);
  return used;
}

function fieldError(
  rule: FieldRule,
  value: unknown,
  rules: Rules,
): string | undefined {
  if (rule.kind === "text" || rule.kind === "longtext") {
    const length = text(value).trim().length;
    if (length === 0) return rule.required ? "This is needed." : undefined;
    if (length < rule.min_length)
      return `Write at least ${rule.min_length} letters.`;
    if (rule.max_length > 0 && length > rule.max_length)
      return `Keep this to ${rule.max_length} letters.`;
    return undefined;
  }
  if (rule.kind === "button") {
    const label = text((value as { label?: unknown } | undefined)?.label);
    if (label.trim() === "")
      return rule.required ? "Give the button its words." : undefined;
    if (label.trim().length < rules.button.label_min)
      return `Write at least ${rules.button.label_min} letters.`;
    return undefined;
  }
  if (rule.kind === "choice")
    return rule.required && (value === undefined || value === "")
      ? "Choose one."
      : undefined;
  if (rule.kind === "choices") {
    const count = Array.isArray(value) ? value.length : 0;
    if (count < rule.min_count) return `Choose at least ${rule.min_count}.`;
    if (rule.max_count > 0 && count > rule.max_count)
      return `Choose at most ${rule.max_count}.`;
    return undefined;
  }
  if (rule.kind === "flag")
    return rule.required && value !== true ? "This must be ticked." : undefined;
  return undefined;
}

/** How many entries this section may hold, which can depend on its layout. */
export function itemLimits(
  rule: SectionRule,
  layout: string | undefined,
): { min: number; max: number } {
  const forLayout = rule.layout_item_counts.find(([name]) => name === layout);
  if (forLayout) return { min: forLayout[1], max: forLayout[2] };
  return { min: rule.items?.min_count ?? 0, max: rule.items?.max_count ?? 0 };
}

/**
 * What a section still needs before it can be published, by where it is:
 * a field's name, `items` for the number of entries, or `items.<n>.<name>`.
 * A draft with these can still be saved.
 */
export function sectionErrors(
  section: EditSection,
  rules: Rules,
): Record<string, string> {
  const rule = ruleFor(rules, section.type);
  if (!rule) return {};
  const errors: Record<string, string> = {};
  for (const field of rule.fields) {
    const error = fieldError(field, section.fields[field.name], rules);
    if (error) errors[field.name] = error;
  }
  if (rule.items) {
    const items = section.items ?? [];
    const { min, max } = itemLimits(rule, section.layout);
    const name = rule.items.label.toLowerCase();
    if (items.length < min)
      errors.items = `Add at least ${min} (${name}) to this section.`;
    else if (items.length > max)
      errors.items = `This layout takes at most ${max} (${name}).`;
    items.forEach((item, at) => {
      if (rule.items?.standard_key && item[rule.items.standard_key]) return;
      for (const field of rule.items?.fields ?? []) {
        const error = fieldError(field, item[field.name], rules);
        if (error) errors[`items.${at}.${field.name}`] = error;
      }
    });
  }
  return errors;
}

/** One sentence per thing a document still needs, saying where it is. */
export function documentProblems(
  document: SiteDocument,
  rules: Rules,
): { path: string; message: string }[] {
  const problems: { path: string; message: string }[] = [];
  document.pages.forEach((page, pageAt) =>
    sectionsOf(page).forEach((section, sectionAt) => {
      if (section.hidden) return;
      const rule = ruleFor(rules, section.type);
      for (const [where, message] of Object.entries(
        sectionErrors(section, rules),
      )) {
        const name = where.split(".").pop() ?? where;
        const field =
          where === "items" ? "" : `${fieldLabel(section.type, name)}: `;
        problems.push({
          path: `pages.${pageAt}.sections.${sectionAt}.${where}`,
          message: `${page.title}, ${rule?.name ?? section.type}. ${field}${message}`,
        });
      }
    }),
  );
  return problems;
}

/**
 * Where one of the backend's publish problems is: in words, and as the page
 * and section to open. Null when its path is not inside a page.
 */
export function problemPlace(
  path: string,
  document: SiteDocument,
  rules: Rules,
): { pageId: string; sectionId: string; where: string } | null {
  const match = /^pages\[(\d+)\](?:\.sections\[(\d+)\](?:\.(.+))?)?/.exec(path);
  const page = match ? document.pages[Number(match[1])] : undefined;
  if (!match || !page) return null;
  const section =
    match[2] === undefined ? undefined : sectionsOf(page)[Number(match[2])];
  if (!section) return { pageId: page.id, sectionId: "", where: page.title };
  const rule = ruleFor(rules, section.type);
  const parts = [page.title, rule?.name ?? section.type];
  const rest = match[3] ?? "";
  const item = /^items\[(\d+)\](?:\.(\w+))?/.exec(rest);
  const field = item ? item[2] : /^fields\.(\w+)/.exec(rest)?.[1];
  if (item)
    parts.push(`${rule?.items?.label ?? "Entry"} ${Number(item[1]) + 1}`);
  if (field) parts.push(fieldLabel(section.type, field));
  return { pageId: page.id, sectionId: section.id, where: parts.join(", ") };
}
