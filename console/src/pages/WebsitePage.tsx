import { useEffect, useMemo, useState, type FormEvent } from "react";
import { navigate } from "@/lib/router";
import logo from "../assets/bomahut.svg";
import { TextLink } from "../components/AuthLayout";
import { FormError, SubmitButton } from "../components/fields";
import { SitePreview } from "../components/SitePreview";
import { useAuth } from "../lib/auth";
import {
  companyNameError,
  companyPhoneError,
  readCompany,
  saveCompany,
  type Company,
} from "../lib/company";
import { PATHS } from "../lib/config";
import { exampleSite } from "../lib/preview";
import type { User } from "../lib/session";
import { readWebsite, saveWebsite, type Website } from "../lib/website";
import { ColourStep } from "./website/ColourStep";
import { DetailsStep, type CompanyErrors } from "./website/DetailsStep";
import { LookStep } from "./website/LookStep";
import { ReviewStep } from "./website/ReviewStep";

const STEPS = [
  {
    key: "look",
    label: "Look",
    title: "Choose a look",
    intro:
      "Each look is a complete design. Pick the one that suits your company; you can change it at any time.",
  },
  {
    key: "colour",
    label: "Colour",
    title: "Choose your colour",
    intro: "Buttons, links and highlights across your website use this colour.",
  },
  {
    key: "details",
    label: "Details",
    title: "Your company details",
    intro: "This is what the public sees on your website.",
  },
  {
    key: "review",
    label: "Review",
    title: "Review your choices",
    intro: "Check everything below. Each line can still be changed.",
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const DEVICES = {
  desktop: { label: "Computer", width: 1280, height: 800 },
  phone: { label: "Phone", width: 390, height: 780 },
} as const;

type Device = keyof typeof DEVICES;

const NO_COMPANY: Company = { displayName: "", phone: "", whatsappNumber: "" };

const pathOf = (step: StepKey) => `${PATHS.website}/${step}`;

function stepAt(pathname: string): number {
  const key = pathname.slice(PATHS.website.length + 1);
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

export function WebsitePage({ user }: { user: User }) {
  const { signOut } = useAuth();
  const current = stepAt(window.location.pathname);
  const step = STEPS[current];
  const [website, setWebsite] = useState<Website | null>(null);
  const [company, setCompany] = useState<Company>(NO_COMPANY);
  const [errors, setErrors] = useState<CompanyErrors>({});
  const [loadProblem, setLoadProblem] = useState("");
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
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
        const found: CompanyErrors = {
          displayName: companyNameError(company.displayName),
          phone: companyPhoneError(company.phone),
        };
        setErrors(found);
        if (Object.values(found).some(Boolean)) return;
        const saved = await saveCompany({
          displayName: company.displayName.trim(),
          phone: company.phone.trim(),
          whatsappNumber: company.whatsappNumber.trim(),
        });
        if (!saved.ok) {
          setProblem(saved.message);
          return;
        }
        setCompany(saved.company);
      }
      await saveWebsite(user.username, website);
      navigate(pathOf(STEPS[current + 1].key));
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
          {step.key === "review" ? (
            <ReviewStep website={website} company={company} pathOf={pathOf} />
          ) : null}
          <div className="mt-8 flex items-center gap-5">
            {current > 0 ? (
              <TextLink href={pathOf(STEPS[current - 1].key)}>Back</TextLink>
            ) : null}
            {isLast ? null : (
              <div className="ml-auto w-44">
                <SubmitButton busy={busy}>Continue</SubmitButton>
              </div>
            )}
          </div>
        </form>
        <section
          aria-label="Preview"
          className="lg:sticky lg:top-20 lg:self-start"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-ink-muted text-sm">
              An example website in your look and colour.
            </p>
            <div className="border-line flex rounded-lg border bg-white p-0.5 text-sm">
              {(Object.keys(DEVICES) as Device[]).map((each) => (
                <button
                  key={each}
                  type="button"
                  aria-pressed={each === device}
                  onClick={() => setDevice(each)}
                  className={`rounded-md px-3 py-1 font-medium ${each === device ? "bg-brand text-white" : "text-ink-muted"}`}
                >
                  {DEVICES[each].label}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`border-line mx-auto overflow-hidden rounded-xl border shadow-lg ${device === "phone" ? "max-w-sm" : ""}`}
          >
            <SitePreview
              site={site}
              title="Preview of your website"
              interactive
              width={DEVICES[device].width}
              height={DEVICES[device].height}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
