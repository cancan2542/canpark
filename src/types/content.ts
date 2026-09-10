export type RegionType = "prefecture" | "municipality";

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
  title: string;
  slug: string;
  prefecture: string;
  prefectureSlug: string;
  municipality: string;
  municipalitySlug: string;
  genreName: string;
  body: string;
  visitedAt: string;
  coordinates: Coordinates | null;
};

export type MapSpot = {
  title: string;
  slug: string;
  coordinates: Coordinates | null;
  prefecture: string;
  municipality: string;
};
