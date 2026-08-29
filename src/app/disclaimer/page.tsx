import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責事項",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold text-ink">免責事項</h1>
      <div className="mt-6 space-y-4 leading-8 text-zinc-700">
        <p>
          canparkに掲載する安全情報、ハザード確認、現地Tipsは、個人の見解と訪問時点の記録です。
        </p>
        <p>
          ハザード情報は確認日時点の内容をもとに整理しています。災害リスク、施設ルール、道路状況、気象条件は変化します。
        </p>
        <p>
          避難や滞在の判断は、現地の最新情報、自治体発表、気象情報、施設の案内、道路規制情報を必ず優先してください。
        </p>
      </div>
    </div>
  );
}
