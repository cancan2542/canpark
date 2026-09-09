import { toMapSpot } from "@/lib/location";
import type { MapSpot, Region, Spot } from "@/types/content";

export type ContentSource = {
  loadSpots: () => Promise<Spot[] | null>;
  loadRegions: () => Promise<Region[] | null>;
};

export type ContentRepositoryDependencies = {
  source: ContentSource;
  fallbackSpots: Spot[];
  fallbackRegions: Region[];
};

export type ContentRepository = {
  getSpots: () => Promise<Spot[]>;
  getRegions: () => Promise<Region[]>;
  getSpotBySlug: (slug: string) => Promise<Spot | undefined>;
  getPrefectures: () => Promise<Region[]>;
  getMunicipalities: (prefectureSlug: string) => Promise<Region[]>;
  getRegionBySlug: (slug: string) => Promise<Region | undefined>;
  getSpotsByPrefecture: (prefectureSlug: string) => Promise<Spot[]>;
  getSpotsByMunicipality: (municipalitySlug: string) => Promise<Spot[]>;
};

export function createContentRepository({
  source,
  fallbackSpots,
  fallbackRegions,
}: ContentRepositoryDependencies): ContentRepository {
  async function getSpots(): Promise<Spot[]> {
    return (await source.loadSpots()) ?? fallbackSpots;
  }

  async function getRegions(): Promise<Region[]> {
    return (await source.loadRegions()) ?? fallbackRegions;
  }

  async function getSpotBySlug(slug: string): Promise<Spot | undefined> {
    const allSpots = await getSpots();
    return allSpots.find((spot) => spot.slug === slug);
  }

  async function getPrefectures(): Promise<Region[]> {
    const allRegions = await getRegions();
    return allRegions.filter((region) => region.type === "prefecture");
  }

  async function getMunicipalities(prefectureSlug: string): Promise<Region[]> {
    const allRegions = await getRegions();
    return allRegions.filter(
      (region) => region.type === "municipality" && region.parentSlug === prefectureSlug,
    );
  }

  async function getRegionBySlug(slug: string): Promise<Region | undefined> {
    const allRegions = await getRegions();
    return allRegions.find((region) => region.slug === slug);
  }

  async function getSpotsByPrefecture(prefectureSlug: string): Promise<Spot[]> {
    const allSpots = await getSpots();
    return allSpots.filter((spot) => spot.prefectureSlug === prefectureSlug);
  }

  async function getSpotsByMunicipality(municipalitySlug: string): Promise<Spot[]> {
    const allSpots = await getSpots();
    return allSpots.filter((spot) => spot.municipalitySlug === municipalitySlug);
  }

  return {
    getSpots,
    getRegions,
    getSpotBySlug,
    getPrefectures,
    getMunicipalities,
    getRegionBySlug,
    getSpotsByPrefecture,
    getSpotsByMunicipality,
  };
}

export function toMapSpots(source: Spot[]): MapSpot[] {
  return source.map(toMapSpot);
}
