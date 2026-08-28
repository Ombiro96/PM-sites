import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(120),
  phone: z
    .string()
    .trim()
    .min(9, "Enter a phone number we can reach you on")
    .max(20)
    .regex(/^[0-9+()\s-]+$/, "Phone number looks incorrect"),
  email: z
    .union([z.literal(""), z.email("Enter a valid email address")])
    .optional(),
  message: z.string().trim().min(5, "Tell us what you are looking for").max(2000),
  subject: z.enum(["viewing", "general", "landlord", "maintenance"]).default("general"),
  /** Listing the enquiry came from, when it came from one. */
  listingSlug: z.string().trim().max(120).optional(),
  listingTitle: z.string().trim().max(200).optional(),
  /** Hidden field. Bots fill it, humans never see it. Checked in the route,
   *  not rejected here, so a bot gets a fake success rather than an error. */
  company: z.string().max(200).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const SUBJECT_LABELS: Record<EnquiryInput["subject"], string> = {
  viewing: "Book a viewing",
  general: "General enquiry",
  landlord: "I am a landlord",
  maintenance: "Maintenance (existing tenant)",
};
