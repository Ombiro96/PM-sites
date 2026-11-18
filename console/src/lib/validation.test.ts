import { describe, expect, it } from "vitest";
import { formatTrackingCookies, registrationSource } from "./tracking";
import {
  emailError,
  formatPhone,
  loginErrorMessage,
  passwordError,
  phoneError,
  phoneForInput,
  phoneFromInput,
  usernameError,
} from "./validation";

describe("sign-up checks", () => {
  it("wants a username of five characters or more", () => {
    expect(usernameError(" abcd ")).toBeDefined();
    expect(usernameError("abcde")).toBeUndefined();
  });

  it("wants an email with a name, an @ and a domain", () => {
    expect(emailError("someone")).toBeDefined();
    expect(emailError("someone@example.com")).toBeUndefined();
  });

  it("wants a password of eight characters mixing letters and numbers", () => {
    expect(passwordError("abc123")).toBeDefined();
    expect(passwordError("abcdefgh")).toBeDefined();
    expect(passwordError("12345678")).toBeDefined();
    expect(passwordError("abcd1234")).toBeUndefined();
  });

  it("sends the phone number as country code, dash, number without its zero", () => {
    expect(formatPhone("+254", "0712 345 678")).toBe("+254-712345678");
    expect(formatPhone("254", "712345678")).toBe("+254-712345678");
  });

  it("stores nothing until a number follows the country code", () => {
    expect(phoneFromInput("254", "254")).toBe("");
    expect(phoneFromInput("2540712345678", "254")).toBe("+254-712345678");
  });

  it("shows a local number saved elsewhere as a Kenyan one", () => {
    expect(phoneForInput("0712 345 678")).toBe("254712345678");
    expect(phoneForInput("+1-2025550123")).toBe("+1-2025550123");
    expect(phoneForInput("")).toBe("");
  });

  it("refuses a phone number that is too short or has no country code", () => {
    expect(phoneError("+254", "0712")).toBeDefined();
    expect(phoneError("", "0712345678")).toBeDefined();
    expect(phoneError("+254", "0712 345 678")).toBeUndefined();
  });
});

describe("sign-in refusals", () => {
  it("reads the reason in each shape the backend sends", () => {
    expect(loginErrorMessage(null)).toBe("Invalid username or password");
    expect(loginErrorMessage("Account archived")).toBe("Account archived");
    expect(
      loginErrorMessage({ nonFieldErrors: [{ message: "Wrong details" }] }),
    ).toBe("Wrong details");
    expect(loginErrorMessage({ message: "Try later" })).toBe("Try later");
  });
});

describe("where a sign-up came from", () => {
  it("groups campaign cookies by the time of the visit", () => {
    const cookies =
      "csrftoken=x; t#utm_source#1717575938=google; t#utm_medium#1717575938=paidsearch; t#utm_source#1717600000=facebook";
    expect(formatTrackingCookies(cookies)).toEqual([
      { "1717575938": { utm_source: "google", utm_medium: "paidsearch" } },
      { "1717600000": { utm_source: "facebook" } },
    ]);
    expect(formatTrackingCookies("csrftoken=x")).toEqual([]);
  });

  it("passes the query string on without the question mark", () => {
    expect(
      registrationSource("?utm_source=internal_referrals&utm_content=AB12"),
    ).toBe("utm_source=internal_referrals&utm_content=AB12");
    expect(registrationSource("")).toBe("");
  });
});
