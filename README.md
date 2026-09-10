# Canpark

車中泊で訪れたスポットと旅行メモを掲載する静的サイトです。Astro、TypeScript、microCMSで構築し、Vercelへデプロイします。

公開URL: <https://canpark.blog>

## ローカル開発

Node.js依存はホストへインストールせず、Dockerコンテナ内で扱います。

```sh
docker compose up --build app
```

起動後は <http://127.0.0.1:4321> を開きます。起動前に公開コンテンツを `.generated/content.json` へ生成します。`.env.local` がない場合、記事は0件で表示されます（地域情報のみローカルデータを使用します）。

主な検証コマンドもDocker経由で実行します。

```sh
docker compose run --rm app pnpm typecheck
docker compose run --rm app pnpm lint
docker compose run --rm app pnpm test
docker compose run --rm app pnpm test:e2e
docker compose run --rm app pnpm build
```

本番相当の静的配信コンテナは次のコマンドで起動し、<http://127.0.0.1:8080> で確認します。

```sh
docker compose --profile production up --build prod
```

## microCMSとデプロイ

Vercelの環境変数へ `MICROCMS_SERVICE_DOMAIN`、`MICROCMS_API_KEY`、`GOOGLE_MAPS_API_KEY` を設定します。`pnpm build` のprebuild処理がmicroCMSの全公開データを取得し、Google Placesで座標を生成して `.generated/content.json` を作成します。AstroはこのJSONだけを読み、同じdeployment内で静的ページを生成します。生成JSONはビルド成果物でありGit管理しません。

コンテンツIDが `microcms-display-test-` で始まる記事は開発時の接続・描画確認専用です。productionビルドでは一覧と記事ページの生成対象から除外されます。

Vercel Project SettingsでDeploy Hook（例: `microcms-production`、対象ブランチ: `main`）を作成し、そのURLをmicroCMSのWebhookへ登録してください。microCMSからDeploy HookへPOSTされるとVercelが再ビルドし、更新後の静的ページを公開します。Deploy Hook URLは秘密情報として扱い、リポジトリやCMS本文へ記載しません。

spots APIのカラム構成と管理画面での変更手順は [microCMS spots運用手順](docs/microcms/README.md) を参照してください。

障害時の切り戻しを含む詳細は [アーキテクチャ](docs/architecture.md) を参照してください。

## 地図データの出典

地図は国土交通省「国土数値情報（行政区域データ）」を加工して利用し、サイトの共通フッター等に出典と加工内容を表示します。地図内には出典文字を重ねません。
