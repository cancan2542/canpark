import { createContentRepository } from "@/lib/content-repository";
import { fallbackRegions } from "@/lib/fallback-regions";
import { createGeneratedContentSource } from "@/lib/generated-content-source";
export { toMapSpots } from "@/lib/content-repository";

const repository = createContentRepository({
  source: createGeneratedContentSource(),
  fallbackSpots: [],
  fallbackRegions,
});

export const getSpots = repository.getSpots;
export const getRegions = repository.getRegions;
export const getSpotBySlug = repository.getSpotBySlug;
export const getPrefectures = repository.getPrefectures;
export const getMunicipalities = repository.getMunicipalities;
export const getRegionBySlug = repository.getRegionBySlug;
export const getSpotsByPrefecture = repository.getSpotsByPrefecture;
export const getSpotsByMunicipality = repository.getSpotsByMunicipality;
