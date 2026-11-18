import type { ReactNode } from "react";

export type NoticeTone = "good" | "bad" | "info";

/** What the console tells the manager after something they did, with at most one thing to do next. */
export type NoticeContent = {
  tone: NoticeTone;
  title: string;
  text: string;
  action?: { label: string; run: () => void } | { label: string; href: string };
};

const TONES: Record<NoticeTone, string> = {
  good: "border-green-300 bg-green-50",
  bad: "border-red-300 bg-red-50",
  info: "border-brand/30 bg-brand-soft",
};

const ACTION =
  "bg-brand hover:bg-brand-deep mt-1 flex min-h-11 items-center self-start rounded-lg px-4 font-semibold text-white";

export function Notice({
  notice,
  onClose,
}: {
  notice: NoticeContent;
  onClose: () => void;
}) {
  const { action } = notice;
  let button: ReactNode = null;
  if (action && "href" in action)
    button = (
      <a href={action.href} target="_blank" rel="noreferrer" className={ACTION}>
        {action.label}
      </a>
    );
  else if (action)
    button = (
      <button type="button" onClick={action.run} className={ACTION}>
        {action.label}
      </button>
    );

  return (
    <div
      role={notice.tone === "bad" ? "alert" : "status"}
      className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 ${TONES[notice.tone]}`}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-semibold">{notice.title}</p>
        <p className="text-[15px]">{notice.text}</p>
        {button}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close this message"
        className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-black/5"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 3l10 10M13 3 3 13" />
        </svg>
      </button>
    </div>
  );
}
