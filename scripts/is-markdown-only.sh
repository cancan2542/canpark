#!/bin/sh

set -eu

if [ "$#" -eq 1 ] && [ "$1" = "--cached" ]; then
  git diff --cached --quiet && exit 1
  git diff --cached --quiet -- . \
    ':(exclude,glob)**/*.md' \
    ':(exclude,glob)**/*.markdown'
  exit $?
fi

[ "$#" -eq 2 ] || exit 1

base_revision=$1
head_revision=$2

git cat-file -e "$base_revision^{commit}" 2>/dev/null || exit 1
git cat-file -e "$head_revision^{commit}" 2>/dev/null || exit 1

# No diff is not a Markdown-only diff. Callers must use the full, safe path.
git diff --quiet "$base_revision" "$head_revision" && exit 1

git diff --quiet "$base_revision" "$head_revision" -- . \
  ':(exclude,glob)**/*.md' \
  ':(exclude,glob)**/*.markdown'
