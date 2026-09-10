# 車中泊スポットブログ Architecture

## Architecture Summary

Astro + TypeScript + microCMSで静的サイトを生成し、Vercelで配信する。UIは必要な箇所だけクライアント側JavaScriptを読み込む。

開発・検証・依存更新はDockerコンテナ内で行い、ホストへNode.js依存をインストールしない。環境は `dev` と `prod` の2つとし、stagingは設けない。

## Stack

- Framework: Astro（static output）
- Language: TypeScript
- Package Manager: pnpm
- Build Runtime: Node.js 22
- Production Container: nginx-unprivileged（nonroot、digest固定）
- CMS: microCMS
- Hosting: Vercel
- Map: 国土数値情報由来のリポジトリ内SVG（外部タイル・WebGL・地図ライブラリ不使用）
- Unit/Integration Test: Vitest
- E2E Test: Playwright
- Formatter/Linter: ESLint + Prettier

## Environments

### dev

- `docker compose up --build app` でAstro開発サーバーを起動する。
- ブラウザから `http://127.0.0.1:4321` を開く。ポートはlocalhostだけへ公開する。
- `.env.local` をコンテナから読み込む。値がない場合、記事は0件とし、地域情報だけローカルデータへフォールバックする。
- `pnpm install`、Playwrightブラウザ取得、依存更新を含むNode.jsコマンドはすべてコンテナ内で実行する。

### prod

- Astroの `dist/` をVercelから静的配信する。
- productionへ反映するCMSコンテンツは公開済みの記事だけとする。
- microCMS更新時はVercel Deploy Hookを呼び、静的ページを再ビルドする。
- 本番相当の配信確認には `docker compose --profile production up --build prod` を使い、`http://127.0.0.1:8080` を開く。
- productionコンテナはread-only、nonroot、`no-new-privileges` で実行する。

### Environment Variables

- `MICROCMS_SERVICE_DOMAIN`
- `MICROCMS_API_KEY`
- `GOOGLE_MAPS_API_KEY`

秘密情報とVercel Deploy Hook URLはGit管理しない。Vercel CLIが生成する `.vercel/` もGit管理しない。旧Next.jsの `MICROCMS_PREVIEW_API_KEY` と `REVALIDATE_SECRET` はAstro SSGでは使用しない。

Vercel productionでは上記3環境変数をすべて必須とし、不足している場合は座標のないサイトを誤って公開せずbuildを失敗させる。ローカルでは未設定でも、記事0件と地域フォールバックを収録したJSONを生成できる。

## Data and Rendering Flow

1. `prebuild`でmicroCMSから全公開記事と地域マスターをページング取得する。
2. microCMSのコンテンツIDを記事slugにし、地域マスターから都道府県・市区町村slugを解決する。
3. 全記事をGoogle Places Text Searchで検索し、入力された都道府県・市区町村内の最上位候補から座標を生成する。
4. 表示に必要な記事・地域情報を `.generated/content.json` へアトミックに生成する。
5. Astroは外部APIへ接続せず生成JSONだけを読み、全静的HTMLを生成する。
6. Vercelまたはproductionコンテナが一つのdeploymentとして生成物を配信する。

microCMS取得または地域slug解決に失敗した場合はbuildを失敗させ、直前のproduction deploymentを維持する。座標検索だけ失敗した場合は記事を座標`null`で収録し、記事本文と一覧は公開する。地図ピンは表示せず、次回deployで再検索する。

都道府県ページのピンは地域内のおおよその位置を把握する案内として扱う。

## Map Architecture

全国地図と都道府県地図は、国土交通省「国土数値情報（行政区域データ）」を加工したSVGを使用する。MapLibre、外部地図タイル、WebGLは使用しない。

- 全国地図は都道府県を選択でき、hover/focus時に都道府県名を表示する。
- 都道府県地図は公開可能な記事スポットをピンで示す。
- ピンは上から落下する演出を行い、`prefers-reduced-motion: reduce` では演出を止める。
- ピンのhover/focus時にスポット名と記事リンクを表示し、キーボード・タッチ操作でも利用できるようにする。
- 地図自体には出典文字を重ねず、共通フッターまたは一般的な出典表示箇所にデータ名、提供者、加工した旨を記載する。

