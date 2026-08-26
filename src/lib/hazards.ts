import type { HazardKey, HazardRating } from "@/types/content";

export const hazardLabels: Record<HazardKey, string> = {
  flood: "洪水",
  landslide: "土砂災害",
  tsunami: "津波",
  stormSurge: "高潮",
};

export function formatHazardRating(rating: HazardRating): string {
  if (rating === "unknown") return "未確認";
  if (rating === "not_applicable") return "該当なし";

  const labels: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: "1 低リスク",
    2: "2 やや低リスク",
    3: "3 注意",
    4: "4 高リスク",
    5: "5 非常に高リスク",
  };

  return labels[rating];
}

export function hazardTone(rating: HazardRating): string {
  if (rating === "unknown" || rating === "not_applicable") return "bg-zinc-100 text-zinc-700";
  if (rating <= 2) return "bg-emerald-100 text-emerald-900";
  if (rating === 3) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
}
