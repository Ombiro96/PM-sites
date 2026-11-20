import { useEffect, useState } from "react";
import { WEBSITES_ROOT_DOMAIN } from "../lib/config";
import { checkAddress } from "../lib/site";
import { addressError } from "../lib/website";

const CHECK_WAIT_MS = 250;

const PRESS =
  "text-brand inline-block font-medium transition-transform duration-100 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

export type AddressRefusal = {
  problem: string;
  suggestion: string | null;
};

type Live = { problem: string; suggestion: string } | null;

/** Fills the box with a free name. The press scales, the same as the other buttons. */
export function UseAddress({
  suggestion,
  onUse,
}: {
  suggestion: string;
  onUse: (suggestion: string) => void;
}) {
  return (
    <button type="button" className={PRESS} onClick={() => onUse(suggestion)}>
      Use {suggestion}
    </button>
  );
}

/**
 * The name they are choosing, with the host it will have written beside it.
 * A bad shape is shown at once. A taken or reserved name is asked of the
 * backend, a moment after they stop typing.
 */
export function AddressField({
  value,
  touched,
  refusal,
  onChange,
}: {
  value: string;
  touched: boolean;
  refusal: AddressRefusal | null;
  onChange: (value: string) => void;
}) {
  const [live, setLive] = useState<Live>(null);
  const shape = addressError(value);
  const shapeProblem = shape && (value !== "" || touched) ? shape : undefined;
  const problem = refusal?.problem ?? shapeProblem ?? live?.problem;
  const suggestion =
    refusal?.suggestion ?? (shapeProblem ? null : (live?.suggestion ?? null));

  useEffect(() => {
    setLive(null);
    if (addressError(value)) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void checkAddress(value)
        .then((check) => {
          if (cancelled) return;
          setLive(
            check.available
              ? null
              : {
                  problem: check.problem ?? "This address name is taken.",
                  suggestion: check.suggestion,
                },
          );
        })
        .catch(() => {
          if (!cancelled) setLive(null);
        });
    }, CHECK_WAIT_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  const describedBy = problem
    ? "web-address-once web-address-err"
    : "web-address-once";

  return (
    <div className="mb-4">
      <label htmlFor="web-address" className="mb-1.5 block text-sm font-medium">
        Web address
      </label>
      <div
        className={`focus-within:border-brand focus-within:ring-brand-soft flex min-w-0 items-center rounded-lg border bg-white focus-within:ring-4 ${problem ? "border-bad" : "border-line"}`}
      >
        <input
          id="web-address"
          value={value}
          maxLength={40}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          aria-invalid={problem ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base outline-none"
        />
        <span className="text-ink-muted shrink-0 pr-3 text-base">
          .{WEBSITES_ROOT_DOMAIN}
        </span>
      </div>
      <p id="web-address-once" className="text-ink-muted mt-1.5 text-sm">
        You choose this once. It can't be changed after your website is created.
      </p>
      {problem ? (
        <p
          key={problem}
          id="web-address-err"
          role="alert"
          className="address-status text-bad mt-1.5 text-sm"
        >
          {problem}
          {suggestion && suggestion !== value ? (
            <>
              {" "}
              <UseAddress suggestion={suggestion} onUse={onChange} />
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
