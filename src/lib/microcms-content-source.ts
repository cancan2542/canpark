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
};

export function createMicroCMSContentSource({
  config,
  fetcher,
}: MicroCMSContentSourceOptions): ContentSource {
  return {
    async loadSpots() {
      const cmsSpots = await fetchMicroCMSList<MicroCMSFlatSpot>("spots", {
        config,
        fetcher,
      });
      return cmsSpots?.map(normalizeMicroCMSSpot) ?? null;
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
