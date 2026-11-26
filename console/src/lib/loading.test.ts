import { describe, expect, it } from "vitest";
import { isLoading, subscribeToLoading, whileLoading } from "./loading";

describe("the loading indicator", () => {
  it("shows while a call is under way and hides when it finishes", async () => {
    let finish = () => {};
    const call = whileLoading(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    expect(isLoading()).toBe(true);
    finish();
    await call;
    expect(isLoading()).toBe(false);
  });

  it("stays until the last of several calls finishes", async () => {
    let finishFirst = () => {};
    let finishSecond = () => {};
    const first = whileLoading(
      () => new Promise<void>((resolve) => (finishFirst = resolve)),
    );
    const second = whileLoading(
      () => new Promise<void>((resolve) => (finishSecond = resolve)),
    );
    finishFirst();
    await first;
    expect(isLoading()).toBe(true);
    finishSecond();
    await second;
    expect(isLoading()).toBe(false);
  });

  it("hides when a call fails, and tells whoever is watching", async () => {
    let changes = 0;
    const stop = subscribeToLoading(() => (changes += 1));
    await expect(
      whileLoading(() => Promise.reject(new Error("refused"))),
    ).rejects.toThrow("refused");
    stop();
    expect(isLoading()).toBe(false);
    expect(changes).toBe(2);
  });
});
