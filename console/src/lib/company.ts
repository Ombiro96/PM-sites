import { graphql } from "./api";
import { storedPhoneError } from "./validation";

/** The company details the public sees, kept on the account's agency profile. */
export type Company = {
  displayName: string;
  phone: string;
  whatsappNumber: string;
};

export const COMPANY_NAME_MAX = 100;

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
  mutation SaveAgencyProfile($displayName: String, $phone: String, $whatsappNumber: String, $confirmPublic: Boolean) {
    saveAgencyProfile(displayName: $displayName, phone: $phone, whatsappNumber: $whatsappNumber, confirmPublic: $confirmPublic) {
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

/** `confirmPublic` records that the name and phone number may be shown publicly. The backend never takes it back. */
export async function saveCompany(
  company: Company,
  confirmPublic = false,
): Promise<Saved> {
  const data = await graphql<{
    saveAgencyProfile: {
      success: boolean | null;
      message: string | null;
      agencyProfile: Company | null;
    } | null;
  }>(SAVE, { ...company, confirmPublic });
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

/** A number typed into the dashboard's plain box is left as it is; one from the phone input is checked. */
const FROM_PHONE_INPUT = /^\+\d*-\d*$/;

export function companyPhoneError(value: string): string | undefined {
  if (value.trim() === "") return "Add the phone number the public will see.";
  return companyWhatsappError(value);
}

export function companyWhatsappError(value: string): string | undefined {
  return FROM_PHONE_INPUT.test(value) ? storedPhoneError(value) : undefined;
}
