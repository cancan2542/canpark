import { createContentRepository } from "@/lib/content-repository";
import { fallbackRegions } from "@/lib/fallback-regions";
import { createMicroCMSContentSource } from "@/lib/microcms-content-source";
import type { FetchLike, MicroCMSConfig } from "@/lib/microcms";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
const microCMSConfig: MicroCMSConfig = { serviceDomain, apiKey };

const fetchAtBuildTime: FetchLike = (input, init) => fetch(input, init);

export { microCMSApiUrl } from "@/lib/microcms";
export {
  normalizeMicroCMSSpot,
  type MicroCMSFlatSpot,
} from "@/lib/content-normalizer";
export { toMapSpots } from "@/lib/content-repository";

const repository = createContentRepository({
  source: createMicroCMSContentSource({
    config: microCMSConfig,
    fetcher: fetchAtBuildTime,
    includeTestContent: !import.meta.env.PROD,
  }),
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
