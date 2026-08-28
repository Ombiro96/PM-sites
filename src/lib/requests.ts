import { z } from "zod";
import type { IconName } from "@/lib/brand/types";

export type RequestFieldType =
  | "text"
  | "tel"
  | "email"
  | "date"
  | "number"
  | "select"
  | "textarea";

export type RequestField = {
  name: string;
  label: string;
  type: RequestFieldType;
  required: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[];
  /** Sits two-to-a-row on wide screens. */
  half?: boolean;
};

export type RequestType = {
  slug: string;
  title: string;
  navLabel: string;
  icon: IconName;
  summary: string;
  intro: string;
  /** Shown beside the form: what the sender should know before submitting. */
  notes: { heading: string; items: string[] };
  submitLabel: string;
  confirmation: string;
  fields: RequestField[];
};

/** Every request starts with the same three: who you are and how to reach you. */
const CONTACT_FIELDS: RequestField[] = [
  {
    name: "fullName",
    label: "Full name",
    type: "text",
    required: true,
    half: true,
  },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    required: true,
    placeholder: "07xx xxx xxx",
    half: true,
  },
  {
    name: "email",
    label: "Email (optional)",
    type: "email",
    required: false,
    half: true,
  },
];

export const REQUEST_TYPES: RequestType[] = [
  {
    slug: "notice-to-vacate",
    title: "Notice to vacate",
    navLabel: "Notice to Vacate",
    icon: "document",
    summary:
      "Tell us you are moving out. We log the notice, book the exit inspection and start your deposit refund.",
    intro:
      "Give written notice that you intend to move out. Once we receive this we confirm your notice period in writing, agree an inspection date and set out what is due before you hand back the keys.",
    notes: {
      heading: "Before you send this",
      items: [
        "Notice must be given for the period set out in your lease - usually one full calendar month.",
        "Rent and service charge remain payable for the whole notice period, even if you leave earlier.",
        "We carry out a joint exit inspection with you before the keys are handed over.",
        "Your deposit is refunded after the inspection, less any rent arrears, utility bills or damage.",
      ],
    },
    submitLabel: "Submit notice to vacate",
    confirmation:
      "Your notice has been received. We will confirm the notice period and an inspection date in writing.",
    fields: [
      ...CONTACT_FIELDS,
      {
        name: "property",
        label: "Property or building",
        type: "text",
        required: true,
        half: true,
      },
      {
        name: "unit",
        label: "Unit or house number",
        type: "text",
        required: true,
        half: true,
      },
      {
        name: "vacateDate",
        label: "Date you intend to move out",
        type: "date",
        required: true,
        half: true,
      },
      {
        name: "reason",
        label: "Reason for leaving",
        type: "select",
        required: true,
        options: [
          "End of lease term",
          "Relocating within Nairobi",
          "Relocating out of Nairobi",
          "Job transfer",
          "Bought a home",
          "Rent is no longer affordable",
          "Unresolved maintenance",
          "Other",
        ],
        half: true,
      },
      {
        name: "forwardingAddress",
        label: "Forwarding address (optional)",
        type: "text",
        required: false,
        hint: "Where we should send your deposit refund and any final statement.",
      },
      {
        name: "details",
        label: "Anything else we should know",
        type: "textarea",
        required: false,
        placeholder:
          "Handover preferences, outstanding repairs, best time for the inspection.",
      },
    ],
  },
  {
    slug: "apply-to-move-in",
    title: "Apply to move in",
    navLabel: "Apply to Move In",
    icon: "key",
    summary:
      "Found a home you want? Send your application and we will start vetting and hold the unit while we do.",
    intro:
      "Apply for a unit you have viewed or seen listed. We check the details, come back to you on vetting, and confirm the deposit and first month's rent needed before keys are released.",
    notes: {
      heading: "What you will need",
      items: [
        "A copy of your national ID or passport.",
        "Your most recent payslip, or business records if you are self-employed.",
        "A contactable referee - a previous landlord or your employer.",
        "Deposit and first month's rent are payable before keys are handed over.",
      ],
    },
    submitLabel: "Submit application",
    confirmation:
      "Your application is with us. We will call you to confirm the details and take you through vetting.",
    fields: [
      ...CONTACT_FIELDS,
      {
        name: "idNumber",
        label: "ID or passport number",
        type: "text",
        required: true,
        half: true,
      },
      {
        name: "property",
        label: "Property you are applying for",
        type: "text",
        required: true,
        half: true,
        hint: "The building or listing name. Put 'not sure yet' if you are still looking.",
      },
      {
        name: "unitType",
        label: "Unit type",
        type: "select",
        required: true,
        options: [
          "Bedsitter",
          "Studio",
          "1 bedroom",
          "2 bedroom",
          "3 bedroom",
          "4 bedroom or larger",
          "Maisonette",
          "Not sure yet",
        ],
        half: true,
      },
      {
        name: "moveInDate",
        label: "Preferred move-in date",
        type: "date",
        required: true,
        half: true,
      },
      {
        name: "occupants",
        label: "Number of occupants",
        type: "number",
        required: true,
        half: true,
      },
      {
        name: "employmentStatus",
        label: "Employment status",
        type: "select",
        required: true,
        options: [
          "Employed",
          "Self-employed",
          "Business owner",
          "Student",
          "Retired",
          "Other",
        ],
        half: true,
      },
      {
        name: "employer",
        label: "Employer or business name",
        type: "text",
        required: false,
        half: true,
      },
      {
        name: "details",
        label: "Anything else we should know",
        type: "textarea",
        required: false,
        placeholder:
          "Pets, parking needs, whether you have already viewed the unit.",
      },
    ],
  },
  {
    slug: "submit-a-complaint",
    title: "Submit a complaint",
    navLabel: "Submit a Complaint",
    icon: "shield",
    summary:
      "Something is not right - noise, security, cleanliness, billing or how you were treated. Put it on record.",
    intro:
      "Raise a complaint about the building, a neighbour, a bill or the service you have received. Every complaint is logged with a reference and followed up by a person, not a form.",
    notes: {
      heading: "How we handle it",
      items: [
        "We acknowledge every complaint within one working day.",
        "You get a named person handling it and an update until it is closed out.",
        "For a broken tap, blocked drain or similar repair, use the tenant portal instead - it reaches the maintenance team faster.",
        "If this is a security emergency, call us first and send this afterwards.",
      ],
    },
    submitLabel: "Submit complaint",
    confirmation:
      "Your complaint has been logged. We will acknowledge it within one working day and tell you who is handling it.",
    fields: [
      ...CONTACT_FIELDS,
      {
        name: "property",
        label: "Property or building",
        type: "text",
        required: true,
        half: true,
      },
      {
        name: "unit",
        label: "Unit or house number (optional)",
        type: "text",
        required: false,
        half: true,
      },
      {
        name: "category",
        label: "What is the complaint about?",
        type: "select",
        required: true,
        options: [
          "Noise",
          "Security",
          "Cleanliness of common areas",
          "Water supply",
          "Electricity or power backup",
          "Parking",
          "A neighbour",
          "Caretaker or staff conduct",
          "Billing or statements",
          "Slow maintenance response",
          "Other",
        ],
        half: true,
      },
      {
        name: "occurredOn",
        label: "When did it happen? (optional)",
        type: "date",
        required: false,
        half: true,
      },
      {
        name: "details",
        label: "What happened?",
        type: "textarea",
        required: true,
        placeholder:
          "Give us the dates, times and anyone involved. The more specific you are, the faster we can act.",
      },
      {
        name: "resolution",
        label: "What outcome would resolve this for you? (optional)",
        type: "textarea",
        required: false,
      },
    ],
  },
];

