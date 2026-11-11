# Contourframe Studio 0.1.0-rc.1

The first candidate includes a homepage with the Alpine Crossing MP4 and
a single-scene editor for changing the title, highlight color, and duration.
It supports local save, preview, and cancelable WebM export.

The release uses schematic terrain and one fixed route. Full geographic maps,
timeline authoring, AI, stickers, and 3D models belong to the larger local studio
and are outside this candidate. Browser recording requires MediaRecorder and
canvas capture support.

Before tagging, record the passing Fedora and Ubuntu browser checks and add the
owner-approved license. Once the candidate is committed in the release repository,
tag that commit with `git tag -a v0.1.0-rc.1 -m "Contourframe Studio 0.1.0-rc.1"`.
Use these notes for the GitHub prerelease.

## Verification status

On Fedora 44, all three scene tests passed. FFmpeg regenerated the homepage
demo and decoded the resulting five-second 960 × 540 H.264 MP4. The sandbox
blocks local TCP sockets, so browser checks remain pending on Fedora and Ubuntu.
