import { toast } from "sonner";

export type NoticeTone = "good" | "bad" | "info";

/** What the console tells the manager after something they did, with at most one thing to do next. */
export type NoticeContent = {
  tone: NoticeTone;
  title: string;
  text: string;
  /** Shows that the work is still going on. A later tell() with the same place replaces it. */
  working?: boolean;
  action?: { label: string; run: () => void } | { label: string; href: string };
};

/** One outcome at a time, matching the old banner: a new message replaces the last. */
const OUTCOME = "outcome";

function actionOf(notice: NoticeContent) {
  const action = notice.action;
  if (!action) return undefined;
  if ("href" in action)
    return {
      label: action.label,
      onClick: () => window.open(action.href, "_blank", "noreferrer"),
    };
  return { label: action.label, onClick: () => action.run() };
}

/** Bottom-right toast. Loading and anything with a button stay until replaced or closed. */
export function tell(notice: NoticeContent): void {
  const options = {
    id: OUTCOME,
    description: notice.text,
    duration:
      notice.working || notice.action
        ? Infinity
        : notice.tone === "good"
          ? 5000
          : 8000,
    action: actionOf(notice),
  };
  if (notice.working) toast.loading(notice.title, options);
  else if (notice.tone === "good") toast.success(notice.title, options);
  else if (notice.tone === "bad") toast.error(notice.title, options);
  else toast.info(notice.title, options);
}
