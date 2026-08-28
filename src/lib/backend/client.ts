import "server-only";

const DEFAULT_ENDPOINT = "https://api.bomahut.com/graphql";

export class BackendError extends Error {}

/**
 * Rejects anything that is not a plain GraphQL query. This site is a read-only
 * consumer of production data — no mutation may ever leave it.
 */
function assertReadOnly(document: string) {
  const stripped = document.replace(/#[^\n]*/g, "");
  if (/\b(mutation|subscription)\b/.test(stripped)) {
    throw new BackendError("PM-Sites is read-only: mutations are not permitted.");
  }
}

export type GraphQLRequest = {
  document: string;
  variables?: Record<string, unknown>;
  /** Seconds. Vacancy data tolerates staleness; keep the backend load flat. */
  revalidate?: number;
  tags?: string[];
};

export async function graphqlQuery<T>({
  document,
  variables,
  revalidate = 300,
  tags,
}: GraphQLRequest): Promise<T> {
  assertReadOnly(document);

  const endpoint = process.env.BOMAHUT_GRAPHQL_URL ?? DEFAULT_ENDPOINT;
  const token = process.env.BOMAHUT_API_TOKEN;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `JWT ${token}` } : {}),
      },
      body: JSON.stringify({ query: document, variables }),
      signal: controller.signal,
      next: { revalidate, tags },
    });

    if (!response.ok) {
      throw new BackendError(`Backend responded ${response.status}`);
    }

    const payload = (await response.json()) as {
      data?: T;
      errors?: { message: string }[];
    };

    if (payload.errors?.length) {
      throw new BackendError(payload.errors.map((e) => e.message).join("; "));
    }
    if (!payload.data) {
      throw new BackendError("Backend returned no data");
    }
    return payload.data;
  } catch (error) {
    if (error instanceof BackendError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new BackendError("Backend request timed out");
    }
    throw new BackendError(
      error instanceof Error ? error.message : "Unknown backend error",
    );
  } finally {
    clearTimeout(timeout);
  }
}
