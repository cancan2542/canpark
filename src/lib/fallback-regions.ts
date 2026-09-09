import type { Region } from "@/types/content";

export const fallbackRegions: Region[] = [
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
