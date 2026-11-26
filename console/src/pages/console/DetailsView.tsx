import { useEffect, useState, type FormEvent } from "react";
import {
  CompanyFields,
  companyErrors,
  CONSENT_NEEDED,
  hasErrors,
  NO_COMPANY,
  NO_LOGO_CHANGE,
  sameCompany,
  trimmedCompany,
  type CompanyErrors,
  type LogoChange,
} from "../../components/CompanyFields";
import { Button, FormError, SubmitButton } from "../../components/fields";
import { saveCompany, type Company } from "../../lib/company";
import type { Site } from "../../lib/site";

/** The backend keeps a consent for good. The console asks again whenever the details change. */
const needsConfirming = (site: Site) =>
  site.publishProblems.some((problem) => problem.path === "facts");

export function DetailsView({
  site,
  company,
  onSaved,
  onDirty,
}: {
  site: Site;
  company: Company | null;
  onSaved: (company: Company) => void;
  /** Told whenever there start or stop being changes that are not saved. */
  onDirty: (dirty: boolean) => void;
}) {
  const [details, setDetails] = useState<Company>(company ?? NO_COMPANY);
  const [confirmed, setConfirmed] = useState(false);
  const [logo, setLogo] = useState<LogoChange>(NO_LOGO_CHANGE);
  const [errors, setErrors] = useState<CompanyErrors>({});
  const [consentError, setConsentError] = useState<string>();
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);

  const changed = !sameCompany(details, company ?? NO_COMPANY);
  const dirty = changed || logo.file !== null || logo.removed;
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
    // Only the change of `dirty` matters; the parent's handler is a new function on every draw.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty]);

  if (!site.canEditCompanyDetails)
    return (
      <p className="border-line max-w-xl rounded-xl border bg-white p-5">
        Only your account admin can change the company details. Ask them to
        confirm the company name and phone number here before this website can
        go live.
      </p>
    );

  const asks = changed || needsConfirming(site);

  const discard = () => {
    setDetails(company ?? NO_COMPANY);
    setLogo(NO_LOGO_CHANGE);
    setConfirmed(false);
    setErrors({});
    setConsentError(undefined);
    setProblem("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = companyErrors(details);
    setErrors(found);
    setConsentError(asks && !confirmed ? CONSENT_NEEDED : undefined);
    if (hasErrors(found) || (asks && !confirmed)) return;
    setProblem("");
    setBusy(true);
    try {
      const saved = await saveCompany(
        trimmedCompany(details),
        confirmed,
        logo.file ?? (logo.removed ? "remove" : undefined),
      );
      if (!saved.ok) {
        setProblem(saved.message);
        return;
      }
      setDetails(saved.company);
      setLogo(NO_LOGO_CHANGE);
      setConfirmed(false);
      onSaved(saved.company);
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
      {dirty ? (
        <div className="border-line sticky top-20 z-[5] mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 shadow-md">
          <p className="text-sm font-medium">
            Save or discard these changes before leaving Company details.
          </p>
          <div className="flex gap-2">
            <Button tone="quiet" disabled={busy} onClick={discard}>
              Discard
            </Button>
            <div className="w-36">
              <SubmitButton busy={busy}>Save changes</SubmitButton>
            </div>
          </div>
        </div>
      ) : null}
      <FormError message={problem} />
      <CompanyFields
        company={details}
        errors={errors}
        logo={{ ...logo, onChange: setLogo }}
        consent={
          asks
            ? {
                given: confirmed,
                again: changed && !needsConfirming(site),
                error: consentError,
                onChange: (given) => {
                  setConfirmed(given);
                  setConsentError(undefined);
                },
              }
            : undefined
        }
        onChange={(changes) => {
          setDetails({ ...details, ...changes });
          setErrors({});
        }}
      />
      {!dirty && asks ? (
        <div className="ml-auto w-44">
          <SubmitButton busy={busy}>Save details</SubmitButton>
        </div>
      ) : null}
      <p className="text-ink-muted mt-4 text-sm">
        The same details appear on your adverts in the Bomahut dashboard.
      </p>
    </form>
  );
}
