import { TextLink } from "../../components/AuthLayout";
import type { Company } from "../../lib/company";
import { AUDIENCE_DETAILS, LOOK_DETAILS } from "../../lib/looks";
import type { Website } from "../../lib/website";

const NOT_GIVEN = "Not given";

export function ReviewStep({
  website,
  company,
  pathOf,
}: {
  website: Website;
  company: Company;
  pathOf: (step: "look" | "colour" | "details") => string;
}) {
  const rows = [
    { label: "Look", value: LOOK_DETAILS[website.look].name, step: "look" },
    { label: "Colour", value: website.brandColour, step: "colour" },
    { label: "Company name", value: company.displayName, step: "details" },
    { label: "Phone number", value: company.phone, step: "details" },
    {
      label: "WhatsApp number",
      value: company.whatsappNumber,
      step: "details",
    },
    {
      label: "Attracts",
      value: AUDIENCE_DETAILS[website.audience].name,
      step: "details",
    },
  ] as const;

  return (
    <>
      <dl className="border-line divide-line divide-y rounded-xl border bg-white">
        {rows.map(({ label, value, step }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <dt className="text-ink-muted w-36 shrink-0 text-sm">{label}</dt>
            <dd className="flex min-w-0 grow items-center gap-2 font-medium">
              {label === "Colour" ? (
                <span
                  className="border-line size-5 shrink-0 rounded-full border"
                  style={{ background: value }}
                />
              ) : null}
              <span className="truncate">{value || NOT_GIVEN}</span>
            </dd>
            <TextLink href={pathOf(step)}>Change</TextLink>
          </div>
        ))}
      </dl>
      <p className="bg-brand-soft mt-5 rounded-xl px-4 py-3 text-sm">
        Your company details are saved to your Bomahut account. Your look,
        colour and audience are saved in this browser for now, and publishing is
        not available here yet.
      </p>
    </>
  );
}
