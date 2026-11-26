import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  COMPANY_NAME_MAX,
  companyNameError,
  companyPhoneError,
  companyWhatsappError,
  type Company,
} from "../lib/company";
import { PICTURE_BYTES_MAX, PICTURE_TYPES } from "../lib/site";
import { phoneForInput, phoneFromInput } from "../lib/validation";
import { Button, CheckField, PhoneField, TextField } from "./fields";

export type CompanyErrors = Partial<Record<keyof Company, string>>;

export const NO_COMPANY: Company = {
  displayName: "",
  phone: "",
  whatsappNumber: "",
  logoUrl: null,
};

export function companyErrors(company: Company): CompanyErrors {
  return {
    displayName: companyNameError(company.displayName),
    phone: companyPhoneError(company.phone),
    whatsappNumber: companyWhatsappError(company.whatsappNumber),
  };
}

export const hasErrors = (errors: CompanyErrors) =>
  Object.values(errors).some(Boolean);

export const trimmedCompany = (company: Company): Company => ({
  displayName: company.displayName.trim(),
  phone: company.phone.trim(),
  whatsappNumber: company.whatsappNumber.trim(),
  logoUrl: company.logoUrl,
});

export const sameCompany = (one: Company, other: Company) =>
  JSON.stringify(trimmedCompany(one)) === JSON.stringify(trimmedCompany(other));

/** The manager's consent to the details being public. `again` when it was given before for other details. */
export type Consent = {
  given: boolean;
  again?: boolean;
  error?: string;
  onChange: (given: boolean) => void;
};

/** The logo change waiting to be saved with the rest of the details: a new file, or the saved one removed. */
export type LogoChange = { file: File | null; removed: boolean };

export const NO_LOGO_CHANGE: LogoChange = { file: null, removed: false };

export type LogoChoice = LogoChange & {
  onChange: (change: LogoChange) => void;
};

export function logoFileError(file: File): string | undefined {
  if (!PICTURE_TYPES.includes(file.type))
    return "Choose a JPEG, PNG or WebP picture.";
  if (file.size > PICTURE_BYTES_MAX)
    return "This picture is larger than 10 MB. Choose a smaller one.";
  return undefined;
}

function LogoField({
  saved,
  logo,
}: {
  saved: string | null;
  logo: LogoChoice;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const chosen = useMemo(
    () => (logo.file ? URL.createObjectURL(logo.file) : null),
    [logo.file],
  );
  useEffect(
    () => () => {
      if (chosen) URL.revokeObjectURL(chosen);
    },
    [chosen],
  );
  const shown = chosen ?? (logo.removed ? null : saved);

  return (
    <div className="mb-4">
      <p className="mb-1.5 text-sm font-medium">Logo (optional)</p>
      <div className="flex flex-wrap items-center gap-4">
        {shown ? (
          <div className="relative">
            <img
              src={shown}
              alt="Your logo"
              className="border-line h-14 max-w-44 rounded-lg border bg-white object-contain p-1"
            />
            <button
              type="button"
              aria-label="Remove the logo"
              title="Remove the logo"
              // A newly chosen file is dropped; a saved logo is marked to be removed on save.
              onClick={() => {
                setError(undefined);
                logo.onChange({
                  file: null,
                  removed: !logo.file && Boolean(saved),
                });
              }}
              className="border-line text-ink hover:border-bad hover:text-bad absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full border bg-white text-lg leading-none font-semibold shadow-sm"
            >
              ×
            </button>
          </div>
        ) : null}
        <input
          ref={input}
          type="file"
          accept={PICTURE_TYPES.join(",")}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            const found = logoFileError(file);
            setError(found);
            if (!found) logo.onChange({ file, removed: false });
          }}
          className="sr-only"
        />
        <Button onClick={() => input.current?.click()}>
          {shown ? "Change logo" : "Choose a logo"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-bad mt-1.5 text-sm">
          {error}
        </p>
      ) : (
        <p className="text-ink-muted mt-1.5 text-sm">
          Shown beside your company name in your website&apos;s menu bar, and in
          the footer. JPEG, PNG or WebP, up to 10 MB.
        </p>
      )}
    </div>
  );
}

export const CONSENT_NEEDED =
  "Tick this to give your consent before you continue.";

/** The company details the public sees. Setup and the console both ask for them with this. */
export function CompanyFields({
  company,
  errors,
  consent,
  logo,
  onChange,
  afterName,
}: {
  company: Company;
  errors: CompanyErrors;
  /** Given where a logo can be chosen. */
  logo?: LogoChoice;
  /** Left out when there is nothing new to consent to. */
  consent?: Consent;
  onChange: (changes: Partial<Company>) => void;
  /** Setup puts the web address here, under the name it is taken from. */
  afterName?: ReactNode;
}) {
  return (
    <>
      <TextField
        id="company-name"
        label="Company name"
        autoComplete="organization"
        maxLength={COMPANY_NAME_MAX}
        value={company.displayName}
        error={errors.displayName}
        onChange={(event) => onChange({ displayName: event.target.value })}
      />
      {afterName}
      {logo ? <LogoField saved={company.logoUrl} logo={logo} /> : null}
      <PhoneField
        id="company-phone"
        label="Phone number"
        value={phoneForInput(company.phone)}
        error={errors.phone}
        onChange={(value, dialCode) =>
          onChange({ phone: phoneFromInput(value, dialCode) })
        }
      />
      <PhoneField
        id="company-whatsapp"
        label="WhatsApp number (optional)"
        hint="Optional. Visitors get a WhatsApp button when you give one."
        value={phoneForInput(company.whatsappNumber)}
        error={errors.whatsappNumber}
        onChange={(value, dialCode) =>
          onChange({ whatsappNumber: phoneFromInput(value, dialCode) })
        }
      />
      {consent ? (
        <div className="bg-brand-soft mb-5 rounded-xl px-3.5">
          <CheckField
            label="I consent to this name and these numbers being shown to the public"
            hint={
              consent.again
                ? "You changed them, so we ask for your consent again."
                : "They appear on your website and your adverts. Your website cannot go live without your consent."
            }
            error={consent.error}
            checked={consent.given}
            onChange={consent.onChange}
          />
        </div>
      ) : null}
    </>
  );
}
