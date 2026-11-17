export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(phone: string, message?: string): string {
  const number = phone.replace(/[^\d]/g, "").replace(/^0/, "254");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${query}`;
}

/**
 * Addresses that come from data (pictures, logos, social links) are only ever
 * used when they are plain https. The dev server also allows its own files.
 */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (
    import.meta.env.DEV &&
    (value.startsWith("/") || value.startsWith("http://"))
  ) {
    return value;
  }
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export function initials(name: string): string {
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const letters =
    words.length > 1 ? words[0][0] + words[1][0] : name.trim().slice(0, 2);
  return letters.toUpperCase();
}

/** Blank-line separated paragraphs of a long text field. */
export function paragraphs(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}
