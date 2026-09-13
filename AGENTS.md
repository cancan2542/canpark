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
