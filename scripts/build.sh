#!/bin/sh
# Package the extension into dist/frame-capture-for-youtube-<version>.zip for the Chrome Web Store
set -e
cd "$(dirname "$0")/.."
version=$(sed -n 's/.*"version": "\(.*\)".*/\1/p' manifest.json)
out="dist/frame-capture-for-youtube-$version.zip"
mkdir -p dist
rm -f "$out"
zip -X -q -r "$out" manifest.json background.js content.js content.css options.html options.js icons -x '*.DS_Store'
echo "$out"
