const KEY = "token";

export function readToken(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    // Storage is blocked; the person stays signed in until the page is closed.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing was stored.
  }
}
