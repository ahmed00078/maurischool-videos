# Brief: « La chèvre a encore frappé », ép. 2 « La copie » (and the update of ép. 1)

Give this file to the agent building the video. It is self-contained. Before starting, read
the repository's `CLAUDE.md` and `README.md`, then **ép. 1** in full, because ép. 2 reuses its
sets and its goat: `src/videos/chevre-01/` (`stage.tsx`, `scenes/Yard.tsx`, `scenes/App.tsx`,
`copy.ts`) and `briefs/chevre-01-recu.md`. For a series engine that already works, read
`src/shared/verite/` (`episode.tsx`, `stage.tsx`, `scenes.tsx`: `SeriesPill`, `EpisodeTag`).

The work has three parts, in this order:

- **A. The series kit:** `src/shared/chevre/`, used by every episode.
- **B. Ép. 1 updated:** `chevre-01` becomes « ÉP. 1 · Le reçu », with the series identity and
  slower proof moments. It has **not been published yet**, so it can change.
- **C. Ép. 2 « La copie »:** `chevre-02`, the new episode.

**Video id:** `chevre-02`. It lives in `src/videos/chevre-02/`, `public/chevre-02/` and
`scripts/chevre-02/`, with compositions prefixed `Chevre02-` in a `<Folder name="chevre-02">`.
Ép. 1 keeps its id (`chevre-01`, `Chevre01-…`).

**Publish:** ép. 1 first, then ép. 2 one to two weeks later (end of October 2026, when the
first tests come back). Then one episode every two weeks, on the same weekday.

## 1. The series in one paragraph

In every episode the goat eats one school paper, and the person who needed it panics, but
only for a moment, because the paper is already in MauriSchool. Then the goat goes for the
phone and fails. A football score in the corner counts her defeats: **Chèvre 0 – 1
MauriSchool** after ép. 1, **0 – 2** after ép. 2, and so on. The goat never speaks, so the
joke works with the sound off and in both languages.

The message never changes and is the end line of every episode:
**« La chèvre mange le papier. *Pas l'appli.* »**

Only the paper changes, so each episode shows one feature. Planned order (the owner may
change it): 1 the receipt, 2 the test paper, 3 the notice on the school gate (announcement),
4 the teacher's roll book (register, absence), 5 the cash book (finance dashboard, « Résumé
du jour »), 6 the timetable on the wall (« Emploi du temps modifié », before Ramadan), 7 the
report card, 8 the teacher's pay slip, 9 the schooling certificate, and a finale where she
finally scores (1 – 9) by eating a MauriSchool flyer.

## 2. Tone rules (from the owner, non-negotiable)

- **Nobody lies, nobody is mocked.** Sidi really had 17. Papa is proud of him, never
  suspicious. The only one who loses is the goat, every time.
- Sidi is endearing: proud, then crushed for a second, then happy. Papa is calm and warm.
- The goat is the comic engine: deadpan, she chews on the beat and stares into the camera.
- The goat **never manages to eat the phone** (that would say the data can be lost).
- No Tabaski or sacrifice jokes. Never dress the goat in clothes. No real injuries.
- Audience: Facebook and TikTok in Mauritania, mostly men aged 25–34 (young fathers), mostly
  watched **with the sound off**. Secondary: school directors, the buyers.

## 3. Reading holds (the owner's request, for every episode)

The owner watched ép. 1 and found that the proof goes by too fast: people cannot see what
happens. In ép. 1's app scene the phone changes screen about every 1.5 s (inbox, « Frais »,
« Historique », the PDF). From now on, **every proof gets a reading hold**:

1. **What is a proof:** the paper the goat eats (what it is, its key figure), the lock-screen
   notification, the value in the app (the grade, the amount, the receipt number), a stamp,
   the score.
2. **The hold:** the camera arrives on the proof in at most 0.5 s and then **stops** (no
   drift, no shake) for **at least 2.5 s (5 beats)** for the value in the app and at least
   **2 s (4 beats)** for the others. The key figure is at least **90 px tall** on the
   1080 × 1920 canvas during the hold.
