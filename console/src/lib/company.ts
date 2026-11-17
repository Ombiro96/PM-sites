import { graphql } from "./api";

/** The company details the public sees, kept on the account's agency profile. */
export type Company = {
  displayName: string;
  phone: string;
  whatsappNumber: string;
};

export const COMPANY_NAME_MAX = 100;
export const COMPANY_PHONE_MAX = 20;

type Saved = { ok: true; company: Company } | { ok: false; message: string };

const FIELDS = "displayName phone whatsappNumber";

const READ = `
  query {
    agencyProfile {
      ${FIELDS}
    }
  }
`;

const SAVE = `
  mutation SaveAgencyProfile($displayName: String, $phone: String, $whatsappNumber: String) {
    saveAgencyProfile(displayName: $displayName, phone: $phone, whatsappNumber: $whatsappNumber) {
      success
      message
      agencyProfile {
        ${FIELDS}
      }
    }
  }
`;

/** Null when the account has not given its public details yet. */
export async function readCompany(): Promise<Company | null> {
  const data = await graphql<{ agencyProfile: Company | null }>(READ);
  return data.agencyProfile;
}

export async function saveCompany(company: Company): Promise<Saved> {
  const data = await graphql<{
    saveAgencyProfile: {
      success: boolean | null;
      message: string | null;
      agencyProfile: Company | null;
    } | null;
  }>(SAVE, company);
  const result = data.saveAgencyProfile;
  if (result?.success && result.agencyProfile)
    return { ok: true, company: result.agencyProfile };
  return {
    ok: false,
    message: result?.message ?? "We could not save your details.",
  };
}

export function companyNameError(value: string): string | undefined {
  if (value.trim() === "") return "Enter the name to show the public.";
  return undefined;
}

export function companyPhoneError(value: string): string | undefined {
  if (value.trim() === "") return "Add the phone number the public will see.";
  return undefined;
}
