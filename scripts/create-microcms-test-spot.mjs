const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  console.error("MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.");
  process.exit(1);
}

const endpoint = `https://${serviceDomain}.microcms.io/api/v1/spots`;
const slug = "codex-microcms-connection-test-20260827";
const headers = {
  "Content-Type": "application/json",
  "X-MICROCMS-API-KEY": apiKey,
};

const query = new URLSearchParams({
  filters: `slug[equals]${slug}`,
  limit: "1",
});
const existingResponse = await fetch(`${endpoint}?${query}`, { headers });

if (!existingResponse.ok) {
  console.error(`microCMS lookup failed with HTTP ${existingResponse.status}.`);
  process.exit(1);
}

const existing = await existingResponse.json();
if (existing.contents?.[0]) {
  const article = existing.contents[0];
  console.log(
    JSON.stringify({ result: "already_exists", id: article.id, title: article.title, slug: article.slug }),
  );
  process.exit(0);
}

const article = {
  title: "microCMS接続テスト記事（2026-08-27）",
  slug,
  prefecture: "山梨県",
  prefectureSlug: "yamanashi",
  municipality: "富士河口湖町",
  municipalitySlug: "fujikawaguchiko",
  genreName: "接続テスト",
  genreSlug: "connection-test",
  body:
    "このコンテンツは、canparkのDocker開発環境からmicroCMSへの接続と画面描画を確認するためのテスト記事です。実在する車中泊スポットの利用可否や安全性を示すものではありません。",
  visitedAt: "2026-08-27T00:00:00.000Z",
  latitude: 35.4973,
  longitude: 138.7551,
  locationVisibility: ["exact"],
  hazardCheckedAt: "2026-08-27T00:00:00.000Z",
  hazardMemo: "接続テスト用データのため、実際のハザード評価は行っていません。",
  flood: ["unknown"],
  landslide: ["unknown"],
  tsunami: ["not_applicable"],
  stormSurge: ["not_applicable"],
  fieldTips: "描画確認専用の記事です。現地情報として利用しないでください。",
};

const createResponse = await fetch(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify(article),
});

if (!createResponse.ok) {
  const error = await createResponse.text();
  console.error(`microCMS create failed with HTTP ${createResponse.status}: ${error.slice(0, 300)}`);
  process.exit(1);
}

const created = await createResponse.json();
console.log(JSON.stringify({ result: "created", id: created.id, title: article.title, slug }));
