import { formatHazardRating, hazardLabels, hazardTone } from "@/lib/hazards";
import type { HazardKey, HazardRating } from "@/types/content";

const hazardOrder: HazardKey[] = ["flood", "landslide", "tsunami", "stormSurge"];

type HazardRatingsProps = {
  hazards: Record<HazardKey, HazardRating>;
};

export function HazardRatings({ hazards }: HazardRatingsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {hazardOrder.map((key) => (
        <div key={key} className="rounded border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">{hazardLabels[key]}</p>
          <p
            className={`mt-2 inline-flex rounded px-2.5 py-1 text-sm font-semibold ${hazardTone(
              hazards[key],
            )}`}
          >
            {formatHazardRating(hazards[key])}
          </p>
        </div>
      ))}
    </div>
  );
}
