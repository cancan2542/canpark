import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/SectionHeader";
import { SiteMap } from "@/components/SiteMap";
import { SpotCard } from "@/components/SpotCard";
import {
  getMunicipalities,
  getPrefectures,
  getRegionBySlug,
  getSpotsByPrefecture,
  toMapSpots,
} from "@/lib/content";

type PrefecturePageProps = {
  params: Promise<{ prefecture: string }>;
};

export async function generateStaticParams() {
  const prefectures = await getPrefectures();
  return prefectures.map((prefecture) => ({ prefecture: prefecture.slug }));
}

export async function generateMetadata({ params }: PrefecturePageProps): Promise<Metadata> {
  const { prefecture } = await params;
  const region = await getRegionBySlug(prefecture);

  return {
    title: region ? `${region.name}の車中泊スポット` : "都道府県",
    alternates: {
      canonical: `/prefectures/${prefecture}`,
    },
  };
}

export default async function PrefecturePage({ params }: PrefecturePageProps) {
  const { prefecture } = await params;
  const [region, municipalities, spots] = await Promise.all([
    getRegionBySlug(prefecture),
    getMunicipalities(prefecture),
    getSpotsByPrefecture(prefecture),
  ]);

  if (!region) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-zinc-500">都道府県</p>
      <h1 className="mt-2 text-4xl font-bold text-ink">{region.name}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-zinc-700">{region.description}</p>

      <section className="mt-8">
        <SiteMap spots={toMapSpots(spots)} zoom={7} />
      </section>

      <section className="mt-10">
        <SectionHeader title="市区町村" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {municipalities.map((municipality) => (
            <Link
              key={municipality.id}
              href={`/prefectures/${prefecture}/${municipality.slug}`}
              className="rounded border border-zinc-200 bg-white p-4 hover:border-pine"
            >
              <h2 className="font-semibold text-ink">{municipality.name}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{municipality.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="スポット" />
        <div className="grid gap-4 md:grid-cols-2">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </section>
    </div>
  );
}
