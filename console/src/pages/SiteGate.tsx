import { useEffect, useState } from "react";
import { toast } from "sonner";
import { navigate } from "@/lib/router";
import { useAuth } from "../lib/auth";
import { PATHS } from "../lib/config";
import type { User } from "../lib/session";
import { findSite, type Site } from "../lib/site";
import { readSetup } from "../lib/website";
import { ConsolePage } from "./ConsolePage";
import { SetupPage } from "./SetupPage";

/** No website: the setup door, or the step already started. A website: the console. */
export function SiteGate({ user }: { user: User }) {
  const { signOut } = useAuth();
  const [site, setSite] = useState<Site | null>();
  const [problem, setProblem] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const settingUp = path === PATHS.setup || path.startsWith(`${PATHS.setup}/`);

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

  const resume = site === null && !settingUp ? readSetup(user.username) : null;
  const wanted =
    site === undefined
      ? path
      : site === null
        ? settingUp
          ? path
          : resume
            ? `${PATHS.setup}/${resume.step}`
            : PATHS.setup
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
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setAttempt(attempt + 1)}
              className="text-brand font-medium hover:underline"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={signOut}
              className="text-brand font-medium hover:underline"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </main>
    );
  if (wanted !== path) return null;
  if (site === null)
    return (
      <SetupPage
        user={user}
        onCreated={(created, notes) => {
          const missed = notes.filter(Boolean);
          toast.success("Your first draft is ready", {
            id: "first-draft",
            description: [
              "Make it yours before anyone sees it. Click any part of a page to change it. Nothing is public until you press Publish.",
              ...missed,
            ].join(" "),
            duration: Infinity,
          });
          setSite(created);
        }}
      />
    );
  return (
    <ConsolePage
      user={user}
      site={site}
      onSite={setSite}
      onReload={() => setAttempt(attempt + 1)}
      // A reloaded site starts the console afresh, dropping changes made on the old one.
      key={loaded}
    />
  );
}
