import { useEffect, useMemo, useState } from "react";
import { navigate } from "@/lib/router";
import { LOOKS } from "@/lib/site/data";
import type { Look } from "@/lib/site/types";
import logo from "../assets/bomahut.svg";
import { Button } from "../components/fields";
import { Notice, type NoticeContent } from "../components/Notice";
import { useAuth } from "../lib/auth";
import { readCompany, type Company } from "../lib/company";
import { PATHS } from "../lib/config";
import { withoutNewIds } from "../lib/draft";
import type { Rules } from "../lib/rules";
import type { User } from "../lib/session";
import {
  askToPublish,
  DEPLOY_POLL_MS,
  publish,
  readDeploy,
  readPictures,
  readRules,
  saveDraft,
  setLook,
  startPreview,
  switchOff,
  switchOn,
  undoPublish,
  type Picture,
  type Refusal,
  type Site,
  type SiteResult,
} from "../lib/site";
import { DetailsView } from "./console/DetailsView";
import { EnquiriesView } from "./console/EnquiriesView";
import { GoLiveView } from "./console/GoLiveView";
import { LookView } from "./console/LookView";
import { PagesView } from "./console/PagesView";
import { PicturesView } from "./console/PicturesView";
import { SettingsView } from "./console/SettingsView";
import { LookStep } from "./website/LookStep";

