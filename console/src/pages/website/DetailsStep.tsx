import { ChoiceCard } from "../../components/ChoiceCard";
import { PhoneField, TextField } from "../../components/fields";
import { COMPANY_NAME_MAX, type Company } from "../../lib/company";
import { AUDIENCE_DETAILS } from "../../lib/looks";
import { phoneForInput, phoneFromInput } from "../../lib/validation";
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
      <PhoneField
        id="company-phone"
        label="Phone number"
        value={phoneForInput(company.phone)}
        error={errors.phone}
        onChange={(value, dialCode) =>
          onCompany({ phone: phoneFromInput(value, dialCode) })
        }
      />
      <PhoneField
        id="company-whatsapp"
        label="WhatsApp number"
        hint="Optional. Visitors get a WhatsApp button when you give one."
        value={phoneForInput(company.whatsappNumber)}
        error={errors.whatsappNumber}
        onChange={(value, dialCode) =>
          onCompany({ whatsappNumber: phoneFromInput(value, dialCode) })
        }
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
