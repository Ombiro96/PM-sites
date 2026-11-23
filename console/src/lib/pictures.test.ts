import { describe, expect, it } from "vitest";
import { nameFromFile } from "./pictures";

describe("nameFromFile", () => {
  it("drops the ending and reads dashes as spaces", () => {
    expect(nameFromFile("front-of_sunrise  court.jpeg")).toBe(
      "front of sunrise court",
    );
  });

  it("never gives an empty name", () => {
    expect(nameFromFile(".png")).toBe("Picture");
  });

  it("keeps to the length the backend takes", () => {
    expect(nameFromFile(`${"a".repeat(300)}.jpg`)).toHaveLength(120);
  });
});
