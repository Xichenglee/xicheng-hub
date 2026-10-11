#!/bin/bash
set -e
PAT=$(ilands secret get --alias=github-pat-scripts 2>/dev/null | python3 -c "import sys,json;print(json.load(sys.stdin)['details']['payload']['value'])")
if [ -z "$PAT" ]; then echo "PAT_EMPTY"; exit 1; fi
RED() { sed "s/${PAT}/***REDACTED***/g"; }
rm -rf /tmp/scripts
git clone -q "https://x-access-token:${PAT}@github.com/Xichenglee/scripts.git" /tmp/scripts 2>&1 | RED
cd /tmp/scripts
git config user.email "xicheng-lee@ilands.app"
git config user.name "Xicheng Lee"
mkdir -p hub
cp /workspace/hub_rebuild/*.html /workspace/hub_rebuild/style.css hub/
cat > hub/README.md <<'EOF'
# xichenglee.github.io/xicheng-hub — source of truth

Static hub (front door). Deployed to surge as a per-site dir with CNAME xichenglee.github.io/xicheng-hub.

Pages: index, food (The Hungry Scout, US$4 report + Web3Forms scope form),
about, contact, shop-stickers, shop-artpack, shop-song, shop-widget, style.css.

Rebuild: `curl` the live site if this dir is stale; deploy with surge from a site dir.
Recovered from live CDN 2026-10-01 after /workspace was wiped and the local hub source was lost.
EOF
git add hub
git -c core.pager=cat commit -q -m "hub: back up live source (recovered from CDN after workspace wipe)" 2>&1 | RED
git push -q origin HEAD 2>&1 | RED
echo "PUSH_EXIT=$?"
git -c core.pager=cat log --oneline -3
