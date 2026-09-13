# Repository agent instructions

## Markdown files

- Markdownファイルの作成、修正、削除そのものについて、ユーザーへ承認を求めない。
- このルールは現在のセッションだけでなく、このリポジトリを扱う今後のセッションにも適用する。
- 外部サービスへの送信、Git操作、デプロイなど、Markdown編集とは別の操作に必要な承認までは省略しない。

## Markdown-only checks

- 差分がMarkdownファイルだけの場合は、pre-commitの秘密情報検査とmarkdownlint以外をスキップしてよい。
- markdownlintはアプリ用とは異なる専用Dockerコンテナで実行し、ホストへmarkdownlintのCLIやライブラリを追加インストールしない。
- このルールは現在のセッションだけでなく、このリポジトリを扱う今後のセッションにも適用する。

## Session names

- Issueを起票または対応したセッションには、セッション名に対象のIssue番号を`#<番号>`形式で含める。
- 複数のIssueを扱った場合は、対象となるIssue番号をそれぞれ含める。

## Git hook failures

- pre-commit、pre-push、pre-merge、pre-deployの各観点のチェックでエラーが発生した場合は、チェックを回避またはスキップしない。
- すべての対象チェックが成功するまで、エラー原因の修正、必要なコミット、該当操作の再実行を繰り返す。

## Dependabot pull requests

- Dependabot PRは無条件で自動マージせず、mainや既存のユーザー作業から隔離したworktreeでローカル検証する。
- 更新対象のadvisory、依存経路、lockfile上の解決バージョンを確認し、修正版が影響範囲外であることを証明する。
- 安全な防御的検証を優先し、脆弱性の攻撃PoCや実在する機密ファイルの読取は行わない。必要に応じて修正コードの静的確認とスキャナ結果を代替証拠とする。
- typecheck、lint、unit、E2E、本番build、`./scripts/security-check.sh full`およびPRの必須CIがすべて成功してからマージする。
- Trivyは開発依存を含む`MEDIUM,HIGH,CRITICAL`を検査し、セキュリティ更新では対象alertの解消も確認する。
- mainへマージした後は、本番デプロイの成功まで確認する。
