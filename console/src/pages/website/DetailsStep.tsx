import { ChoiceCard } from "../../components/ChoiceCard";
import { TextField } from "../../components/fields";
import {
  COMPANY_NAME_MAX,
  COMPANY_PHONE_MAX,
  type Company,
} from "../../lib/company";
import { AUDIENCE_DETAILS } from "../../lib/looks";
import { AUDIENCES, type Audience } from "../../lib/website";

export type CompanyErrors = Partial<Record<keyof Company, string>>;

export function DetailsStep({
  company,
  errors,
  audience,
  onCompany,
  onAudience,
}: {
  company: Company;
  errors: CompanyErrors;
  audience: Audience;
  onCompany: (changes: Partial<Company>) => void;
  onAudience: (audience: Audience) => void;
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
        onChange={(event) => onCompany({ displayName: event.target.value })}
      />
      <TextField
        id="company-phone"
        label="Phone number"
        type="tel"
        autoComplete="tel"
        maxLength={COMPANY_PHONE_MAX}
        value={company.phone}
        error={errors.phone}
        onChange={(event) => onCompany({ phone: event.target.value })}
      />
      <TextField
        id="company-whatsapp"
        label="WhatsApp number"
        type="tel"
        hint="Optional. Visitors get a WhatsApp button when you give one."
        maxLength={COMPANY_PHONE_MAX}
        value={company.whatsappNumber}
        error={errors.whatsappNumber}
        onChange={(event) => onCompany({ whatsappNumber: event.target.value })}
      />
      <fieldset className="mt-6">
        <legend className="mb-2.5 text-sm font-medium">
          Who should the website attract?
        </legend>
        <div className="grid gap-3">
          {AUDIENCES.map((each) => (
            <ChoiceCard
              key={each}
              group="audience"
              value={each}
              chosen={each === audience}
              onChoose={() => onAudience(each)}
              name={AUDIENCE_DETAILS[each].name}
              summary={AUDIENCE_DETAILS[each].summary}
            />
          ))}
        </div>
      </fieldset>
    </>
  );
}
