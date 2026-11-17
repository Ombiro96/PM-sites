import { useState, type InputHTMLAttributes, type ReactNode } from "react";

const INPUT =
  "border-line focus:border-brand focus:ring-brand-soft w-full rounded-lg border bg-white px-3 py-2.5 text-base outline-none focus:ring-4 aria-invalid:border-bad";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

function FieldShell({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-bad mt-1.5 text-sm">
          {error}
        </p>
      ) : hint ? (
        <p className="text-ink-muted mt-1.5 text-sm">{hint}</p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
  } as const;
}

export function TextField({ id, label, error, hint, ...input }: InputProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input id={id} className={INPUT} {...describedBy(id, error)} {...input} />
    </FieldShell>
  );
}

export function PasswordField({
  id,
  label,
  error,
  hint,
  ...input
}: InputProps) {
  const [shown, setShown] = useState(false);
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          className={`${INPUT} pr-16`}
          {...describedBy(id, error)}
          {...input}
        />
        <button
          type="button"
          onClick={() => setShown(!shown)}
          aria-pressed={shown}
          className="text-brand absolute inset-y-0 right-0 px-3 text-sm font-medium"
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
    </FieldShell>
  );
}

export function PhoneField({
  id,
  label,
  error,
  dialCode,
  number,
  onDialCode,
  onNumber,
  onBlur,
}: {
  id: string;
  label: string;
  error?: string;
  dialCode: string;
  number: string;
  onDialCode: (value: string) => void;
  onNumber: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <FieldShell id={id} label={label} error={error}>
      <div className="flex gap-2">
        <input
          aria-label="Country code"
          inputMode="tel"
          autoComplete="tel-country-code"
          className={`${INPUT} w-20 shrink-0 text-center`}
          value={dialCode}
          onChange={(event) => onDialCode(event.target.value)}
          onBlur={onBlur}
        />
        <input
          id={id}
          type="tel"
          autoComplete="tel-national"
          placeholder="0712 345 678"
          className={INPUT}
          value={number}
          onChange={(event) => onNumber(event.target.value)}
          onBlur={onBlur}
          {...describedBy(id, error)}
        />
      </div>
    </FieldShell>
  );
}

export function SubmitButton({
  busy,
  disabled,
  children,
}: {
  busy: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="bg-brand hover:bg-brand-deep w-full rounded-lg px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "Please wait…" : children}
    </button>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="text-bad mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm"
    >
      {message}
    </p>
  );
}
