import { describe, expect, it } from "vitest";
import { parseSiteData } from "@/lib/site/data";
import {
  companyNameError,
  companyPhoneError,
  companyWhatsappError,
} from "./company";
import { exampleSite } from "./preview";
import {
  addressFromName,
  brandColourError,
  chosenAddress,
  clearWebsite,
  parseSetup,
  parseWebsite,
  readSetup,
  saveSetupStep,
  saveTryout,
  saveWebsite,
  startSetup,
  tryoutName,
} from "./website";

describe("a manager's website choices", () => {
  it("start as the backend starts a new site", () => {
    const fresh = {
      look: "fresh",
      brandColour: "#1d4e89",
      audience: "tenants",
      answers: { about_text: "", services: [], show_figures: false },
      addressName: "",
      addressTouched: false,
    };
    expect(parseWebsite(null)).toEqual(fresh);
    expect(parseWebsite("not json")).toEqual(fresh);
    expect(parseWebsite("[1]")).toEqual(fresh);
  });

  it("keep what was stored and replace only what cannot be used", () => {
    const answers = {
      about_text: "We let and manage apartments for their owners.",
      services: ["rent_collection", "repairs"],
      show_figures: true,
    };
    const stored = {
      look: "estate" as const,
      brandColour: "#7a1f2b",
      audience: "both" as const,
      answers,
      addressName: "",
      addressTouched: false,
    };
    expect(parseWebsite(JSON.stringify(stored))).toEqual(stored);
    expect(
      parseWebsite(
        JSON.stringify({
          look: "no-such-look",
          brandColour: "red",
          audience: "both",
          answers: { services: ["gardening", "repairs"], show_figures: "yes" },
        }),
      ),
    ).toEqual({
      look: "fresh",
      brandColour: "#1d4e89",
      audience: "both",
      answers: { about_text: "", services: ["repairs"], show_figures: false },
      addressName: "",
      addressTouched: false,
    });
  });

  it("keeps a chosen address and treats a missing one as not yet chosen", () => {
    expect(addressFromName("Mwangaza Homes")).toBe("mwangaza-homes");
    expect(addressFromName("")).toBe("website");
    expect(addressFromName("ab")).toBe("website");
    expect(addressFromName("Preview Realty")).toBe("previewrealty");
    const fresh = parseWebsite(null);
    const chosen = parseWebsite(
      JSON.stringify({
        ...fresh,
        addressName: "acme-homes",
        addressTouched: true,
      }),
    );
    expect(chosen.addressName).toBe("acme-homes");
    expect(chosen.addressTouched).toBe(true);
    expect(parseWebsite(JSON.stringify({ look: "fresh" }))).toMatchObject({
      addressName: "",
      addressTouched: false,
    });
    expect(chosenAddress(fresh, "Mwangaza Homes")).toBe("mwangaza-homes");
    expect(
      chosenAddress(
        { ...fresh, addressName: "acme", addressTouched: true },
        "Mwangaza Homes",
      ),
    ).toBe("acme");
    expect(
      chosenAddress(
        { ...fresh, addressName: "", addressTouched: true },
        "Mwangaza Homes",
      ),
    ).toBe("");
  });

  it("treat a missing record as not started, and resume a stored step", () => {
    const fresh = parseWebsite(null);
    expect(parseSetup(null)).toBeNull();
    expect(parseSetup(JSON.stringify({ ...fresh, step: "details" }))).toEqual({
      website: fresh,
      step: "details",
    });
    expect(parseSetup(JSON.stringify(fresh))?.step).toBe("look");
    expect(parseSetup(JSON.stringify({ ...fresh, step: "nope" }))?.step).toBe(
      "look",
    );
    expect(parseWebsite(JSON.stringify({ ...fresh, step: "about" }))).toEqual(
      fresh,
    );
  });

  it("start, resume and forget in this browser", async () => {
    localStorage.clear();
    expect(readSetup("ada")).toBeNull();
    startSetup("ada");
    expect(readSetup("ada")).toEqual({
      website: parseWebsite(null),
      step: "look",
    });
    saveSetupStep("ada", "about");
    expect(readSetup("ada")?.step).toBe("about");
    saveSetupStep("nobody", "review");
    expect(readSetup("nobody")).toBeNull();
    const website = {
      ...parseWebsite(null),
      brandColour: "#7a1f2b",
    };
    await saveWebsite("ada", website, "colour");
    expect(readSetup("ada")).toEqual({ website, step: "colour" });
    clearWebsite("ada");
    expect(readSetup("ada")).toBeNull();
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

describe("what a visitor tried on the landing page", () => {
  it("is where setup starts, and is gone once setup is cleared", () => {
    window.localStorage.clear();
    saveTryout({ look: "bold", brandColour: "#1f4d3a", name: " Acme Homes " });
    startSetup("tried");
    expect(readSetup("tried")?.website).toMatchObject({
      look: "bold",
      brandColour: "#1f4d3a",
    });
    expect(tryoutName()).toBe("Acme Homes");
    clearWebsite("tried");
    expect(tryoutName()).toBe("");
    startSetup("tried");
    expect(readSetup("tried")?.website.look).toBe("fresh");
  });
});
