import { ChoiceCard } from "../../components/ChoiceCard";
import {
  CompanyFields,
  type CompanyErrors,
} from "../../components/CompanyFields";
import type { Company } from "../../lib/company";
import { AUDIENCE_DETAILS } from "../../lib/looks";
import { AUDIENCES, type Audience } from "../../lib/website";

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
      <CompanyFields company={company} errors={errors} onChange={onCompany} />
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
