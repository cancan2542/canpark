import { describe, expect, it } from "vitest";
import { getMunicipalities, getSpotsByMunicipality, getSpotsByPrefecture, toMapSpots } from "@/lib/content";
import { spots } from "@/lib/sample-data";

describe("content helpers", () => {
  it("groups spots by prefecture", async () => {
    await expect(getSpotsByPrefecture("yamanashi")).resolves.toHaveLength(1);
  });

  it("groups spots by municipality", async () => {
    await expect(getSpotsByMunicipality("hakuba")).resolves.toHaveLength(1);
  });

  it("lists municipalities by parent prefecture", async () => {
    const municipalities = await getMunicipalities("nagano");
    expect(municipalities.map((municipality) => municipality.slug)).toEqual(["hakuba"]);
  });

  it("creates map spots without leaking approximate coordinates", () => {
    const mapSpots = toMapSpots(spots);
    expect(mapSpots.find((spot) => spot.slug === "hakuba-mountain-base")?.coordinates).toBeNull();
  });
});
