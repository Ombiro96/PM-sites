import { describe, expect, it } from "vitest";
import { inSiteTarget, matchRoute } from "./router";

describe("matchRoute", () => {
  it("matches the four stored pages by their fixed paths", () => {
    expect(matchRoute("/")).toEqual({ name: "page", kind: "home" });
    expect(matchRoute("/for-owners")).toEqual({ name: "page", kind: "owners" });
    expect(matchRoute("/about")).toEqual({ name: "page", kind: "about" });
    expect(matchRoute("/contact")).toEqual({ name: "page", kind: "contact" });
  });

  it("ignores a trailing slash and index.html", () => {
    expect(matchRoute("/about/")).toEqual({ name: "page", kind: "about" });
    expect(matchRoute("/index.html")).toEqual({ name: "page", kind: "home" });
    expect(matchRoute("/contact/index.html")).toEqual({ name: "page", kind: "contact" });
  });

  it("matches the houses list and one house", () => {
    expect(matchRoute("/houses")).toEqual({ name: "houses" });
    expect(matchRoute("/houses/")).toEqual({ name: "houses" });
    expect(matchRoute("/houses/k3x9p")).toEqual({ name: "house", id: "k3x9p" });
    expect(matchRoute("/houses/0B6F1F0E-6E0B-4B43-9C56-0D8F1F1B2C3D")).toEqual({
      name: "house",
      id: "0b6f1f0e-6e0b-4b43-9c56-0d8f1f1b2c3d",
    });
  });

  it("treats everything else as not found", () => {
    expect(matchRoute("/blog")).toEqual({ name: "not_found" });
    expect(matchRoute("/about/team")).toEqual({ name: "not_found" });
    expect(matchRoute("/houses/a/b")).toEqual({ name: "not_found" });
    expect(matchRoute("/houses/..%2F")).toEqual({ name: "not_found" });
    expect(matchRoute("/constructor")).toEqual({ name: "not_found" });
  });
});

describe("inSiteTarget", () => {
  const origin = "https://tembo-hart.example";
  const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };
  const anchor = (href: string, extra: { target?: string; download?: boolean } = {}) => ({
    href,
    target: extra.target ?? "",
    hasAttribute: (name: string) => name === "download" && extra.download === true,
  });

  it("takes over plain clicks on same-site pages", () => {
    expect(inSiteTarget(anchor(`${origin}/about`), click, origin)?.pathname).toBe("/about");
    expect(inSiteTarget(anchor(`${origin}/for-owners#sec_request`), click, origin)?.hash).toBe("#sec_request");
  });

  it("leaves other sites, new tabs, files and modified clicks to the browser", () => {
    expect(inSiteTarget(anchor("https://wa.me/254711000202"), click, origin)).toBeNull();
    expect(inSiteTarget(anchor("tel:0711000202"), click, origin)).toBeNull();
    expect(inSiteTarget(anchor(`${origin}/about`, { target: "_blank" }), click, origin)).toBeNull();
    expect(inSiteTarget(anchor(`${origin}/assets/app.js`), click, origin)).toBeNull();
    expect(inSiteTarget(anchor(`${origin}/about`, { download: true }), click, origin)).toBeNull();
    expect(inSiteTarget(anchor(`${origin}/about`), { ...click, metaKey: true }, origin)).toBeNull();
    expect(inSiteTarget(anchor(`${origin}/about`), { ...click, button: 1 }, origin)).toBeNull();
  });
});
