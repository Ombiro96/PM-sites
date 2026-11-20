import type { ReactNode } from "react";
import { Button } from "../../components/fields";
import type { Site } from "../../lib/site";

function Card({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="border-line flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5">
      <div className="min-w-0 flex-[1_1_17rem]">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-ink-muted text-sm">{children}</div>
      </div>
      {action}
    </section>
  );
}

export function SettingsView({
  site,
  address,
  busy,
  onUndo,
  onSwitch,
}: {
  site: Site;
  address: string;
  busy: boolean;
  onUndo: () => void;
  onSwitch: () => void;
}) {
  const off = site.status === "OFF";
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <Card title="Website address">
        <p className="text-ink font-semibold">{address}</p>
        <p>You chose this when you set up your website. It can't be changed.</p>
      </Card>
      <Card
        title="Go back to previous version"
        action={
          <Button disabled={busy || !site.canUndo} onClick={onUndo}>
            Undo last publish
          </Button>
        }
      >
        {site.canUndo
          ? "Use this if the current version is buggy. Visitors see the version before your last publish again."
          : "Use this if the current version is buggy. Available once you have published at least twice."}
      </Card>
      <Card
        title={off ? "Your website is switched off" : "Switch the website off"}
        action={
          <Button
            tone={off ? "outline" : "danger"}
            disabled={busy}
            onClick={onSwitch}
          >
            {off ? "Switch on" : "Switch off"}
          </Button>
        }
      >
        {off
          ? 'Visitors see "Site not found". Your draft and pictures are kept.'
          : 'Visitors will see "Site not found". Nothing is deleted, and you can switch it back on.'}
      </Card>
    </div>
  );
}
