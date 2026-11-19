import { useEffect, useMemo, useState, type FormEvent } from "react";
import { navigate } from "@/lib/router";
import logo from "../assets/bomahut.svg";
import { Chevron } from "../components/Chevron";
import {
  companyErrors,
  hasErrors,
  NO_COMPANY,
  trimmedCompany,
  type CompanyErrors,
} from "../components/CompanyFields";
import { FormError, SubmitButton } from "../components/fields";
import { PreviewPanel } from "../components/PreviewPanel";
import { useAuth } from "../lib/auth";
import { readCompany, saveCompany, type Company } from "../lib/company";
import { PATHS } from "../lib/config";
import { exampleSite } from "../lib/preview";
import type { User } from "../lib/session";
import { createSite, type Site } from "../lib/site";
import {
  aboutTextError,
  clearWebsite,
  readWebsite,
  saveWebsite,
  type Website,
} from "../lib/website";
import { AboutStep } from "./website/AboutStep";
import { ColourStep } from "./website/ColourStep";
import { DetailsStep } from "./website/DetailsStep";
import { LookStep } from "./website/LookStep";
import { ReviewStep } from "./website/ReviewStep";

const STEPS = [
  {
    key: "look",
    label: "Theme",
    title: "Choose a theme",
    intro:
      "Each theme is a complete design. Pick the one that suits your company; you can change it at any time.",
  },
  {
    key: "colour",
    label: "Theme colour",
    title: "Choose your theme colour",
    intro: "Buttons, links and highlights across your website use this colour.",
  },
  {
    key: "details",
    label: "Details",
    title: "Your company details",
    intro: "This is what the public sees on your website.",
  },
  {
    key: "about",
    label: "About you",
    title: "Tell us about your company",
    intro:
      "We use your answers to write the first draft of your website, so you do not start from an empty page.",
  },
  {
    key: "review",
    label: "Review",
    title: "Review your choices",
    intro:
      "Check everything below. Each line can still be changed, now or after your first draft is written.",
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const pathOf = (step: StepKey) => `${PATHS.setup}/${step}`;

function stepAt(pathname: string): number {
  const key = pathname.slice(PATHS.setup.length + 1);
  return Math.max(
    STEPS.findIndex((step) => step.key === key),
    0,
  );
}

function Steps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1 text-sm sm:gap-2">
      {STEPS.map((step, at) => {
        const number = (
          <span
            className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${at <= current ? "bg-brand text-white" : "bg-line text-ink-muted"}`}
          >
            {at + 1}
          </span>
        );
        const name = <span className="hidden sm:inline">{step.label}</span>;
        return (
          <li key={step.key} className="flex items-center gap-1 sm:gap-2">
            {at > 0 ? <span className="bg-line h-px w-3 sm:w-6" /> : null}
            {at < current ? (
              <a
                href={pathOf(step.key)}
                className="flex items-center gap-1.5 font-medium hover:underline"
              >
                {number}
                {name}
              </a>
            ) : (
              <span
                aria-current={at === current ? "step" : undefined}
                className={`flex items-center gap-1.5 ${at === current ? "font-semibold" : "text-ink-muted"}`}
              >
                {number}
                {name}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** The steps a manager goes through once, ending with their first draft. */
export function SetupPage({
  user,
  onCreated,
}: {
  user: User;
  onCreated: (site: Site, leftOut: string[]) => void;
}) {
  const { signOut } = useAuth();
  const current = stepAt(window.location.pathname);
  const step = STEPS[current];
  const [website, setWebsite] = useState<Website | null>(null);
  const [company, setCompany] = useState<Company>(NO_COMPANY);
  const [errors, setErrors] = useState<CompanyErrors>({});
  const [loadProblem, setLoadProblem] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [aboutError, setAboutError] = useState<string>();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([readWebsite(user.username), readCompany()])
      .then(([storedWebsite, storedCompany]) => {
        if (!active) return;
        setWebsite(storedWebsite);
        setCompany(storedCompany ?? NO_COMPANY);
        setLoadProblem("");
      })
      .catch((error: unknown) => {
        if (active)
          setLoadProblem(
            error instanceof Error ? error.message : String(error),
          );
      });
    return () => {
      active = false;
    };
  }, [user.username, attempt]);

  const named = company.displayName.trim() !== "";
  const site = useMemo(
    () =>
      website
        ? exampleSite({ ...website, company: named ? company : null })
        : null,
    [website, company, named],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!website) return;
    setProblem("");
    setBusy(true);
    try {
      if (step.key === "details") {
        const found = companyErrors(company);
        setErrors(found);
        if (hasErrors(found)) return;
        const saved = await saveCompany(trimmedCompany(company));
        if (!saved.ok) {
          setProblem(saved.message);
          return;
        }
        setCompany(saved.company);
      }
      if (step.key === "about") {
        const found = aboutTextError(website.answers.about_text);
        setAboutError(found);
        if (found) return;
      }
      await saveWebsite(user.username, website);
      if (step.key !== "review") {
        navigate(pathOf(STEPS[current + 1].key));
        return;
      }
      const created = await createSite(website);
      if (!created.ok) {
        setProblem(created.message);
        return;
      }
      clearWebsite(user.username);
      onCreated(created.site, created.leftOut);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const header = (
    <header className="border-line sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6">
      <img
        src={logo}
        alt="Bomahut"
        className="h-8 w-auto"
        width={195}
        height={39}
      />
      <Steps current={current} />
      <div className="flex items-center gap-4 text-sm">
        <span className="text-ink-muted hidden md:inline">{user.username}</span>
        <button
          type="button"
          onClick={signOut}
          className="text-brand font-medium hover:underline"
        >
          Sign out
        </button>
      </div>
    </header>
  );

  if (!website || !site) {
    return (
      <div className="min-h-dvh">
        {header}
        <main className="text-ink-muted px-4 py-16 text-center">
          {loadProblem ? (
            <>
              <p className="mb-3">{loadProblem}</p>
              <button
                type="button"
                onClick={() => setAttempt(attempt + 1)}
                className="text-brand font-medium hover:underline"
              >
                Try again
              </button>
            </>
          ) : (
            <p>Loading…</p>
          )}
        </main>
      </div>
    );
  }

  const isLast = current === STEPS.length - 1;

  return (
    <div className="min-h-dvh">
      {header}
      <main className="mx-auto grid max-w-[100rem] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[30rem_minmax(0,1fr)]">
        <form onSubmit={submit} noValidate>
          <p className="text-ink-muted mb-1 text-sm font-medium">
            Step {current + 1} of {STEPS.length}
          </p>
          <h1 className="mb-2 text-2xl font-semibold">{step.title}</h1>
          <p className="text-ink-muted mb-6">{step.intro}</p>
          <FormError message={problem} />
          {step.key === "look" ? (
            <LookStep
              look={website.look}
              brandColour={website.brandColour}
              company={named ? company : null}
              onChoose={(look) => setWebsite({ ...website, look })}
            />
          ) : null}
          {step.key === "colour" ? (
            <ColourStep
              brandColour={website.brandColour}
              onChoose={(brandColour) =>
                setWebsite({ ...website, brandColour })
              }
            />
          ) : null}
          {step.key === "details" ? (
            <DetailsStep
              company={company}
              errors={errors}
              audience={website.audience}
              onCompany={(changes) => {
                setCompany({ ...company, ...changes });
                setErrors({});
              }}
              onAudience={(audience) => setWebsite({ ...website, audience })}
            />
          ) : null}
          {step.key === "about" ? (
            <AboutStep
              answers={website.answers}
              audience={website.audience}
              error={aboutError}
              onChange={(changes) => {
                setWebsite({
                  ...website,
                  answers: { ...website.answers, ...changes },
                });
                setAboutError(undefined);
              }}
            />
          ) : null}
          {step.key === "review" ? (
            <ReviewStep website={website} company={company} pathOf={pathOf} />
          ) : null}
          <div className="mt-8 flex items-center gap-5">
            {current > 0 ? (
              <a
                href={pathOf(STEPS[current - 1].key)}
                className="border-brand text-brand hover:bg-brand-soft flex items-center gap-1.5 rounded-lg border bg-white py-3 pr-5 pl-3.5 font-semibold"
              >
                <Chevron direction="left" />
                Back
              </a>
            ) : null}
            <div className={`ml-auto ${isLast ? "w-56" : "w-44"}`}>
              <SubmitButton busy={busy}>
                {isLast ? "Write my first draft" : "Continue"}
                {isLast ? null : <Chevron direction="right" />}
              </SubmitButton>
            </div>
          </div>
        </form>
        <PreviewPanel
          site={site}
          caption="An example website in your theme and colour."
        />
      </main>
    </div>
  );
}
