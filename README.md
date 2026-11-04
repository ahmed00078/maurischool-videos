# maurischool-videos

MauriSchool's marketing videos, made in code with [Remotion](https://www.remotion.dev) (React).
Every video is built on a **shared kit**: the app's own screens rebuilt pixel for pixel, the phone,
the logo, the FR/AR language switch, the beat grid, and the voice pipeline. A new video starts
from that kit, not from zero.

## Videos

| Video | What it is | Published files |
|---|---|---|
| [`tour-2026`](src/videos/tour-2026) | « MauriSchool en 10 points », the presentation sent to schools (October 2026), **landscape**: a cold open on a payment reaching the parent's phone, ten numbered chapters in three acts each announced by a card (your money: fees and receipts, finance, payroll; your classes: attendance, grades, report cards, timetable; your families: announcements, the parent's app), the director's dashboard where it all lands, « Et aussi… » and the offer of a demonstration. Each chapter lists its steps beside a phone whose screen stays veiled; only the section a step is about is sharp, lifted out and enlarged. It follows one pupil, Khadi (`data.ts`). Written for a narrator (`briefs/tour-2026-voix.md`); complete without one | FR and AR (2 min 53 before the voice), `out/tour-2026/MauriSchool-10-points-FR/AR.mp4` |
| [`groupe-01`](src/videos/groupe-01) | « Le groupe des parents » (class announcements, mid-October 2026): opens on a found clip (« Quand tu ouvres le groupe des parents… », boxes falling out of a container), then 312 unread in the parents' group; on Tuesday night the director's « Composition de maths jeudi » flies past in the flood (six frames, sharp on a paused frame); on Thursday Sidi asks « c'est la compo aujourd'hui ?! » and Papa finds it, two days late. VHS rewind: the director sends one MauriSchool announcement to 5e A (78 recipients), Papa's lock screen shows it at 18:04, and on Wednesday night they revise while the phone lies face down. Generic chat app, never WhatsApp's. No voice, loops | FR and AR (29.5 s), cover on frame 0; `Groupe01-Gag-FR/AR` with the optional gag |
| [`chevre-02`](src/videos/chevre-02) | « La chèvre a encore frappé », ép. 2 « La copie » (the first tests, end of October 2026): frame 0 is the cover, the goat chewing Sidi's test with the red 17/20 readable; a slow-motion replay (« RALENTI ») of her taking it from his hands; a « dun, dun, DUN » zoom on his face, « Papa ne le saura jamais. »; indoors, Papa's phone buzzes, « Note publiée — Sidi Ould Mocktar », and the inbox shows « 17/20 en Mathématiques » under a loupe; she fails to get the phone: Chèvre 0 – 2 MauriSchool. The end card asks the audience to name her. No voice, loops | FR and AR (24 s), cover on frame 0 |
| [`chevre-01`](src/videos/chevre-01) | « La chèvre a encore frappé », ép. 1 « Le reçu » (fee collection, October 2026): Papa paid, the goat takes the receipt from his hand in the first second, PREUVE : 0 at the counter; a VHS rewind to payday with MauriSchool: the accountant records it, his phone buzzes, he taps the notification and the receipt (the October 2026 document layout) opens in the app, held still with the amount circled; the goat eats the paper again, goes after the phone and loses: Chèvre 0 – 1 MauriSchool. Nobody lies. No voice, the music loops | FR and AR (30 s), cover on frame 0 |
| [`verite-03`](src/videos/verite-03) | « Qui ne dit pas la vérité ? » ep. 3, « Le bulletin » (December): Papa's payment and Sidi's 12 are true, Zahra's sad « 11 » is FAUX (her grades screen says 17.5) and a gold BRAVO lands over it: she wanted to surprise her parents; the rosette behind her placard and a 4-frame smile are the clues. `Verite03` ends on Papa's « 18 à ton âge », stamped INVÉRIFIABLE | FR and AR: tease cut (32 s) and `Verite03-Plain` (30.5 s), cover on frame 0 |
| [`verite-02`](src/videos/verite-02) | « Qui ne dit pas la vérité ? » ep. 2, « Le henné »: everyone suspects Sidi again, but his 16 is true; Zahra was not at school all day (an absence in the inbox), and the henna on her hands was there from the first frame | FR and AR (30.5 s), cover on frame 0 |
| [`verite-01`](src/videos/verite-01) | « Qui ne dit pas la vérité ? » ep. 1: a lineup (Sidi, Zahra, Papa), one claim each, a vote in the comments, the mother's inbox gives the answer (Sidi turned 7.5 into 17.5), no voice | FR and AR (30.5 s), cover on frame 0 |
| [`teachers-day-2026`](src/videos/teachers-day-2026) | World Teachers' Day (5 Oct 2026): a chalkboard question with an example answer and a school bell, a teacher marking the whole class at night under the lamp, the register in one tap, a thank-you that loops back to the question; part 2 chalks the names from the comments | FR and AR (23 s, loops), cover on frame 0; Names-FR/AR from a `names` prop |
| [`promo-2026`](src/videos/promo-2026) | Launch promo, Sept 2026: 11 scenes, French and Arabic, voiced (ElevenLabs) | FR ×1.3 (46 s), AR ×1.4 (51 s), cover on frame 0; `Promo2026-FR/AR-Short` (20.5 s, no voice): opens on the father's lock screen (Mariem's absence), rewinds to the teacher's register, then payment, the director's morning, the demo offer |
| [`promo-v1`](src/videos/promo-v1) | First 30 s WhatsApp promo, kept as shipped (predates the kit) | — |

