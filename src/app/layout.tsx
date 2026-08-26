import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "canpark",
    template: "%s | canpark",
  },
  description: "車中泊旅行スポットとハザードマップ確認メモを紹介するブログ。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold text-pine">
              canpark
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-700">
              <Link href="/disclaimer" className="hover:text-pine">
                免責事項
              </Link>
              <a
                href="https://disaportal.gsi.go.jp/"
                className="hover:text-pine"
                rel="noreferrer"
                target="_blank"
              >
                ハザードマップ
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
