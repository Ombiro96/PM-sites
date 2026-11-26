import { safeUrl } from "@/lib/utils";
import type { HouseCard, ListingCover } from "./types";

export function money(
  amount: string | number | null | undefined,
  currency = "KES",
): string {
  const value = Number(amount);
  if (
    amount === null ||
    amount === undefined ||
    amount === "" ||
    !Number.isFinite(value)
  ) {
    return "";
  }
  const unit = currency === "KES" || !currency ? "KSh" : currency;
  return `${unit} ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
}

export function availability(
  house: Pick<HouseCard, "available_count" | "available_from">,
): string {
  if (house.available_from) {
    const date = new Date(`${house.available_from}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return `Available from ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    }
  }
  if (house.available_count && house.available_count > 0) {
    return `${house.available_count} available now`;
  }
  return "Available now";
}

/** "Deposit KSh 9,500 · total to move in KSh 19,000", with whatever the backend gave. */
export function moveInLine(house: HouseCard): string {
  const parts = [];
  if (house.deposit_amount !== null) {
    parts.push(`Deposit ${money(house.deposit_amount, house.currency)}`);
  }
  if (house.move_in_total !== null) {
    parts.push(
      `total to move in ${money(house.move_in_total, house.currency)}`,
    );
  }
  const line = parts.join(" · ");
  return line ? line[0].toUpperCase() + line.slice(1) : "";
}

export function coverUrl(
  cover: ListingCover | null,
  size: "small" | "large",
): string | null {
  if (!cover) return null;
  const [first, second] =
    size === "small"
      ? [cover.small_url, cover.url]
      : [cover.url, cover.small_url];
  return safeUrl(first) ?? safeUrl(second);
}
