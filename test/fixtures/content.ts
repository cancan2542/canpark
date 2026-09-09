import type { Genre, Spot } from "@/types/content";

const genres: Genre[] = [
  {
    id: "genre-roadside-station",
    name: "道の駅",
    slug: "roadside-station",
  },
  {
    id: "genre-rv-park",
    name: "RVパーク",
    slug: "rv-park",
  },
];

export const fixtureSpots: Spot[] = [
  {
    id: "spot-exact",
    title: "公開地点のテストスポット",
    slug: "exact-test-spot",
    prefecture: "山梨県",
    prefectureSlug: "yamanashi",
    municipality: "富士河口湖町",
    municipalitySlug: "fujikawaguchiko",
    genre: genres[0],
    body: "テスト用の記事本文です。",
    photos: [],
    visitedAt: "2026-08-01",
    publishedAt: "2026-08-02",
    updatedAt: "2026-08-02",
    coordinates: { latitude: 35.5082, longitude: 138.7246 },
    locationVisibility: "exact",
    hazardCheckedAt: "2026-08-02",
    hazardMemo: "テスト用のメモです。",
    hazards: {
      flood: 3,
      landslide: 2,
      tsunami: "not_applicable",
      stormSurge: "not_applicable",
    },
    fieldTips: "テスト用の現地情報です。",
  },
  {
    id: "spot-approximate",
    title: "概略地点のテストスポット",
    slug: "approximate-test-spot",
    prefecture: "長野県",
    prefectureSlug: "nagano",
    municipality: "白馬村",
    municipalitySlug: "hakuba",
    genre: genres[1],
    body: "テスト用の記事本文です。",
    photos: [],
    visitedAt: "2026-08-03",
    publishedAt: "2026-08-04",
    updatedAt: "2026-08-04",
    coordinates: { latitude: 36.6987, longitude: 137.8608 },
    locationVisibility: "approximate",
    hazardCheckedAt: "2026-08-04",
    hazardMemo: "テスト用のメモです。",
    hazards: {
      flood: 2,
      landslide: 4,
      tsunami: "not_applicable",
      stormSurge: "not_applicable",
    },
    fieldTips: "テスト用の現地情報です。",
  },
];
