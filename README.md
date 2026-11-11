# Contourframe Studio 0.1.0-rc.1

Contourframe creates short illustrated map animations. This release candidate
ships one editable scene, **An Alpine Crossing**, with a camera move, a route,
and a Switzerland highlight. The terrain and boundary are schematic.

## Run locally

From this folder, run `python3 -m http.server 8000 --bind 127.0.0.1` and open
[localhost:8000](http://localhost:8000/). Change the title, duration, or color,
select **Save**, then **Preview**. Export in a browser with WebM recording
support. Save stores settings in this browser. There is no database, tile cache,
AI key, or external asset request.

## Recreate the homepage MP4

With Node.js 22+ and FFmpeg installed, run `npm run demo` from this folder.
FFmpeg needs the librsvg decoder and either the libx264 or libopenh264 encoder.
The command renders `scene.js` to `assets/alpine-crossing.mp4`. The homepage
serves that file and the editor uses the same scene renderer.

## Verify the exact release folder

```sh
npm test
npm install --no-save --no-package-lock playwright@1.56.1
CHROME_BIN=/path/to/chrome-or-chromium node scripts/browser-check.mjs
```

The browser check uses a fresh profile at 390 px wide. It plays the homepage
MP4, saves and reloads an edit, cancels an export, retries, and plays the
downloaded WebM. The Fedora and Ubuntu workflow is included in this folder.
For format conversion, use `ffmpeg -i contourframe.webm -pix_fmt yuv420p contourframe.mp4`
with an FFmpeg build that supports H.264 encoding.

See [release notes](RELEASE_NOTES.md) and the [source inventory](PROVENANCE.md).
