import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/SectionHeader";
import { SiteMap } from "@/components/SiteMap";
import { SpotCard } from "@/components/SpotCard";
import {
  getMunicipalities,
  getRegionBySlug,
  getSpotsByMunicipality,
  toMapSpots,
} from "@/lib/content";

type MunicipalityPageProps = {
  params: Promise<{ prefecture: string; municipality: string }>;
};

export async function generateStaticParams() {
  const prefectures = ["yamanashi", "nagano"];
  const params = await Promise.all(
    prefectures.map(async (prefecture) => {
      const municipalities = await getMunicipalities(prefecture);
      return municipalities.map((municipality) => ({
        prefecture,
        municipality: municipality.slug,
      }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({ params }: MunicipalityPageProps): Promise<Metadata> {
  const { prefecture, municipality } = await params;
  const region = await getRegionBySlug(municipality);

  return {
    title: region ? `${region.name}の車中泊スポット` : "市区町村",
    alternates: {
      canonical: `/prefectures/${prefecture}/${municipality}`,
    },
  };
}

export default async function MunicipalityPage({ params }: MunicipalityPageProps) {
  const { prefecture, municipality } = await params;
  const [prefectureRegion, municipalityRegion, spots] = await Promise.all([
    getRegionBySlug(prefecture),
    getRegionBySlug(municipality),
    getSpotsByMunicipality(municipality),
  ]);

  if (!prefectureRegion || !municipalityRegion) notFound();

  const checkedCount = spots.filter((spot) => Boolean(spot.hazardCheckedAt)).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-zinc-500">{prefectureRegion.name}</p>
      <h1 className="mt-2 text-4xl font-bold text-ink">{municipalityRegion.name}</h1>
      <p className="mt-3 max-w-3xl leading-7 text-zinc-700">{municipalityRegion.description}</p>
      <p className="mt-3 text-sm text-pine">ハザード確認済みスポット: {checkedCount}件</p>

      <section className="mt-8">
        <SiteMap spots={toMapSpots(spots)} zoom={11} />
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
