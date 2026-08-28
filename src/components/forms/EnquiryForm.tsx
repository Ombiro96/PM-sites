"use client";

import { useState } from "react";
import { SUBJECT_LABELS, type EnquiryInput } from "@/lib/enquiry";
import { Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const FIELD =
  "h-11 w-full rounded-brand border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/70";

type Status = "idle" | "submitting" | "sent" | "error";

export function EnquiryForm({
  listingSlug,
  listingTitle,
  defaultSubject = "general",
  defaultMessage = "",
  compact = false,
}: {
  listingSlug?: string;
  listingTitle?: string;
  defaultSubject?: EnquiryInput["subject"];
  defaultMessage?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      subject: String(formData.get("subject") ?? "general"),
      company: String(formData.get("company") ?? ""),
      listingSlug,
      listingTitle,
    };

    try {
      const response = await fetch("/api/enquiry", {
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
          Thank you — your enquiry is with us.
        </h3>
        <p className="mt-2 text-sm text-emerald-800">
          We reply during office hours, usually the same working day. If it is
          urgent, please call us.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {listingTitle ? (
        <p className="rounded-brand bg-surface-muted px-3 py-2 text-sm text-ink-muted">
          Enquiring about <span className="font-semibold text-ink">{listingTitle}</span>
        </p>
      ) : null}

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Your name
          </span>
          <input name="name" required autoComplete="name" className={FIELD} />
          <FieldError errors={fieldErrors.name} />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Phone number
          </span>
          <input
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="07xx xxx xxx"
            className={FIELD}
          />
          <FieldError errors={fieldErrors.phone} />
        </label>
      </div>

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Email <span className="font-normal">(optional)</span>
          </span>
          <input name="email" type="email" autoComplete="email" className={FIELD} />
          <FieldError errors={fieldErrors.email} />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
            What is this about?
          </span>
          <select name="subject" defaultValue={defaultSubject} className={FIELD}>
            {Object.entries(SUBJECT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={compact ? 3 : 5}
          defaultValue={defaultMessage}
          placeholder="Tell us what you are looking for, and when you would like to view."
          className="w-full rounded-brand border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70"
        />
        <FieldError errors={fieldErrors.message} />
      </label>

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

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </Button>

      <p className="text-xs leading-relaxed text-ink-muted">
        We use your details only to respond to this enquiry.
      </p>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs font-medium text-red-700">{errors[0]}</p>;
}
