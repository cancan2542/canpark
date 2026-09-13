import type { Coordinates, MapSpot, Spot } from "@/types/content";

export function getDisplayCoordinates(spot: Spot): Coordinates | null {
  return spot.coordinates;
}

export function toMapSpot(spot: Spot): MapSpot {
  return {
    title: spot.title,
    slug: spot.slug,
    coordinates: getDisplayCoordinates(spot),
    prefecture: spot.prefecture,
    municipality: spot.municipality,
  };
}

export function averageCoordinates(spots: MapSpot[]): Coordinates {
  const visible = spots.flatMap((spot) => (spot.coordinates ? [spot.coordinates] : []));

  if (visible.length === 0) {
    return { latitude: 36.2048, longitude: 138.2529 };
  }

  const totals = visible.reduce(
    (acc, coordinates) => ({
      latitude: acc.latitude + coordinates.latitude,
      longitude: acc.longitude + coordinates.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: totals.latitude / visible.length,
    longitude: totals.longitude / visible.length,
  };
}
