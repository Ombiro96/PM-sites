const trimmed = (value: string) => value.replace(/\/+$/, "");

/** The backend's address, without a trailing slash. */
export const API_BASE = trimmed(
  import.meta.env.VITE_CONSOLE_API_BASE ?? "http://127.0.0.1:8000",
);

export const PATHS = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  /** Followed by the token from the emailed link, as in the dashboard. */
  resetPassword: "/reset-password",
  website: "/website",
} as const;