## Security Controls

Vercelとproductionコンテナの両方で次のレスポンスヘッダーを付与する。

- `Content-Security-Policy`: 既定の取得元をsame-originへ制限し、object・frame埋め込みを禁止する。
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY` とCSP `frame-ancestors 'none'`
- `Permissions-Policy`: camera、geolocation、microphone、payment、USBを無効化する。

正規ホストは `canpark.blog` とし、`www.canpark.blog` はパスとクエリを保ってHTTPSの正規ホストへ308リダイレクトする。Vercel preview URLやlocalhostは確認できるよう強制転送しない。

## Development Workflow

1. GitHub Issueへ目的、受け入れ条件、テスト観点を書く。
2. `main` から `feature/#<issueNo>` または `fix/#<issueNo>` を作る。
3. 先に失敗するテスト、または再現可能な検証観点を用意する。
4. 小さい単位で実装・コミットする。
5. Docker内で `typecheck`、`lint`、`test`、`test:e2e`、`build` を通す。
6. Pull RequestのCIとレビューを通し、`main` へマージする。
7. Vercel Git Integrationがproduction deploymentを作成する。

## Quality Gates and Supply-chain Checks

GitHub Actionsはpush、Pull Request、手動実行、毎週月曜9:17（JST）に次を実行する。

- TypeScript型チェック、lint、Vitest、Playwright、production build
- Gitleaksによる全Git履歴の秘密情報スキャン
- Trivyによる開発依存を含む依存関係とDocker設定のHigh/Critical検査
- productionコンテナのビルド、起動スモークテスト、脆弱性・秘密情報検査
- CodeQL `security-extended` によるJavaScript/TypeScript解析

ワークフロー権限は原則 `contents: read` とし、CodeQLだけ `security-events: write` を追加する。外部Actionとスキャナイメージはcommit SHAまたはdigestで固定する。npm、GitHub Actions、Dockerの更新はDependabotが週次確認する。

CodeQLはAstroコンポーネントのfrontmatterから生成されるJavaScript/TypeScriptを解析するが、`.astro`テンプレート全体の構文・表示挙動を単独では保証しない。その範囲は`astro check`、ESLintのAstro推奨ルール、desktop/mobileのPlaywright E2Eで補完する。

## Deployment and CMS Refresh

Production deployはVercel Git Integrationへ一本化し、GitHub Actionsからデプロイしない。`main` pushまたはmicroCMSのDeploy Hookで新しいdeploymentを作る。

microCMS側のWebhookは次のイベントでproduction用Deploy HookへPOSTする。

- 記事の公開
- 公開記事の更新
- 公開記事の削除・非公開化

Deploy Hookは署名検証を行う自前APIではなく、URLを知る者が実行できるVercelの秘密URLである。CMS管理者だけが閲覧できる場所に保存し、漏えい時はVercelで削除・再発行する。反映されない場合は、VercelのdeploymentログでCMS取得・ビルド失敗を確認し、原因解消後にDeploy Hookを再送する。

## Rollback

### アプリケーション変更を戻す

1. GitHubで原因コミットをrevertするPull Requestを作る（履歴のforce pushやresetはしない）。
2. 品質ゲート通過後に `main` へマージする。
3. Vercel Git Integrationによるproduction反映と主要ページを確認する。

緊急時はVercel Dashboardで直前の正常なdeploymentを選び、productionへPromoteして即時復旧する。その後、必ずGit側もrevertして次回deployで不具合が復活しないようにする。

### CMSコンテンツを戻す

1. microCMSで対象記事を直前の正しい内容へ戻すか、一時的に非公開にする。
2. production用Deploy Hookを実行する。
3. Vercelのビルド成功後、対象ページと一覧から反映を確認する。

## External Data and Attribution

地図境界は国土数値情報の利用条件に従い、共通フッター等へ出典と加工した旨を表示する。
