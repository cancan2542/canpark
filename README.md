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

Git hooksを有効にすると、週次cronに代わり変更のタイミングに合わせてセキュリティ検査を実行します。追加のライブラリやCLIはインストールせず、GitとDockerだけを使用します。ローカルの作業コピーごとに一度、次を実行してください。

```sh
./scripts/install-git-hooks.sh
```

| タイミング | 検査内容 |
| --- | --- |
| pre-commit | ステージ済み差分の秘密情報 |
| pre-push | 専用Dockerコンテナによるmarkdownlint、全Git履歴の秘密情報、開発依存を含む依存関係、Docker設定 |
| pre-merge | ローカルのmerge commit作成時は完全検査、Pull Requestではproduction imageとCodeQLを含む必須CI |
| pre-deploy | mainへのmerge前の必須CIとVercel build時の環境変数・CMSデータ検証。手動の完全検査は `./scripts/security-check.sh pre-deploy` |

push対象またはmerge commitの差分が `.md` または `.markdown` だけの場合、pre-commitの秘密情報検査とmarkdownlint以外をスキップする。Pull Request CIも `quality` でmarkdownlintだけを実行し、他のアプリ・セキュリティ検査をスキップする。差分を判定できない場合はすべて実行する。

作業ツリーと全Git履歴の秘密情報、依存関係・設定、production imageをまとめてローカル検査する場合は次を実行します。Codexでは`/skills`から`Security Check`を選ぶか、`$security-check`を指定して同じ検査を実行できます。

```sh
./scripts/security-check.sh full
```

本番相当の静的配信コンテナは次のコマンドで起動し、<http://127.0.0.1:8080> で確認します。

```sh
docker compose --profile production up --build prod
```

## microCMSとデプロイ

Vercelの環境変数へ `MICROCMS_SERVICE_DOMAIN`、`MICROCMS_API_KEY`、`GOOGLE_MAPS_API_KEY`、`GOOGLE_MAPS_EMBED_API_KEY` を設定します。`pnpm build` のprebuild処理がmicroCMSの全公開データを取得し、Google Placesで座標とPlace IDを生成して `.generated/content.json` を作成します。AstroはこのJSONだけを読み、同じdeployment内で静的ページを生成します。生成JSONはビルド成果物でありGit管理しません。

`GOOGLE_MAPS_API_KEY` はPlaces API (New) だけを許可するサーバー用キーです。`GOOGLE_MAPS_EMBED_API_KEY` はMaps Embed APIだけを許可する埋め込み専用キーとし、Google Cloud側で `https://canpark.blog/*` など利用するサイトのHTTPリファラー制限を設定してください。Embed APIの仕様上、後者は生成HTMLのiframe URLから閲覧可能ですが、リポジトリ、microCMS、生成JSONには保存しません。

コンテンツIDが `microcms-display-test-` で始まる記事は開発時の接続・描画確認専用です。productionビルドでは一覧と記事ページの生成対象から除外されます。

Vercel Project SettingsでDeploy Hook（例: `microcms-production`、対象ブランチ: `main`）を作成し、そのURLをmicroCMSのWebhookへ登録してください。microCMSからDeploy HookへPOSTされるとVercelが再ビルドし、更新後の静的ページを公開します。Deploy Hook URLは秘密情報として扱い、リポジトリやCMS本文へ記載しません。

spots APIのカラム構成と管理画面での変更手順は [microCMS spots運用手順](docs/microcms/README.md) を参照してください。

障害時の切り戻しを含む詳細は [アーキテクチャ](docs/architecture.md) を参照してください。

## 地図データの出典

地図は国土交通省「国土数値情報（行政区域データ）」を加工して利用し、サイトの共通フッター等に出典と加工内容を表示します。地図内には出典文字を重ねません。
