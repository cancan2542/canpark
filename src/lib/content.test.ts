import { describe, expect, it } from "vitest";
import {
  getMunicipalities,
  getSpotsByMunicipality,
  getSpotsByPrefecture,
  normalizeMicroCMSSpot,
  toMapSpots,
} from "@/lib/content";
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
});
