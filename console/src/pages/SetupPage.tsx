import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { navigate } from "@/lib/router";
import logo from "../assets/bomahut.svg";
import { Chevron } from "../components/Chevron";
import {
  companyErrors,
  CONSENT_NEEDED,
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
import { confirmAddress, createSite, type Site } from "../lib/site";
import {
  aboutTextError,
  chosenAddress,
  clearWebsite,
  readSetup,
  readWebsite,
  saveSetupStep,
  saveWebsite,
  startSetup,
  tryoutName,
  type SetupStep,
  type Website,
} from "../lib/website";
import { AboutStep } from "./website/AboutStep";
import { ColourStep } from "./website/ColourStep";
import { DetailsStep } from "./website/DetailsStep";
import { LookStep } from "./website/LookStep";
import { ReviewStep } from "./website/ReviewStep";

const STEPS: readonly {
  key: SetupStep;
  label: string;
  place: string;
  title: string;
  intro: string;
}[] = [
  {
    key: "look",
    label: "Theme",
    place: "Theme",
    title: "Choose a theme",
    intro:
      "Each theme is a complete design. Pick the one that suits your company; you can change it at any time.",
  },
  {
    key: "colour",
    label: "Theme colour",
    place: "Theme colour",
    title: "Choose your theme colour",
    intro: "Buttons, links and highlights across your website use this colour.",
  },
  {
    key: "details",
    label: "Details",
    place: "Company details",
    title: "Your company details",
    intro: "This is what the public sees on your website.",
  },
  {
    key: "about",
    label: "About you",
    place: "About you",
    title: "Tell us about your company",
    intro:
      "We use your answers to write the first draft of your website, so you do not start from an empty page.",
  },
  {
    key: "review",
    label: "Review",
    place: "Review",
    title: "Review your choices",
    intro:
      "Check everything below. Each line can still be changed, now or after your first draft is written.",
  },
];

const pathOf = (step: SetupStep) => `${PATHS.setup}/${step}`;

function stepAt(pathname: string): number {
  const key = pathname.slice(PATHS.setup.length + 1);
  return Math.max(
    STEPS.findIndex((step) => step.key === key),
    0,
  );
}

type Motion = "arrive" | "onward" | "back" | "none";

/** Set in the click that leaves the door, read on the next screen. */
let pending: Motion | null = null;

function arm(motion: Motion) {
  pending = motion;
}

function plainClick(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function useSetupMotion(path: string): Motion {
  const [at, setAt] = useState(path);
  const [motion, setMotion] = useState<Motion>(
    path === PATHS.setup ? "arrive" : "none",
  );
  let shown = motion;
  if (at !== path) {
    const next =
      pending ??
      (path === PATHS.setup
        ? at === pathOf("look")
          ? "back"
          : "arrive"
        : "none");
    setAt(path);
    setMotion(next);
    shown = next;
  }
  useEffect(() => {
    pending = null;
  }, [path]);
  return shown;
}

function motionClass(path: string, motion: Motion): string {
  if (path === PATHS.setup)
    return motion === "back" ? "setup-back" : "setup-arrive";
  if (path === pathOf("look") && motion === "onward") return "setup-onward";
  return "";
}

function Header({ user, center }: { user: User; center?: ReactNode }) {
  const { signOut } = useAuth();
  return (
    <header className="border-line sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-4 py-3 sm:px-6">
      <img
        src={logo}
        alt="Bomahut"
        className="h-8 w-auto"
        width={195}
        height={39}
      />
      {center}
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
}

const PRIMARY =
  "bg-brand hover:bg-brand-deep flex w-full max-w-xs items-center justify-center rounded-lg px-4 py-3 font-semibold text-white transition-transform duration-100 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

function SetupDoor({ user, motion }: { user: User; motion: Motion }) {
  const [stored, setStored] = useState(() => readSetup(user.username));
  const place = STEPS.find((step) => step.key === stored?.step)?.place;

  const begin = () => {
    startSetup(user.username);
    arm("onward");
    navigate(pathOf("look"));
  };

  const resume = () => {
    if (!stored) return;
    if (stored.step === "look") arm("onward");
    navigate(pathOf(stored.step));
  };

  const reset = () => {
    if (
      !window.confirm(
        "Start over? The answers saved on this browser will be deleted.",
      )
    )
      return;
    clearWebsite(user.username);
    setStored(null);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header user={user} />
      <main className="flex flex-1 flex-col justify-center px-4 py-16">
        <div
          className={`mx-auto w-full max-w-md ${motionClass(PATHS.setup, motion)}`}
        >
          <h1 className="text-4xl font-semibold tracking-tight">
            {stored ? "Continue setting up" : "Your website"}
          </h1>
          {stored ? (
            <p className="text-ink-muted mt-3 text-lg">
              You stopped at {place}. Saved on this browser.
            </p>
          ) : (
            <>
              <p className="text-ink-muted mt-3 text-lg">
                Five short steps. We write the first draft from your answers.
                Nothing is public until you publish.
              </p>
              <p className="mt-6 font-medium">
                Theme · Colour · Company · About you · Review
              </p>
            </>
          )}
          <button
            type="button"
            onClick={stored ? resume : begin}
            className={`${PRIMARY} mt-8`}
          >
            {stored ? "Continue" : "Set up your website"}
          </button>
          {stored ? (
            <button
              type="button"
              onClick={reset}
              className="text-brand mt-5 block font-medium hover:underline"
            >
              Start over
            </button>
          ) : null}
        </div>
      </main>
    </div>
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
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const motion = useSetupMotion(path);
  if (path === PATHS.setup) return <SetupDoor user={user} motion={motion} />;
  return (
    <SetupWizard
      user={user}
      onCreated={onCreated}
      motion={motion}
      path={path}
    />
  );
}

function SetupWizard({
  user,
  onCreated,
  motion,
  path,
}: {
  user: User;
  onCreated: (site: Site, leftOut: string[]) => void;
  motion: Motion;
  path: string;
}) {
  const current = stepAt(path);
  const step = STEPS[current] ?? STEPS[0];
  const [website, setWebsite] = useState<Website | null>(null);
  const [company, setCompany] = useState<Company>(NO_COMPANY);
  const [errors, setErrors] = useState<CompanyErrors>({});
  // The consent to the details being public. It is asked for again once saved details are changed.
  const [consent, setConsent] = useState({ given: false, saved: false });
  const [consentError, setConsentError] = useState<string>();
  const [loadProblem, setLoadProblem] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [aboutError, setAboutError] = useState<string>();
  const [addressRefusal, setAddressRefusal] = useState<{
    name: string;
    problem: string;
    suggestion: string | null;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([readWebsite(user.username), readCompany()])
      .then(([storedWebsite, storedCompany]) => {
        if (!active) return;
        setWebsite(storedWebsite);
        // A new account has no name yet: start from the one tried on the landing page.
        setCompany(
          storedCompany?.displayName
            ? storedCompany
            : {
                ...(storedCompany ?? NO_COMPANY),
                displayName: tryoutName(),
              },
        );
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

  useEffect(() => {
    saveSetupStep(user.username, step.key);
  }, [user.username, step.key]);

  const named = company.displayName.trim() !== "";
  const address = website ? chosenAddress(website, company.displayName) : "";
  const takeAddress = (addressName: string) => {
    if (!website) return;
    setAddressRefusal(null);
    setWebsite({ ...website, addressName, addressTouched: true });
  };
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
        setConsentError(consent.given ? undefined : CONSENT_NEEDED);
        if (hasErrors(found) || !consent.given) return;
        const saved = await saveCompany(trimmedCompany(company), true);
        if (!saved.ok) {
          setProblem(saved.message);
          return;
        }
        setCompany(saved.company);
        setConsent({ given: true, saved: true });
        const name = chosenAddress(website, saved.company.displayName);
        const checked = await confirmAddress(name);
        if (!checked.ok) {
          setAddressRefusal({ ...checked, name });
          return;
        }
        setAddressRefusal(null);
      }
      if (step.key === "about") {
        const found = aboutTextError(website.answers.about_text);
        setAboutError(found);
        if (found) return;
      }
      const following = STEPS[current + 1];
      const next = following ? following.key : step.key;
      await saveWebsite(user.username, website, next);
      if (step.key !== "review") {
        navigate(pathOf(next));
        return;
      }
      const name = chosenAddress(website, company.displayName);
      const checked = await confirmAddress(name);
      if (!checked.ok) {
        setAddressRefusal({ ...checked, name });
        return;
      }
      setAddressRefusal(null);
      const created = await createSite({ ...website, addressName: name });
      if (!created.ok) {
        if (created.code === "address_name") {
          setAddressRefusal({
            name,
            problem: created.message,
            suggestion: created.suggestion,
          });
          return;
        }
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

  const header = <Header user={user} center={<Steps current={current} />} />;
  const isLast = current === STEPS.length - 1;

  return (
    <div className="min-h-dvh">
      {header}
      <div className={motionClass(path, motion)}>
        {!website || !site ? (
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
        ) : (
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
                  consent={{
                    given: consent.given,
                    error: consentError,
                    onChange: (given) => {
                      setConsent({ given, saved: false });
                      setConsentError(undefined);
                    },
                  }}
                  audience={website.audience}
                  address={address}
                  addressTouched={website.addressTouched}
                  addressRefusal={
                    addressRefusal?.name === address ? addressRefusal : null
                  }
                  onCompany={(changes) => {
                    setCompany({ ...company, ...changes });
                    setErrors({});
                    if (consent.saved)
                      setConsent({ given: false, saved: false });
                  }}
                  onAudience={(audience) =>
                    setWebsite({ ...website, audience })
                  }
                  onAddress={takeAddress}
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
                <ReviewStep
                  website={website}
                  company={company}
                  address={address}
                  addressProblem={
                    addressRefusal?.name === address
                      ? addressRefusal.problem
                      : undefined
                  }
                  addressSuggestion={
                    addressRefusal?.name === address
                      ? addressRefusal.suggestion
                      : null
                  }
                  onUseAddress={takeAddress}
                  pathOf={pathOf}
                />
              ) : null}
              <div className="mt-8 flex items-center gap-5">
                <a
                  href={
                    current > 0 ? pathOf(STEPS[current - 1].key) : PATHS.setup
                  }
                  onClick={(event) => {
                    if (current === 0 && plainClick(event)) arm("back");
                  }}
                  className="border-brand text-brand hover:bg-brand-soft flex items-center gap-1.5 rounded-lg border bg-white py-3 pr-5 pl-3.5 font-semibold"
                >
                  <Chevron direction="left" />
                  Back
                </a>
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
        )}
      </div>
    </div>
  );
}
