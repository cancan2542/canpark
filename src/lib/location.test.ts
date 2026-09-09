import { describe, expect, it } from "vitest";
import { getDisplayCoordinates, toMapSpot } from "@/lib/location";
import { fixtureSpots as spots } from "../../test/fixtures/content";

describe("location visibility", () => {
  it("keeps coordinates for exact spots", () => {
    expect(getDisplayCoordinates(spots[0])).toEqual(spots[0].coordinates);
  });

  it("masks coordinates for approximate spots", () => {
    expect(getDisplayCoordinates(spots[1])).toBeNull();
  });

  it("maps a spot to a map-safe shape", () => {
    expect(toMapSpot(spots[1])).toMatchObject({
      slug: "approximate-test-spot",
      coordinates: null,
      locationVisibility: "approximate",
    });
  });
});
