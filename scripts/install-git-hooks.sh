#!/bin/sh

set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

git -C "$repo_root" config --local core.hooksPath .githooks
echo "Git hooks enabled from .githooks"