3. **One thing to read at a time.** The headline and the proof never appear or change
   together: the headline lands first, then the proof gets its hold. Nothing new appears
   during a hold.
4. **Point at it.** During the app hold, a hand-drawn circle (`MarkerCircle` in
   `lineup.tsx`) draws around the key figure, with a soft « ding ».
5. **The music makes room:** during a hold, no new melodic hit, only the beat and the chew.
6. **At most two screens and one tap per episode** on the phone. Choose the screen that
   carries the value; drop the rest.
7. **Test:** while the render plays at normal speed, read every hold aloud, slowly. If you
   cannot finish before it moves, it is too short. Report the holds' lengths in seconds.

The comedy stays fast (the snatch, the zoom, the ears); only the proof slows down.

## 4. Series identity (every episode has it)

The owner wants **a number, a title and a thumbnail in every episode**.

| What | FR | AR (placeholder) |
|---|---|---|
| Series name | La chèvre a encore frappé | العنز ضربت من جديد |
| Episode label | ÉP. 1, ÉP. 2… | الحلقة 1، الحلقة 2… |
| Ép. 1 title | Le reçu | الوصل |
| Ép. 2 title | La copie | ورقة الامتحان |
| Score bug | Chèvre 0 – 2 MauriSchool | العنز 0 – 2 MauriSchool |
| End line | La chèvre mange le papier. *Pas l'appli.* | العنز تأكل الورق. *لا التطبيق.* |
| Catchphrase (replay) | La chèvre a mangé *la preuve*. | والعنز أكلت *الورقة*. |
| Hashtag | #LaChevreAEncoreFrappe | #العنز_ضربت_من_جديد |

The Arabic lines are **standard-Arabic placeholders**; the owner will have them rewritten in
Hassaniya, so they live only in the copy files. In the hashtag, no accent (it types as it
reads, like `#QuiNeDitPasLaVerite`). « La chèvre a mangé la preuve » was ép. 1's second
headline; it becomes the line every episode says over its replay.

Where they appear:

