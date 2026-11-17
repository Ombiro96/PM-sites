import { API_BASE } from "./config";
import { whileLoading } from "./loading";
import { readToken } from "./token";

const TIMEOUT_MS = 20000;
export const NETWORK_PROBLEM =
  "Network problem. Please check your connection and try again.";
export const NOT_SIGNED_IN = "You must be logged in to perform this action";

export class ApiError extends Error {}

async function request(path: string, body: unknown): Promise<unknown> {
  const token = readToken();
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(NETWORK_PROBLEM);
  }
  const parsed: unknown = await response.json().catch(() => null);
  if (parsed === null) throw new ApiError(NETWORK_PROBLEM);
  return parsed;
}

/** Every backend call goes through here. Unless `quiet`, the loading indicator shows until it answers. */
function send(path: string, body: unknown, quiet = false): Promise<unknown> {
  return quiet ? request(path, body) : whileLoading(() => request(path, body));
}

/** Runs one GraphQL document and returns its `data`. A refusal from the server is thrown. */
export async function graphql<Data>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<Data> {
  const result = (await send("/graphql", { query, variables })) as {
    data?: Data | null;
    errors?: { message?: string }[];
  };
  const refusal = result.errors?.[0]?.message;
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
