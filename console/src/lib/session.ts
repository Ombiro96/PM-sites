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
