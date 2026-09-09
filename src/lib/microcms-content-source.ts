import {
  normalizeMicroCMSSpot,
  type MicroCMSFlatSpot,
} from "@/lib/content-normalizer";
import {
  fetchMicroCMSList,
  type FetchLike,
  type MicroCMSConfig,
} from "@/lib/microcms";
import type { ContentSource } from "@/lib/content-repository";
import type { Region } from "@/types/content";

type MicroCMSContentSourceOptions = {
  config: MicroCMSConfig;
  fetcher: FetchLike;
  includeTestContent?: boolean;
};

const TEST_CONTENT_GENRE_SLUG = "connection-test";

export function createMicroCMSContentSource({
  config,
  fetcher,
  includeTestContent = true,
}: MicroCMSContentSourceOptions): ContentSource {
  return {
    async loadSpots() {
      const cmsSpots = await fetchMicroCMSList<MicroCMSFlatSpot>("spots", {
        config,
        fetcher,
      });
      const spots = cmsSpots?.map(normalizeMicroCMSSpot) ?? null;
      if (!spots || includeTestContent) return spots;

      return spots.filter((spot) => spot.genre.slug !== TEST_CONTENT_GENRE_SLUG);
    },
    loadRegions() {
      return fetchMicroCMSList<Region>("regions", {
        config,
        fetcher,
        allowMissing: true,
      });
    },
  };
}