## Getting started

```bash
npm install
npm run studio        # opens Remotion Studio: every composition, grouped by video
npm run typecheck
```

Renders go to `out/` (git-ignored). Node 18+; Remotion downloads its own Chrome and ffmpeg.

## Layout

```
src/
  Root.tsx                    assembles each video's compositions
  shared/                     the kit — reuse it, extend it, don't copy it
    tokens.ts                 app colours, fonts (Outfit / Tajawal), app-point scale, beat grid, easing
    lang.tsx                  FR/AR switch: language, direction, font; money and percent formats
    appCopy.ts                interface wording, verbatim from the app's i18n and backend notifications
    demo.ts                   the invented school and its numbers ("École Nour El Ilm")
    beat.ts                   timeline.json → frames; useBeat(), useMarks(); voice lines
    rig.tsx                   Scene, Top (safe text band), PhoneRig, Tap, Sfx
    fx.tsx                    Backdrop, Grain, Vignette, Camera (drift / push / shake), CameraPath (shot to shot), SafeZones
    transitions.ts            transition types → Remotion presentations, mirrored in Arabic
    sound.ts                  silence a subtree (used by the sped-up cuts)
    formats.ts                PORTRAIT 1080×1920, LANDSCAPE 1920×1080
    wide.tsx                  the landscape stage: text on the reading side, the phone on the other; Veiled (a screen blurred and washed out
                              but for one Rect) and Lift (that section on a card of its own, enlarged)
    Kit.tsx, compositions.tsx the kit on its own, to check screens against the real app (KitCast, KitInbox, KitChat, KitAnnounce and the rooms too)
    ui/
      appkit.tsx              the app's components: cards, stat tiles, alerts, tab bar, header…
      screens.tsx             director home, finance dashboard
      screens2.tsx            attendance register (pre-redesign, as promo-2026 shows it), payment form, parent grades
      admin.tsx               the director's timetable (and its blocking-conflict alert), the teachers' payroll, the term closing hub (and « Publier les bulletins ? »)
      documents.tsx           the school's documents in the layout printed since October 2026: the report card (A4, bilingual, the school's
                              colour, frame and watermark) and the payment receipt (A5)
      teacher.tsx             the teacher's workspace: register (current design), grade entry, confirm dialog, toast, tab bar
      Chalkboard.tsx          a classroom board, chalk that writes itself in the reading direction, the eraser
      desk.tsx                a desk at night: the wooden top, a lamp and its light, a glass of atay, a hand writing with a red pen
      Device.tsx              the phone (neutral: punch-hole, 08:15 status bar or `time`), its back, a phone that turns face down
      inbox.tsx               the notification centre, where sensitive values show (the lock screen hides them)
      childGrades.tsx         a parent's child profile on its grades tab (where a report-card notification leads): the term's average, the subjects
      confetti.tsx            a burst of paper squares, the same on every render
      people.tsx              the family, drawn flat: boy, girl in headscarf, father in daraa; faces that act
      goat.tsx                the goat: chews on the beat, stares at the camera, snatches, steps, ears that droop; paper in her mouth
      paper.tsx               a carbon-book receipt (whole, or the scrap a goat leaves), the fees envelope, a marked test on a school copie (whole, or the scrap with its red mark)
      places.tsx              a courtyard at midday; a school cash office, its counter, a register whose pages turn; a family's
                              salon (floor mattress, bolster cushions, window, doorway) at night, sunset or morning, and the light
                              over it (RoomShade); a tear-off wall calendar with weekdays whose leaves tear off and come back
      chat.tsx                a generic chat app (nobody's: own colours, words, Roboto): conversation list with unread badges,
                              a group thread (text, voice notes, pictures, stickers, forwarded chains) scrolled by the frame, its lock-screen banner
      announcement.tsx        the director's « Nouvelle annonce » (message, audience, recipients preview), its confirmation, the admin tab bar
      fees.tsx, receiptDoc.tsx  the parent's « Frais » tab (pending, history, « Télécharger le reçu ») and the receipt PDF as a viewer opens it
      lineup.tsx              the « Qui ne dit pas la vérité ? » set: height-chart wall, placards (plain or henna hands, a rosette behind), stamps (VRAI, FAUX, BRAVO, INVÉRIFIABLE), arms up or clapping, speech bubble, countdown
      LockScreen.tsx          lock screen + MauriSchool push notification
      Headline.tsx            kinetic headline (*starred* words highlighted), role chip, place tag (« Mardi soir »)
      Ionicon.tsx, LogoMark.tsx, Illustrations.tsx (notebook, copies, calculator, wall clock…),
      props.tsx (chat bubbles, report card, laptop…)
    verite/                   the « Qui ne dit pas la vérité ? » series engine: every episode is its copy, its
                              inbox, its clue and its faces fed to these scenes (stage.tsx, scenes.tsx, episode.tsx)
    chevre/                   the « La chèvre a encore frappé » series: its words and running score (series.ts), the
                              courtyard, the goat, Papa and Sidi (stage.tsx), the marks every episode carries (marks.tsx:
                              the tag with the episode's number and title, the football score and its goal, the slow-motion
                              replay, the drama zoom, the loupe, the end card), and the assembler (episode.tsx)
  videos/<video>/
    compositions.tsx          this video's compositions, in a <Folder> named after it
    timeline.json             scenes, their length in beats, the transition after each
    voice-cues.<lang>.json    hand-read timings for a recording (see "Voice")
    voice.<lang>.json         written by scripts/fit-voice.mjs — don't edit by hand
    copy.ts, scenes/…         the video's own words and scenes
public/
  shared/                     Ionicons font, sound effects (make-sfx.mjs, make-classroom-sfx.mjs, make-lineup-sfx.mjs, make-goat-sfx.mjs, make-chat-sfx.mjs, make-chevre-sfx.mjs)
  <video>/                    that video's voices, music, mixes
scripts/                      generic tools (take the video's name)
  <video>/                    tools for one video only (e.g. its temp music)
```

