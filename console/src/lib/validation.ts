/** The country the phone field opens on, as in the dashboard. */
export const PHONE_COUNTRY = "ke";
const USERNAME_MIN = 5;
const PASSWORD_MIN = 8;
const PHONE_MIN_DIGITS = 8;
const PHONE_MAX_DIGITS = 12;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function usernameError(value: string): string | undefined {
  if (normalizeUsername(value).length < USERNAME_MIN)
    return "Username should be more than 4 characters long";
  return undefined;
}

export function emailError(value: string): string | undefined {
  if (!/\S+@\S+\.\S+/.test(value.trim()))
    return "Please enter the correct email format.";
  return undefined;
}

export function passwordError(value: string): string | undefined {
  if (value.length < PASSWORD_MIN)
    return "Ensure your password is at least 8 characters long";
  if (/^[a-zA-Z]+$/.test(value) || /^\d+$/.test(value))
    return "Ensure your password is a combination of letters and numbers";
  return undefined;
}

/** The number as the backend stores it: country code, a dash, then the number without its leading zero. */
export function formatPhone(dialCode: string, number: string): string {
  const code = dialCode.replace(/\D/g, "");
  const local = number.replace(/\D/g, "").replace(/^0+/, "");
  return `+${code}-${local}`;
}

export function phoneError(
  dialCode: string,
  number: string,
): string | undefined {
  const [code, local] = formatPhone(dialCode, number).slice(1).split("-");
  if (local.length < PHONE_MIN_DIGITS || local.length > PHONE_MAX_DIGITS)
    return "Enter your phone number, for example 0712 345 678.";
  if (code.length < 1 || code.length > 3)
    return "Enter a country code, for example +254.";
  return undefined;
}

/** What the phone input holds, as the number to store; empty until a number follows the country code. */
export function phoneFromInput(value: string, dialCode: string): string {
  const number = value.slice(dialCode.length);
  return number === "" ? "" : formatPhone(dialCode, number);
}

/**
 * A stored number as the phone input should show it. One typed elsewhere as a
 * local number (0712 345 678) is shown as Kenyan, the way the site dials it.
 */
export function phoneForInput(stored: string): string {
  if (stored.startsWith("+")) return stored;
  return stored.replace(/\D/g, "").replace(/^0/, "254");
}

/** Checks a number already in the stored form, such as +254-712345678. */
export function storedPhoneError(value: string): string | undefined {
  const [code, number = ""] = value.replace(/^\+/, "").split("-");
  return phoneError(code, number);
}

type LoginErrors =
  | string
  | {
      nonFieldErrors?: ({ message?: string } | string)[];
      message?: string;
    }
  | null
  | undefined;

/** The reason a sign-in was refused, in the shapes the backend sends it. */
export function loginErrorMessage(errors: LoginErrors): string {
  const fallback = "Invalid username or password";
  if (!errors) return fallback;
  if (typeof errors === "string") return errors;
  const first = errors.nonFieldErrors?.[0];
  if (typeof first === "string") return first;
  return first?.message ?? errors.message ?? fallback;
}
