#!/bin/sh
# Render the Chrome Web Store images in store/ from their HTML sources with headless Chrome
set -e
cd "$(dirname "$0")/../store"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
for spec in screenshot-1:1280,800 screenshot-2:1280,800 promo-small:440,280 promo-marquee:1400,560; do
  name=${spec%%:*}
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size="${spec#*:}" --allow-file-access-from-files --virtual-time-budget=2000 \
    --screenshot="$PWD/$name.png" "file://$PWD/$name.html" 2>/dev/null
  echo "store/$name.png"
done
