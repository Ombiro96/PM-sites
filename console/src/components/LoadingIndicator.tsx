import { useSyncExternalStore } from "react";
import { isLoading, subscribeToLoading } from "../lib/loading";

/** Covers the page with a spinner while any backend call is under way. */
export function LoadingIndicator() {
  const loading = useSyncExternalStore(subscribeToLoading, isLoading);
  if (!loading) return null;
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <span className="size-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
    </div>
  );
}
