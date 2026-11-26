import { useEffect, useRef, useState } from "react";
import { Button } from "./fields";

/** Asks before something is removed for good. With `canConfirm` off it only explains why it cannot be done yet. */
export function ConfirmDialog({
  title,
  text,
  confirmLabel,
  busyLabel,
  canConfirm = true,
  onConfirm,
  onClose,
}: {
  title: string;
  text: string;
  confirmLabel: string;
  busyLabel: string;
  canConfirm?: boolean;
  /** Answers with what went wrong, or null once it is done. */
  onConfirm: () => Promise<string | null>;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current && !busy) onClose();
      }}
      aria-label={title}
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl p-5 backdrop:bg-black/60"
    >
      <h2 className="font-semibold">{title}</h2>
      <p className="text-ink-muted mt-1 text-sm">{text}</p>
      {problem ? (
        <p role="alert" className="text-bad mt-3 text-sm">
          {problem}
        </p>
      ) : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button tone="quiet" disabled={busy} onClick={onClose}>
          {canConfirm ? "Cancel" : "Close"}
        </Button>
        {canConfirm ? (
          <Button
            tone="danger"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setProblem("");
              void onConfirm().then((found) => {
                if (found === null) return;
                setBusy(false);
                setProblem(found);
              });
            }}
          >
            {busy ? busyLabel : confirmLabel}
          </Button>
        ) : null}
      </div>
    </dialog>
  );
}
