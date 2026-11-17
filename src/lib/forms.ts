export type Errors<Name extends string> = Partial<Record<Name, string>>;

export function nameError(value: string): string | undefined {
  const name = value.trim();
  if (name.length < 2) return "Enter your name.";
  if (name.length > 100) return "Keep your name under 100 characters.";
  return undefined;
}

/** A phone number is 9 to 15 digits, written with or without spaces, dashes, brackets or a leading plus. */
export function phoneError(value: string): string | undefined {
  const phone = value.trim();
  if (!phone) return "Enter your phone number.";
  const digits = phone.replace(/\D/g, "");
  if (!/^\+?[\d\s()-]+$/.test(phone) || digits.length < 9 || digits.length > 15) {
    return "Enter a phone number we can call, for example 0712 345 678.";
  }
  return undefined;
}

export function lengthError(value: string, limit: number, what = "the message"): string | undefined {
  return value.trim().length > limit
    ? `Keep ${what} under ${limit.toLocaleString("en-KE")} characters.`
    : undefined;
}

/** An optional whole number of units, at least one. */
export function unitCountError(value: string): string | undefined {
  const text = value.trim();
  if (!text) return undefined;
  const count = Number(text);
  if (!/^\d{1,6}$/.test(text) || count < 1) return "Enter a number of units, for example 24.";
  return undefined;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
