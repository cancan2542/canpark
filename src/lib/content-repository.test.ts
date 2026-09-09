import { describe, expect, it, vi } from "vitest";
import {
  createContentRepository,
  toMapSpots,
} from "@/lib/content-repository";
import { fallbackRegions as regions } from "@/lib/fallback-regions";
import type { Region, Spot } from "@/types/content";
import { fixtureSpots as spots } from "../../test/fixtures/content";

describe("content repository", () => {
  it("loads content through an injected source", async () => {
    const cmsSpot = { ...spots[0], id: "cms-spot", title: "CMS spot" };
    const cmsRegion = { ...regions[0], id: "cms-region", name: "CMS region" };
    const loadSpots = vi.fn().mockResolvedValue([cmsSpot]);
    const loadRegions = vi.fn().mockResolvedValue([cmsRegion]);
    const repository = createContentRepository({
      source: { loadSpots, loadRegions },
      fallbackSpots: spots,
      fallbackRegions: regions,
    });

    await expect(repository.getSpots()).resolves.toEqual([cmsSpot]);
    await expect(repository.getRegions()).resolves.toEqual([cmsRegion]);
    expect(loadSpots).toHaveBeenCalledOnce();
    expect(loadRegions).toHaveBeenCalledOnce();
  });

  it("uses fallback data only when a source is unavailable", async () => {
    const repository = createContentRepository({
      source: {
        loadSpots: vi.fn().mockResolvedValue(null),
        loadRegions: vi.fn().mockResolvedValue(null),
      },
      fallbackSpots: spots,
      fallbackRegions: regions,
    });

    await expect(repository.getSpots()).resolves.toBe(spots);
    await expect(repository.getRegions()).resolves.toBe(regions);
  });

  it("preserves an intentionally empty CMS response", async () => {
    const repository = createContentRepository({
      source: {
        loadSpots: vi.fn().mockResolvedValue([]),
        loadRegions: vi.fn().mockResolvedValue([]),
      },
      fallbackSpots: spots,
      fallbackRegions: regions,
    });

    await expect(repository.getSpots()).resolves.toEqual([]);
    await expect(repository.getRegions()).resolves.toEqual([]);
  });

  it("looks up and filters injected content without changing source order", async () => {
    const orderedSpots: Spot[] = [
      { ...spots[1], id: "nagano-first", slug: "nagano-first" },
      { ...spots[0], id: "yamanashi", slug: "yamanashi" },
      { ...spots[1], id: "nagano-second", slug: "nagano-second" },
    ];
    const orderedRegions: Region[] = [
      regions[3],
      regions[1],
      regions[2],
      regions[0],
    ];
    const repository = createContentRepository({
      source: {
        loadSpots: vi.fn().mockResolvedValue(null),
        loadRegions: vi.fn().mockResolvedValue(null),
      },
      fallbackSpots: orderedSpots,
      fallbackRegions: orderedRegions,
    });

    await expect(repository.getSpotBySlug("nagano-second")).resolves.toMatchObject({
      id: "nagano-second",
    });
    await expect(repository.getRegionBySlug("yamanashi")).resolves.toMatchObject({
      id: "region-yamanashi",
    });
    await expect(repository.getSpotsByPrefecture("nagano")).resolves.toEqual([
      orderedSpots[0],
      orderedSpots[2],
    ]);
    await expect(repository.getSpotsByMunicipality("hakuba")).resolves.toEqual([
      orderedSpots[0],
      orderedSpots[2],
    ]);
    await expect(repository.getPrefectures()).resolves.toEqual([
      orderedRegions[2],
      orderedRegions[3],
    ]);
    await expect(repository.getMunicipalities("yamanashi")).resolves.toEqual([
      orderedRegions[1],
    ]);
  });

  it("maps spots through the privacy-aware location service", () => {
    const mapSpots = toMapSpots(spots);

    expect(mapSpots.map((spot) => spot.id)).toEqual(spots.map((spot) => spot.id));
    expect(mapSpots[0].coordinates).toEqual(spots[0].coordinates);
    expect(mapSpots[1].coordinates).toBeNull();
  });
});