## How a video is built

1. **A beat grid.** `timeline.json` gives each scene a length in beats (120 BPM: 1 beat = 15 frames
   = 0.5 s) and the transition into the next. Cuts land on beats, so any music at that tempo fits.
2. **Scenes time themselves in beats.** Inside a scene, `const b = useBeat()` and `b(2.5)` is the
   frame of beat 2.5 after the scene's cut.
3. **The voice drives the final timing.** `scripts/fit-voice.mjs` measures each recorded line and
   grows a scene by whole beats when its line needs room. It also writes named *marks* (beats where a
   word lands) that scenes read with `useMarks()('question', 4)`, the second value being the fallback
   without a voice.
4. **One render per language.** The same code renders French and Arabic; everything reads
   `useLang()`, and Arabic mirrors (layout, tab bar, chevrons, transitions).

## Recipes

**Fit a recorded voice** (one file per scene, numbered `1..N` or ElevenLabs names in recording order):

```bash
node scripts/fit-voice.mjs promo-2026 fr out/audios --report   # look first: speech, pauses, fit
node scripts/fit-voice.mjs promo-2026 fr out/audios            # copy the files, write voice.fr.json
```

To make a word land on a picture, add it to `src/videos/<video>/voice-cues.<lang>.json` (an
`anchor`, a `lead`, or `marks` in seconds of the source file) and run it again.
`MIN_PAUSE=0.1` shows finer pauses.

**Render a voiced cut:** `npx remotion render Promo2026-FR out/promo-2026/FR-voix.mp4 --crf=18`

**Make the sped-up social cut** (the whole video faster, voice pitch kept):

