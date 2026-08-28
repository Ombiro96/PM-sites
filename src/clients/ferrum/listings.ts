import type { ListingContent } from "@/lib/listings/content";

/**
 * Marketing layer for Ferrum's portfolio.
 *
 * `propertyMatch` must equal `Property.name` in Bomahut exactly — that is the
 * join key that pulls live availability and rent onto each unit type.
 *
 * TODO(ferrum): replace these placeholders with the real portfolio once the
 * read-only prod query has been run (see docs/ferrum-portfolio-query.sql), and
 * swap Unsplash photography for the client's own shoot.
 */
export const ferrumListings: ListingContent[] = [
  {
    slug: "2-bedroom-apartment",
    propertyMatch: "Riverside Court",
    title: "2 Bedroom Apartment",
    category: "apartment",
    area: "Kilimani",
    areaSlug: "kilimani",
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 92,
    depositMonths: 2,
    amenities: [
      "Borehole water",
      "Backup generator",
      "Secure parking",
      "24-hour security",
      "Lift",
      "Fibre-ready",
    ],
    description:
      "A well-proportioned two bedroom apartment with a master en-suite, open-plan living area and a balcony facing away from the road. The building has borehole water, a backup generator and secure parking for one car per unit.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
        alt: "Open-plan living area with natural light",
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
        alt: "Master bedroom",
      },
      {
        url: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1600&q=80",
        alt: "Fitted kitchen",
      },
    ],
    featured: true,
    match: { unitNamePattern: "^[A-C]" },
    fallbackRent: 75000,
  },
  {
    slug: "3-bedroom-apartment",
    propertyMatch: "Riverside Court",
    title: "3 Bedroom Apartment",
    category: "apartment",
    area: "Kilimani",
    areaSlug: "kilimani",
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 128,
    depositMonths: 2,
    amenities: [
      "Master en-suite",
      "DSQ",
      "Borehole water",
      "Backup generator",
      "Secure parking",
      "24-hour security",
    ],
    description:
      "Three bedrooms with a separate dining area and a servant's quarter. Suited to families who want space in Kilimani without moving out to the suburbs.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
        alt: "Spacious family living room",
      },
      {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
        alt: "Dining area",
      },
    ],
    featured: true,
    match: { unitNamePattern: "^[D-F]" },
    fallbackRent: 110000,
  },
  {
    slug: "1-bedroom-apartment",
    propertyMatch: "Westgate Residency",
    title: "1 Bedroom Apartment",
    category: "apartment",
    area: "Westlands",
    areaSlug: "westlands",
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 58,
    depositMonths: 2,
    amenities: ["Lift", "Backup water tank", "CCTV", "Parking", "Fibre-ready"],
    description:
      "A compact one bedroom within walking distance of Westlands' offices and restaurants. Ideal for a young professional who would rather walk to work than sit in traffic.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
        alt: "Bright one bedroom apartment interior",
      },
    ],
    featured: false,
    fallbackRent: 55000,
  },
  {
    slug: "bedsitter",
    propertyMatch: "South B Gardens",
    title: "Bedsitter",
    category: "bedsitter",
    area: "South B",
    areaSlug: "south-b",
    bedrooms: null,
    bathrooms: 1,
    sizeSqm: 32,
    depositMonths: 1,
    amenities: ["Water included", "Secure gate", "CCTV", "Cabro parking"],
    description:
      "A clean, well-kept bedsitter in a gated compound off Mukoma Road. Water is included in the rent and the compound has a resident caretaker.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80",
        alt: "Bedsitter interior",
      },
    ],
    featured: false,
    fallbackRent: 18000,
  },
  {
    slug: "2-bedroom-apartment-ruaka",
    propertyMatch: "Ruaka Heights",
    title: "2 Bedroom Apartment",
    category: "apartment",
    area: "Ruaka",
    areaSlug: "ruaka",
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 85,
    depositMonths: 2,
    amenities: ["Borehole water", "Lift", "Rooftop terrace", "Parking", "24-hour security"],
    description:
      "Two bedrooms with a master en-suite in a newer block off Limuru Road. Good value for the space, with quick access to the Northern Bypass.",
    photos: [
      {
        url: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1600&q=80",
        alt: "Modern apartment living area",
      },
    ],
    featured: true,
    fallbackRent: 45000,
  },
];
