import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type {
  Background,
  ButtonField,
  PictureRef,
  Section,
} from "@/lib/site/types";

/**
 * Dev server only (`/__sections?look=…&only=…`): every section type in every layout
 * and background, with the longest text the rules allow, a very long company
 * name and missing pictures. This is where text limits are checked against
 * the designs.
 */

const WORDS =
  "managed buildings and collected rent across the city for owners who wanted statements they could read and tenants who wanted repairs done properly without having to ask twice".split(
    " ",
  );

/** Text of exactly `length` characters. */
function fill(length: number, start = 0): string {
  let text = "";
  for (let at = start; text.length < length; at += 1)
    text += `${WORDS[at % WORDS.length]} `;
  text = text.slice(0, length).trimEnd();
  text = text.padEnd(length, "x");
  return text[0].toUpperCase() + text.slice(1);
}

const MISSING: PictureRef = { asset: "as_missing", alt: "Missing picture" };
const picture = (asset: string): PictureRef => ({
  asset,
  alt: "Sample picture",
  focus: [0.5, 0.5],
});
const button = (to: ButtonField["to"]): ButtonField => ({
  label: fill(28, 3),
  to,
});
const items = <Item,>(count: number, make: (index: number) => Item) =>
  Array.from({ length: count }, (_, index) => ({
    id: `it_${index}`,
    ...make(index),
  }));

type Case = { note: string; section: Section };

let made = 0;
function make(note: string, section: Omit<Section, "id">): Case {
  made += 1;
  return { note, section: { ...section, id: `test_${made}` } as Section };
}

function withBackgrounds(
  backgrounds: Background[],
  build: (background: Background) => [string, Omit<Section, "id">],
): Case[] {
  return backgrounds.map((background) => {
    const [note, section] = build(background);
    return make(`${note} · ${background}`, section);
  });
}

