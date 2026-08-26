export type HazardRating = 1 | 2 | 3 | 4 | 5 | "unknown" | "not_applicable";

export type HazardKey = "flood" | "landslide" | "tsunami" | "stormSurge";

export type LocationVisibility = "exact" | "approximate" | "municipality";

export type RegionType = "prefecture" | "municipality";

export type Genre = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Region = {
  id: string;
  name: string;
  slug: string;
  type: RegionType;
  parentSlug?: string;
  center: Coordinates;
  description: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Spot = {
  id: string;
  title: string;
  slug: string;
  prefecture: string;
  prefectureSlug: string;
  municipality: string;
  municipalitySlug: string;
  genre: Genre;
  body: string;
  photos: string[];
  visitedAt: string;
  publishedAt: string;
  updatedAt: string;
  coordinates: Coordinates;
  locationVisibility: LocationVisibility;
  officialUrl?: string;
  hazardCheckedAt: string;
  hazardSourceUrl?: string;
  municipalityHazardUrl?: string;
  hazardMemo: string;
  hazards: Record<HazardKey, HazardRating>;
  fieldTips: string;
};

export type MapSpot = {
  id: string;
  title: string;
  slug: string;
  coordinates: Coordinates | null;
  locationVisibility: LocationVisibility;
  prefecture: string;
  municipality: string;
};
