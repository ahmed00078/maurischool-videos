# Brief: « Qui ne dit pas la vérité ? » — Episode 2, « Le henné »

Hand this file to the agent building the episode. It stands on its own; read the
repository's `CLAUDE.md` and `README.md` first, then `src/videos/verite-01/`, which
this episode copies scene for scene.

## 1. The series, in one paragraph

A 28-second vertical video (1080×1920, FR and AR, no voice, 120 BPM beat grid). Three
members of the Ould Mocktar family stand in a police lineup against a height chart,
each holding a numbered placard: **1 Sidi** (the little brother), **2 Zahra** (the big
sister), **3 Papa**. Each says one sentence. Viewers vote in the comments (1, 2 or 3).
Then the mother checks her MauriSchool notifications: after each one, a stamp lands on a
placard, **VRAI** or **FAUX**. Two tell the truth, one does not. A hidden clue, visible
from the first frame, rewards whoever watches again.

Episode 1 (`verite-01`, already published) : Sidi said « J'ai eu 17,5 en maths ! », the
inbox said 7.5/20. The clue was the marked test in his shirt pocket.

## 2. Tone rules (from the owner, not negotiable)

- Never call anyone a liar. The title is « Qui ne dit pas la vérité ? »; the stamps judge
  **what was said** (VRAI / FAUX), never the person. No « menteur », no « menti ».
- A parent is never the one who does not tell the truth.
- Warm and funny: the family laughs together at the end.
- In Arabic, a grade is **درجة** (never نقطة) in the video's own copy. App wording on the
  phone stays verbatim, even where the app itself says نقطة.

## 3. The story of episode 2

**The trap:** after episode 1, everyone will suspect Sidi again. This time Sidi tells the
truth, and the one who does not is Zahra, the good student.

| # | Who | Says (FR / AR, placeholder Arabic) | Mum's notification | Verdict |
|---|---|---|---|---|
| 1 | Sidi | « Aujourd'hui, j'ai eu 16 en français ! » / «أخذت اليوم 16 في الفرنسية!» | Note publiée, 16/20 en Français | **VRAI** (he has turned over a new leaf) |
| 2 | Zahra | « Je suis restée à l'école toute la journée. » / «بقيت في المدرسة طوال اليوم.» | Absence enregistrée, 14/10/2026, 3e A | **FAUX** |
| 3 | Papa | « Novembre ? Il faut payer avant le 5. » / «شهر نوفمبر؟ يجب الدفع قبل يوم 5.» | Échéance le 05/11/2026, 2 500 MRU to pay at the desk | **VRAI** |

**Order of the reveal:** Sidi (VRAI, which surprises episode 1 viewers), then Papa
(VRAI), then Zahra last (FAUX). The inbox is newest first, so the three rows are read
top to bottom in that order.

**The hidden clue:** Zahra's hands, holding her placard, are decorated with **henna**
(dark orange-brown fingertips and a small pattern on the back of the hand). It is there
from the first frame, and nobody mentions it until the end.

**The ending:**
- Headline: « C'était *Zahra*. » / «إنها *زهرة*!»
- Line 2: « Le henné… c'était le mariage de sa cousine. » / «الحنّاء… كانت لعرس ابنة عمّها.»
- The camera pushes in on her hands; a marker circles the henna. « Tu avais vu ses mains ? » / «هل رأيت يديها؟»
- Outro, the question that fills the comments: « Et toi, tu as déjà raté l'école pour un mariage ? » /
  «وأنت، هل غبت يومًا عن المدرسة من أجل عرس؟»
- Brand line and logo, as in episode 1: « Notes, absences, paiements : *les parents savent*. »
- Reactions: Zahra embarrassed then laughing, Sidi triumphant (finally not him), Papa
  shaking his head, smiling.

The Arabic lines above are standard-Arabic placeholders. The owner will have them
rewritten in Hassaniya: keep every video word in `copy.ts` so they are easy to replace.

## 4. The notifications, exactly (checked against the code on 2026-09-30)

All three are real parent notifications. The inbox renders them in the app from
`mobile_app/src/i18n/{fr,ar}/notifications.json` (wording identical to
`backend/app/core/notification_i18n.py`). Show them in the **inbox**
(`src/shared/ui/inbox.tsx`), never on a lock screen: a locked phone hides sensitive values.

