# microCMS spots運用手順

## 管理するカラム

`spots` APIでは、次の6カラムだけを管理する。

- 基本情報: `title`, `prefecture`, `municipality`, `genreName`
- 記事: `body`, `visitedAt`

詳細なフィールド種別と必須設定は [spots-schema.json](spots-schema.json) を正とする。`id`, `createdAt`, `updatedAt`, `publishedAt`, `revisedAt` はmicroCMSが自動付与するため、独自カラムとして作成しない。

記事URLにはmicroCMSの`id`を使う。`prefectureSlug`と`municipalitySlug`は地域マスターから、緯度・経度はデプロイ時のGoogle Places検索から生成するため、記事編集画面では入力しない。

## 手動更新が必要なAPIスキーマ

- `spots`: この変更の適用時に手動更新が必要。上記6カラム以外を削除する。
- `regions`: 既存スキーマの変更は不要。記事で初めて扱う都道府県・市区町村だけ、公開前に地域マスターへ登録する。`regions` API自体がない環境では、リポジトリの `data/regions.json` を更新する。
- その他のAPI: この変更に伴う更新は不要。

## 既存APIを整理する手順

1. microCMS管理画面で `spots` の記事件数が0件であることを確認する。記事が存在していても、削除対象カラムの内容は移行しない。
2. `spots` の「API設定」→「APIスキーマ」から、変更前のスキーマJSONをエクスポートして控える。
3. アプリケーション側の変更を先にデプロイする。
4. APIスキーマから次のカラムを削除する。
   - `slug`, `prefectureSlug`, `municipalitySlug`
   - `latitude`, `longitude`
   - `locationVisibility`
   - `genreSlug`, `officialUrl`
   - `hazardCheckedAt`, `hazardSourceUrl`, `municipalHazardUrl`, `hazardMemo`
   - `flood`, `landslide`, `tsunami`, `stormSurge`
   - `fieldTips`
   - 存在する場合は `photos` など、管理対象6カラム以外の独自カラム
5. `spots-schema.json` と同じフィールドID、種類、必須設定になっていることを確認して保存する。
6. Deploy HookによるVercelの再ビルドが成功したことを確認し、トップ、地域ページ、スポット記事を確認する。

全記事を座標検索する。入力した都道府県・市区町村内の最上位候補を使い、都道府県ページでは案内用のピンを表示する。Google Placesが候補を返さない場合や一時的に失敗した場合でも記事は公開し、地図ピンだけ表示しない。次のデプロイで再検索する。

スキーマのエクスポート方法は [microCMS公式ドキュメント](https://document.microcms.io/manual/export-and-import-api-schema) を参照する。
