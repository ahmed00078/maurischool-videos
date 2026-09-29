# maurischool-videos — working notes

Remotion (React) videos for MauriSchool. Read `README.md` first: layout, recipes, rules.

## Conventions

- Reuse and extend `src/shared/`; a video never imports from another video. A screen or effect
  one video needs is probably useful to the next: put it in the kit.
- A video lives in `src/videos/<name>/` (code), `public/<name>/` (assets) and, if it has
  one-off tools, `scripts/<name>/`. Composition ids are prefixed by the video and grouped in a
  `<Folder>` named after it.
- Time scenes with `useBeat()` / `useMarks()`, never raw frame numbers that ignore the scene's lead.
- Interface wording on the phone is verbatim from the MauriSchool app (`mobile_app/src/i18n`,
  `backend/app/core/notification_i18n.py`); video copy (headlines) lives in the video's `copy.ts`.
  Data is invented (`shared/demo.ts`).
- Every change is checked in French and Arabic (RTL), light and dark where relevant, and against
  the Reels/TikTok safe zones.
- Commits: English, imperative, `type(scope): description`; no Co-Authored-By trailer.

## Verify by looking

Type-check (`npm run typecheck`), then render what changed and look at it:
`npx remotion still <id> out/x.jpg --frame=N --scale=0.4`, or render the video and pull frames with
`scripts/contact-sheet.mjs`. Report what was seen, not what should have happened.

## Gotchas learned the hard way

- Remotion's bundled ffmpeg (`node_modules/@remotion/compositor-*/ffmpeg(.exe)`) has few video
  filters (`scale`, `trim`) but the audio ones Remotion needs (`atempo`, `amix`, `volume`…), and
  WAV/PNG/MJPEG but no raw PCM muxer. Decode audio to a WAV file, not a pipe.
- Fonts come from Google Fonts at render time; a transient TLS error once failed a whole render.
  Pipe long renders through `set -o pipefail`, or a failed render looks successful.
- `<Sequence playbackRate>` speeds everything inside (fractional frames, smooth), but nested
  sequences are clipped against the composition's duration in unscaled frames: keep the full
  length and render a `--frames` range (see `promo-2026/PromoFast.tsx`).
- `<Freeze>` clamps to the composition's length: a 1-frame composition freezes on frame 0.
- `@remotion/media` audio with `playbackRate` is converted in the browser; to change speed without
  changing pitch, stretch the mix with ffmpeg `atempo` (`scripts/make-fast-mix.mjs`).
- A `*/` inside a `/** … */` comment (e.g. a path glob) ends the comment early.
- French puts a space before `?` and `:` — use a no-break space (` `) in headlines, or the
  mark wraps onto its own line.
