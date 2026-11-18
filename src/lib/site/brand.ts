import type { Look } from "./types";

type Rgb = [number, number, number];

const FALLBACK_BRAND = "#1d4e89";
const LIGHT: Rgb = [255, 255, 255];
const DARK: Rgb = [22, 18, 10];
/** The page colour of each look whose page is not white. */
const PAGES: Partial<Record<Look, Rgb>> = {
  estate: [17, 23, 21],
  midnight: [11, 12, 14],
  moss: [16, 38, 29],
  dusk: [14, 19, 34],
  neon: [12, 12, 17],
  parchment: [250, 248, 243],
  gallery: [233, 228, 217],
  catalogue: [241, 241, 238],
  collage: [255, 252, 245],
};

export function parseHex(value: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const hex =
    match[1].length === 3
      ? [...match[1]].map((letter) => letter + letter).join("")
      : match[1];
  return [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16)) as Rgb;
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((part) => Math.round(part).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((part) => {
    const value = part / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

function mix(a: Rgb, b: Rgb, share: number): Rgb {
  return a.map((part, at) => part * share + b[at] * (1 - share)) as Rgb;
}

function readableOn(background: Rgb): string {
  return contrast(LIGHT, background) >= contrast(DARK, background)
    ? toHex(LIGHT)
    : toHex(DARK);
}

/**
 * The colours a look derives from the manager's one brand colour:
 * `--on` is text on the brand colour, `--on-deep` is text on the darker brand
 * shade used for brand-background sections, and `--brand-ink` is the brand
 * colour made readable as text on the look's page background.
 */
export function brandVariables(
  brandColour: string,
  look: Look,
): Record<string, string> {
  const brand = parseHex(brandColour) ?? (parseHex(FALLBACK_BRAND) as Rgb);
  const page = PAGES[look] ?? LIGHT;
  const dark = luminance(page) < 0.2;
  const deep = dark ? brand : mix(brand, [0, 0, 0], 0.72);

  let asText = brand;
  for (let step = 0; step < 12 && contrast(asText, page) < 4.5; step += 1) {
    asText = mix(asText, dark ? LIGHT : [0, 0, 0], 0.8);
  }

  return {
    "--brand": toHex(brand),
    "--on": readableOn(brand),
    "--on-deep": readableOn(deep),
    "--brand-ink": toHex(asText),
  };
}
