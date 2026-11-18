import {
  COMPANY_NAME_MAX,
  companyNameError,
  companyPhoneError,
  companyWhatsappError,
  type Company,
} from "../lib/company";
import { phoneForInput, phoneFromInput } from "../lib/validation";
import { PhoneField, TextField } from "./fields";

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

/** The company details the public sees. Setup and the console both ask for them with this. */
export function CompanyFields({
  company,
  errors,
  onChange,
}: {
  company: Company;
  errors: CompanyErrors;
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
    </>
  );
}
