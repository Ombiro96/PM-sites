import { useMemo, useState, type ReactNode } from "react";
import { LOOKS } from "@/lib/site/data";
import type { Look } from "@/lib/site/types";
import logo from "../assets/bomahut.svg";
import { PreviewPanel } from "../components/PreviewPanel";
import { SitePreview } from "../components/SitePreview";
import { COMPANY_NAME_MAX } from "../lib/company";
import { API_BASE, PATHS } from "../lib/config";
import { LOOK_DETAILS } from "../lib/looks";
import { triedSite } from "../lib/preview";
import { BRAND_COLOURS, saveTryout } from "../lib/website";

const PRESS =
  "transition-transform duration-100 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
const PRIMARY = `bg-brand hover:bg-brand-deep inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold text-white ${PRESS}`;
const SECONDARY = `text-brand hover:bg-brand-soft inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold ${PRESS}`;
const EYEBROW = "text-brand text-sm font-semibold tracking-wide uppercase";
const HEADING =
  "text-4xl leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-5xl";

type Tryout = { look: Look; brandColour: string; name: string };

/** Keeps the campaign query string, which sign-up sends as the registration source. */
const registerHref = () => `${PATHS.register}${window.location.search}`;

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const FEATURES: { icon: string; title: string; body: string }[] = [
  {
    icon: "M3 10.5 12 3l9 7.5M5 9v11h14V9M9.5 20v-6h5v6",
    title: "Your vacant houses, listed for you",
    body: "Houses to let come straight from your Bomahut account. Update a unit once and your website shows it.",
  },
  {
    icon: "M4 5h16v11H8l-4 4V5Zm4 4h8m-8 3h5",
    title: "Every enquiry in one inbox",
    body: "Viewing requests and messages arrive in Enquiries with the person's name, phone and the building they asked about.",
  },
  {
    icon: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z",
    title: "WhatsApp and call, one tap away",
    body: "On phones, call and WhatsApp buttons stay at the bottom of the screen, so a tenant can reach you from any page.",
  },
  {
    icon: "M4 20V8l8-4 8 4v12M9 20v-5h6v5M8 11h.01M16 11h.01",
    title: "Win new buildings",
    body: "A page for owners with your services, how you work and a form that lets a landlord ask you to manage their property.",
  },
  {
    icon: "M4 20h16M7 16V10m5 6V6m5 10v-4",
    title: "Show how much you manage",
    body: "Your number of buildings and units, taken from your account, so owners see your track record.",
  },
  {
    icon: "M4 20l4-1 11-11-3-3L5 16l-1 4Zm10-13 3 3",
    title: "Change anything by clicking it",
    body: "Click a section to change its words or pictures. Changes stay private until you publish, and you can go back a version.",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "Choose a theme and colour",
    body: "Six complete designs. Pick one and make it yours with your company colour.",
  },
  {
    title: "Answer a few questions",
    body: "Your name, phone and a few words about your company. We write the first draft of every page from your answers.",
  },
  {
    title: "Make it yours, then publish",
    body: "Change any section you like. Nothing is public until you press Publish.",
  },
];

const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "What does it cost to build?",
    a: "Nothing. Building and previewing your website is free. When you are happy with it, ask Bomahut to switch on publishing from the Go live page.",
  },
  {
    q: "Do I need a designer or a developer?",
    a: "No. Every theme is a complete, finished design. You answer a few questions, we write the first draft, and you change it by clicking.",
  },
  {
    q: "Do I need my own web address?",
    a: "No. We give your website an address based on your company name.",
  },
  {
    q: "Will it work on phones?",
    a: "Yes. Every theme is built for phones first, and you can preview your website as a phone, tablet or computer while you edit.",
  },
  {
    q: "Can I change the theme later?",
    a: "Yes, at any time. You can try your own pages in another theme before you switch.",
  },
  {
    q: "I already use Bomahut. Do I need a new account?",
    a: "No. Sign in with the account you already use, and your buildings and vacant houses are ready for your website.",
  },
];

