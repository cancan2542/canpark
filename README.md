# Canpark

車中泊スポットと、訪問時点で確認した公式ハザード情報を掲載する静的サイトです。Astro、TypeScript、microCMSで構築し、Vercelへデプロイします。

公開URL: <https://canpark.blog>

## ローカル開発

Node.js依存はホストへインストールせず、Dockerコンテナ内で扱います。

```sh
docker compose up --build app
```

起動後は <http://127.0.0.1:4321> を開きます。`.env.local` がない、またはmicroCMSの値が空の場合はサンプルデータを使用します。

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

Vercelの環境変数へ `MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` を設定します。公開データはAstroのビルド時に取得されるため、microCMSで記事を公開・更新・削除しただけでは公開サイトは変わりません。

Vercel Project SettingsでDeploy Hook（例: `microcms-production`、対象ブランチ: `main`）を作成し、そのURLをmicroCMSのWebhookへ登録してください。microCMSからDeploy HookへPOSTされるとVercelが再ビルドし、更新後の静的ページを公開します。Deploy Hook URLは秘密情報として扱い、リポジトリやCMS本文へ記載しません。

障害時の切り戻しを含む詳細は [アーキテクチャ](docs/architecture.md) を参照してください。

## 地図データの出典

地図は国土交通省「国土数値情報（行政区域データ）」を加工して利用し、サイトの共通フッター等に出典と加工内容を表示します。地図内には出典文字を重ねません。
