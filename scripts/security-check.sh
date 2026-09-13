#!/bin/sh

set -eu

GITLEAKS_IMAGE="ghcr.io/gitleaks/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f"
TRIVY_IMAGE="aquasec/trivy:0.74.0@sha256:62b1e65e8869bc4b4c6aa4fa2b21595256c7c2f6018a9d9ad61caf87187c1969"
MARKDOWNLINT_IMAGE="davidanson/markdownlint-cli2:v0.23.2@sha256:839558fd0d36c46da0e01ea84fd1d20a2822b5a8a60c16dc9708f0bb7c9e903b"
LOCAL_IMAGE_TAG="canpark:security-check-$$"

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
archive_path=""
temporary_image=""

cleanup() {
  if [ -n "$archive_path" ]; then
    rm -f "$archive_path"
  fi

  if [ -n "$temporary_image" ]; then
    docker image rm "$temporary_image" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT HUP INT TERM

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is required to run security checks." >&2
    exit 1
  fi

  if ! docker info >/dev/null 2>&1; then
    echo "Docker is installed but the daemon is not available." >&2
    exit 1
  fi
}

scan_staged_secrets() {
  echo "==> Scanning staged changes for secrets"
  docker run --rm \
    --volume "$repo_root:/repo:ro" \
    --workdir /repo \
    "$GITLEAKS_IMAGE" \
    git --pre-commit --staged --config /repo/.gitleaks.toml --redact --no-banner
}

scan_repository_secrets() {
  echo "==> Scanning Git history for secrets"
  docker run --rm \
    --volume "$repo_root:/repo:ro" \
    "$GITLEAKS_IMAGE" \
    git /repo --config /repo/.gitleaks.toml --redact --no-banner
}

scan_working_tree_secrets() {
  echo "==> Scanning working tree for secrets"
  docker run --rm \
    --volume "$repo_root:/repo:ro" \
    "$GITLEAKS_IMAGE" \
    dir /repo --config /repo/.gitleaks.toml --redact --no-banner
}

scan_filesystem() {
  echo "==> Scanning dependencies and configuration"
  docker run --rm \
    --volume "$repo_root:/repo:ro" \
    --volume "trivy-cache:/root/.cache/trivy" \
    "$TRIVY_IMAGE" \
    fs --scanners vuln,misconfig --include-dev-deps \
    --skip-dirs /repo/node_modules \
    --skip-dirs /repo/.pnpm-store \
    --skip-dirs /repo/.next \
    --skip-dirs /repo/.astro \
    --skip-dirs /repo/dist \
    --severity HIGH,CRITICAL --exit-code 1 --quiet /repo
}

scan_markdown() {
  echo "==> Linting Markdown"
  docker run --rm \
    --volume "$repo_root:/workdir:ro" \
    "$MARKDOWNLINT_IMAGE" \
    "**/*.md" "**/*.markdown" "#node_modules" "#.git"
}

scan_image() {
  image_tag=$1
  archive_path=$(mktemp "${TMPDIR:-/tmp}/canpark-security-image.XXXXXX")

  echo "==> Exporting production image"
  docker image save --output "$archive_path" "$image_tag"

  echo "==> Scanning production image"
  docker run --rm \
    --volume "$archive_path:/scan/image.tar:ro" \
    --volume "trivy-cache:/root/.cache/trivy" \
    "$TRIVY_IMAGE" \
    image --input /scan/image.tar --scanners vuln,secret \
    --severity HIGH,CRITICAL --exit-code 1 --quiet

  rm -f "$archive_path"
  archive_path=""
}

run_full_scan() {
  scan_markdown
  scan_working_tree_secrets
  scan_repository_secrets
  scan_filesystem

  echo "==> Building production image"
  temporary_image=$LOCAL_IMAGE_TAG
  docker build --target runner --tag "$temporary_image" "$repo_root"
  scan_image "$temporary_image"
}

run_pre_push_scan() {
  scan_markdown
  scan_repository_secrets
  scan_filesystem
}

usage() {
  cat >&2 <<'EOF'
Usage: scripts/security-check.sh <pre-commit|pre-push|pre-merge|pre-deploy|markdown|staged|filesystem|repository|image|full> [mode-or-image-tag]

  pre-commit   Scan staged changes before creating a commit.
  pre-push     Lint Markdown, then scan Git history, dependencies, and configuration.
               Pass "markdown-only" to skip the non-Markdown scans.
  pre-merge    Run the complete scan before creating a local merge commit.
  pre-deploy   Run the complete scan as a manual deployment-readiness check.
  markdown     Lint all Markdown files.
  staged       Scan staged changes for secrets.
  filesystem   Scan dependencies and configuration for High/Critical issues.
  repository   Scan the complete Git history for secrets.
  image        Scan an existing production image (default: canpark:ci).
  full         Scan the working tree, repository, filesystem, and a locally built image.
EOF
  exit 2
}

require_docker

case "${1:-}" in
  pre-commit)
    [ "$#" -eq 1 ] || usage
    scan_staged_secrets
    ;;
  pre-push)
    [ "$#" -le 2 ] || usage
    case "${2:-full}" in
      markdown-only)
        scan_markdown
        ;;
      full)
        run_pre_push_scan
        ;;
      *)
        usage
        ;;
    esac
    ;;
  pre-merge|pre-deploy)
    [ "$#" -eq 1 ] || usage
    run_full_scan
    ;;
  markdown)
    [ "$#" -eq 1 ] || usage
    scan_markdown
    ;;
  staged)
    [ "$#" -eq 1 ] || usage
    scan_staged_secrets
    ;;
  filesystem)
    [ "$#" -eq 1 ] || usage
    scan_filesystem
    ;;
  repository)
    [ "$#" -eq 1 ] || usage
    scan_repository_secrets
    ;;
  image)
    [ "$#" -le 2 ] || usage
    scan_image "${2:-canpark:ci}"
    ;;
  full)
    [ "$#" -eq 1 ] || usage
    run_full_scan
    ;;
  *)
    usage
    ;;
esac
