import {
  normalizeMicroCMSSpot,
  type MicroCMSFlatSpot,
} from "@/lib/content-normalizer";
import { regions, spots } from "@/lib/sample-data";
import { toMapSpot } from "@/lib/location";
import {
  fetchMicroCMSList,
  type FetchLike,
  type MicroCMSConfig,
} from "@/lib/microcms";
import type {
  MapSpot,
  Region,
  Spot,
} from "@/types/content";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
const microCMSConfig: MicroCMSConfig = { serviceDomain, apiKey };

type NextRequestInit = RequestInit & {
  next: { revalidate: number };
};

const fetchWithRevalidation: FetchLike = (input, init) => {
  const requestInit: NextRequestInit = {
    ...init,
    next: { revalidate: 300 },
  };
  return fetch(input, requestInit);
};

export { microCMSApiUrl } from "@/lib/microcms";
export {
  normalizeMicroCMSSpot,
  type MicroCMSFlatSpot,
} from "@/lib/content-normalizer";

export async function getSpots(): Promise<Spot[]> {
  const microCMSSpots = await fetchMicroCMSList<MicroCMSFlatSpot>("spots", {
    config: microCMSConfig,
    fetcher: fetchWithRevalidation,
  });
  return microCMSSpots?.map(normalizeMicroCMSSpot) ?? spots;
}

export async function getRegions(): Promise<Region[]> {
  return (
    (await fetchMicroCMSList<Region>("regions", {
      config: microCMSConfig,
      fetcher: fetchWithRevalidation,
      allowMissing: true,
    })) ?? regions
  );
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
