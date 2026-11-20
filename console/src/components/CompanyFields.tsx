import {
  COMPANY_NAME_MAX,
  companyNameError,
  companyPhoneError,
  companyWhatsappError,
  type Company,
} from "../lib/company";
import { phoneForInput, phoneFromInput } from "../lib/validation";
import { CheckField, PhoneField, TextField } from "./fields";

export type CompanyErrors = Partial<Record<keyof Company, string>>;

export const NO_COMPANY: Company = {
  displayName: "",
  phone: "",
  whatsappNumber: "",
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

export const CONSENT_NEEDED =
  "Tick this to give your consent before you continue.";

/** The company details the public sees. Setup and the console both ask for them with this. */
export function CompanyFields({
  company,
  errors,
  consent,
  onChange,
}: {
  company: Company;
  errors: CompanyErrors;
  /** Left out when there is nothing new to consent to. */
  consent?: Consent;
  onChange: (changes: Partial<Company>) => void;
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
