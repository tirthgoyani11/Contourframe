# Contourframe Studio 0.1.0-rc.1

Contourframe creates short illustrated map animations. This release candidate
ships one editable scene, **An Alpine Crossing**, with a camera move, a route,
and a Switzerland highlight. The terrain and boundary are schematic.

## Run locally

From this folder, run `python3 -m http.server 8080 --bind 127.0.0.1` and open
[the browser sample](http://localhost:8080/studio.html). Change the title, duration, or color,
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

## Deploy the original landing page

Run `npm run build` and deploy `dist/` to the existing Cloudflare Pages
project. The original landing page is served at `/`. **Open local studio**
opens `http://localhost:8000/studio` in the visitor's browser. The visitor must
start the full checkout's FastAPI server first. It serves the editor and API
from the same local origin, and SQLite and FFmpeg use the visitor's machine.
**Try the browser sample** opens the separate hosted sample at `/studio.html`.

```sh
npm run build
npx wrangler pages deploy dist --project-name contourframe-studio --branch main
```

## Automatic deployment from GitHub

The production site is [contourframe-studio.pages.dev](https://contourframe-studio.pages.dev/).
In the [Contourframe GitHub repository](https://github.com/tirthgoyani11/Contourframe),
open **Settings → Secrets and variables → Actions**. Add these values once:

| Type | Name | Value |
| --- | --- | --- |
| Variable | `CLOUDFLARE_ACCOUNT_ID` | ID of the Cloudflare account that owns the existing Pages project |
| Secret | `CLOUDFLARE_API_TOKEN` | An API token scoped to that account with Cloudflare Pages Edit permission |

The workflow tests and builds on pushes to `main`, uploads only `dist/` to
the existing Pages project, and checks that the public homepage links to the
local studio. To deploy the current commit, run **Deploy Contourframe to
Cloudflare Pages** from the GitHub Actions tab on `main`.
