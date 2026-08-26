import type { Genre, Region, Spot } from "@/types/content";

export const genres: Genre[] = [
  {
    id: "genre-roadside-station",
    name: "道の駅",
    slug: "roadside-station",
    description: "休憩施設を中心にした車中泊候補地。",
  },
  {
    id: "genre-rv-park",
    name: "RVパーク",
    slug: "rv-park",
    description: "車中泊を公式に想定した有料施設。",
  },
];

export const regions: Region[] = [
  {
    id: "region-yamanashi",
    name: "山梨県",
    slug: "yamanashi",
    type: "prefecture",
    center: { latitude: 35.6639, longitude: 138.5684 },
    description: "富士山麓や甲府盆地を中心に、標高差と水害リスクを見比べたい地域。",
  },
  {
    id: "region-fujikawaguchiko",
    name: "富士河口湖町",
    slug: "fujikawaguchiko",
    type: "municipality",
    parentSlug: "yamanashi",
    center: { latitude: 35.4973, longitude: 138.7551 },
    description: "湖畔、観光地、山麓道路が近く、季節と天候で滞在感が変わりやすい地域。",
  },
  {
    id: "region-nagano",
    name: "長野県",
    slug: "nagano",
    type: "prefecture",
    center: { latitude: 36.6513, longitude: 138.181 },
    description: "山間部が多く、土砂災害や冬季道路条件を意識したい地域。",
  },
  {
    id: "region-hakuba",
    name: "白馬村",
    slug: "hakuba",
    type: "municipality",
    parentSlug: "nagano",
    center: { latitude: 36.6982, longitude: 137.8619 },
    description: "山岳観光の拠点。谷筋の道路や降雪時の動きやすさを確認したい地域。",
  },
];

export const spots: Spot[] = [
  {
    id: "spot-katsuyama",
    title: "道の駅 かつやま",
    slug: "michi-no-eki-katsuyama",
    prefecture: "山梨県",
    prefectureSlug: "yamanashi",
    municipality: "富士河口湖町",
    municipalitySlug: "fujikawaguchiko",
    genre: genres[0],
    body:
      "河口湖の西側にある休憩スポット。湖畔に近く景色は良い一方で、悪天候時は水辺に近いことを意識して長居しない判断も必要だと感じた。",
    photos: [],
    visitedAt: "2026-05-18",
    publishedAt: "2026-08-26",
    updatedAt: "2026-08-26",
    coordinates: { latitude: 35.5082, longitude: 138.7246 },
    locationVisibility: "exact",
    officialUrl: "https://www.ktr.mlit.go.jp/honkyoku/road/Michi-no-Eki/station/yama_katuyama/",
    hazardCheckedAt: "2026-08-26",
    hazardSourceUrl: "https://disaportal.gsi.go.jp/",
    municipalityHazardUrl: "https://www.town.fujikawaguchiko.lg.jp/",
    hazardMemo: "湖畔に近い立地のため、水害情報と気象情報を滞在前に確認したい。",
    hazards: {
      flood: 3,
      landslide: 2,
      tsunami: "not_applicable",
      stormSurge: "not_applicable",
    },
    fieldTips:
      "前面道路は比較的分かりやすい。観光地に近く人の気配はあるが、湖畔側に寄りすぎない駐車位置を選びたい。",
  },
  {
    id: "spot-hakuba",
    title: "白馬村 山麓エリアの休憩地点",
    slug: "hakuba-mountain-base",
    prefecture: "長野県",
    prefectureSlug: "nagano",
    municipality: "白馬村",
    municipalitySlug: "hakuba",
    genre: genres[1],
    body:
      "山の近さを強く感じるエリア。晴天時は快適だが、強雨や降雪時は谷筋の道路条件と迂回路を先に見ておきたい。",
    photos: [],
    visitedAt: "2026-07-04",
    publishedAt: "2026-08-26",
    updatedAt: "2026-08-26",
    coordinates: { latitude: 36.6987, longitude: 137.8608 },
    locationVisibility: "approximate",
    hazardCheckedAt: "2026-08-26",
    hazardSourceUrl: "https://disaportal.gsi.go.jp/",
    municipalityHazardUrl: "https://www.vill.hakuba.lg.jp/",
    hazardMemo: "土砂災害警戒区域と道路規制情報をセットで確認したい。",
    hazards: {
      flood: 2,
      landslide: 4,
      tsunami: "not_applicable",
      stormSurge: "not_applicable",
    },
    fieldTips:
      "山側の天候変化が早い。夜間に細い道へ入り込むより、明るいうちに退出ルートを確認しておく方が安心。",
  },
];
