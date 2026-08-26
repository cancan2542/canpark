# 車中泊ハザード検証ブログ Architecture

## Architecture Summary

Next.js App Router + TypeScript + microCMS + Vercel で構築する。

開発はローカル環境を汚さないためDockerコンテナ内で行う。

環境は `dev` と `prod` の2つにする。stagingは作らない。

地図UIはGoogle Mapsに近い操作感を優先し、MapLibre GL JSを採用する。背景地図は地理院タイルのラスタータイルを使う。

## Stack

- Framework: Next.js App Router
- Language: TypeScript
- Package Manager: pnpm
- Runtime: Node.js LTS
- CMS: microCMS
- Hosting: Vercel
- Map: MapLibre GL JS
- Base Map: 地理院タイル
- Styling: Tailwind CSS
- Unit/Integration Test: Vitest + React Testing Library
- E2E Test: Playwright
- Formatter/Linter: ESLint + Prettier

## Environments

### dev

- Docker ComposeでNext.js開発サーバーを起動する。
- `.env.local` はコンテナ内から読み込む。
- microCMSは本番と同じサービスを使い、下書き/非公開記事で開発確認する。
- ローカルに直接Node.js依存を入れない。
- `pnpm install`、Playwrightブラウザ取得、その他インストール系コマンドはすべてDockerコンテナ内で実行する。

### prod

- Vercelにデプロイする。
- microCMSの公開済み記事のみ表示する。
- microCMS更新時にVercelの再検証Webhookを叩く。

### Environment Variables

必要な環境変数。

- `MICROCMS_SERVICE_DOMAIN`
- `MICROCMS_API_KEY`
- `MICROCMS_PREVIEW_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `REVALIDATE_SECRET`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

秘密情報はGit管理しない。Vercel関連の値はGitHub Actions Secretsに設定する。

Vercel CLIでローカルリンクした場合に生成される `.vercel/` はGit管理しない。`projectId` と `orgId` はGitHub Actions Secretsへ登録する。

## Docker Development Flow

リポジトリに以下を用意する。

- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

基本コマンド。

- `docker compose up app`: 開発サーバー起動
- `docker compose run --rm app pnpm test`: 単体/統合テスト
- `docker compose run --rm app pnpm test:e2e`: E2Eテスト
- `docker compose run --rm app pnpm lint`: lint
- `docker compose run --rm app pnpm typecheck`: TypeScript型チェック
- `docker compose run --rm app pnpm build`: production build
- `docker run --rm -v <repo>:/app -w /app node:22-bookworm-slim corepack pnpm install`: lockfile生成/依存更新

Mac/WindowsのDocker開発ではファイル監視が不安定な場合があるため、必要に応じてpolling設定を使う。

## microCMS APIs

以下のAPIを作る。

- `spots`
- `regions`
- `genres`

Next.js側ではCMSレスポンスをそのまま画面に渡さず、表示用の型へ正規化する。

## Data Flow

正規化時に以下を処理する。

- `locationVisibility` に応じて地図表示座標を制御する
- ハザード未入力項目を `未確認` として扱う
- 外部URLがない場合はリンクを表示しない
- 写真がない場合は写真領域自体を省略する

## Rendering Strategy

トップ、都道府県、市区町村、スポット記事はSEO重視で静的生成またはISRにする。

地図コンポーネントはブラウザAPI/WebGL依存のためClient Componentに分離する。

React Server Componentsの細かい単体テストは避け、ロジックを純粋関数に切り出してVitestでテストする。

## Map Architecture

MapLibre GL JSをClient Component内で初期化する。

背景地図は地理院タイルのラスタータイルを使う。

地図には以下を表示する。

- 公開可能なスポットピン
- 都道府県/市区町村ページの表示範囲
- 地理院タイルの出典表記

非公式スポットで `locationVisibility` が `approximate` または `municipality` の場合、正確な座標ピンは表示しない。

## Development Workflow

Issue駆動で進める。

基本フロー。

1. GitHub Issueを作る
2. Issueに目的、受け入れ条件、テスト観点を書く
3. `main` から `feature/#<issueNo>` ブランチを切る
4. 先に失敗するテストまたは検証観点を書く
5. 実装する
6. `typecheck`、`lint`、`test`、`test:e2e`、`build` を通す
7. `main` へマージする
8. `main` をpushする
9. GitHub Actionsが品質ゲートを通した後、Vercel productionへdeployする

ブランチ命名。

- `feature/#<issueNo>`
- `fix/#<issueNo>`
- `docs/#<issueNo>`

コミットは小さく分ける。

- CMS型/データ取得
- UI
- 地図
- テスト
- ドキュメント

## TDD Policy

優先してテストを書く対象。

- CMSデータの正規化
- ハザード評価の表示変換
- 位置公開レベルによる座標制御
- 地域slug生成
- 記事一覧の絞り込み
- 主要ページの表示

React Server Componentsの画面全体保証はPlaywrightで行う。

## Quality Gates

mainに入れる前に以下を必須にする。

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`

CIでも同じコマンドを実行する。

## Deployment Flow

GitHub Actionsで `main` push時にproduction deployする。

Deploy jobはquality gate jobの成功後にだけ実行する。

Secrets更新後やVercel側の一時障害後に再実行できるよう、CI workflowは手動実行にも対応する。

Vercel CLIでproduction deployするため、GitHub Actions Secretsに以下を登録する。

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

microCMS更新時は `REVALIDATE_SECRET` で保護したrevalidate endpointを呼ぶ。

## External Data and Attribution

ハザード確認元は以下を基準にする。

- ハザードマップポータルサイト
- 自治体ハザードマップ

地理院タイルを表示する場合は、地図上または近接箇所に出典を表示する。

ハザードマップ情報を引用・加工する場合は、出典と加工した旨を明記する。