const VIEWS = [
  {
    key: "pages",
    nav: "Edit pages",
    title: "Edit your pages",
    intro:
      "Click any section of a page to change it. Everything here is a draft until you publish.",
  },
  {
    key: "pictures",
    nav: "Pictures",
    title: "Pictures",
    intro: "The pictures your pages can use.",
  },
  {
    key: "details",
    nav: "Company details",
    title: "Company details",
    intro: "What the public sees about your company, on every page.",
  },
  {
    key: "theme",
    nav: "Theme",
    title: "Theme",
    intro:
      "Click a theme to see your own pages in it. Nothing changes until you choose to use it.",
  },
  {
    key: "theme-colour",
    nav: "Theme colour",
    title: "Theme colour",
    intro: "Buttons, links and highlights across your website use this colour.",
  },
  {
    key: "go-live",
    nav: "Go live",
    title: "Go live",
    intro: "What is left to do before visitors can see your website.",
  },
  {
    key: "enquiries",
    nav: "Enquiries",
    title: "Enquiries",
    intro: "People who wrote to you through your website.",
  },
  {
    key: "settings",
    nav: "Settings",
    title: "Settings",
    intro: "Your address, going back a version, and switching the website off.",
  },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

const pathOf = (view: ViewKey) => `${PATHS.website}/${view}`;

/** The view a path names, and what follows it: the theme opened on the Theme view. */
function viewAt(pathname: string) {
  const [key, detail = ""] = pathname
    .slice(PATHS.website.length + 1)
    .split("/");
  return {
    view: VIEWS.find((each) => each.key === key) ?? VIEWS[0],
    detail,
  };
}

const STATUS_TONES = {
  quiet: "bg-line/60",
  good: "bg-green-100 text-green-900",
  waiting: "bg-amber-100 text-amber-900",
} as const;

function statusOf(site: Site): [string, keyof typeof STATUS_TONES] {
  if (site.status === "OFF") return ["Switched off", "quiet"];
  if (site.status === "DRAFT") return ["Draft · not public", "quiet"];
  return site.hasUnpublishedChanges
    ? ["Live · changes not published", "waiting"]
    : ["Live", "good"];
}

const SAVE_FIRST: NoticeContent = {
  tone: "info",
  title: "Save your changes first",
  text: "You have changes under Edit pages that are not saved to your draft.",
};

/** Where a manager runs their website once it exists: edits it, previews it, publishes it and reads what visitors sent. */
export function ConsolePage({
  user,
  site,
  fresh,
  onSite,
  onReload,
}: {
  user: User;
  site: Site;
  /** True straight after setup, when the first draft has just been written. */
  fresh: boolean;
  onSite: (site: Site) => void;
  onReload: () => void;
}) {
  const { signOut } = useAuth();
  const { view, detail } = viewAt(window.location.pathname);
  const openedLook = LOOKS.find((look) => look === detail) ?? null;
  // Each theme in the grid is a whole website being drawn, so once shown the grid stays loaded and is only hidden.
  const [themesShown, setThemesShown] = useState(false);
  if (view.key === "theme" && !themesShown) setThemesShown(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [rules, setRules] = useState<Rules>();
  const [loadProblem, setLoadProblem] = useState("");
  const [working, setWorking] = useState(site.draft);
  const [notice, setNotice] = useState<NoticeContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [deployId, setDeployId] = useState("");
  // Compared by content: every answer from the backend carries the draft as a new object.
  const dirty = useMemo(
    () => JSON.stringify(working) !== JSON.stringify(site.draft),
    [working, site.draft],
  );
  const address = site.url ? new URL(site.url).host : site.addressName;
  const [statusText, statusTone] = statusOf(site);

  useEffect(() => {
    let active = true;
    Promise.all([readCompany(), readPictures(), readRules()])
      .then(([foundCompany, foundPictures, foundRules]) => {
        if (!active) return;
        setCompany(foundCompany);
        setPictures(foundPictures);
        setRules(foundRules);
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
  }, []);

  useEffect(() => {
    if (!deployId) return;
    const timer = window.setInterval(() => {
      void readDeploy(deployId)
        .then((deploy) => {
          if (deploy?.status === "BUILDING") return;
          setDeployId("");
          setNotice(
            deploy?.status === "LIVE" && deploy.url
              ? {
                  tone: "good",
                  title: "Your preview is ready",
                  text: "The link works for 24 hours and you can share it.",
                  action: { label: "Open the preview", href: deploy.url },
                }
              : {
                  tone: "bad",
                  title: "This preview could not be built",
                  text: deploy?.message ?? "Try again.",
                },
          );
        })
        .catch(() => undefined);
    }, DEPLOY_POLL_MS);
    return () => window.clearInterval(timer);
  }, [deployId]);

  const refused = (refusal: Refusal): NoticeContent => {
    if (refusal.code === "stale")
      return {
        tone: "bad",
        title: "Someone else changed this website",
        text: "Your change was not saved. Reload to see the latest version, then make your change again.",
        action: { label: "Reload", run: onReload },
      };
    if (refusal.code === "not_ready")
      return {
        tone: "bad",
        title: "Your website cannot go live yet",
        text: refusal.problems[0]?.message ?? refusal.message,
        action: {
          label: "See what is left",
          run: () => {
            setNotice(null);
            navigate(pathOf("go-live"));
          },
        },
      };
    if (refusal.code === "not_allowed")
      return site.publishRequestedAt
        ? {
            tone: "info",
            title: "We have your request",
            text: "Our team has been told. You will get an SMS when you can publish.",
          }
        : {
            tone: "info",
            title: "Bomahut switches on publishing for each website",
            text: "Ask us to switch it on for yours. We will send you an SMS as soon as you can publish.",
            action: { label: "Ask Bomahut to publish", run: ask },
          };
    if (refusal.code === "already_asked")
      return {
        tone: "info",
        title: "You have already asked",
        text: "Our team has your request. There is no need to ask again.",
      };
    return { tone: "bad", title: "That did not work", text: refusal.message };
  };

  /** Runs one call about the site, takes in the site it answers with, and says how it went. */
  const run = async (
    call: () => Promise<SiteResult>,
    done: NoticeContent,
  ): Promise<Site | null> => {
    setBusy(true);
    try {
      const result = await call();
      if (!result.ok) {
        setNotice(refused(result));
        return null;
      }
      onSite(result.site);
      setNotice(done);
      return result.site;
    } catch (error) {
      setNotice({
        tone: "bad",
        title: "That did not work",
        text: error instanceof Error ? error.message : String(error),
      });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    const saved = await run(
      () =>
        saveDraft({
          document: withoutNewIds(working),
          expectedRevision: site.draftRevision,
        }),
      {
        tone: "good",
        title: "Saved to your draft",
        text: "Visitors do not see this change until you publish.",
      },
    );
    // What comes back has the ids the backend gave to new sections.
    if (saved) setWorking(saved.draft);
    return saved !== null;
  };

  function ask() {
    void run(() => askToPublish({ expectedRevision: site.draftRevision }), {
      tone: "good",
      title: "We have your request",
      text: "Our team has been told. You will get an SMS when you can publish.",
    });
  }

  const publishNow = () => {
    if (dirty) return setNotice(SAVE_FIRST);
    void run(() => publish({ expectedRevision: site.draftRevision }), {
      tone: "good",
      title: "Your website is live",
      text: `Visitors now see this version at ${address}.`,
    });
  };

  const preview = async () => {
    if (dirty) return setNotice(SAVE_FIRST);
    setBusy(true);
    try {
      const started = await startPreview();
      if (!started.ok) return setNotice(refused(started));
      setDeployId(started.deploy.id);
      setNotice({
        tone: "info",
        title: "Building your preview…",
        text: "This takes a few seconds.",
      });
    } catch (error) {
      setNotice({
        tone: "bad",
        title: "This preview could not be built",
        text: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setBusy(false);
    }
  };

  const saveLook = (look: Look, brandColour: string) =>
    void run(
      () =>
        setLook({ expectedRevision: site.draftRevision, look, brandColour }),
      {
        tone: "good",
        title:
          look === site.look
            ? "Theme colour saved to your draft"
            : "Theme saved to your draft",
        text: "Visitors do not see this change until you publish.",
      },
    );

  const upToDate =
    site.status === "LIVE" && !site.hasUnpublishedChanges && !dirty;

  return (
    <div className="min-h-dvh">
      <header className="border-line sticky top-0 z-10 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b bg-white/85 px-4 py-3 backdrop-blur-lg backdrop-saturate-150 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <img
            src={logo}
            alt="Bomahut"
            className="h-8 w-auto"
            width={195}
            height={39}
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-semibold">{address}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${STATUS_TONES[statusTone]}`}
            >
              {statusText}
            </span>
            <span className="text-ink-muted hidden text-sm md:inline">
              Account: {site.accountName}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            disabled={busy || deployId !== ""}
            onClick={() => void preview()}
          >
            {deployId ? "Building…" : "Preview"}
          </Button>
          <Button tone="solid" disabled={busy || upToDate} onClick={publishNow}>
            {upToDate ? "Published" : "Publish"}
          </Button>
          <button
            type="button"
            onClick={signOut}
            title={user.username}
            className="text-brand min-h-11 px-1.5 text-sm font-medium hover:underline"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[100rem] flex-wrap items-start gap-6 px-4 py-6 sm:px-6">
        <nav
          aria-label="Website"
          className="flex min-w-0 flex-[1_1_12rem] flex-col gap-1 lg:sticky lg:top-24 lg:max-w-56"
        >
          {VIEWS.map((each) => (
            <a
              key={each.key}
              href={pathOf(each.key)}
              aria-current={each.key === view.key ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3.5 ${each.key === view.key ? "bg-brand-soft text-brand font-semibold" : "hover:bg-line/40 font-medium"}`}
            >
              {each.nav}
            </a>
          ))}
        </nav>

        <main className="flex min-w-0 flex-[999_1_35rem] flex-col gap-4">
          {notice ? (
            <Notice notice={notice} onClose={() => setNotice(null)} />
          ) : null}
          {view.key === "theme" && openedLook ? null : (
            <div>
              <h1 className="text-[26px] leading-tight font-semibold tracking-tight">
                {view.title}
              </h1>
              <p className="text-ink-muted">{view.intro}</p>
            </div>
          )}

          {themesShown ? (
            <div hidden={view.key !== "theme" || openedLook !== null}>
              <LookStep
                look={site.look}
                brandColour={site.brandColour}
                company={company}
                opens
                onChoose={(look) => navigate(`${pathOf("theme")}/${look}`)}
              />
            </div>
          ) : null}

          {!rules ? (
            <p className="text-ink-muted">{loadProblem || "Loading…"}</p>
          ) : view.key === "pages" ? (
            <PagesView
              site={site}
              rules={rules}
              working={working}
              dirty={dirty}
              busy={busy}
              fresh={fresh}
              company={company}
              pictures={pictures}
              onWorking={setWorking}
              onSave={save}
              onDiscard={() => setWorking(site.draft)}
            />
          ) : view.key === "pictures" ? (
            <PicturesView
              pictures={pictures}
              document={working}
              onAdded={(picture) => setPictures([...pictures, picture])}
            />
          ) : view.key === "details" ? (
            <DetailsView
              site={site}
              company={company}
              onSaved={(saved, result) => {
                setCompany(saved);
                void run(() => Promise.resolve(result), {
                  tone: "good",
                  title: "Company details saved",
                  text: "They appear on every page of your website.",
                });
              }}
            />
          ) : view.key === "theme" || view.key === "theme-colour" ? (
            <LookView
              key={view.key}
              part={view.key}
              opened={view.key === "theme" ? openedLook : null}
              onClose={() => navigate(pathOf("theme"))}
              site={site}
              working={working}
              company={company}
              pictures={pictures}
              busy={busy}
              onSave={saveLook}
            />
          ) : view.key === "go-live" ? (
            <GoLiveView
              site={site}
              dirty={dirty}
              busy={busy}
              onAsk={ask}
              onPublish={publishNow}
              onStandin={(change) =>
                void run(() => change, {
                  tone: "info",
                  title: "Publishing switch changed",
                  text: "In production the manager gets an SMS when Bomahut switches publishing on.",
                })
              }
            />
          ) : view.key === "enquiries" ? (
            <EnquiriesView />
          ) : (
            <SettingsView
              site={site}
              address={address}
              busy={busy}
              onUndo={() =>
                void run(undoPublish, {
                  tone: "good",
                  title: "Back to the previous version",
                  text: "Visitors now see the version before your last publish.",
                })
              }
              onSwitch={() =>
                void run(
                  site.status === "OFF" ? switchOn : switchOff,
                  site.status === "OFF"
                    ? {
                        tone: "good",
                        title: "Your website is back on",
                        text: "Visitors see your last published version again.",
                      }
                    : {
                        tone: "info",
                        title: "Your website is switched off",
                        text: 'Visitors see "Site not found" until you switch it on again.',
                      },
                )
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
