import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { HazardRatings } from "@/components/HazardRatings";
import { SectionHeader } from "@/components/SectionHeader";
import { SiteMap } from "@/components/SiteMap";
import { getSpotBySlug, getSpots, toMapSpots } from "@/lib/content";

type SpotPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const spots = await getSpots();
  return spots.map((spot) => ({ slug: spot.slug }));
}

export async function generateMetadata({ params }: SpotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  return {
    title: spot ? `${spot.title}の車中泊メモ` : "スポット",
    description: spot?.body,
  };
}

export default async function SpotPage({ params }: SpotPageProps) {
  const { slug } = await params;
  const spot = await getSpotBySlug(slug);

  if (!spot) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span>{spot.prefecture}</span>
        <span>/</span>
        <span>{spot.municipality}</span>
        <span className="rounded bg-mist px-2 py-0.5 text-ink">{spot.genre.name}</span>
      </div>
      <h1 className="mt-3 text-4xl font-bold text-ink">{spot.title}</h1>
      <p className="mt-3 text-sm text-zinc-500">
        訪問日: {spot.visitedAt} / ハザード確認日: {spot.hazardCheckedAt}
      </p>

      <section className="mt-8">
        <SiteMap spots={toMapSpots([spot])} zoom={13} />
      </section>

      <section className="mt-8">
        <SectionHeader title="旅行メモ" />
        <p className="whitespace-pre-line text-base leading-8 text-zinc-700">{spot.body}</p>
      </section>

      <section className="mt-8">
        <SectionHeader
          title="ハザード確認"
          description="危険度は確認時点の公式ハザード情報をもとにした個人の整理です。"
        />
        <HazardRatings hazards={spot.hazards} />
        <p className="mt-4 text-sm leading-6 text-zinc-700">{spot.hazardMemo}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {spot.hazardSourceUrl ? (
            <a className="font-semibold text-pine underline" href={spot.hazardSourceUrl} target="_blank" rel="noreferrer">
              ハザードマップポータルサイト
            </a>
          ) : null}
          {spot.municipalityHazardUrl ? (
            <a className="font-semibold text-pine underline" href={spot.municipalityHazardUrl} target="_blank" rel="noreferrer">
              自治体情報
            </a>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader title="現地Tips" />
        <p className="whitespace-pre-line rounded border border-zinc-200 bg-white p-4 leading-7 text-zinc-700">
          {spot.fieldTips}
        </p>
      </section>

      <section className="mt-8">
        <DisclaimerNotice />
      </section>
    </article>
  );
}
