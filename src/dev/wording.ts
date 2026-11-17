import type { ServiceWording } from "@/lib/site/types";

/** A copy of the backend's standard wording (`backend/websites/standard_wording.py`), for the samples only. */
export const STANDARD_SERVICES: Record<string, ServiceWording> = {
  tenant_finding: {
    title: "Finding tenants",
    text: "We advertise vacant units, show them to people who ask, and handle the move-in.",
  },
  rent_collection: {
    title: "Rent collection",
    text: "We invoice tenants, collect the rent and follow up on late payments.",
  },
  repairs: {
    title: "Repairs and maintenance",
    text: "Tenants report problems to us and we arrange the repair.",
  },
  owner_statements: {
    title: "Owner statements",
    text: "You receive a statement of rent collected and costs paid.",
  },
  caretaker: {
    title: "Caretaker supervision",
    text: "We supervise the caretaker and the day-to-day running of the building.",
  },
  inspections: {
    title: "Inspections",
    text: "We inspect units when tenants move in and out, and visit the building regularly.",
  },
  lease_paperwork: {
    title: "Leases and paperwork",
    text: "We prepare tenancy agreements and keep the records.",
  },
  utilities_billing: {
    title: "Water and utility billing",
    text: "We read meters and bill tenants for water and other utilities.",
  },
};
