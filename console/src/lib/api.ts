import { API_BASE } from "./config";
import { whileLoading } from "./loading";
import { readToken } from "./token";

const TIMEOUT_MS = 20000;
const UPLOAD_TIMEOUT_MS = 120000;
export const NETWORK_PROBLEM =
  "Network problem. Please check your connection and try again.";
export const UPLOAD_PROBLEM =
  "This could not be uploaded. The file may be too large, or your connection dropped. Try a smaller picture, or try again.";
const TOO_LARGE = "This file is too large to upload. Choose a smaller one.";
const OUR_PROBLEM = "Something went wrong on our side. Please try again.";
const NOT_SIGNED_IN = "You must be logged in to perform this action";

export class ApiError extends Error {}

let whenNotSignedIn: (() => void) | null = null;

/** Any call can be told the caller is not signed in; like the web app, that ends the session. */
export function onNotSignedIn(listener: (() => void) | null): void {
  whenNotSignedIn = listener;
}

async function request(path: string, body: unknown): Promise<unknown> {
  const token = readToken();
  const upload = body instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        ...(upload ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: upload ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(upload ? UPLOAD_TIMEOUT_MS : TIMEOUT_MS),
    });
  } catch {
    // A server in front of the backend that refuses an upload answers in a way the browser hides, so it lands here too.
    throw new ApiError(upload ? UPLOAD_PROBLEM : NETWORK_PROBLEM);
  }
  if (response.status === 413) throw new ApiError(TOO_LARGE);
  const parsed: unknown = await response.json().catch(() => null);
  if (parsed === null) throw new ApiError(NETWORK_PROBLEM);
  return parsed;
}

/** Every backend call goes through here. Unless `quiet`, the loading indicator shows until it answers. */
function send(path: string, body: unknown, quiet = false): Promise<unknown> {
  return quiet ? request(path, body) : whileLoading(() => request(path, body));
}

/**
 * Runs one GraphQL document and returns its `data`. A refusal from the server is thrown.
 * A `file` is sent as the document's `$file` variable.
 */
export async function graphql<Data>(
  query: string,
  variables: Record<string, unknown> = {},
  { file, quiet = false }: { file?: File; quiet?: boolean } = {},
): Promise<Data> {
  let body: unknown = { query, variables };
  if (file) {
    const form = new FormData();
    form.append("operations", JSON.stringify(body));
    form.append("map", JSON.stringify({ "0": ["variables.file"] }));
    form.append("0", file);
    body = form;
  }
  const result = (await send("/graphql", body, quiet)) as {
    data?: Data | null;
    errors?: { message?: string }[];
  };
  const refusal = result.errors?.[0]?.message;
  if (refusal === NOT_SIGNED_IN) whenNotSignedIn?.();
  // No `data` at all means the backend rejected the document itself, in words not meant for people.
  if (refusal && !("data" in result)) {
    console.error(refusal);
    throw new ApiError(OUR_PROBLEM);
  }
  if (refusal) throw new ApiError(refusal);
  if (!result.data) throw new ApiError(NETWORK_PROBLEM);
  return result.data;
}

export async function post<Data>(
  path: string,
  body: unknown,
  { quiet = false } = {},
): Promise<Data> {
  return (await send(path, body, quiet)) as Data;
}
