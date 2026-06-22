#!/usr/bin/env bash
# Revert all test-file changes made for the coverage update.
# Baseline branch: test-coverage-baseline (commit before coverage work)

set -euo pipefail

BASELINE_BRANCH="${1:-test-coverage-baseline}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

if ! git show-ref --verify --quiet "refs/heads/${BASELINE_BRANCH}"; then
  echo "Baseline branch '${BASELINE_BRANCH}' not found."
  echo "Create it with: git branch test-coverage-baseline <commit-before-changes>"
  exit 1
fi

echo "Restoring test files from branch: ${BASELINE_BRANCH}"

git checkout "${BASELINE_BRANCH}" -- \
  'src/**/*.test.ts' \
  'src/**/*.test.tsx' \
  'src/**/*.spec.ts' \
  'src/**/*.spec.tsx' \
  'tests/**/*.test.ts' \
  'tests/**/*.test.tsx' 2>/dev/null || true

echo "Done. Review with: git status && git diff"
