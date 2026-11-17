import { describe, expect, it } from "vitest";
import { parseSiteData } from "@/lib/site/data";
import {
  companyNameError,
  companyPhoneError,
  companyWhatsappError,
} from "./company";
import { exampleSite } from "./preview";
import { brandColourError, parseWebsite } from "./website";

describe("a manager's website choices", () => {
  it("start as the backend starts a new site", () => {
    const fresh = {
      look: "fresh",
      brandColour: "#1d4e89",
      audience: "tenants",
    };
    expect(parseWebsite(null)).toEqual(fresh);
    expect(parseWebsite("not json")).toEqual(fresh);
    expect(parseWebsite("[1]")).toEqual(fresh);
  });

  it("keep what was stored and replace only what cannot be used", () => {
    const stored = { look: "estate", brandColour: "#7a1f2b", audience: "both" };
    expect(parseWebsite(JSON.stringify(stored))).toEqual(stored);
    expect(
      parseWebsite(
        JSON.stringify({ look: "neon", brandColour: "red", audience: "both" }),
      ),
    ).toEqual({ look: "fresh", brandColour: "#1d4e89", audience: "both" });
  });

  it("take a colour only as # and six hex digits", () => {
    expect(brandColourError("#1D4e89")).toBeUndefined();
    expect(brandColourError("1d4e89")).toBeDefined();
    expect(brandColourError("#1d4")).toBeDefined();
    expect(brandColourError("#1d4e8g")).toBeDefined();
  });
});

describe("the company details", () => {
  it("need a name and a phone number", () => {
    expect(companyNameError("  ")).toBeDefined();
    expect(companyNameError("ABC Properties")).toBeUndefined();
    expect(companyPhoneError("")).toBeDefined();
    expect(companyPhoneError("0712 345 678")).toBeUndefined();
    expect(companyPhoneError("+254-712345678")).toBeUndefined();
  });

  it("refuse a number from the phone input that is too short", () => {
    expect(companyPhoneError("+254-7123")).toBeDefined();
    expect(companyWhatsappError("+254-7123")).toBeDefined();
    expect(companyWhatsappError("")).toBeUndefined();
  });
});

describe("the example website", () => {
  const choices = { look: "bold", brandColour: "#7a1f2b" } as const;

  it("is drawn in the chosen look and colour", () => {
    const site = exampleSite({ ...choices, company: null });
    expect(site.site.look).toBe("bold");
    expect(site.site.brand_colour).toBe("#7a1f2b");
    expect(site.facts.name).toBe("Tembo & Hart");
  });

  it("carries the company's own name and numbers once given", () => {
    const site = exampleSite({
      ...choices,
      company: {
        displayName: "ABC Properties",
        phone: "0712 345 678",
        whatsappNumber: "",
      },
    });
    expect(site.facts.name).toBe("ABC Properties");
    expect(site.facts.phone).toBe("0712 345 678");
    expect(site.facts.whatsapp).toBe("");
  });

  it("is site data the site app accepts", () => {
    const site = exampleSite({ ...choices, company: null });
    const read = parseSiteData(JSON.parse(JSON.stringify(site)));
    expect(read?.site.look).toBe("bold");
    expect(read?.document.pages.length).toBe(site.document.pages.length);
  });
});
