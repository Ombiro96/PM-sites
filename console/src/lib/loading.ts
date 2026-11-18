/**
 * How many backend calls are under way. The loading indicator shows while
 * there is at least one, as the dashboard's does.
 */
let pending = 0;
const listeners = new Set<() => void>();

function change(by: number): void {
  pending += by;
  listeners.forEach((listener) => listener());
}

export function subscribeToLoading(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isLoading(): boolean {
  return pending > 0;
}

/** Runs `work` with the loading indicator showing until it finishes or fails. */
export async function whileLoading<Result>(
  work: () => Promise<Result>,
): Promise<Result> {
  change(1);
  try {
    return await work();
  } finally {
    change(-1);
  }
}
