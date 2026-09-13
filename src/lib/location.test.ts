import { describe, expect, it } from "vitest";
import { getDisplayCoordinates, toMapSpot } from "@/lib/location";
import { fixtureSpots as spots } from "../../test/fixtures/content";

describe("location visibility", () => {
  it("keeps generated coordinates", () => {
    expect(getDisplayCoordinates(spots[0])).toEqual(spots[0].coordinates);
  });

  it("keeps a missing coordinate as null", () => {
    expect(getDisplayCoordinates(spots[1])).toBeNull();
  });

  it("maps a spot to a map-safe shape", () => {
    expect(toMapSpot(spots[1])).toMatchObject({
      slug: "unlocated-test-spot",
      coordinates: null,
    });
  });
});