function Section({
  id,
  tone = "white",
  children,
}: {
  id?: string;
  tone?: "white" | "surface";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 px-4 py-20 sm:px-6 sm:py-28 ${tone === "white" ? "bg-white" : ""}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function Nav({ onStart }: { onStart: () => void }) {
  return (
    <header className="landing-nav sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="/" aria-label="Bomahut Websites, home">
          <img
            src={logo}
            alt="Bomahut"
            className="h-7 w-auto"
            width={195}
            height={39}
          />
        </a>
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <a
            href="#features"
            className="text-ink-muted hover:text-ink hidden px-3 py-2 font-medium sm:inline"
          >
            Features
          </a>
          <a
            href="#questions"
            className="text-ink-muted hover:text-ink hidden px-3 py-2 font-medium sm:inline"
          >
            Questions
          </a>
          <a
            href={`${PATHS.login}${window.location.search}`}
            className="text-ink px-3 py-2 font-medium hover:underline"
          >
            Sign in
          </a>
          <a
            href={registerHref()}
            onClick={onStart}
            className={`${PRIMARY} px-4 py-2 text-sm`}
          >
            Start free
          </a>
        </nav>
      </div>
    </header>
  );
}

function TryIt({
  tryout,
  onChange,
  onStart,
}: {
  tryout: Tryout;
  onChange: (changes: Partial<Tryout>) => void;
  onStart: () => void;
}) {
  const site = useMemo(() => triedSite(tryout), [tryout]);

  return (
    <div
      id="try"
      className="border-line mx-auto grid max-w-[90rem] scroll-mt-20 grid-cols-1 gap-8 rounded-3xl border bg-white p-4 shadow-xl shadow-black/5 sm:p-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:p-8"
    >
      <div className="flex flex-col gap-7">
        <div>
          <p className="text-lg font-semibold tracking-tight">
            Try it with your company
          </p>
          <p className="text-ink-muted mt-1 text-sm">
            This is the real thing. Click around the preview.
          </p>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Company name</span>
          <input
            type="text"
            value={tryout.name}
            maxLength={COMPANY_NAME_MAX}
            placeholder="Tembo & Hart"
            autoComplete="organization"
            onChange={(event) => onChange({ name: event.target.value })}
            className="border-line focus:border-brand focus:ring-brand/20 mt-1.5 block w-full rounded-xl border bg-white px-3.5 py-2.5 text-base outline-none focus:ring-4"
          />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Theme</legend>
          <div className="grid grid-cols-3 gap-2">
            {LOOKS.map((look) => (
              <label key={look} className="cursor-pointer">
                <input
                  type="radio"
                  name="tryout-look"
                  value={look}
                  checked={look === tryout.look}
                  onChange={() => onChange({ look })}
                  className="peer sr-only"
                />
                <span
                  className={`border-line peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand peer-focus-visible:outline-brand block rounded-xl border px-2 py-2 text-center text-sm font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${PRESS}`}
                >
                  {LOOK_DETAILS[look].name}
                </span>
              </label>
            ))}
          </div>
          <p className="text-ink-muted mt-2 min-h-10 text-sm">
            {LOOK_DETAILS[tryout.look].summary}
          </p>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Colour</legend>
          <div className="grid grid-cols-8 gap-2">
            {BRAND_COLOURS.map(({ name, value }) => (
              <label key={value} className="cursor-pointer" title={name}>
                <input
                  type="radio"
                  name="tryout-colour"
                  value={value}
                  checked={value === tryout.brandColour}
                  onChange={() => onChange({ brandColour: value })}
                  className="peer sr-only"
                />
                <span className="sr-only">{name}</span>
                <span
                  aria-hidden="true"
                  className={`peer-checked:ring-ink peer-focus-visible:outline-brand block aspect-square w-full rounded-full ring-offset-2 peer-checked:ring-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 ${PRESS}`}
                  style={{ background: value }}
                />
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-auto">
          <a
            href={registerHref()}
            onClick={onStart}
            className={`${PRIMARY} w-full`}
          >
            Build this website
          </a>
          <p className="text-ink-muted mt-2.5 text-center text-sm">
            Free to build. Your choices come with you.
          </p>
        </div>
      </div>
      <PreviewPanel
        site={site}
        caption="Example pages, houses and enquiries."
      />
    </div>
  );
}

function Themes({
  tryout,
  onPick,
}: {
  tryout: Tryout;
  onPick: (look: Look) => void;
}) {
  const { brandColour, name } = tryout;
  const sites = useMemo(
    () =>
      LOOKS.map((look) => ({
        look,
        site: triedSite({ look, brandColour, name }),
      })),
    [brandColour, name],
  );

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map(({ look, site }) => (
        <button
          key={look}
          type="button"
          onClick={() => onPick(look)}
          className={`group border-line hover:border-brand focus-visible:outline-brand overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-[transform,border-color] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 ${PRESS}`}
        >
          <span className="border-line block border-b">
            <SitePreview
              site={site}
              title={`${LOOK_DETAILS[look].name} theme`}
              width={1280}
              height={860}
            />
          </span>
          <span className="flex items-center justify-between gap-3 px-4 py-3.5">
            <span>
              <span className="block font-semibold">
                {LOOK_DETAILS[look].name}
              </span>
              <span className="text-ink-muted block text-sm">
                {LOOK_DETAILS[look].summary}
              </span>
            </span>
            <span className="text-brand shrink-0 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Try it
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

/** What a signed-out visitor sees first: the product, shown working, and the way in. */
export function LandingPage() {
  const [tryout, setTryout] = useState<Tryout>({
    look: "fresh",
    brandColour: BRAND_COLOURS[0].value,
    name: "",
  });
  const change = (changes: Partial<Tryout>) =>
    setTryout((current) => ({ ...current, ...changes }));
  const start = () => saveTryout(tryout);

  return (
    <div className="min-h-dvh">
      <Nav onStart={start} />
      <main>
        <section className="px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
          <div className="setup-arrive mx-auto max-w-3xl text-center">
            <p className={EYEBROW}>For property managers and landlords</p>
            <h1 className="mt-4 text-5xl leading-[1.03] font-semibold tracking-[-0.035em] text-balance sm:text-7xl">
              A professional website, ready before your next viewing.
            </h1>
            <p className="text-ink-muted mx-auto mt-6 max-w-2xl text-lg text-pretty sm:text-xl">
              Show your vacant houses, take enquiries on WhatsApp and win new
              buildings. We write the first draft for you. No designer, no code.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a href={registerHref()} onClick={start} className={PRIMARY}>
                Build your website free
              </a>
              <a href="#try" className={SECONDARY}>
                Try it first
              </a>
            </div>
            <p className="text-ink-muted mt-4 text-sm">
              Free to build · Nothing is public until you publish
            </p>
          </div>
          <div className="mt-16">
            <TryIt tryout={tryout} onChange={change} onStart={start} />
          </div>
        </section>

        <Section id="features">
          <div className="max-w-2xl">
            <p className={EYEBROW}>Built for property</p>
            <h2 className={`${HEADING} mt-3`}>
              Not just a website. One that knows your buildings.
            </h2>
            <p className="text-ink-muted mt-5 text-lg">
              Your website works with your Bomahut account, so the houses,
              numbers and enquiries are always your real ones.
            </p>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <span className="bg-brand-soft text-brand flex size-11 items-center justify-center rounded-xl">
                  <Icon d={feature.icon} />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-ink-muted mt-1.5">{feature.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section tone="surface">
          <div className="mx-auto max-w-2xl text-center">
            <p className={EYEBROW}>How it works</p>
            <h2 className={`${HEADING} mt-3`}>
              Three steps. About five minutes.
            </h2>
          </div>
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, at) => (
              <li
                key={step.title}
                className="border-line rounded-2xl border bg-white p-7"
              >
                <span className="bg-brand flex size-9 items-center justify-center rounded-full font-semibold text-white">
                  {at + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-ink-muted mt-1.5">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className={EYEBROW}>Themes</p>
              <h2 className={`${HEADING} mt-3`}>Six finished designs.</h2>
              <p className="text-ink-muted mt-5 text-lg">
                Each one is complete, from the first screen to the contact form.
                Change it any time without losing a word.
              </p>
            </div>
          </div>
          <div className="mt-12">
            <Themes
              tryout={tryout}
              onPick={(look) => {
                change({ look });
                document
                  .getElementById("try")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        </Section>

        <Section tone="surface">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="border-line rounded-3xl border bg-white p-8 sm:p-10">
              <p className={EYEBROW}>Property managers</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Fill units and win buildings.
              </h3>
              <p className="text-ink-muted mt-3">
                One website for both sides of your business: tenants find a
                house, owners see why they should hand you their building.
              </p>
            </div>
            <div className="border-line rounded-3xl border bg-white p-8 sm:p-10">
              <p className={EYEBROW}>Landlords</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Let your houses faster.
              </h3>
              <p className="text-ink-muted mt-3">
                Share one link instead of sending photos one by one. Tenants see
                what is free and reach you on WhatsApp.
              </p>
            </div>
          </div>
        </Section>

        <Section id="questions">
          <div className="mx-auto max-w-3xl">
            <h2 className={`${HEADING} text-center`}>Questions</h2>
            <div className="divide-line border-line mt-12 divide-y border-y">
              {QUESTIONS.map(({ q, a }) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {q}
                    <span
                      aria-hidden="true"
                      className="text-brand text-2xl leading-none font-normal transition-transform duration-200 ease-out group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="text-ink-muted mt-3 pr-8">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>

        <section className="bg-brand px-4 py-20 text-center text-white sm:px-6 sm:py-28">
          <h2 className="mx-auto max-w-2xl text-4xl leading-[1.08] font-semibold tracking-[-0.025em] text-balance sm:text-5xl">
            See your website before you decide.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
            Answer a few questions and get a first draft written for you. Free,
            and private until you publish.
          </p>
          <a
            href={registerHref()}
            onClick={start}
            className={`text-brand mt-9 inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 font-semibold hover:bg-white/90 ${PRESS}`}
          >
            Build your website free
          </a>
        </section>
      </main>
      <footer className="text-ink-muted px-4 py-10 text-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Bomahut</p>
          <nav className="flex gap-5">
            <a
              href={`${API_BASE}/termsofservice`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              Terms
            </a>
            <a
              href={`${API_BASE}/privacypolicy`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              Privacy
            </a>
            <a href={PATHS.login} className="hover:text-ink">
              Sign in
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
