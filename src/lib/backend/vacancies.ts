import "server-only";
import { graphqlQuery } from "./client";

/**
 * Anonymous, read-only vacancy feed. Implemented backend-side as
 * `publicVacancies` on the existing GraphQL endpoint — it must expose nothing
 * beyond what a prospective tenant may see on a public listing page.
 */
const PUBLIC_VACANCIES = /* GraphQL */ `
  query PublicVacancies($accountNumber: String!) {
    publicVacancies(accountNumber: $accountNumber) {
      id
      name
      city
      addressStreet
      currency
      vacantUnits {
        id
        unitName
        rentAmount
      }
    }
  }
`;

export type VacantUnit = {
  id: string;
  unitName: string;
  rentAmount: number;
};

export type VacantProperty = {
  id: string;
  name: string;
  city: string | null;
  addressStreet: string | null;
  currency: string;
  vacantUnits: VacantUnit[];
};

export async function fetchVacancies(
  accountNumber: string,
): Promise<VacantProperty[]> {
  const data = await graphqlQuery<{ publicVacancies: VacantProperty[] }>({
    document: PUBLIC_VACANCIES,
    variables: { accountNumber },
    revalidate: 300,
    tags: [`vacancies:${accountNumber}`],
  });
  return data.publicVacancies ?? [];
}
