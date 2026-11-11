#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
temp_dir=$(mktemp -d)
trap 'rm -rf "$temp_dir"' EXIT
node scripts/render-demo.mjs "$temp_dir"
encoders=$(ffmpeg -hide_banner -encoders)
case "$encoders" in
  *libx264*) encoder=libx264 ;;
  *libopenh264*) encoder=libopenh264 ;;
  *) echo 'Install FFmpeg with libx264 or libopenh264.' >&2; exit 1 ;;
esac
ffmpeg -v error -y -framerate 24 -c:v librsvg -i "$temp_dir/frame-%04d.svg" \
  -an -c:v "$encoder" -threads 2 -pix_fmt yuv420p -movflags +faststart "$temp_dir/alpine-crossing.mp4"
mv "$temp_dir/alpine-crossing.mp4" assets/alpine-crossing.mp4
