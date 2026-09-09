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
  microCMSApiUrl,
  normalizeMicroCMSSpot,
  toMapSpots,
} from "@/lib/content";
import { spots } from "@/lib/sample-data";

describe("content helpers", () => {
  it("only builds API URLs for valid microCMS service IDs and endpoints", () => {
    expect(microCMSApiUrl("canpark", "spots")?.toString()).toBe(
      "https://canpark.microcms.io/api/v1/spots",
    );
    expect(microCMSApiUrl("example.com/path?", "spots")).toBeNull();
    expect(microCMSApiUrl("canpark", "../users")).toBeNull();
  });

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

  it("keeps the existing content facade available with sample-data fallback", async () => {
    const [allSpots, allRegions, prefectures, spot, region] = await Promise.all([
      getSpots(),
      getRegions(),
      getPrefectures(),
      getSpotBySlug("michi-no-eki-katsuyama"),
      getRegionBySlug("yamanashi"),
    ]);

    expect(allSpots).toEqual(spots);
    expect(allRegions).toHaveLength(4);
    expect(prefectures.map((prefecture) => prefecture.slug)).toEqual(["yamanashi", "nagano"]);
    expect(spot?.id).toBe("spot-katsuyama");
    expect(region?.id).toBe("region-yamanashi");
  });

  it("creates map spots without leaking approximate coordinates", () => {
    const mapSpots = toMapSpots(spots);
    expect(mapSpots.find((spot) => spot.slug === "michi-no-eki-katsuyama")?.coordinates).toEqual({
      latitude: 35.5082,
      longitude: 138.7246,
    });
    expect(mapSpots.find((spot) => spot.slug === "hakuba-mountain-base")?.coordinates).toBeNull();
  });

  it("normalizes the flat microCMS spot schema", () => {
    const spot = normalizeMicroCMSSpot({
      id: "cms-test",
      title: "microCMS test",
      slug: "microcms-test",
      prefecture: "山梨県",
      prefectureSlug: "yamanashi",
      municipality: "富士河口湖町",
      municipalitySlug: "fujikawaguchiko",
      genreName: "テスト記事",
      genreSlug: "test",
      body: "connection test",
      photos: [{ url: "https://example.com/photo.jpg" }],
      visitedAt: "2026-08-27T00:00:00.000Z",
      publishedAt: "2026-08-27T01:00:00.000Z",
      updatedAt: "2026-08-27T01:00:00.000Z",
      latitude: 35.5,
      longitude: 138.7,
      locationVisibility: "exact",
      hazardCheckedAt: "2026-08-27T00:00:00.000Z",
      hazardMemo: "test",
      flood: ["3"],
      landslide: ["unknown"],
      tsunami: ["not_applicable"],
      stormSurge: ["1"],
      fieldTips: "test",
    });

    expect(spot.genre).toMatchObject({ name: "テスト記事", slug: "test" });
    expect(spot.coordinates).toEqual({ latitude: 35.5, longitude: 138.7 });
    expect(spot.visitedAt).toBe("2026-08-27");
    expect(spot.photos).toEqual(["https://example.com/photo.jpg"]);
    expect(spot.hazards).toEqual({
      flood: 3,
      landslide: "unknown",
      tsunami: "not_applicable",
      stormSurge: 1,
    });
  });

  it("fails closed for unsafe URLs, invalid coordinates, and unknown visibility", () => {
    const spot = normalizeMicroCMSSpot({
      id: "unsafe-cms-test",
      title: "unsafe CMS test",
      latitude: 91,
      longitude: 138.7,
      locationVisibility: "exact",
      officialUrl: "javascript:alert(1)",
      hazardSourceUrl: "data:text/html,<script>alert(2)</script>",
      municipalityHazardUrl: "ftp://example.com/map",
      photos: ["javascript:alert(3)", { url: "https://example.com/safe.jpg" }],
    });

    expect(spot.coordinates).toEqual({ latitude: 0, longitude: 0 });
    expect(spot.locationVisibility).toBe("municipality");
    expect(toMapSpots([spot])[0].coordinates).toBeNull();
    expect(spot.officialUrl).toBeUndefined();
    expect(spot.hazardSourceUrl).toBeUndefined();
    expect(spot.municipalityHazardUrl).toBeUndefined();
    expect(spot.photos).toEqual(["https://example.com/safe.jpg"]);
  });

  it("defaults a missing visibility setting to municipality-level privacy", () => {
    const spot = normalizeMicroCMSSpot({
      id: "missing-visibility-test",
      latitude: 35.5,
      longitude: 138.7,
    });

    expect(spot.locationVisibility).toBe("municipality");
    expect(toMapSpots([spot])[0].coordinates).toBeNull();
  });
});
