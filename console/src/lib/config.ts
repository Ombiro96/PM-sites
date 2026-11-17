const trimmed = (value: string) => value.replace(/\/+$/, "");

/** The backend's address, without a trailing slash. */
export const API_BASE = trimmed(
  import.meta.env.VITE_CONSOLE_API_BASE ?? "http://127.0.0.1:8000",
);

/** The main Bomahut dashboard, which still owns password resets. */
export const DASHBOARD_URL = trimmed(
  import.meta.env.VITE_CONSOLE_DASHBOARD_URL ?? "https://app.bomahut.com",
);

export const PATHS = {
  login: "/login",
  register: "/register",
  website: "/website",
} as const;
