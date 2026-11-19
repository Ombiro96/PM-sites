import { useEffect, useState } from "react";
import { navigate } from "@/lib/router";
import { PATHS } from "../lib/config";
import type { User } from "../lib/session";
import { findSite, type Site } from "../lib/site";
import { ConsolePage } from "./ConsolePage";
import { SetupPage } from "./SetupPage";

/** Sends a signed-in manager to setup when the account has no website, and to the console when it has. */
export function SiteGate({ user }: { user: User }) {
  const [site, setSite] = useState<Site | null>();
  const [leftOut, setLeftOut] = useState<string[]>();
  const [problem, setProblem] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const path = window.location.pathname;
  const settingUp = path.startsWith(`${PATHS.setup}/`);

  useEffect(() => {
    let active = true;
    findSite()
      .then((found) => {
        if (!active) return;
        setSite(found);
        setLoaded((count) => count + 1);
        setProblem("");
      })
      .catch((error: unknown) => {
        if (active)
          setProblem(error instanceof Error ? error.message : String(error));
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const wanted =
    site === undefined
      ? path
      : site === null
        ? settingUp
          ? path
          : `${PATHS.setup}/look`
        : settingUp
          ? `${PATHS.website}/pages`
          : path;

  useEffect(() => {
    if (wanted !== path) navigate(wanted, { replace: true });
  }, [wanted, path]);

  if (site === undefined)
    return (
      <main className="text-ink-muted flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <p>{problem || "Loading…"}</p>
        {problem ? (
          <button
            type="button"
            onClick={() => setAttempt(attempt + 1)}
            className="text-brand font-medium hover:underline"
          >
            Try again
          </button>
        ) : null}
      </main>
    );
  if (wanted !== path) return null;
  if (site === null)
    return (
      <SetupPage
        user={user}
        onCreated={(created, notes) => {
          setLeftOut(notes);
          setSite(created);
        }}
      />
    );
  return (
    <ConsolePage
      user={user}
      site={site}
      leftOut={leftOut}
      onSite={setSite}
      onReload={() => setAttempt(attempt + 1)}
      // A reloaded site starts the console afresh, dropping changes made on the old one.
      key={loaded}
    />
  );
}
