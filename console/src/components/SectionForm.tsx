import { useState } from "react";
import type { SiteDocument } from "@/lib/site/types";
import { PATHS } from "../lib/config";
import {
  itemLimits,
  newItem,
  sectionErrors,
  sectionsOf,
  type EditSection,
  type Fields,
  type Item,
} from "../lib/draft";
import { fieldLabel, optionLabel } from "../lib/labels";
import {
  ruleFor,
  type FieldRule,
  type Rules,
  type SectionRule,
} from "../lib/rules";
import type { Picture } from "../lib/site";
import { TextLink } from "./AuthLayout";
import {
  Button,
  CheckField,
  SelectField,
  TextAreaField,
  TextField,
} from "./fields";

type PictureValue = { asset: string; alt?: string };
type ButtonValue = {
  label: string;
  to: { kind: string; page?: string; section?: string; message?: string };
};

/** What every input of the form needs beside its own value. */
type Around = {
  rules: Rules;
  document: SiteDocument;
  pictures: readonly Picture[];
};

const OWN_WORDING = "";

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** A copy with `name` set, or left out when the value is empty. */
function withValue<Holder extends Fields>(
  holder: Holder,
  name: string,
  value: unknown,
): Holder {
  const next: Fields = { ...holder };
  if (
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
    delete next[name];
  else next[name] = value;
  return next as Holder;
}

function PictureInput({
  id,
  label,
  value,
  around,
  onChange,
}: {
  id: string;
  label: string;
  value: PictureValue | undefined;
  around: Around;
  onChange: (value: PictureValue | undefined) => void;
}) {
  const [choosing, setChoosing] = useState(false);
  const chosen = around.pictures.find((each) => each.id === value?.asset);

  return (
    <div className="mb-4">
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        {chosen ? (
          <img
            src={chosen.url}
            alt={chosen.description}
            className="border-line h-16 w-24 rounded-lg border object-cover"
          />
        ) : (
          <span className="bg-line/50 text-ink-muted flex h-16 w-24 items-center justify-center rounded-lg text-xs">
            No picture
          </span>
        )}
        <Button onClick={() => setChoosing(!choosing)}>
          {choosing ? "Close" : chosen ? "Change" : "Choose a picture"}
        </Button>
        {value ? (
          <Button tone="quiet" onClick={() => onChange(undefined)}>
            Remove
          </Button>
        ) : null}
      </div>
      {choosing ? (
        around.pictures.length === 0 ? (
          <p className="text-ink-muted mt-2 text-sm">
            You have no pictures yet.{" "}
            <TextLink href={`${PATHS.website}/pictures`}>
              Upload one under Pictures
            </TextLink>
            .
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {around.pictures.map((each) => (
              <button
                key={each.id}
                type="button"
                aria-pressed={each.id === value?.asset}
                title={each.description}
                onClick={() => {
                  onChange({
                    asset: each.id,
                    alt: value?.alt || each.description,
                  });
                  setChoosing(false);
                }}
                className="aria-pressed:ring-brand overflow-hidden rounded-lg aria-pressed:ring-2 aria-pressed:ring-offset-2"
              >
                <img
                  src={each.url}
                  alt={each.description}
                  className="h-16 w-full object-cover"
                />
              </button>
            ))}
          </div>
        )
      ) : null}
      {value ? (
        <div className="mt-3">
          <TextField
            id={`${id}-alt`}
            label="What the picture shows"
            hint="Read aloud to visitors who cannot see it."
            maxLength={around.rules.picture.alt_max}
            value={value.alt ?? ""}
            onChange={(event) =>
              onChange({ ...value, alt: event.target.value })
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function ButtonInput({
  id,
  label,
  rule,
  value,
  error,
  around,
  onChange,
}: {
  id: string;
  label: string;
  rule: FieldRule;
  value: ButtonValue | undefined;
  error?: string;
  around: Around;
  onChange: (value: ButtonValue | undefined) => void;
}) {
  const { rules, document } = around;
  const to = value?.to ?? { kind: "houses" };
  const page =
    document.pages.find((each) => each.id === to.page) ?? document.pages[0];
  const sections = page ? sectionsOf(page).filter((each) => !each.hidden) : [];
  const set = (changes: Partial<ButtonValue>) =>
    onChange({ label: value?.label ?? "", to, ...changes });

  return (
    <fieldset className="border-line mb-4 rounded-xl border px-3.5 pt-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <TextField
        id={`${id}-label`}
        label="Words on the button"
        hint={rule.required ? undefined : "Leave empty for no button here."}
        maxLength={rules.button.label_max}
        value={value?.label ?? ""}
        error={error}
        onChange={(event) =>
          event.target.value === "" && !rule.required
            ? onChange(undefined)
            : set({ label: event.target.value })
        }
      />
      {value ? (
        <>
          <SelectField
            id={`${id}-to`}
            label="Where it takes the visitor"
            value={to.kind}
            options={Object.keys(rules.action_kinds).map((kind) => ({
              value: kind,
              label: optionLabel(kind),
            }))}
            onChange={(kind) =>
              set({
                to:
                  kind === "page" || kind === "section"
                    ? {
                        kind,
                        page: page?.id,
                        ...(kind === "section"
                          ? { section: sections[0]?.id }
                          : {}),
                      }
                    : { kind },
              })
            }
          />
          {to.kind === "page" || to.kind === "section" ? (
            <SelectField
              id={`${id}-page`}
              label="Page"
              value={page?.id ?? ""}
              options={document.pages.map((each) => ({
                value: each.id,
                label: each.title,
              }))}
              onChange={(pageId) => {
                const chosen = document.pages.find(
                  (each) => each.id === pageId,
                );
                set({
                  to:
                    to.kind === "section"
                      ? {
                          kind: "section",
                          page: pageId,
                          section: chosen?.sections.find((each) => !each.hidden)
                            ?.id,
                        }
                      : { kind: "page", page: pageId },
                });
              }}
            />
          ) : null}
          {to.kind === "section" ? (
            <SelectField
              id={`${id}-section`}
              label="Section"
              value={to.section ?? ""}
              options={sections.map((each) => ({
                value: each.id,
                label: `${ruleFor(rules, each.type)?.name ?? each.type}: ${text(each.fields.heading)}`,
              }))}
              onChange={(section) => set({ to: { ...to, section } })}
            />
          ) : null}
          {to.kind === "whatsapp" ? (
            <TextField
              id={`${id}-message`}
              label="Message to start the chat with (optional)"
              maxLength={rules.button.whatsapp_message_max}
              value={to.message ?? ""}
              onChange={(event) =>
                set({
                  to: event.target.value
                    ? { kind: "whatsapp", message: event.target.value }
                    : { kind: "whatsapp" },
                })
              }
            />
          ) : null}
        </>
      ) : null}
    </fieldset>
  );
}

function FieldInput({
  id,
  sectionType,
  rule,
  value,
  error,
  pictureLimit,
  around,
  onChange,
}: {
  id: string;
  sectionType: string;
  rule: FieldRule;
  value: unknown;
  error?: string;
  /** For a list of pictures: the most this layout takes. */
  pictureLimit?: number;
  around: Around;
  onChange: (value: unknown) => void;
}) {
  const label = `${fieldLabel(sectionType, rule.name)}${rule.required ? "" : " (optional)"}`;

  if (rule.kind === "text" || rule.kind === "longtext") {
    const shared = {
      id,
      label,
      error,
      hint: rule.max_length > 0 ? `Up to ${rule.max_length} letters.` : "",
      maxLength: rule.max_length > 0 ? rule.max_length : undefined,
      value: text(value),
    };
    return rule.kind === "longtext" || rule.max_length > 120 ? (
      <TextAreaField
        {...shared}
        rows={rule.kind === "longtext" ? 6 : 3}
        onChange={(event) => onChange(event.target.value)}
      />
    ) : (
      <TextField
        {...shared}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (rule.kind === "picture")
    return (
      <PictureInput
        id={id}
        label={label}
        value={value as PictureValue | undefined}
        around={around}
        onChange={onChange}
      />
    );

  if (rule.kind === "pictures") {
    const chosen = Array.isArray(value) ? (value as PictureValue[]) : [];
    const limit = pictureLimit ?? rule.max_count;
    return (
      <div>
        {chosen.map((each, at) => (
          <PictureInput
            key={at}
            id={`${id}-${at}`}
            label={`Picture ${at + 1}`}
            value={each}
            around={around}
            onChange={(next) =>
              onChange(
                next
                  ? chosen.map((old, index) => (index === at ? next : old))
                  : chosen.filter((_, index) => index !== at),
              )
            }
          />
        ))}
        {chosen.length < limit ? (
          <PictureInput
            key={chosen.length}
            id={`${id}-new`}
            label={
              chosen.length === 0 ? `${label}` : `Picture ${chosen.length + 1}`
            }
            value={undefined}
            around={around}
            onChange={(next) => next && onChange([...chosen, next])}
          />
        ) : null}
      </div>
    );
  }

  if (rule.kind === "button")
    return (
      <ButtonInput
        id={id}
        label={label}
        rule={rule}
        value={value as ButtonValue | undefined}
        error={error}
        around={around}
        onChange={onChange}
      />
    );

  if (rule.kind === "choice") {
    const options = rule.options.map((option) => ({
      value: String(option),
      label: optionLabel(option),
    }));
    return (
      <SelectField
        id={id}
        label={label}
        error={error}
        value={value === undefined ? "" : String(value)}
        options={
          rule.required && value !== undefined
            ? options
            : [{ value: "", label: "None" }, ...options]
        }
        onChange={(chosen) =>
          onChange(rule.options.find((option) => String(option) === chosen))
        }
      />
    );
  }

  if (rule.kind === "choices") {
    const chosen = Array.isArray(value) ? (value as (string | number)[]) : [];
    return (
      <fieldset className="mb-4">
        <legend className="text-sm font-medium">{label}</legend>
        {rule.options.map((option) => (
          <CheckField
            key={option}
            label={optionLabel(option)}
            checked={chosen.includes(option)}
            onChange={(ticked) =>
              onChange(
                rule.options.filter((each) =>
                  each === option ? ticked : chosen.includes(each),
                ),
              )
            }
          />
        ))}
        {error ? (
          <p role="alert" className="text-bad text-sm">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  }

  return (
    <CheckField
      label={fieldLabel(sectionType, rule.name)}
      error={error}
      checked={value === true}
      onChange={(ticked) => onChange(ticked ? true : undefined)}
    />
  );
}

function ItemsInput({
  section,
  rule,
  errors,
  around,
  onChange,
}: {
  section: EditSection;
  rule: SectionRule;
  errors: Record<string, string>;
  around: Around;
  onChange: (items: Item[]) => void;
}) {
  const library = rule.items;
  if (!library) return null;
  const items = section.items ?? [];
  const { max } = itemLimits(rule, section.layout);
  const replace = (at: number, item: Item) =>
    onChange(items.map((old, index) => (index === at ? item : old)));

  return (
    <div className="mb-4">
      {items.map((item, at) => {
        const standard = library.standard_key
          ? text(item[library.standard_key])
          : "";
        return (
          <fieldset
            key={item.id ?? at}
            className="border-line mb-3 rounded-xl border px-3.5 pt-3"
          >
            <legend className="px-1 text-sm font-medium">
              {library.label} {at + 1}
            </legend>
            {library.standard_key ? (
              <SelectField
                id={`item-${at}-standard`}
                label="Service"
                hint={
                  standard
                    ? "We supply the wording for this service."
                    : undefined
                }
                value={standard}
                options={[
                  ...library.standard_options.map((option) => ({
                    value: option,
                    label: optionLabel(option),
                  })),
                  {
                    value: OWN_WORDING,
                    label: "Another service, in your words",
                  },
                ]}
                onChange={(chosen) =>
                  replace(
                    at,
                    chosen === OWN_WORDING
                      ? { id: item.id }
                      : { id: item.id, [library.standard_key]: chosen },
                  )
                }
              />
            ) : null}
            {standard
              ? null
              : library.fields.map((field) => (
                  <FieldInput
                    key={field.name}
                    id={`item-${at}-${field.name}`}
                    sectionType={section.type}
                    rule={field}
                    value={item[field.name]}
                    error={errors[`items.${at}.${field.name}`]}
                    around={around}
                    onChange={(value) =>
                      replace(at, withValue(item, field.name, value))
                    }
                  />
                ))}
            <div className="mb-3 flex justify-end">
              <Button
                tone="quiet"
                onClick={() =>
                  onChange(items.filter((_, index) => index !== at))
                }
              >
                Remove this {library.label.toLowerCase()}
              </Button>
            </div>
          </fieldset>
        );
      })}
      {errors.items ? (
        <p role="alert" className="text-bad mb-2 text-sm">
          {errors.items}
        </p>
      ) : null}
      {items.length < max ? (
        <Button onClick={() => onChange([...items, newItem(library)])}>
          Add a {library.label.toLowerCase()}
        </Button>
      ) : null}
    </div>
  );
}

/** The form for one section, built from that section type's rules. Every change is handed up as a whole section. */
export function SectionForm({
  section,
  rule,
  rules,
  document,
  pictures,
  fixed,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
  onRemove,
  onClose,
}: {
  section: EditSection;
  rule: SectionRule;
  rules: Rules;
  document: SiteDocument;
  pictures: readonly Picture[];
  /** The opening section of a page stays where it is and cannot be hidden or removed. */
  fixed: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (section: EditSection) => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const around: Around = { rules, document, pictures };
  const errors = sectionErrors(section, rules);
  const pictureCounts = rule.layout_picture_counts.find(
    ([layout]) => layout === section.layout,
  )?.[1];

  return (
    <div className="border-brand ring-brand-soft rounded-xl border bg-white p-5 ring-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Editing: {rule.name}</h2>
          <p className="text-ink-muted text-sm">{rule.description}</p>
        </div>
        <Button onClick={onClose}>Done</Button>
      </div>
      {Object.keys(errors).length > 0 ? (
        <p className="text-ink-muted mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm">
          The marked parts are needed before you can publish. You can still save
          your draft.
        </p>
      ) : null}
      {rule.fields.map((field) => (
        <FieldInput
          key={field.name}
          id={`field-${field.name}`}
          sectionType={section.type}
          rule={field}
          value={section.fields[field.name]}
          error={errors[field.name]}
          pictureLimit={pictureCounts ? Math.max(...pictureCounts) : undefined}
          around={around}
          onChange={(value) =>
            onChange({
              ...section,
              fields: withValue(section.fields, field.name, value),
            })
          }
        />
      ))}
      {rule.items ? (
        <ItemsInput
          section={section}
          rule={rule}
          errors={errors}
          around={around}
          onChange={(items) => onChange({ ...section, items })}
        />
      ) : null}
      {rule.layouts.length > 1 ? (
        <SelectField
          id="section-layout"
          label="Layout"
          value={section.layout ?? rule.layouts[0]}
          options={rule.layouts.map((layout) => ({
            value: layout,
            label: optionLabel(layout),
          }))}
          onChange={(layout) => onChange({ ...section, layout })}
        />
      ) : null}
      {!rule.always_brand && rule.backgrounds.length > 1 ? (
        <SelectField
          id="section-background"
          label="Background"
          value={section.background ?? rule.backgrounds[0]}
          options={rule.backgrounds.map((background) => ({
            value: background,
            label: optionLabel(background),
          }))}
          onChange={(background) => onChange({ ...section, background })}
        />
      ) : null}
      {fixed ? (
        <p className="text-ink-muted border-line border-t pt-4 text-sm">
          This section opens the page, so it stays first and cannot be hidden.
        </p>
      ) : (
        <div className="border-line flex flex-wrap gap-2 border-t pt-4">
          <Button
            onClick={() => onChange({ ...section, hidden: !section.hidden })}
          >
            {section.hidden ? "Show this section again" : "Hide this section"}
          </Button>
          <Button disabled={!canMoveUp} onClick={() => onMove(-1)}>
            Move up
          </Button>
          <Button disabled={!canMoveDown} onClick={() => onMove(1)}>
            Move down
          </Button>
          <Button tone="danger" onClick={onRemove}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
