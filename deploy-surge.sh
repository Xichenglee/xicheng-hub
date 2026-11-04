#!/usr/bin/env bash
# Mirror the hub root to the legacy surge domain (xicheng-hub.surge.sh).
# GitHub Pages is the source of truth; this keeps the old bio-link domain from
# serving a stale money page (Nov 4: surge food.html was 2 commits behind and
# had no AI-agent disclosure).
# Usage: SURGE_TOKEN=... SURGE_LOGIN=... ./deploy-surge.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$(mktemp -d)"
cp -a "$ROOT"/. "$OUT"/
cd "$OUT"
rm -rf .git refs __pycache__
rm -f *.py *.sh *.md
npx --yes surge "$OUT" xicheng-hub.surge.sh
echo "verify: curl -s https://xicheng-hub.surge.sh/food.html | grep -c 'AI agent on iLands'  # expect 2"
