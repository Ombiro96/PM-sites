import { TextLink } from "../../components/AuthLayout";
import type { Company } from "../../lib/company";
import { AUDIENCE_DETAILS, LOOK_DETAILS } from "../../lib/looks";
import type { Website } from "../../lib/website";

const NOT_GIVEN = "Not given";

type ChangedAt = "look" | "colour" | "details" | "about";

export function ReviewStep({
  website,
  company,
  pathOf,
}: {
  website: Website;
  company: Company;
  pathOf: (step: ChangedAt) => string;
}) {
  const { answers } = website;
  const rows: { label: string; value: string; step: ChangedAt }[] = [
    { label: "Theme", value: LOOK_DETAILS[website.look].name, step: "look" },
    { label: "Theme colour", value: website.brandColour, step: "colour" },
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
    { label: "About you", value: answers.about_text.trim(), step: "about" },
  ];

  return (
    <>
      <dl className="border-line divide-line divide-y rounded-xl border bg-white">
        {rows.map(({ label, value, step }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <dt className="text-ink-muted w-36 shrink-0 text-sm">{label}</dt>
            <dd className="flex min-w-0 grow items-center gap-2 font-medium">
              {label === "Theme colour" ? (
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
      <div className="bg-brand-soft mt-5 space-y-2 rounded-xl px-4 py-3">
        <p className="font-semibold">What happens next</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>We write a first draft of your pages from your answers.</li>
          <li>
            You change any section you like: the wording, the pictures, what is
            shown.
          </li>
          <li>
            You publish when you are happy. Nothing is public before that.
          </li>
        </ol>
        <p className="text-sm">
          We choose your website's address from your company name.
        </p>
      </div>
    </>
  );
}
