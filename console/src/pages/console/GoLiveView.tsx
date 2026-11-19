import type { ReactNode } from "react";
import { TextLink } from "../../components/AuthLayout";
import { Button } from "../../components/fields";
import { PATHS } from "../../lib/config";
import type { Site } from "../../lib/site";

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Check({
  number,
  done,
  title,
  children,
  action,
}: {
  number: number;
  done: boolean;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="border-line flex items-start gap-3 border-t py-3.5">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-green-700 text-white" : "bg-line/60"}`}
      >
        {done ? "✓" : number}
      </span>
      <div className="min-w-0 grow">
        <p className="font-semibold">
          {title}
          <span className="sr-only">{done ? " (done)" : " (to do)"}</span>
        </p>
        <div className="text-ink-muted text-sm">{children}</div>
      </div>
      {action}
    </li>
  );
}

/** Everything between a draft and a live website, in the order it is done. */
export function GoLiveView({
  site,
  dirty,
  busy,
  onAsk,
  onPublish,
}: {
  site: Site;
  dirty: boolean;
  busy: boolean;
  onAsk: () => void;
  onPublish: () => void;
}) {
  const facts = site.publishProblems.filter((problem) =>
    problem.path.startsWith("facts"),
  );
  const pages = site.publishProblems.filter(
    (problem) => !problem.path.startsWith("facts"),
  );
  const live = site.status === "LIVE";
  const ready = site.publishProblems.length === 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="border-line rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">
          Before your website can go live
        </h2>
        <ol>
          <Check
            number={1}
            done={site.publishedNumber !== null}
            title="Make the pages yours"
            action={
              <TextLink href={`${PATHS.website}/pages`}>Edit pages</TextLink>
            }
          >
            Your first draft is written. Read it through and change what you
            want, for as long as you like.
          </Check>
          <Check
            number={2}
            done={facts.length === 0}
            title="Company details confirmed as public"
            action={
              facts.length > 0 ? (
                <TextLink href={`${PATHS.website}/details`}>
                  Open details
                </TextLink>
              ) : null
            }
          >
            {facts.length === 0 ? (
              "Your name and phone number can be shown."
            ) : (
              <ul>
                {facts.map((problem) => (
                  <li key={problem.path + problem.code}>{problem.message}</li>
                ))}
              </ul>
            )}
          </Check>
          <Check
            number={3}
            done={pages.length === 0}
            title="No problems in your draft"
            action={
              pages.length > 0 ? (
                <TextLink href={`${PATHS.website}/pages`}>Fix them</TextLink>
              ) : null
            }
          >
            {pages.length === 0 ? (
              "Every page has what it needs."
            ) : (
              <ul className="list-disc pl-4">
                {pages.map((problem) => (
                  <li key={problem.path}>{problem.message}</li>
                ))}
              </ul>
            )}
          </Check>
          <Check
            number={4}
            done={site.mayPublish}
            title="Publishing switched on by Bomahut"
            action={
              !site.mayPublish && !site.publishRequestedAt ? (
                <Button disabled={busy || !ready} onClick={onAsk}>
                  Ask Bomahut
                </Button>
              ) : null
            }
          >
            {site.mayPublish
              ? "You can publish whenever you are ready."
              : site.publishRequestedAt
                ? `You asked on ${formatDate(site.publishRequestedAt)}. We will send you an SMS when you can publish.`
                : ready
                  ? "Bomahut switches on publishing for each website. Ask us to switch it on for yours."
                  : "Bomahut switches on publishing for each website. You can ask once the steps above are done."}
          </Check>
        </ol>
      </section>

      <div className="flex flex-col gap-5">
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
          {dirty ? (
            <p className="text-ink-muted mt-1 text-sm">
              You also have changes under Edit pages that are not saved to your
              draft.
            </p>
          ) : null}
          <div className="mt-4 flex">
            <Button
              tone="solid"
              disabled={
                busy ||
                (site.publishState === "LIVE" &&
                  !site.hasUnpublishedChanges &&
                  !dirty)
              }
              onClick={onPublish}
            >
              {live ? "Publish my changes" : "Publish my website"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
