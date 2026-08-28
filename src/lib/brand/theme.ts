import type { ThemeTokens } from "./types";

const RADIUS_SCALE: Record<ThemeTokens["radius"], { sm: string; md: string; lg: string }> = {
  sharp: { sm: "0px", md: "0px", lg: "0px" },
  soft: { sm: "4px", md: "8px", lg: "16px" },
  round: { sm: "8px", md: "16px", lg: "28px" },
};

/**
 * Turns brand tokens into the CSS custom properties every component reads.
 * Nothing in `src/components` may hard-code a brand colour — it all comes
 * through here, which is what makes client #2 a configuration change.
 */
export function themeToCssVars(theme: ThemeTokens): string {
  const radius = RADIUS_SCALE[theme.radius];
  const vars: Record<string, string> = {
    "--brand-primary": theme.primary,
    "--brand-primary-contrast": theme.primaryContrast,
    "--brand-primary-deep": theme.primaryDeep,
    "--brand-accent": theme.accent,
    "--brand-accent-contrast": theme.accentContrast,
    "--brand-ink": theme.ink,
    "--brand-ink-muted": theme.inkMuted,
    "--brand-surface": theme.surface,
    "--brand-surface-muted": theme.surfaceMuted,
    "--brand-border": theme.border,
    "--brand-radius-sm": radius.sm,
    "--brand-radius-md": radius.md,
    "--brand-radius-lg": radius.lg,
    "--brand-font-display": theme.fontDisplay,
    "--brand-font-body": theme.fontBody,
  };

  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
}

/**
 * Relative luminance per WCAG 2.1. Used to keep text legible on whatever colour
 * a property manager picks for their brand.
 */
function luminance(hex: string): number {
  const normalised = hex.replace("#", "");
  const full =
    normalised.length === 3
      ? normalised
          .split("")
          .map((c) => c + c)
          .join("")
      : normalised;
  const channels = [0, 2, 4].map((i) => {
    const value = parseInt(full.slice(i, i + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Readable foreground for an arbitrary brand colour. */
export function readableOn(background: string): "#FFFFFF" | "#15202B" {
  return contrastRatio("#FFFFFF", background) >= 4.5 ? "#FFFFFF" : "#15202B";
}
