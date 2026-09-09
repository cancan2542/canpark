import type {
  Coordinates,
  HazardKey,
  HazardRating,
  LocationVisibility,
  Spot,
} from "@/types/content";

type MicroCMSSelectValue = string | string[] | undefined;
type MicroCMSHazards = Partial<
  Record<HazardKey, MicroCMSSelectValue | number>
>;

export type MicroCMSFlatSpot = Omit<
  Partial<Spot>,
  "hazards" | "locationVisibility" | "photos"
> & {
  id: string;
  hazards?: MicroCMSHazards;
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

function selectValue(value: MicroCMSSelectValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseHazardRating(
  value: MicroCMSSelectValue | number,
): HazardRating | undefined {
  const selected = typeof value === "number" ? value : selectValue(value);
  if (selected === "unknown" || selected === "not_applicable") return selected;

  if (typeof selected === "number") {
    return Number.isInteger(selected) && selected >= 1 && selected <= 5
      ? (selected as HazardRating)
      : undefined;
  }

  return selected !== undefined && /^[1-5]$/.test(selected)
    ? (Number(selected) as HazardRating)
    : undefined;
}

function hazardRating(
  nestedValue: MicroCMSSelectValue | number,
  flatValue?: MicroCMSSelectValue | number,
): HazardRating {
  return parseHazardRating(nestedValue) ?? parseHazardRating(flatValue) ?? "unknown";
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
    hazards: {
      flood: hazardRating(source.hazards?.flood, source.flood),
      landslide: hazardRating(source.hazards?.landslide, source.landslide),
      tsunami: hazardRating(source.hazards?.tsunami, source.tsunami),
      stormSurge: hazardRating(source.hazards?.stormSurge, source.stormSurge),
    },
    fieldTips: source.fieldTips ?? "",
  };
}
