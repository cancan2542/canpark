import { regions, spots } from "@/lib/sample-data";
import { toMapSpot } from "@/lib/location";
import type { MapSpot, Region, Spot } from "@/types/content";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

type MicroCMSListResponse<T> = {
  contents: T[];
};

async function fetchMicroCMSList<T>(endpoint: string): Promise<T[] | null> {
  if (!serviceDomain || !apiKey) return null;

  const response = await fetch(`https://${serviceDomain}.microcms.io/api/v1/${endpoint}`, {
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`microCMS request failed: ${endpoint}`);
  }

  const data = (await response.json()) as MicroCMSListResponse<T>;
  return data.contents;
}

export async function getSpots(): Promise<Spot[]> {
  return (await fetchMicroCMSList<Spot>("spots")) ?? spots;
}

export async function getRegions(): Promise<Region[]> {
  return (await fetchMicroCMSList<Region>("regions")) ?? regions;
}

export async function getSpotBySlug(slug: string): Promise<Spot | undefined> {
  const allSpots = await getSpots();
  return allSpots.find((spot) => spot.slug === slug);
}

export async function getPrefectures(): Promise<Region[]> {
  const allRegions = await getRegions();
  return allRegions.filter((region) => region.type === "prefecture");
}

export async function getMunicipalities(prefectureSlug: string): Promise<Region[]> {
  const allRegions = await getRegions();
  return allRegions.filter(
    (region) => region.type === "municipality" && region.parentSlug === prefectureSlug,
  );
}

export async function getRegionBySlug(slug: string): Promise<Region | undefined> {
  const allRegions = await getRegions();
  return allRegions.find((region) => region.slug === slug);
}

export async function getSpotsByPrefecture(prefectureSlug: string): Promise<Spot[]> {
  const allSpots = await getSpots();
  return allSpots.filter((spot) => spot.prefectureSlug === prefectureSlug);
}

export async function getSpotsByMunicipality(municipalitySlug: string): Promise<Spot[]> {
  const allSpots = await getSpots();
  return allSpots.filter((spot) => spot.municipalitySlug === municipalitySlug);
}

export function toMapSpots(source: Spot[]): MapSpot[] {
  return source.map(toMapSpot);
}