```bash
node scripts/make-fast-mix.mjs promo-2026 fr 1.3 --from=out/promo-2026/FR-voix.mp4
npm run render:promo-2026:fr
npm run cover:promo-2026:fr
node scripts/embed-cover.mjs out/promo-2026/fast-FR.mp4 out/promo-2026/cover-FR.jpg out/promo-2026/MauriSchool-promo-FR.mp4
```

The fast compositions keep the full length and are rendered with `--frames` (see
`PromoFast.tsx` for why). The frame range is in `package.json`.

**Re-cut existing scenes into a shorter video:** list the scenes in a second timeline file
(`promo-2026/short.json`) where `from` starts a scene part-way, at that beat of the full scene, and
assemble it like `PromoShort.tsx`. Music: `node scripts/promo-2026/make-temp-track.mjs short`, then
`npm run render:promo-2026:short:fr` (and `:ar`).

**Review without watching:** `node scripts/contact-sheet.mjs <video.mp4> <dir> <frame…>` pulls
frames to look at; `node scripts/stills.mjs <composition> <frame…>` renders stills directly;
`node scripts/shots.mjs <dir> [--scale=0.5] <Composition:frame,frame…> …` renders stills of several
compositions from one bundle.

**Make an episode of « La chèvre a encore frappé »:** add it to `EPISODES` in
`shared/chevre/series.ts` (number, title, the score after it), write its scenes from
`shared/chevre/stage.tsx` and `marks.tsx`, assemble it with `makeChevreEpisode` (`chevre-02/Chevre.tsx`:
the goal's scene and beat, where the score comes to), and its score with `scripts/chevre/music-kit.mjs`
(every episode opens on the goat's motif). Every proof holds still long enough to read: the camera
arrives, then stops 2 to 2.5 s, the key figure about 90 px tall (`Loupe` when it is smaller); the
headline never changes during a hold (`briefs/chevre-02-copie.md`, section 3).

**Show one section of a screen, not the screen** (videos for schools: a competitor must not be able
to copy the app from the footage). Put the screen in `<Veiled windows={[{ rect }]}>` inside the
`Device` and the same screen in a `<Lift rect to t>`; read the `Rect` (app points) off
`Tour2026-Ruler-FR/AR-<n>`. Arabic sets some blocks taller, so check the rect in both.

## Making a new video

1. `src/videos/<name>/` with a `timeline.json` (scene ids, beats, transitions) and a
   `timeline.ts` that calls `buildTimeline` from `shared/beat.ts` (copy promo-2026's).
2. Scenes built from the kit: `Scene` + `Top` + `PhoneRig` + a screen from `shared/ui`, words in
   the video's `copy.ts`. A missing app screen goes into `shared/ui`, so the next video has it too.
3. A `compositions.tsx` with ids prefixed by the video, added to `src/Root.tsx`.
4. Voice → `fit-voice.mjs` → render → (optional) fast cut and cover.

## Rules

- **The phone shows the real app.** Interface wording is copied verbatim from `mobile_app/src/i18n`
  and `backend/app/core/notification_i18n.py` into `shared/appCopy.ts`, never paraphrased. Only
  notifications that really exist are shown.
- **Invented data only.** No real school, pupil or parent; change the school in `shared/demo.ts`.
- **Keep text in the safe band.** Reels/TikTok cover the top ~220 px and bottom ~420 px of a
  1080×1920 frame; `Top` places text right, and `safeZones: true` draws the zones to check.
- **Both languages, both directions.** Check every change in French and in Arabic.
- **For schools, never a whole screen.** In a video sent to schools or buyers, every app screen stays
  veiled except the section the scene is about (`shared/wide.tsx`). The social videos show full screens.
- **Check by looking.** Render stills or a contact sheet of the moments you changed before
  delivering; pipe renders with `set -o pipefail`, or a failure hides behind `tail`.

## Assets and licences

- Fonts: Outfit and Tajawal (Google Fonts, OFL), loaded at render time.
- Icons: Ionicons (MIT), the font the app ships, in `public/shared/fonts`.
- Music: `promo-2026`'s temp tracks and `promo-v1`'s music are synthesized in code (`scripts/…`),
  so there is nothing to clear. Real music must be licensed for ads.
- Voices: ElevenLabs, generated by the MauriSchool team.
- Remotion is free for companies of up to 3 people; above that a company licence is required.
- Audio is committed as plain files. If the repository grows heavy, move `*.wav`/`*.mp3` to Git LFS.
