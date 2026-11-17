import { graphql, post } from "./api";
import type { TrackingCookies } from "./tracking";
import { loginErrorMessage } from "./validation";

export type User = {
  username: string;
  firstName: string;
  email: string;
  teamMember: { isAdmin: boolean } | null;
};

export type SignedIn = { ok: true; token: string };
export type Refused = { ok: false; message: string };

const LOGIN = `
  mutation Login($username: String!, $password: String!, $trackingCookies: JSONString) {
    tokenAuth(username: $username, password: $password, trackingCookies: $trackingCookies) {
      success
      errors
      token
    }
  }
`;

const REGISTER = `
  mutation Register($email: String!, $username: String!, $password: String!, $phoneNumber: String!, $registrationSource: String!, $trackingCookies: JSONString) {
    register(
      email: $email
      username: $username
      password: $password
      phoneNumber: $phoneNumber
      registrationSource: $registrationSource
      trackingCookies: $trackingCookies
    ) {
      success
      errors
      token
    }
  }
`;

const SEND_PASSWORD_RESET = `
  mutation SendPasswordReset($username: String!) {
    sendPasswordResetEmail(username: $username) {
      success
      errors
    }
  }
`;

const PASSWORD_RESET = `
  mutation PasswordReset($token: String!, $newPassword1: String!, $newPassword2: String!) {
    passwordReset(token: $token, newPassword1: $newPassword1, newPassword2: $newPassword2) {
      success
      errors
    }
  }
`;

const FETCH_USER = `
  query {
    fetchUser {
      username
      firstName
      email
      teamMember {
        isAdmin
      }
    }
  }
`;

type AuthResult = {
  success: boolean | null;
  errors: Parameters<typeof loginErrorMessage>[0];
  token: string | null;
} | null;

function outcome(result: AuthResult, fallback: string): SignedIn | Refused {
  if (result?.success && result.token) return { ok: true, token: result.token };
  const message = result?.errors ? loginErrorMessage(result.errors) : fallback;
  return { ok: false, message };
}

export async function signIn(details: {
  username: string;
  password: string;
  trackingCookies: TrackingCookies;
}): Promise<SignedIn | Refused> {
  const data = await graphql<{ tokenAuth: AuthResult }>(LOGIN, {
    username: details.username,
    password: details.password,
    trackingCookies: JSON.stringify(details.trackingCookies),
  });
  return outcome(data.tokenAuth, "Invalid username or password");
}

export async function signUp(details: {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  registrationSource: string;
  trackingCookies: TrackingCookies;
}): Promise<SignedIn | Refused> {
  const data = await graphql<{ register: AuthResult }>(REGISTER, {
    ...details,
    trackingCookies: JSON.stringify(details.trackingCookies),
  });
  return outcome(data.register, "We could not create your account.");
}

/** Emails the account's owner a link for choosing a new password. */
export async function sendPasswordReset(
  username: string,
): Promise<{ ok: true } | Refused> {
  const data = await graphql<{
    sendPasswordResetEmail: {
      success: boolean | null;
      errors: string | null;
    } | null;
  }>(SEND_PASSWORD_RESET, { username });
  if (data.sendPasswordResetEmail?.success) return { ok: true };
  return {
    ok: false,
    message:
      data.sendPasswordResetEmail?.errors ||
      "Something went wrong! Please try again later",
  };
}

export type ResetField = "newPassword1" | "newPassword2" | "nonFieldErrors";
type ResetErrors = Partial<Record<ResetField, { message?: string }[]>>;

/** Sets a new password with the token from the emailed link. A refusal names the field it is about. */
export async function resetPassword(details: {
  token: string;
  newPassword1: string;
  newPassword2: string;
}): Promise<
  { ok: true } | { ok: false; errors: Partial<Record<ResetField, string>> }
> {
  const data = await graphql<{
    passwordReset: {
      success: boolean | null;
      errors: ResetErrors | null;
    } | null;
  }>(PASSWORD_RESET, details);
  if (data.passwordReset?.success) return { ok: true };
  const errors: Partial<Record<ResetField, string>> = {};
  for (const [field, found] of Object.entries(data.passwordReset?.errors ?? {}))
    errors[field as ResetField] = found
      .map((error) => error.message ?? "")
      .join(" ");
  if (Object.keys(errors).length === 0)
    errors.nonFieldErrors = "Something went wrong! Please try again later";
  return { ok: false, errors };
}

export async function fetchUser(): Promise<User> {
  const data = await graphql<{ fetchUser: User }>(FETCH_USER);
  return data.fetchUser;
}

export async function usernameAvailable(username: string): Promise<boolean> {
  const data = await post<{ available?: boolean }>("/api/auth/check-username", {
    username,
  });
  return data.available !== false;
}
