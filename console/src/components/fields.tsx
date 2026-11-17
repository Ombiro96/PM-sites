import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import PhoneInputModule from "react-phone-input-2";
import { PHONE_COUNTRY } from "../lib/validation";

// The library is CommonJS, and a bundler may hand over the module instead of its default export.
const PhoneInput =
  (PhoneInputModule as unknown as { default?: typeof PhoneInputModule })
    .default ?? PhoneInputModule;

const PHONE_INPUT_STYLE = { width: "100%", height: 46, fontSize: 16 };

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
  hint,
  error,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string, dialCode: string) => void;
  onBlur?: () => void;
}) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <PhoneInput
        country={PHONE_COUNTRY}
        value={value}
        onChange={(next, country) =>
          onChange(next, "dialCode" in country ? country.dialCode : "")
        }
        onBlur={onBlur}
        inputStyle={PHONE_INPUT_STYLE}
        inputProps={{ id, autoComplete: "tel", ...describedBy(id, error) }}
      />
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

export function FormSuccess({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
    >
      {message}
    </p>
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
