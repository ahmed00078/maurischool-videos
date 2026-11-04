# social — the feed posts

MauriSchool's Facebook and Instagram posts (1080 × 1350, stories 1080 × 1920), in French and Arabic,
made in HTML and rendered to PNG. They share their world with the videos: the cast, the goat, the
director's office and the classroom are drawn once in `src/shared/` and rendered here as stills.

The brand rules (voice, lexicon, colours, the devices, templates, feed rhythm, the checklist) are in
the **MauriSchool Social** design system on claude.ai; this folder is its working copy.

## Layout

```
social/
  posts.html            every post: its French and Arabic copy side by side, built from the kit's helpers
  clarte.css            the kit's stylesheet (tokens, surfaces, header, headline, socle, loupe, cachet, phone…)
  fonts/                Outfit and Tajawal (OFL), self-hosted so a render never waits on Google Fonts
  img/
    mauri-mark.svg      the logo's mark
    S-*.png             the cast and the goat, rendered from the video kit
    cap/                real app captures (1.0.8, 1290 × 2634), French and Arabic
    docs/               real documents rendered by the backend, with the demo school's crest and stamp
    moments/            the drawn scenes (git-ignored: rendered from src/shared/moments)
  scripts/
    render-moments.mjs  renders the `Moments-*` stills into img/moments
    render.cjs          renders the posts to out/ (git-ignored)
    snapshot.cjs        saves each post as static HTML for Impeccable's detector
    feed-grid.py        the profile grid as Instagram crops it (3:4, three across)
    capture/            refreshes img/cap from a local review database
    docs/               refreshes img/docs (demo identity, backend renderer)
  .impeccable/critique/ the design critiques, one file per run
```

## Render

From the repository root:

```bash
node social/scripts/render-moments.mjs
node social/scripts/render.cjs
```

`render.cjs` needs Playwright (`npm i --no-save playwright`, then `npx playwright install chromium`,
or `CHROMIUM=/path/to/chrome`). `render.cjs social/out m1:fr t2:ar` renders some posts only. A
machine where Remotion cannot download its Chrome passes `REMOTION_BROWSER=/path/to/chrome` to
`render-moments.mjs`. Then look at the PNGs: a render with no errors is not a post that reads.

`python3 social/scripts/feed-grid.py social/out/grid.png <post.png> …` shows a planned feed.

## Posts

| Id | Surface | For | What carries it |
|---|---|---|---|
| `fait` | paper | direction | Loupe of the director's home (« Appel non fait »), the phone below |
| `notif` | blue | parents | Loupe of Zahra's bulletin in the inbox, Papa |
| `scene` | sable | families | the goat and the in-app payment row (the Reel's world) |
| `outil` | night | teachers | the register with the network cut, the app's own toast |
| `docs` | night | direction | Loupe of the receipt's stamp box, the real bulletin |
| `phrase` | night, story | direction | the school's stamp where the word would be |
| `c1`–`c4` | paper | accounting | one payment followed from the counter to the parent's phone |
| `m1`, `m2` | the office | direction | the director at 10:24: phoning every class, then reading his phone, tea still hot |
| `t1`, `t2` | night, the classroom | teachers | the teacher at 23:40 copying the register again, then in class, offline, saved |
| `carte` | night, story | everyone | the contact story |

A new post is a new entry in `POSTS` (and in `scripts/posts.cjs`), written with the helpers
(`head`, `headline`, `device`, `capLoupe`, `loupe`, `doc`, `inrow`, `cachet`, `cast`, `steps`,
`moment`, `url`).

**Every post carries the cachet** with the number (33 08 25 42). Direction, teacher and accounting
posts ask for a free demo; parent and family posts ask « Votre école n'est pas encore sur
MauriSchool ? ». On a moment, the cachet lies on the desk where it covers no hand and no face.

## Moments: drawn scenes

`src/shared/moments/` draws the cast at work on a 1080-wide canvas whose bottom 1350 px hold the
scene; the wall above stays plain for the headline. Each moment exists as a 4:5 still
(`Moments-<Scene>-<Moment>-FR/AR`) and as a 4-second living loop for Reels (`…-Reel`, 9:16: steam
rises, the clock ticks, eyes blink). In Arabic the drawing mirrors; the clock and anything written
(the chalked date) do not.

| Scene | before | after |
|---|---|---|
| `Director` | 10:24, the landline at his ear, the paper registers, the tea gone cold | 10:24, reading his phone, the tea still steaming |
| `Teacher` | 23:40 at home under the lamp, copying out the day's register | in class in front of the board; crossed bars, a green tick |

The people are in `src/shared/ui/people.tsx` (`Director`, `Teacher`, `PupilBack`, beside the family and
the accountant), drawn flat like the rest of the cast. A new moment goes in `src/shared/moments/`
and is registered in its `compositions.tsx`, so a video can use it too.

## Refresh the captures (1.0.8 or later)

From `maurischool/backend/`, on a machine with PostgreSQL, and only against a disposable database:

1. `python -m scripts.review_db --live-day` builds a local review database with the demo school (its
   guard refuses any non-local target; with a socket URL it cannot parse, pass
   `--database-url postgresql://user@127.0.0.1:<port>/maurischool_review` for a local cluster).
2. In that database only: rename the school and one family for the cast, and snooze account setup
   (`users.setup_snoozed_until`).
3. Start the API with its clock on a school morning (`LD_PRELOAD=libfaketime.so.1
   FAKETIME="@2026-11-04 10:24:00"`) and `BACKEND_CORS_ORIGINS='["http://localhost:8081"]'`; start the
   app with `npx expo start --web` after the two local-only changes the website's `CLAUDE.md`
   describes (`web` in `platforms`, a web stand-in for `expo-secure-store`), never committed.
4. `sh social/scripts/capture/batch.sh social/img/cap` with `CHROMIUM` and the review accounts'
   passwords (`ADMIN_PASSWORD`, `TEACHER_PASSWORD`, `PARENT_PASSWORD`) as `review_db` prints them.

`capture-app.cjs` is the website's capture script plus `FIXED_TIME`, `GOTO`, `OFFLINE`, `FINAL_WAIT`
and `~text` / `@label` steps; `capture-register-offline.cjs` opens a register, then cuts the network.
Arabic captures load `rtl-shim.js`; always look at them before use. When the app's layout moves, the
Loupe crops in `posts.html` (`CROP`, in source pixels) move with it.

## Refresh the documents

`scripts/docs/demo_identity.py` draws the demo school's crest and its stamp-and-signature (invented).
`scripts/docs/render_real_docs.py`, run from `maurischool/backend/` against the review database,
calls the backend's own `PDFService.generate_receipt_pdf` and the official bulletin's context with that
identity. Rasterise with `pdftoppm -r 220 -png` into `img/docs/`.

## Before publishing

- Run Impeccable: `node social/scripts/snapshot.cjs`, then `impeccable detect --json social/out/snapshots`,
  and `/impeccable critique` on the renders. Known false positives on a fixed 1080 px canvas:
  `dark-glow` (the stamp's shadow token), `oversized-h1`, `cramped-padding` on bleeding objects.
- One fact, one proof, one cachet; fact then outcome, four lines at most.
- The product's own words and numbers; never an amount or an average on a lock screen.
- French and Arabic both complete; the Arabic read by a native speaker.
- Captions carry the WhatsApp link `wa.me/22233082542`: a number in an image cannot be tapped.
