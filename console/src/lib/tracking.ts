const DOMAIN = "bomahut.com";
const TAG = "t#";

export type TrackingCookies = Record<string, Record<string, string>>[];

let taken: TrackingCookies | null = null;

function trackingCookies(cookies: string): string[] {
  return cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(TAG));
}

/** The campaign cookies the marketing site leaves, grouped by when each visit happened. */
export function formatTrackingCookies(cookies: string): TrackingCookies {
  const byTime: Record<string, Record<string, string>> = {};
  for (const cookie of trackingCookies(cookies)) {
    const [cookieName, value = ""] = cookie.split("=");
    const [, name, timestamp] = cookieName.split("#");
    if (!name || !timestamp) continue;
    byTime[timestamp] = { ...byTime[timestamp], [name]: value };
  }
  return Object.entries(byTime).map(([timestamp, values]) => ({
    [timestamp]: values,
  }));
}

/** Reads the campaign cookies once and removes them, as the dashboard does. */
export function takeTrackingCookies(): TrackingCookies {
  if (taken) return taken;
  const formatted = formatTrackingCookies(document.cookie);
  taken = formatted;
  for (const cookie of trackingCookies(document.cookie)) {
    const cookieName = cookie.split("=")[0];
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;domain=.${DOMAIN};path=/;SameSite=lax`;
  }
  return formatted;
}

/** The address's query string, sent with a sign-up so the backend knows where it came from. */
export function registrationSource(search: string): string {
  return decodeURIComponent(new URLSearchParams(search).toString());
}
