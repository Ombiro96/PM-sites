"use client";

import { useState } from "react";
import type { RequestField, RequestType } from "@/lib/requests";
import { Button, ButtonLink } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const FIELD =
  "h-11 w-full rounded-brand border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/70";

type Status = "idle" | "submitting" | "sent" | "error";

export function RequestForm({ type }: { type: RequestType }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, string> = { requestType: type.slug };
    for (const field of type.fields) {
      payload[field.name] = String(formData.get(field.name) ?? "");
    }
    payload.company = String(formData.get("company") ?? "");

    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();

      if (!response.ok || !body.ok) {
        setFieldErrors(body.fieldErrors ?? {});
        setError(body.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("We could not reach the server. Please check your connection.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-brand-lg border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="font-display text-lg font-semibold text-emerald-900">
          {type.title} received.
        </h3>
        <p className="mt-2 text-sm text-emerald-800">{type.confirmation}</p>
        <ButtonLink
          href="/submit-a-request"
          variant="secondary"
          size="sm"
          className="mt-5"
        >
          Submit another request
        </ButtonLink>
      </div>
    );
  }

  // Half-width fields pair up with the next half-width field in a two-column row.
  const rows: RequestField[][] = [];
  for (const field of type.fields) {
    const last = rows.at(-1);
    if (field.half && last?.length === 1 && last[0].half) last.push(field);
    else rows.push([field]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {rows.map((row) => (
        <div
          key={row.map((field) => field.name).join("-")}
          className={cn("grid gap-4", row.length > 1 && "sm:grid-cols-2")}
        >
          {row.map((field) => (
            <Field
              key={field.name}
              field={field}
              errors={fieldErrors[field.name]}
            />
          ))}
        </div>
      ))}

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="w-full"
      >
        {status === "submitting" ? "Sending…" : type.submitLabel}
      </Button>

      <p className="text-xs leading-relaxed text-ink-muted">
        We use your details only to handle this request.
      </p>
    </form>
  );
}

function Field({
  field,
  errors,
}: {
  field: RequestField;
  errors?: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
        {field.label}
      </span>

      {field.type === "textarea" ? (
        <textarea
          name={field.name}
          required={field.required}
          rows={4}
          placeholder={field.placeholder}
          className="w-full rounded-brand border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70"
        />
      ) : field.type === "select" ? (
        <select
          name={field.name}
          required={field.required}
          defaultValue=""
          className={FIELD}
        >
          <option value="" disabled>
            Choose one
          </option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          required={field.required}
          type={field.type === "number" ? "text" : field.type}
          inputMode={
            field.type === "tel"
              ? "tel"
              : field.type === "number"
                ? "numeric"
                : undefined
          }
          autoComplete={AUTOCOMPLETE[field.name]}
          placeholder={field.placeholder}
          className={FIELD}
        />
      )}

      {field.hint ? (
        <p className="mt-1 text-xs text-ink-muted">{field.hint}</p>
      ) : null}
      {errors?.length ? (
        <p className="mt-1 text-xs font-medium text-red-700">{errors[0]}</p>
      ) : null}
    </label>
  );
}

const AUTOCOMPLETE: Record<string, string> = {
  fullName: "name",
  phone: "tel",
  email: "email",
};