function cases(): Case[] {
  made = 0;
  const bannerFields = {
    heading: fill(80),
    text: fill(240, 5),
    primary: button({ kind: "houses" }),
    secondary: button({ kind: "page", page: "pg_contact" }),
    badge: "houses_available" as const,
  };
  const banners = (
    ["split", "photo", "centre", "band", "plain"] as const
  ).flatMap((layout) => [
    make(`top_banner · ${layout} · with pictures`, {
      type: "top_banner",
      layout,
      fields: {
        ...bannerFields,
        pictures:
          layout === "band"
            ? [picture("as_block"), picture("as_keys"), picture("as_office")]
            : [picture("as_skyline")],
      },
    }),
    make(`top_banner · ${layout} · pictures missing`, {
      type: "top_banner",
      layout,
      fields: { ...bannerFields, pictures: [MISSING] },
    }),
  ]);

  return [
    make("page_title · with picture", {
      type: "page_title",
      fields: {
        heading: fill(60),
        text: fill(160, 4),
        picture: picture("as_block"),
      },
    }),
    make("page_title · picture missing", {
      type: "page_title",
      fields: { heading: fill(60), text: fill(160, 4), picture: MISSING },
    }),
    ...banners,
    make("top_banner · band · two pictures", {
      type: "top_banner",
      layout: "band",
      fields: {
        ...bannerFields,
        pictures: [picture("as_block"), picture("as_keys")],
      },
    }),
    ...(["cards", "list", "rows"] as const).flatMap((layout) =>
      withBackgrounds(["white", "tinted"], (background) => [
        `houses · ${layout}`,
        {
          type: "houses",
          layout,
          background,
          fields: { heading: fill(60), show: 6 },
        },
      ]),
    ),
    ...(["picture_left", "picture_right"] as const).flatMap((layout) =>
      withBackgrounds(["white", "tinted"], (background) => [
        `about · ${layout}`,
        {
          type: "about",
          layout,
          background,
          fields: {
            heading: fill(80),
            text: `${fill(230)}\n\n${fill(230, 7)}\n\n${fill(230, 11)}`,
            picture: picture("as_office"),
          },
        },
      ]),
    ),
    make("about · picture missing", {
      type: "about",
      layout: "picture_left",
      fields: {
        heading: fill(80),
        text: `${fill(340)}\n\n${fill(340, 7)}`,
        picture: MISSING,
      },
    }),
    ...(["cards", "list"] as const).flatMap((layout) =>
      withBackgrounds(["white", "tinted"], (background) => [
        `services · ${layout}`,
        {
          type: "services",
          layout,
          background,
          fields: { heading: fill(60) },
          items: [
            { id: "s1", service: "tenant_finding" },
            { id: "s2", service: "rent_collection" },
            { id: "s3", service: "utilities_billing" },
            ...items(5, (index) => ({
              title: fill(40, index),
              text: fill(140, index + 3),
            })),
          ],
        },
      ]),
    ),
    ...withBackgrounds(["tinted", "white", "brand"], (background) => [
      "steps",
      {
        type: "steps",
        background,
        fields: { heading: fill(60) },
        items: items(5, (index) => ({
          title: fill(40, index),
          text: fill(120, index + 2),
        })),
      },
    ]),
    ...withBackgrounds(["brand", "tinted"], (background) => [
      "figures",
      {
        type: "figures",
        background,
        fields: {
          heading: fill(60),
          show: ["buildings", "units", "towns", "houses_to_let"],
        },
      },
    ]),
    ...withBackgrounds(["white", "tinted"], (background) => [
      "buildings",
      { type: "buildings", background, fields: { heading: fill(60), show: 6 } },
    ]),
    ...withBackgrounds(["tinted", "white"], (background) => [
      "team",
      {
        type: "team",
        background,
        fields: { heading: fill(60) },
        items: items(8, (index) => ({
          name: fill(40, index),
          role: fill(40, index + 4),
          picture:
            index === 0
              ? picture("as_keys")
              : index === 1
                ? MISSING
                : undefined,
        })),
      },
    ]),
    ...withBackgrounds(["tinted", "white"], (background) => [
      "testimonials · single",
      {
        type: "testimonials",
        layout: "single",
        background,
        fields: { heading: fill(60) },
        items: items(1, () => ({
          quote: fill(240),
          by: fill(60, 6),
          permission: true,
        })),
      },
    ]),
    ...withBackgrounds(["tinted", "white"], (background) => [
      "testimonials · cards",
      {
        type: "testimonials",
        layout: "cards",
        background,
        fields: { heading: fill(60) },
        items: items(6, (index) => ({
          quote: fill(240, index),
          by: fill(60, index + 6),
          permission: true,
        })),
      },
    ]),
    ...withBackgrounds(["white", "tinted"], (background) => [
      "areas",
      { type: "areas", background, fields: { heading: fill(60) } },
    ]),
    ...withBackgrounds(["white", "tinted"], (background) => [
      "questions",
      {
        type: "questions",
        background,
        fields: { heading: fill(60), for: "tenants" },
        items: items(10, (index) => ({
          question: `${fill(99, index)}?`,
          answer: fill(400, index + 2),
        })),
      },
    ]),
    ...withBackgrounds(["white", "tinted"], (background) => [
      "fees",
      {
        type: "fees",
        background,
        fields: { heading: fill(60), note: fill(160, 3) },
        items: items(6, (index) => ({
          label: fill(60, index),
          value: fill(40, index + 5),
        })),
      },
    ]),
    ...withBackgrounds(["tinted", "white", "brand"], (background) => [
      "management_request · form",
      {
        type: "management_request",
        background,
        fields: { heading: fill(80), text: fill(200, 2), mode: "form" },
      },
    ]),
    ...withBackgrounds(["tinted", "brand"], (background) => [
      "management_request · whatsapp",
      {
        type: "management_request",
        background,
        fields: { heading: fill(80), text: fill(200, 2), mode: "whatsapp" },
      },
    ]),
    ...withBackgrounds(["tinted", "white"], (background) => [
      "message_form",
      {
        type: "message_form",
        background,
        fields: { heading: fill(60), text: fill(200, 2) },
      },
    ]),
    ...withBackgrounds(["white", "tinted"], (background) => [
      "contact",
      { type: "contact", background, fields: { heading: fill(60) } },
    ]),
    make("call_to_action · with picture", {
      type: "call_to_action",
      fields: {
        heading: fill(60),
        text: fill(120, 2),
        button: button({ kind: "whatsapp", message: "Hello" }),
        picture: picture("as_keys"),
      },
    }),
    make("call_to_action · picture missing", {
      type: "call_to_action",
      fields: {
        heading: fill(60),
        text: fill(120, 2),
        button: button({ kind: "call" }),
        picture: MISSING,
      },
    }),
    make("hidden section (draws nothing)", {
      type: "areas",
      hidden: true,
      fields: { heading: "Hidden" },
    }),
    make("unknown type (draws nothing)", {
      type: "carousel",
      fields: { heading: "Unknown" },
    } as unknown as Omit<Section, "id">),
  ];
}

const noteStyle = {
  font: "600 12px/1.4 ui-monospace, monospace",
  background: "#fff7c2",
  color: "#3d3500",
  padding: "4px 22px",
  borderTop: "1px dashed #b5a400",
} as const;

export default function SectionsTestPage() {
  // `?only=steps,figures` narrows the page to some section types.
  const only = (new URLSearchParams(window.location.search).get("only") ?? "")
    .split(",")
    .filter(Boolean);
  const shown = cases().filter(
    ({ section }) => only.length === 0 || only.includes(section.type),
  );
  return (
    <>
      {shown.map(({ note, section }) => (
        <div key={section.id}>
          <div style={noteStyle}>{note}</div>
          <SectionRenderer section={section} />
        </div>
      ))}
    </>
  );
}
