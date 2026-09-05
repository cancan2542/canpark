import { regions, spots } from "@/lib/sample-data";
import { toMapSpot } from "@/lib/location";
import type {
  Coordinates,
  HazardRating,
  LocationVisibility,
  MapSpot,
  Region,
  Spot,
} from "@/types/content";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

type MicroCMSListResponse<T> = {
  contents: T[];
};

type MicroCMSSelectValue = string | string[] | undefined;

type MicroCMSFlatSpot = Omit<Partial<Spot>, "hazards" | "locationVisibility" | "photos"> & {
  id: string;
  hazards?: Spot["hazards"];
  genreName?: string;
  genreSlug?: string;
  latitude?: number;
  longitude?: number;
  municipalHazardUrl?: string;
  flood?: MicroCMSSelectValue | number;
  landslide?: MicroCMSSelectValue | number;
  tsunami?: MicroCMSSelectValue | number;
  stormSurge?: MicroCMSSelectValue | number;
  photos?: Array<string | { url: string }>;
  locationVisibility?: MicroCMSSelectValue;
};

export function microCMSApiUrl(domain: string, endpoint: string): URL | null {
  const validDomain = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(domain);
  const validEndpoint = /^[a-z0-9-]+$/.test(endpoint);
  if (!validDomain || !validEndpoint) return null;

  return new URL(`https://${domain}.microcms.io/api/v1/${endpoint}`);
}

async function fetchMicroCMSList<T>(endpoint: string, allowMissing = false): Promise<T[] | null> {
  if (!serviceDomain || !apiKey) return null;
  const url = microCMSApiUrl(serviceDomain, endpoint);
  if (!url) return null;

  const response = await fetch(url, {
    headers: {
      "X-MICROCMS-API-KEY": apiKey,
    },
    next: { revalidate: 300 },
  });

  if (allowMissing && response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`microCMS request failed: ${endpoint}`);
  }

  const data = (await response.json()) as MicroCMSListResponse<T>;
  return data.contents;
}

function selectValue(value: MicroCMSSelectValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function hazardRating(value: MicroCMSSelectValue | number): HazardRating {
  const selected = typeof value === "number" ? value : selectValue(value);
  if (selected === "unknown" || selected === "not_applicable") return selected;

  const numeric = Number(selected);
  return numeric >= 1 && numeric <= 5 ? (numeric as HazardRating) : "unknown";
}

function dateOnly(value: string | undefined): string {
  return value?.slice(0, 10) ?? "";
}

function httpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function validCoordinates(source: MicroCMSFlatSpot): Coordinates | null {
  const coordinates = source.coordinates ?? {
    latitude: source.latitude,
    longitude: source.longitude,
  };

  if (
    typeof coordinates.latitude !== "number" ||
    !Number.isFinite(coordinates.latitude) ||
    coordinates.latitude < -90 ||
    coordinates.latitude > 90 ||
    typeof coordinates.longitude !== "number" ||
    !Number.isFinite(coordinates.longitude) ||
    coordinates.longitude < -180 ||
    coordinates.longitude > 180
  ) {
    return null;
  }

  return coordinates as Coordinates;
}

function locationVisibility(
  value: MicroCMSSelectValue,
  hasValidCoordinates: boolean,
): LocationVisibility {
  const selected = selectValue(value);
  if (selected === "exact" && hasValidCoordinates) return "exact";
  if (selected === "approximate") return "approximate";
  return "municipality";
}

export function normalizeMicroCMSSpot(source: MicroCMSFlatSpot): Spot {
  const genre = source.genre ?? {
    id: `genre-${source.genreSlug ?? "other"}`,
    name: source.genreName ?? "その他",
    slug: source.genreSlug ?? "other",
  };
  const coordinates = validCoordinates(source);

  return {
    id: source.id,
    title: source.title ?? "無題",
    slug: source.slug ?? source.id,
    prefecture: source.prefecture ?? "",
    prefectureSlug: source.prefectureSlug ?? "",
    municipality: source.municipality ?? "",
    municipalitySlug: source.municipalitySlug ?? "",
    genre,
    body: source.body ?? "",
    photos: (source.photos ?? []).flatMap((photo) => {
      const normalized = httpUrl(typeof photo === "string" ? photo : photo.url);
      return normalized ? [normalized] : [];
    }),
    visitedAt: dateOnly(source.visitedAt),
    publishedAt: source.publishedAt ?? "",
    updatedAt: source.updatedAt ?? "",
    coordinates: coordinates ?? { latitude: 0, longitude: 0 },
    locationVisibility: locationVisibility(source.locationVisibility, coordinates !== null),
    officialUrl: httpUrl(source.officialUrl),
    hazardCheckedAt: dateOnly(source.hazardCheckedAt),
    hazardSourceUrl: httpUrl(source.hazardSourceUrl),
    municipalityHazardUrl: httpUrl(source.municipalityHazardUrl ?? source.municipalHazardUrl),
    hazardMemo: source.hazardMemo ?? "",
    hazards:
      source.hazards ??
      ({
        flood: hazardRating(source.flood),
        landslide: hazardRating(source.landslide),
        tsunami: hazardRating(source.tsunami),
        stormSurge: hazardRating(source.stormSurge),
      } as Spot["hazards"]),
    fieldTips: source.fieldTips ?? "",
  };
}

export async function getSpots(): Promise<Spot[]> {
  const microCMSSpots = await fetchMicroCMSList<MicroCMSFlatSpot>("spots");
  return microCMSSpots?.map(normalizeMicroCMSSpot) ?? spots;
}

export async function getRegions(): Promise<Region[]> {
  return (await fetchMicroCMSList<Region>("regions", true)) ?? regions;
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