export function getRequestType(slug: string): RequestType | undefined {
  return REQUEST_TYPES.find((type) => type.slug === slug);
}

const PHONE_PATTERN = /^[0-9+()\s-]+$/;

function fieldSchema(field: RequestField): z.ZodTypeAny {
  if (field.type === "email") {
    const email = z.union([z.literal(""), z.email("Enter a valid email address")]);
    return field.required
      ? z.email("Enter a valid email address")
      : email.optional();
  }

  let schema: z.ZodTypeAny;
  switch (field.type) {
    case "tel":
      schema = z
        .string()
        .trim()
        .min(9, "Enter a phone number we can reach you on")
        .max(20)
        .regex(PHONE_PATTERN, "Phone number looks incorrect");
      break;
    case "number":
      schema = z
        .string()
        .trim()
        .regex(/^\d{1,3}$/, "Enter a number");
      break;
    case "date":
      schema = z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date");
      break;
    case "select":
      schema = z.enum((field.options ?? []) as [string, ...string[]], {
        error: "Choose one of the options",
      });
      break;
    case "textarea":
      schema = z.string().trim().min(5, `Please fill in "${field.label}"`).max(4000);
      break;
    default:
      schema = z.string().trim().min(2, `Please fill in "${field.label}"`).max(200);
  }

  return field.required ? schema : z.union([z.literal(""), schema]).optional();
}

/**
 * The field config is the single source of truth: the form renders from it and
 * the API route validates against it, so the two can never drift apart.
 */
export function requestSchema(type: RequestType) {
  const shape = Object.fromEntries(
    type.fields.map((field) => [field.name, fieldSchema(field)]),
  );

  return z.object({
    ...shape,
    requestType: z.literal(type.slug),
    /** Hidden field. Bots fill it, humans never see it. Checked in the route,
     *  not rejected here, so a bot gets a fake success rather than an error. */
    company: z.string().max(200).optional(),
  });
}

export const requestTypeSlugSchema = z.enum(
  REQUEST_TYPES.map((type) => type.slug) as [string, ...string[]],
);
