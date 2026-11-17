import type { ReactNode } from "react";

/** One input on its own row: label on top, "optional" marked, the problem underneath. */
export function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="af">
      <label htmlFor={id}>
        {label}
        {optional ? <small> (optional)</small> : null}
      </label>
      {children}
      {error ? (
        <span className="err" id={`${id}-err`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** Props that tie an input to its `Field`. */
export function fieldProps(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
  } as const;
}

/** A field people never see. Anything typed into it marks the sender as a script. */
export function TrapField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="trap" aria-hidden="true">
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}

export function Sent({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="reveal" role="status">
      <b>{title}</b>
      {children}
    </div>
  );
}