| Row | Time | Key | Category | Priority (tile) | Params |
|---|---|---|---|---|---|
| 0 | 12:10 | `grade_published_parent` | grades (blue, school icon) | NORMAL, tinted tile | student_name = Sidi Ould Mocktar / سيدي ولد المختار; grade = `16` (the app prints 16.0 as "16"); subject_name = Français / اللغة الفرنسية; period = 1er trimestre / الفصل الأول |
| 1 | 09:00 | `payment_reminder` | finance (purple, card icon) | HIGH, **filled tile** (`elevated: true`) | student_name = Zahra Mint Mocktar / زهرة بنت المختار; due_date = 05/11/2026; amount_due = `2 500` (narrow no-break space, U+202F); invoice_number = INV-2026-000231 |
| 2 | 08:20 | `absence_marked` | attendance (cyan `#0891b2`, calendar icon) | HIGH, **filled tile** | student_name = Zahra Mint Mocktar; date = 14/10/2026 (a Wednesday); class_name = 3e A / الثالثة أ |

Wording to add to `src/shared/appCopy.ts` (`NOTIFS`), verbatim:

- `payment_reminder`
  - FR title: `Échéance le {due_date} — {student_name}`
  - FR message: `Il reste {amount_due} MRU à régler au guichet pour la facture {invoice_number}. Ignorez ce rappel si le paiement vient d'être enregistré.`
  - AR title: `الاستحقاق يوم {due_date} — {student_name}`
  - AR message: `يتبقّى {amount_due} أوقية للدفع في الشبّاك عن الفاتورة {invoice_number}. تجاهلوا هذا التذكير إذا تمّ الدفع للتوّ.`
- `absence_marked` and `grade_published_parent` are already in `NOTIFS`.

Notes:
- The inbox title is one line with an ellipsis and the message two lines, as in the app
  (`INBOX_ROW` in `inbox.tsx`). Long names get cut; that is correct.
- `inbox.tsx` already maps the `attendance` category (cyan, calendar icon); check that the
  filled cyan tile renders.
- The check scene in episode 1 zooms onto rows in on-screen order (window `i` reads row
  `i`), so the reveal order must be the row order: the times above keep Sidi, Papa, Zahra
  from top to bottom.
- Put Zahra's class (`3e A` / `الثالثة أ`) and the new values in `FAMILY`
  (`src/shared/demo.ts`). Do not touch `PUPIL` (Mariem Mint Ahmed), which other videos use.

## 5. Building it

1. **Lift the series into the kit first.** `CLAUDE.md` says a video never imports from
   another video. `src/videos/verite-01/scenes/` holds the series engine: `Stage.tsx`
   (lineup placement, story clock, suspects), the claim / vote / check / busted scene
   logic. Move what is generic into `src/shared/verite/` (or similar), parameterised by
   the episode's cast states, claims, rows and clue. Make `verite-01` use it, and check
   that `verite-01` still renders the same: stills at frames 50, 150, 290, 470, 590, 730
   and 820 in FR and AR, compared with the current `out/verite-01/render-*.mp4`.
2. **Create `src/videos/verite-02/`** (compositions `Verite02-FR/AR`, `-Check`, `-Cover-*`,
   per-scene compositions), `public/verite-02/`, `scripts/verite-02/make-music.mjs` (copy
   episode 1's and adapt), `package.json` render/cover scripts, the README table and
   `src/Root.tsx`.
3. **Henna hands.** `Placard` in `src/shared/ui/lineup.tsx` draws the hands as two skin
   ovals. Add an option (for example `hands?: 'plain' | 'henna'`) that dyes the fingertips
   and adds a small dotted or floral pattern in `#7a2e14` / `#a0461f`. It must be visible
   at normal size and readable when the camera pushes in (zoom about 1.9).
4. **The busted camera** pushes in on Zahra's hands (not a pocket this time): add a
   `handsAt(who, rtl)` helper next to `paperAt` and circle the hand with `MarkerCircle`.
5. **Reactions during the reveal:** Zahra gets more nervous each time someone else is
   cleared (sweat, worry), as Sidi did in episode 1.
6. **Timing:** keep episode 1's timeline (57 beats, 28.5 s) unless the text needs room.

## 6. Checks before delivering (from `CLAUDE.md`)

- `npm run typecheck`.
- Render and **look**: stills of every scene in FR and AR, with the `-Check` compositions
  (safe zones: nothing important under the top 220 px, the bottom 420 px or the right
  140 px). Arabic is mirrored: placard 1 on the right.
- French no-break spaces before `?`, `!`, `:` and inside « ».
- Render both cuts and both covers; measure the audio (see how episode 1 was checked:
  decode to WAV with Remotion's bundled ffmpeg and check peaks per second).
- Report what was seen, not what should have happened. Do not commit unless asked.

## 7. Deliverables

`out/verite-02/render-FR.mp4`, `render-AR.mp4`, `cover-FR.jpg`, `cover-AR.jpg`, and a
short list of anything that needs the owner's decision.
