import { describe, expect, it, vi } from "vitest";
import {
  fetchMicroCMSList,
  generateContent,
  geocodeSpot,
  microCMSApiUrl,
  resolveSpot,
  selectPlaceCandidate,
} from "./generate-content.mjs";
import { fallbackRegions } from "@/lib/fallback-regions";

const cmsSpot = {
  id: "michi-no-eki-katsuyama",
  title: "道の駅かつやま",
  prefecture: "山梨県",
  municipality: "富士河口湖町",
  genreName: "道の駅",
  body: "本文",
  visitedAt: "2026-09-10T00:00:00.000Z",
};

describe("generated content", () => {
  it("requires deployment credentials in production", async () => {
    await expect(generateContent({ env: { VERCEL_ENV: "production" } })).rejects.toThrow(
      "microCMS credentials are required in production",
    );
    await expect(
      generateContent({
        env: {
          VERCEL_ENV: "production",
          MICROCMS_SERVICE_DOMAIN: "canpark",
          MICROCMS_API_KEY: "key",
        },
      }),
    ).rejects.toThrow("GOOGLE_MAPS_API_KEY is required in production");
    await expect(
      generateContent({
        env: {
          VERCEL_ENV: "production",
          MICROCMS_SERVICE_DOMAIN: "canpark",
          MICROCMS_API_KEY: "key",
          GOOGLE_MAPS_API_KEY: "places-key",
        },
      }),
    ).rejects.toThrow("GOOGLE_MAPS_EMBED_API_KEY is required in production");
  });

  it("only builds microCMS URLs from valid identifiers", () => {
    expect(microCMSApiUrl("canpark", "spots")?.toString()).toBe(
      "https://canpark.microcms.io/api/v1/spots",
    );
    expect(microCMSApiUrl("example.com/path", "spots")).toBeNull();
    expect(microCMSApiUrl("canpark", "../users")).toBeNull();
  });

  it("retrieves all microCMS pages", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({ id: `spot-${index}` }));
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ contents: firstPage, totalCount: 101, offset: 0, limit: 100 }),
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            contents: [{ id: "spot-100" }],
            totalCount: 101,
            offset: 100,
            limit: 100,
          }),
        ),
      );

    await expect(
      fetchMicroCMSList("spots", {
        serviceDomain: "canpark",
        apiKey: "key",
        fetcher,
      }),
    ).resolves.toHaveLength(101);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("derives route fields and defaults coordinates to null", () => {
    expect(resolveSpot(cmsSpot, fallbackRegions)).toEqual({
      title: "道の駅かつやま",
      slug: "michi-no-eki-katsuyama",
      prefecture: "山梨県",
      prefectureSlug: "yamanashi",
      municipality: "富士河口湖町",
      municipalitySlug: "fujikawaguchiko",
      genreName: "道の駅",
      body: "本文",
      visitedAt: "2026-09-10",
      coordinates: null,
      googlePlaceId: null,
    });
  });

  it("rejects a municipality that is missing from the region master", () => {
    expect(() => resolveSpot({ ...cmsSpot, municipality: "未登録市" }, fallbackRegions)).toThrow(
      "unknown municipality",
    );
  });

  it("chooses an address and exact-name match", () => {
    const spot = resolveSpot(cmsSpot, fallbackRegions);
    const candidate = selectPlaceCandidate(
      [
        {
          displayName: { text: "別の施設" },
          formattedAddress: "日本、山梨県南都留郡富士河口湖町",
          location: { latitude: 35.4, longitude: 138.7 },
        },
        {
          displayName: { text: "道の駅かつやま" },
          formattedAddress: "日本、山梨県南都留郡富士河口湖町勝山",
          location: { latitude: 35.5, longitude: 138.7 },
        },
      ],
      spot,
    );
    expect(candidate?.location).toEqual({ latitude: 35.5, longitude: 138.7 });
  });

  it("uses the top address match when names do not exactly match", () => {
    const spot = resolveSpot(cmsSpot, fallbackRegions);
    const places = [1, 2].map((index) => ({
      displayName: { text: `候補${index}` },
      formattedAddress: "日本、山梨県南都留郡富士河口湖町",
      location: { latitude: 35.5, longitude: 138.7 },
    }));
    expect(selectPlaceCandidate(places, spot)?.displayName.text).toBe("候補1");
  });

  it("requests Google Places with the minimum field mask", async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            places: [
              {
                id: "ChIJexample",
                displayName: { text: "道の駅かつやま" },
                formattedAddress: "日本、山梨県南都留郡富士河口湖町勝山",
                location: { latitude: 35.5, longitude: 138.7 },
              },
            ],
          }),
        ),
    );
    const spot = resolveSpot(cmsSpot, fallbackRegions);

    await expect(geocodeSpot(spot, { apiKey: "key", fetcher })).resolves.toEqual({
      coordinates: { latitude: 35.5, longitude: 138.7 },
      googlePlaceId: "ChIJexample",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:searchText",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location",
        }),
      }),
    );
  });
});
