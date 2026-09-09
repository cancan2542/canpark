import { describe, expect, it } from "vitest";
import { normalizeMicroCMSSpot } from "@/lib/content-normalizer";

describe("normalizeMicroCMSSpot hazards", () => {
  it("normalizes every nested hazard value", () => {
    const spot = normalizeMicroCMSSpot({
      id: "nested-hazards",
      hazards: {
        flood: 1,
        landslide: "5",
        tsunami: ["unknown"],
        stormSurge: "not_applicable",
      },
    });

    expect(spot.hazards).toEqual({
      flood: 1,
      landslide: 5,
      tsunami: "unknown",
      stormSurge: "not_applicable",
    });
  });

  it("falls back per field from invalid or missing nested values to flat values", () => {
    const spot = normalizeMicroCMSSpot({
      id: "nested-fallbacks",
      hazards: {
        flood: 0,
        landslide: "invalid",
      },
      flood: "2",
      landslide: ["4"],
      tsunami: 3,
      stormSurge: "not_applicable",
    });

    expect(spot.hazards).toEqual({
      flood: 2,
      landslide: 4,
      tsunami: 3,
      stormSurge: "not_applicable",
    });
  });

  it("uses unknown when nested and flat values are both absent or invalid", () => {
    const spot = normalizeMicroCMSSpot({
      id: "invalid-hazards",
      hazards: {
        flood: 1.5,
        landslide: "6",
        tsunami: [],
      },
      flood: -1,
      landslide: "3e0",
      tsunami: "",
      stormSurge: "invalid",
    });

    expect(spot.hazards).toEqual({
      flood: "unknown",
      landslide: "unknown",
      tsunami: "unknown",
      stormSurge: "unknown",
    });
  });
});
