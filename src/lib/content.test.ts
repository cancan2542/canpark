import { describe, expect, it } from "vitest";
import {
  getMunicipalities,
  getPrefectures,
  getRegionBySlug,
  getRegions,
  getSpotBySlug,
  getSpots,
  getSpotsByMunicipality,
  getSpotsByPrefecture,
} from "@/lib/content";

describe("content helpers", () => {
  it("does not show hard-coded spots when generated content is unavailable", async () => {
    await expect(getSpots()).resolves.toEqual([]);
    await expect(getSpotsByPrefecture("yamanashi")).resolves.toEqual([]);
    await expect(getSpotsByMunicipality("hakuba")).resolves.toEqual([]);
    await expect(getSpotBySlug("michi-no-eki-katsuyama")).resolves.toBeUndefined();
  });

  it("lists municipalities by parent prefecture", async () => {
    const municipalities = await getMunicipalities("nagano");
    expect(municipalities.map((municipality) => municipality.slug)).toEqual(["hakuba"]);
  });

  it("keeps the region fallback available without article data", async () => {
    const [allRegions, prefectures, region] = await Promise.all([
      getRegions(),
      getPrefectures(),
      getRegionBySlug("yamanashi"),
    ]);

    expect(allRegions).toHaveLength(4);
    expect(prefectures.map((prefecture) => prefecture.slug)).toEqual(["yamanashi", "nagano"]);
    expect(region?.id).toBe("region-yamanashi");
  });

});
