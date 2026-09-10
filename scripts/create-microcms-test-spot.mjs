const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

const validServiceDomain =
  serviceDomain && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(serviceDomain);

if (!validServiceDomain || !apiKey) {
  console.error("MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are required.");
  process.exit(1);
}

const endpoint = `https://${serviceDomain}.microcms.io/api/v1/spots`;
const contentId = "microcms-display-test-20260910";
const headers = {
  "Content-Type": "application/json",
  "X-MICROCMS-API-KEY": apiKey,
};

const existingResponse = await fetch(`${endpoint}/${contentId}`, { headers });

if (existingResponse.ok) {
  const article = await existingResponse.json();
  console.log(JSON.stringify({ result: "already_exists", id: article.id, title: article.title }));
  process.exit(0);
}

if (existingResponse.status !== 404) {
  console.error(`microCMS lookup failed with HTTP ${existingResponse.status}.`);
  process.exit(1);
}

const article = {
  title: "microCMS表示テスト記事（2026-09-09）",
  prefecture: "山梨県",
  municipality: "富士河口湖町",
  genreName: "接続テスト",
  body: "このコンテンツは、canparkのDocker開発環境からmicroCMSへの接続と画面描画を確認するためのテスト記事です。実在する車中泊スポットの利用可否や安全性を示すものではありません。",
  visitedAt: "2026-09-09T00:00:00.000Z",
};

const createResponse = await fetch(`${endpoint}/${contentId}?status=PUBLISH`, {
  method: "PUT",
  headers,
  body: JSON.stringify(article),
});

if (!createResponse.ok) {
  const error = await createResponse.text();
  console.error(
    `microCMS create failed with HTTP ${createResponse.status}: ${error.slice(0, 300)}`,
  );
  process.exit(1);
}

const created = await createResponse.json();
console.log(JSON.stringify({ result: "created", id: created.id, title: article.title }));