- **Frame 0 and the hook:** the series name small, then the yellow tag « ÉP. 2 » and the
  title « La copie » big (in the spirit of `EpisodeTag` and `SeriesPill` in
  `shared/verite/scenes.tsx`, but the goat's own colours). Readable on a profile grid.
- **The thumbnail:** frame 0 of the published cut **is** the cover. Draw the hook's first
  frame as the cover itself, so it is not a one-frame flash: the goat's face close, the paper
  in her mouth with its key figure readable, the tag, the title, one headline. Also render it
  as a still (`Chevre02-Cover-FR/AR`) for platforms where a thumbnail is uploaded.
- **The score bug:** in a top corner of the safe band (below y 220, at least 60 px from the
  side, clear of the right 140 px), from the hook to the end. It shows the score **before**
  the episode; when the goat fails, a referee's whistle, the bug jumps to the centre, the
  MauriSchool number ticks up (0 – 1 → 0 – 2), holds 2 s, and goes back to its corner. Draw
  it like a TV football score, but no real broadcaster's look: a goat-head icon and « Chèvre »
  on one side, `LogoMark` and « MauriSchool » on the other. In Arabic it mirrors.
- **The end card:** the end line, the logo and `BRAND_LINE` (`shared/brand.ts`), the question
  for the comments, and « La chèvre a encore frappé · ÉP. 2 » with the hashtag.
- **The post caption** (not in the video), in `copy.ts` as `CAPTION`.

## A. The series kit: `src/shared/chevre/`

Build it before touching either episode, on the model of `src/shared/verite/`: an episode is
its copy, its paper, its score and its scenes, handed down by context.

1. **`series.ts`**: the series name, label, end line, catchphrase and hashtag (section 4),
   and each episode's number, title and score: `{ 1: { goat: 0, app: 1 }, 2: { goat: 0,
   app: 2 } }` (the score **after** the episode; the bug starts from the previous one).
2. **`stage.tsx`**: the courtyard set from ép. 1 (`GOAT`, `goatAt`, `GOAT_FACE`,
   `goatMouth`, `PAPA_YARD`, `papaAt`, `SHOT`, `PapaState`), moved out of
   `chevre-01/stage.tsx` so both episodes use it, plus a place for **Sidi** in the yard (the
   `Boy` bust from `people.tsx`). `chevre-01` imports it back: its frames must not change.
3. **`SeriesTag`** (series name + episode label + title) and **`ScoreBug`** (section 4).
4. **`Replay`**: the crime again in **slow motion** (about 0.35×) with a small « RALENTI » /
   «إعادة» band, like a sports replay. Compute a slowed clock inside the scene
   (`slow = frame * 0.35`) and drive the snatch from it; do **not** use `<Sequence
   playbackRate>` here (see `CLAUDE.md` gotchas on clipping). A replay is a reading hold
   too: the paper's key figure is readable before the bite.
5. **`DramaZoom`**: three hard zoom steps on a face (×1.3, ×1.8, ×2.6), one per hit of a
   « dun-dun-DUN » sting, then still.
6. **`EndCard`** and **`Cover`** (section 4), and an `Episode` assembler like
   `makeEpisode` in `shared/verite/episode.tsx`: cuts FR/AR, `-Check` cuts with the safe
   zones, covers, one composition per scene.
7. **Sound effects:** a referee's whistle and the three-hit sting, generated in code like
   `scripts/make-goat-sfx.mjs` (no downloads), into `public/shared/sfx/`. Reuse `chew`,
   `bleat`, `wahwah`, `whip`, `buzz`, `ding`, `mouse-click`.
8. **The music signature:** the first notes of ép. 1's music (`scripts/chevre-01/make-music.mjs`)
   become the series motif: the same three notes open every episode. Keep the motif in one
   place both scripts import, so it cannot drift.

## B. Ép. 1 updated: « ÉP. 1 · Le reçu »

Keep the story, the scenes and everything the brief `chevre-01-recu.md` fixed. Change:

1. **Identity:** the series tag, « ÉP. 1 » and « Le reçu » on the hook from frame 0; the
   cover becomes frame 0 (section 4) and the cover stills get the number and the title.
2. **The score:** the bug shows « Chèvre 0 – 0 MauriSchool » from the hook; in the twist,
   when her ears drop, the whistle and **0 – 1**.
3. **The end card:** the series end line replaces « Le reçu *ne se perd plus*. » (that line
   can stay as the twist's headline), « La chèvre a encore frappé · ÉP. 1 », the hashtag. The
   question stays « Et chez vous, la chèvre a mangé quoi ? ».
4. **Reading holds (section 3), where it matters:**
   - the hook: the scrap « REÇU N° …0412 » readable and still for 2 s once it is in her mouth;
   - the counter: « PREUVE : 0 » holds 2 s;
   - the lock screen in the pay scene: 2 s on « Paiement enregistré — Sidi Ould Mocktar »;
   - the app scene: **at most two stops**, 2.5 s each. Suggested: the inbox row (the amount
     and « RCP-2026-000412 » circled), then the receipt PDF (« REÇU DE PAIEMENT », the
     amount). A tap on a `payment_received` notification opens « Frais » in the app
     (`action_url="/parent/fees"`), so if the PDF stays, show « Frais » for one quick beat on
     the way (the tab, the link), not as a stop. If that still runs long, keep the inbox and
     « Frais » › « Historique » and drop the PDF. Show the owner both if unsure.
5. **Length:** stay at or under **30 s**. Pay for the holds by trimming what does not carry
   a proof: the rewind (4 → 3 beats), the walk-ups, the pay scene's lead-in. Report the new
   length.
6. Its frames outside the changed moments must look the same as today (stills before/after).

## C. Ép. 2 « La copie »: the idea in one paragraph

Sidi comes home with his maths test: **17/20, « Très bien ! »** in red. He holds it up to
show Papa; the goat takes it out of his hands and eats it. Sidi is crushed: Papa will never
know. Papa's phone buzzes: « Note publiée — Sidi Ould Mocktar ». In the app, « 17/20 en
Mathématiques ». Papa already knows, and he is proud. The goat goes for the phone; Papa lifts
it over his head; her ears drop. Whistle: **Chèvre 0 – 2 MauriSchool**.

Format: 1080×1920, about **22.5 s (45 beats)**, 25 s maximum, **FR and AR**, no voice,
music plus sound effects, 120 BPM grid (1 beat = 0.5 s = 15 frames at 30 fps). It **loops**:
the last frame (her face, the scrap in her mouth) matches the first.

## C.1 Scene by scene

Timings are indicative (in beats of 0.5 s). Time scenes with `useBeat()` / `useMarks()`,
never with raw frame numbers (`CLAUDE.md`).

| # | Beats | Scene | Headline (FR / AR placeholder) |
|---|---|---|---|
| 1 | 0–6 | **Hook = cover.** Her face close, chewing on the beat, staring into the camera. The scrap of the test paper sticks out of her mouth and the red **17/20 · Très bien !** is readable on it (the scrap is torn so that the mark is on the part outside her mouth). Series tag, « ÉP. 2 », « La copie », the score bug at « 0 – 1 ». **Hold: the 17/20 readable and still for the first 2 s** (she chews, the scrap does not shrink). | « Sidi a eu *17*. » / «سيدي حصل على *17*.» |
| 2 | 6–13 | **Replay, slow motion** (« RALENTI »). The courtyard, wide: Sidi, beaming, holds the whole test up with both hands toward the house door: « Devoir de mathématiques », his name, the red 17/20. The goat's head comes in from the side, bites, pulls (sound: `whip` slowed, a deep « nooon » is not needed: his face says it). Sidi's grin turns to an « o ». | « La chèvre a mangé *la preuve*. » / «والعنز أكلت *الورقة*.» |
| 3 | 13–17 | **Drama.** Normal speed. Sidi, empty-handed, frozen. `DramaZoom` on his face, three hits. The goat behind him chews and stares at the camera. | « Papa ne le saura jamais. » / «بابا لن يعرف أبدًا.» |
| 4 | 17–23 | **The buzz.** Papa in the shade by the house door, a glass of atay (`TeaGlass`, `desk.tsx`). His phone buzzes (`buzz`); he raises it: the lock screen, **title and generic message only** (section C.2a). **Hold 2 s.** | « Papa le sait *déjà*. » / «بابا عرف *من قبل*.» |
| 5 | 23–31 | **The proof.** One tap (`Tap`, `mouse-click`): the inbox, the « Note publiée » row on top, unread. The camera goes in to the row (×2 or more) and **stops for 2.5–3 s**: « 17/20 en Mathématiques, 1er trimestre. Aucune action requise. » `MarkerCircle` draws around « 17/20 » with a `ding`. The headline does not change during the hold. | (keeps scene 4's headline, or none) |
| 6 | 31–39 | **The revenge fails.** The yard. Papa walks over, proud: a hand on Sidi's shoulder, Sidi grins again (the phone in Papa's other hand, screen to camera). The goat's eyes go to the phone; she steps toward it; Papa lifts it over his head; she stretches her neck, gives up, looks at you, ears droop (`bleat`, `wahwah`). **Whistle:** the score bug jumps to the centre, **0 – 1 → 0 – 2**, holds 2 s, goes back to its corner. | none (the score is the punchline) |
| 7 | 39–45 | **End card** (section 4) over her face, the scrap in her mouth again: end line, logo, brand line, « La chèvre a encore frappé · ÉP. 2 », the hashtag, and the question: « Elle n'a pas encore de nom. Proposez-en un ! » **Last frame = frame 0** (without the end card's words), for the loop. | see section C.3 |

**Easter egg for rewatches (cheap, optional):** in scene 5, the inbox's older rows include
ép. 1's payment (« Paiement enregistré », receipt …0412), read, below the grade.

## C.2 What the phone shows (checked in the code on 2026-10-14)

Rule (`CLAUDE.md`): every word of the app is **verbatim**. Re-check it in
`../maurischool/backend/app/core/notification_i18n.py` and `../maurischool/mobile_app/src/i18n/`.
`src/shared/appCopy.ts` already has `NOTIFS.grade_published_parent` and `SENSITIVE_PUSH_BODY`.

**How it works** (`notification_catalog.py`, `notification_event_service.py`
`notify_grade_published`): when a teacher publishes a grade, the pupil and **the parents**
are notified. `GRADE_PUBLISHED` is **sensitive**: a locked phone shows the title (it names
the pupil, never the grade) and the generic body. The grade is in the inbox.

**Invented data** (add to `src/shared/demo.ts`, near `FAMILY`): Sidi Ould Mocktar
(`FAMILY.son`); Mathématiques / الرياضيات; period « 1er trimestre » / «الفصل الأول» (the
backend's `period_names("trimester1")`); grade **17**; Tuesday **27 October 2026, 13:10**.
The app formats the number the API sends: 17.0 should print « 17 ». Check it in the mobile
code before relying on it (the comments in `demo.ts` disagree on this: `TEST` says a whole
grade reads « 16.0/20 », `FAMILY.sonFrenchGrade` says « 16 »). If it prints « 17.0 », pick
17.5 instead and change the paper to match.

**a) Lock screen (scene 4)**: `LockScreen` + `Notification` (`src/shared/ui/LockScreen.tsx`),
time 13:10, date mardi 27 octobre.

| | FR | AR |
|---|---|---|
| Title | Note publiée — Sidi Ould Mocktar | نشر نقطة — سيدي ولد المختار |
| Body | Ouvrez MauriSchool pour consulter le détail. | افتحوا MauriSchool للاطّلاع على التفاصيل. |

**b) Inbox (scene 5)**: `InboxScreen` (`src/shared/ui/inbox.tsx`), category `grades`.

| | FR | AR |
|---|---|---|
| Title | Note publiée — Sidi Ould Mocktar | نشر نقطة — سيدي ولد المختار |
| Message | 17/20 en Mathématiques, 1er trimestre. Aucune action requise. | 17/20 في الرياضيات، الفصل الأول. لا يتطلّب أيّ إجراء. |

The message is clamped to two lines: check in FR **and** AR that « 17/20 » is fully
visible. Arabic: the grade stays in Western digits, as the app prints it; check that
« 17/20 » keeps its order inside the RTL line (wrap it in `<bdi dir="ltr">` if needed, the
way the inbox already does for the time).

**Word note for the owner:** the app's Arabic title says **نقطة**. The video's own Arabic
copy says **درجة** (the owner's rule). Leave the phone verbatim and list this in the
decisions.

Stop at the inbox: it carries the value. Do not show the child's grades screen (a second
screen would break the « two screens, one tap » rule).

## C.3 Video copy (`src/videos/chevre-02/copy.ts`)

Series words come from `shared/chevre/series.ts`, never copied. Arabic: placeholders, to be
rewritten in Hassaniya. French: no-break space (U+00A0) before `?`, `!`, `:` and inside « ».

| Key | FR | AR (placeholder) |
|---|---|---|
| title | La copie | ورقة الامتحان |
| hook | Sidi a eu *17*. | سيدي حصل على *17*. |
| never | Papa ne le saura jamais. | بابا لن يعرف أبدًا. |
| already | Papa le sait *déjà*. | بابا عرف *من قبل*. |
| ask | Elle n'a pas encore de nom. Proposez-en un ! | ما عندها اسم بعد. اقترحوا لها اسمًا! |
| paper: heading | Devoir de mathématiques | فرض في الرياضيات |
| paper: name | Nom : Sidi Ould Mocktar | الاسم: سيدي ولد المختار |
| paper: mark | 17/20 · Très bien ! | 17/20 · حسن جدًا! |

**Caption** (not in the video):
FR « Ép. 2 — La copie. Sidi a eu 17… la chèvre aussi 🐐 Elle n'a pas encore de nom :
proposez-en un en commentaire ! #LaChevreAEncoreFrappe #MauriSchool #Mauritanie »;
AR «الحلقة 2 — ورقة الامتحان 🐐 ما عندها اسم بعد: اقترحوا لها اسمًا في التعليقات!
#العنز_ضربت_من_جديد #MauriSchool #موريتانيا».

No emoji inside the video (the render's fonts may not have them): draw an arrow if the ask
needs one.

## C.4 What to build for ép. 2

**Reuse:** `shared/chevre/` (part A), `goat.tsx`, `people.tsx` (`Boy` for Sidi, `Father`,
`Face`, `Arm`), `places.tsx` (`Courtyard`), `desk.tsx` (`TeaGlass`), `LockScreen.tsx`,
`inbox.tsx`, `Device.tsx`, `rig.tsx` (`PhoneRig`, `Tap`, `Sfx`, `Top`), `Headline.tsx`,
`lineup.tsx` (`MarkerCircle`), `fx.tsx` (`CameraPath`, `Grain`, `Vignette`, `SafeZones`),
`LogoMark`, `brand.ts`, `beat.ts`.

**New, in the kit:**

1. **The test paper** in `shared/ui/paper.tsx`: a school « copie double » (lined, a red
   margin line), the heading and the name in blue handwriting, the red **17/20** circled and
   « Très bien ! » in the teacher's red. Three states like `ReceiptSheet`: whole (held up by
   Sidi), bitten, and the scrap that stays in her mouth with the mark on it. In the AR cut
   the paper is in Arabic and its lines run right to left.
2. **Sidi in the yard**, holding a paper up with both hands (the `Boy` bust can already hold
   a paper: extend it if the pose is missing, without breaking `verite-*` and `groupe-01`).
3. **Papa seated** by the door with his tea, then standing (if `Father` cannot sit, frame
   him from the chest up).

**Plumbing:** compositions `Chevre02-FR`, `Chevre02-AR`, `Chevre02-FR-Check`,
`Chevre02-AR-Check`, `Chevre02-Cover-FR/AR`, one per scene; `src/Root.tsx`;
`package.json` render/cover scripts on the model of `chevre-01`; the video table in
`README.md` (ép. 1's row too: its new title and length); `scripts/chevre-02/make-music.mjs`
(the series motif, playful; a slowed, lower version of the motif under the replay; a three-hit
sting for the drama; room for the holds; a bright ending; 120 BPM).

## D. Checks before delivering (`CLAUDE.md`)

- `npm run typecheck`.
- Render and **look**: a still of every scene of both episodes, FR and AR, with the `-Check`
  cuts (nothing important in the top 220 px, the bottom 420 px, or the right 140 px).
  Arabic mirrors: the paper, the score bug, the phone, the tag.
- **The holds:** for each proof, the first and last frame of its hold side by side (they must
  be the same picture, give or take the chew), and its length in seconds. Read them aloud
  while the render plays (section 3).
- The cover = frame 0, for both episodes and both languages; the number and the title read on
  a still scaled to 300 px wide (a profile grid).
- Every app word compared against the files (C.2); the grade and the amount never on a lock
  screen.
- The loop: the last frame against frame 0.
- Ép. 1: stills before and after the refactor at frames that should not change, and the new
  length. `verite-*`, `groupe-01` and `teachers-day-2026` still render the same if `people.tsx`
  or `paper.tsx` changed.
- Render all four cuts and four covers; measure the audio (decode to WAV with Remotion's
  bundled ffmpeg, check peaks per second). Pipe renders through `set -o pipefail`.
- Report what was seen, not what should have happened. **Don't commit** unless asked.

## E. Deliverables

`out/chevre-01/render-FR.mp4`, `render-AR.mp4`, `cover-FR.jpg`, `cover-AR.jpg` (updated);
`out/chevre-02/` the same four files; a contact sheet per cut (`scripts/contact-sheet.mjs`)
that includes each hold; and a short list of decisions left to the owner:

- the Arabic lines (series name, titles, headlines, hashtag) to rewrite in Hassaniya;
- نقطة on the phone against درجة in the video copy;
- ép. 1's app scene: inbox + PDF, or inbox + « Historique »;
- Sidi's class, which is not shown in ép. 2 but differs between videos (5e A in
  `groupe-01`, 1re B in `chevre-01` and `verite-03`);
- the goat's name, after ép. 2's comments, for ép. 3.
