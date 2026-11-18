import { useState, type FormEvent } from "react";
import {
  CompanyFields,
  companyErrors,
  hasErrors,
  NO_COMPANY,
  trimmedCompany,
  type CompanyErrors,
} from "../../components/CompanyFields";
import { CheckField, FormError, SubmitButton } from "../../components/fields";
import { saveCompany, type Company } from "../../lib/company";
import {
  confirmCompanyPublic,
  type Site,
  type SiteResult,
} from "../../lib/site";

const isConfirmed = (site: Site) =>
  !site.publishProblems.some((problem) => problem.path.startsWith("facts"));

export function DetailsView({
  site,
  company,
  onSaved,
}: {
  site: Site;
  company: Company | null;
  onSaved: (company: Company, result: SiteResult) => void;
}) {
  const [details, setDetails] = useState<Company>(company ?? NO_COMPANY);
  const [confirmed, setConfirmed] = useState(isConfirmed(site));
  const [errors, setErrors] = useState<CompanyErrors>({});
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  if (!site.canEditCompanyDetails)
    return (
      <p className="border-line max-w-xl rounded-xl border bg-white p-5">
        Only your account admin can change the company details. Ask them to
        confirm the company name and phone number here before this website can
        go live.
      </p>
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = companyErrors(details);
    setErrors(found);
    if (hasErrors(found)) return;
    setProblem("");
    setBusy(true);
    try {
      const saved = await saveCompany(trimmedCompany(details));
      if (!saved.ok) {
        setProblem(saved.message);
        return;
      }
      setDetails(saved.company);
      onSaved(saved.company, await confirmCompanyPublic(confirmed));
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="border-line max-w-xl rounded-xl border bg-white p-5"
    >
      <FormError message={problem} />
      <CompanyFields
        company={details}
        errors={errors}
        onChange={(changes) => {
          setDetails({ ...details, ...changes });
          setErrors({});
          // A changed name or phone number has to be confirmed again.
          if ("displayName" in changes || "phone" in changes)
            setConfirmed(false);
        }}
      />
      <div className="bg-brand-soft mb-5 rounded-xl px-3.5">
        <CheckField
          label="These details can be shown to the public"
          hint="Your website cannot go live until you tick this. Changing the name or phone number asks you to confirm again."
          checked={confirmed}
          onChange={setConfirmed}
        />
      </div>
      <div className="ml-auto w-44">
        <SubmitButton busy={busy}>Save details</SubmitButton>
      </div>
      <p className="text-ink-muted mt-4 text-sm">
        The same details appear on your adverts in the Bomahut dashboard.
      </p>
    </form>
  );
}
