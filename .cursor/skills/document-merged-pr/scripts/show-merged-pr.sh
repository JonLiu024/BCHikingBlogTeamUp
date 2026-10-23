#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
PR="${1:-}"

if command -v gh >/dev/null 2>&1 && [[ -n "$PR" ]]; then
  gh pr view "$PR" --json number,title,mergedAt,baseRefName,headRefName,url,body
  echo "----- DIFF -----"
  gh pr diff "$PR"
  exit 0
fi

git fetch origin main --quiet || true

if [[ -n "$PR" ]]; then
  SHA="$(git log origin/main --grep="#${PR}\\b" -1 --format=%H || true)"
else
  SHA="$(git log origin/main -1 --format=%H)"
fi

if [[ -z "$SHA" ]]; then
  echo "No commit for that pull request was found on origin/main." >&2
  exit 1
fi

git show -s --format=fuller "$SHA"
echo "----- DIFF -----"
if git rev-parse --verify --quiet "${SHA}^2" >/dev/null; then
  git diff --find-renames "${SHA}^1" "${SHA}^2"
else
  git show --format= --find-renames "$SHA"
fi
