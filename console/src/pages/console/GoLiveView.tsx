import { TextLink } from "../../components/AuthLayout";
import { Button } from "../../components/fields";
import { PATHS } from "../../lib/config";
import { problemPlace } from "../../lib/draft";
import type { Rules } from "../../lib/rules";
import type { Problem, Site } from "../../lib/site";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Where one publish problem is, and where the manager goes to clear it. */
function fixFor(problem: Problem, site: Site, rules: Rules) {
  if (problem.path === "facts" || problem.path.startsWith("facts."))
    return {
      where: "Company details",
      href: `${PATHS.website}/details`,
      label: "Open details",
    };
  const place = problemPlace(problem.path, site.draft, rules);
  if (place)
    return {
      where: place.where,
      href: `${PATHS.website}/pages/${place.pageId}${place.sectionId ? `/${place.sectionId}` : ""}`,
      label: "Open it",
    };
  return { where: "", href: `${PATHS.website}/pages`, label: "Open pages" };
}

/**
 * One sequence: the issues the backend still refuses, then the single next
 * action. Publish, asking Bomahut, and a stale copy never compete.
 */
export function GoLiveView({
  site,
  rules,
  dirty,
  busy,
  stale,
  onAsk,
  onPublish,
  onReload,
}: {
  site: Site;
  rules: Rules;
  dirty: boolean;
  busy: boolean;
  stale: boolean;
  onAsk: () => void;
  onPublish: () => void;
  onReload: () => void;
}) {
  const problems = site.publishProblems;
  const live = site.status === "LIVE";
  const ready = problems.length === 0;
  const upToDate =
    site.publishState === "LIVE" && !site.hasUnpublishedChanges && !dirty;
  const asked = site.publishRequestedAt;
  const goingUp = live || site.publishState === "PUBLISHING";
  const publicUrl = goingUp ? site.url : null;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {stale ? (
        <section
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-5"
        >
          <h2 className="text-lg font-semibold">
            You are not looking at the latest version
          </h2>
          <p className="mt-1">
            Someone else changed this website after you opened it. Reload, then
            fix or publish from the latest version.
          </p>
          <div className="mt-4 flex">
            <Button tone="solid" disabled={busy} onClick={onReload}>
              Reload
            </Button>
          </div>
        </section>
      ) : null}

      {problems.length > 0 ? (
        <section
          aria-labelledby="publish-issues"
          className="rounded-xl border border-amber-400 bg-amber-50 p-5"
        >
          <h2 id="publish-issues" className="text-lg font-semibold">
            Fix these before publishing
          </h2>
          <p className="mt-1 text-sm">
            Publishing stays closed until each of these is done.
          </p>
          <ul className="mt-2">
            {problems.map((problem) => {
              const fix = fixFor(problem, site, rules);
              return (
                <li
                  key={problem.path + problem.code}
                  className="flex flex-col gap-1 border-t border-amber-300 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <p>
                    {fix.where ? (
                      <span className="block font-semibold">{fix.where}</span>
                    ) : null}
                    {problem.message}
                  </p>
                  <span className="shrink-0">
                    <TextLink href={fix.href}>{fix.label}</TextLink>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="border-line rounded-xl border bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold">Where it stands</h2>
        <p>
          {site.status === "OFF"
            ? 'Your website is switched off. Visitors see "Site not found".'
            : site.publishState === "FAILED"
              ? "Your last publish did not reach visitors. Publish again."
              : live && site.hasUnpublishedChanges
                ? "Your website is live. You have changes that visitors cannot see yet."
                : live
                  ? "Your website is live and up to date."
                  : "Your website is a draft. Only you can see it, through Preview."}
        </p>
        <p className="text-ink-muted mt-1 text-sm">
          {site.publishedNumber !== null && site.publishedAt
            ? `Version ${site.publishedNumber}, published ${formatDate(site.publishedAt)}.`
            : "Not published yet."}
        </p>
        {publicUrl ? (
          <p className="mt-3">
            <TextLink href={publicUrl} external>
              {new URL(publicUrl).host}
            </TextLink>
            <span className="text-ink-muted mt-1 block text-sm">
              If you see &ldquo;Site not found&rdquo;, give it up to a minute.
            </span>
          </p>
        ) : null}
        {dirty ? (
          <p className="mt-3 text-sm font-medium">
            Save the changes under Edit pages first. They are not in this draft
            yet.
          </p>
        ) : null}

        {stale ? null : !ready ? (
          <p className="mt-4 font-medium">
            {site.mayPublish
              ? "Fix the issues above, then publish."
              : "Fix the issues above. After that, ask Bomahut to switch on publishing."}
          </p>
        ) : !site.mayPublish ? (
          asked ? (
            <p className="mt-4">
              {`You asked on ${formatDate(asked)}. We will send you an SMS when you can publish.`}
            </p>
          ) : (
            <>
              <p className="mt-4">
                Nothing left to fix. Bomahut switches on publishing for each
                website. Ask, and we will send you an SMS when you can publish
                it yourself.
              </p>
              <div className="mt-4 flex">
                <Button tone="solid" disabled={busy || dirty} onClick={onAsk}>
                  Ask Bomahut to publish
                </Button>
              </div>
            </>
          )
        ) : upToDate ? null : (
          <div className="mt-4 flex">
            <Button tone="solid" disabled={busy || dirty} onClick={onPublish}>
              {live ? "Publish my changes" : "Publish my website"}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
