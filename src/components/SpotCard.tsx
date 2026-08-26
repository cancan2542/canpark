import Link from "next/link";
import type { Spot } from "@/types/content";

type SpotCardProps = {
  spot: Spot;
};

export function SpotCard({ spot }: SpotCardProps) {
  return (
    <article className="rounded border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span>{spot.prefecture}</span>
        <span>/</span>
        <span>{spot.municipality}</span>
        <span className="rounded bg-mist px-2 py-0.5 text-ink">{spot.genre.name}</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-ink">
        <Link href={`/spots/${spot.slug}`} className="hover:text-pine">
          {spot.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-700">{spot.body}</p>
      <p className="mt-3 text-xs text-zinc-500">ハザード確認日: {spot.hazardCheckedAt}</p>
    </article>
  );
}
