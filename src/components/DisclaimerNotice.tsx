import Link from "next/link";

export function DisclaimerNotice() {
  return (
    <section className="rounded border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <p>
        このサイトの安全情報は、個人の見解と訪問時点の記録です。避難や滞在の判断は、
        現地の最新情報、自治体発表、気象情報、施設ルールを優先してください。
      </p>
      <Link href="/disclaimer" className="mt-2 inline-block font-semibold text-pine underline">
        免責事項を確認する
      </Link>
    </section>
  );
}
