import type { Spot } from "@/types/content";

export const fixtureSpots: Spot[] = [
  {
    title: "座標付きテストスポット",
    slug: "located-test-spot",
    prefecture: "山梨県",
    prefectureSlug: "yamanashi",
    municipality: "富士河口湖町",
    municipalitySlug: "fujikawaguchiko",
    genreName: "道の駅",
    body: "テスト用の記事本文です。",
    visitedAt: "2026-08-01",
    coordinates: { latitude: 35.5082, longitude: 138.7246 },
  },
  {
    title: "座標未取得のテストスポット",
    slug: "unlocated-test-spot",
    prefecture: "長野県",
    prefectureSlug: "nagano",
    municipality: "白馬村",
    municipalitySlug: "hakuba",
    genreName: "RVパーク",
    body: "テスト用の記事本文です。",
    visitedAt: "2026-08-03",
    coordinates: null,
  },
];
