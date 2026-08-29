import type { Metadata } from "next";
import Link from "next/link";
import { DisclaimerNotice } from "@/components/DisclaimerNotice";
import { SectionHeader } from "@/components/SectionHeader";
import { SiteMap } from "@/components/SiteMap";
import { SpotCard } from "@/components/SpotCard";
import { getPrefectures, getSpots, toMapSpots } from "@/lib/content";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [prefectures, spots] = await Promise.all([getPrefectures(), getSpots()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold text-pine">車中泊スポットとハザード確認メモ</p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            地図から、泊まりたい場所と避けたい条件を一緒に見る。
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-700">
            実際に訪れた車中泊スポットを、公式ハザードマップの確認結果と現地で見た道幅・標高感・周辺環境のメモつきで紹介します。
          </p>
        </div>
        <DisclaimerNotice />
      </section>

      <section className="mt-8">
        <SiteMap spots={toMapSpots(spots)} />
      </section>

      <section className="mt-10">
        <SectionHeader title="都道府県から探す" description="初期版は地域導線を中心に整備しています。" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {prefectures.map((prefecture) => (
            <Link
              key={prefecture.id}
              href={`/prefectures/${prefecture.slug}`}
              className="rounded border border-zinc-200 bg-white p-4 hover:border-pine"
            >
              <h3 className="font-semibold text-ink">{prefecture.name}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{prefecture.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="最新スポット" />
        <div className="grid gap-4 md:grid-cols-2">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </section>
    </div>
  );
}
