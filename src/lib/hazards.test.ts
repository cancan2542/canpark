import { describe, expect, it } from "vitest";
import { formatHazardRating } from "@/lib/hazards";

describe("formatHazardRating", () => {
  it("formats numeric danger levels", () => {
    expect(formatHazardRating(1)).toBe("1 低リスク");
    expect(formatHazardRating(5)).toBe("5 非常に高リスク");
  });

  it("formats non-numeric states", () => {
    expect(formatHazardRating("unknown")).toBe("未確認");
    expect(formatHazardRating("not_applicable")).toBe("該当なし");
  });
});
