# Brief: « Qui ne dit pas la vérité ? » — Episode 3, « Le bulletin »

Hand this file to the agent building the episode. It stands on its own; read the
repository's `CLAUDE.md` and `README.md` first, then `src/videos/verite-01/` (episode 1)
and, if it exists, `src/videos/verite-02/` (episode 2).

**Publish date:** when the first-term report cards come out, mid to late **December
2026**. Build it in advance; the story takes place on the evening the report cards
are published.

## 1. The series, in one paragraph

A 28-second vertical video (1080×1920, FR and AR, no voice, 120 BPM beat grid). Three
members of the Ould Mocktar family stand in a police lineup against a height chart,
each holding a numbered placard: **1 Sidi** (the little brother), **2 Zahra** (the big
sister), **3 Papa**. Each says one sentence. Viewers vote in the comments (1, 2 or 3).
Then the mother checks her MauriSchool notifications: after each one, a stamp lands on a
placard, **VRAI** or **FAUX**. Two tell the truth, one does not. A hidden clue, visible
from the first frame, rewards whoever watches again.

- Episode 1: Sidi said 17,5 in maths, the inbox said 7.5. Clue: the test in his pocket.
- Episode 2: Zahra said she was at school all day, the inbox showed an absence. Clue:
  henna on her hands (a cousin's wedding).

## 2. Tone rules (from the owner, not negotiable)

- Never call anyone a liar. The title is « Qui ne dit pas la vérité ? »; the stamps judge
  **what was said** (VRAI / FAUX), never the person. No « menteur », no « menti ».
- A parent is never the one who does not tell the truth.
- Warm and funny: the family laughs together at the end.
- In Arabic, a grade is **درجة** (never نقطة) in the video's own copy. App wording on the
  phone stays verbatim, even where the app itself says نقطة.

## 3. The story of episode 3: the format flips

After two episodes, viewers expect the FAUX to be bad news. This time the one who does
not tell the truth **hides good news**: Zahra says she has 11 average, sadly, when she has
17.25. She wanted to surprise her parents. It ends in a celebration, the most shareable
feeling of the series.

| # | Who | Says (FR / AR, placeholder Arabic) | Mum's notification | Verdict |
|---|---|---|---|---|
| 1 | Sidi | « Ma moyenne ? 12. » / «معدّلي؟ 12.» | Bulletin disponible, Moyenne générale : 12.00/20 | **VRAI** |
| 2 | Zahra | « Moi… 11 de moyenne. » (sad face, eyes down) / «أنا… معدّلي 11.» | Bulletin disponible, Moyenne générale : 17.25/20 | **FAUX**, in the best way |
| 3 | Papa | « Le 2e trimestre ? Payé cet après-midi. » / «الفصل الثاني؟ دفعته بعد الظهر.» | Paiement enregistré, 7 500 MRU, receipt RCP-2026-000418 | **VRAI** |

**Order of the reveal:** Papa (VRAI), then Sidi (VRAI), then Zahra last. The inbox is
newest first, and the times below put the rows in exactly that order, top to bottom.

**The FAUX that is good news:** the red FAUX stamp lands on Zahra's placard as usual.
Then, one beat later, a gold stamp lands over it: **BRAVO** / «أحسنتِ». Confetti. This
needs a third stamp kind in the kit (see section 5).

**The hidden clues (two, for rewatching):**
1. A gold ribbon rosette peeking out from behind Zahra's placard, from the first frame
   (schools give one for the honour roll).
2. During her sad line, her mouth breaks into a tiny smile for about 4 frames before she
   looks sad again. Blink and you miss it.

**The ending:**
- Headline: « C'était *Zahra*… » / «إنها *زهرة*…»
- Line 2: « Elle avait 17,25. Elle voulait vous faire la surprise. » /
  «معدّلها 17.25. أرادت أن تفاجئكم.»
- The camera pushes in on the ribbon behind her placard; a marker circles it.
  « Tu avais vu le ruban ? » / «هل رأيت الشريط؟»
- The family celebrates: Papa lifts his arms, Sidi claps, Zahra laughs, and Sidi
  looks at the camera as if to say "and me?" (12 is not bad either).
- Outro, the comment question: « Et toi, ta moyenne du 1er trimestre ? » /
  «وأنت، كم معدّلك في الفصل الأول؟»
- Brand line and logo, as in episode 1: « Notes, absences, paiements : *les parents savent*. »

**Optional last beat (the owner decides; build it behind a prop so it can be switched
off):** after the celebration, Papa says « Moi, à ton âge, j'avais 18 de moyenne. » /
«أنا في عمرك كان معدّلي 18.» A grey-blue stamp lands on his placard: **INVÉRIFIABLE** /
«لا يمكن التحقّق». The tag line becomes « Tague un papa qui avait 18 à son âge. » It
teases without calling him a liar, but confirm it fits the tone rules before shipping.

The Arabic lines above are standard-Arabic placeholders. The owner will have them
rewritten in Hassaniya: keep every video word in `copy.ts` so they are easy to replace.

## 4. The notifications, exactly (checked against the code on 2026-09-30)

All three are real parent notifications. The inbox renders them in the app from
`mobile_app/src/i18n/{fr,ar}/notifications.json` (wording identical to
`backend/app/core/notification_i18n.py`). Show them in the **inbox**
(`src/shared/ui/inbox.tsx`), never on a lock screen: a locked phone hides sensitive values.

| Row | Time | Key | Category | Priority (tile) | Params |
|---|---|---|---|---|---|
| 0 | 17:40 | `payment_received` | finance (purple, card icon) | NORMAL, tinted tile | student_name = Zahra Mint Mocktar / زهرة بنت المختار; amount = `7 500` (narrow no-break space, U+202F); receipt_number = RCP-2026-000418 |
| 1 | 12:01 | `report_card_available_parent` | grades (blue, school icon) | HIGH, **filled tile** (`elevated: true`) | student_name = Sidi Ould Mocktar / سيدي ولد المختار; period = 1er trimestre / الفصل الأول; overall_average = `12.00` |
| 2 | 12:00 | `report_card_available_parent` | grades | HIGH, **filled tile** | student_name = Zahra Mint Mocktar; period = 1er trimestre; overall_average = `17.25` |

The report cards are published at noon (the whole class at once, a minute apart), Papa
pays at the desk in the afternoon, and Mum reads everything at 19:42 (the status-bar time
used in episode 1). Keep that order: the check scene in episode 1 zooms onto rows in
on-screen order (window `i` reads row `i`), so the reveal order must be the row order.

**How the average is printed:** the backend sends `overall_average` as a string with two
decimals (`format(round_average(value), ".2f")` in
`backend/app/services/term_publication_service.py`), and the inbox prints it as sent:
**12.00/20** and **17.25/20**, not "12/20". Zahra's spoken line uses the French comma
(17,25); the phone uses the point.

Wording (already in `src/shared/appCopy.ts` `NOTIFS`, verbatim):

- `report_card_available_parent`
  - FR title: `Bulletin disponible — {student_name}`
  - FR message: `Le bulletin de {student_name} pour le {period} est disponible. Moyenne générale : {overall_average}/20. Téléchargez-le depuis les documents.`
  - AR title: `كشف الدرجات متاح — {student_name}`
  - AR message: `كشف درجات {student_name} لـ {period} متاح. المعدّل العام: {overall_average}/20. حمّلوه من الوثائق.`
- `payment_received`: already in `NOTIFS`.

The message is clamped to two lines in the inbox. Check that « Moyenne générale :
17.25/20 » is still visible in both languages at the zoom used (about 2×). If it falls
on the cut-off third line, the episode must show the value another way that the app
really has (for example the parent's child grades screen, which the notification opens:
`action_url=/parent/children/{student_id}/grades`). Do not invent a layout.

## 5. Building it

1. **Reuse the series engine.** Episode 2's brief asks for the lineup, claim, vote,
   check and busted logic to be lifted from `src/videos/verite-01/scenes/` into the kit
   (`src/shared/`). If that is done, build on it; if not, do it first and check that
   `verite-01` still renders the same (`CLAUDE.md`: a video never imports from another
   video). Do not start this in parallel with episode 2's agent: both would rewrite the
   same files.
2. **Create `src/videos/verite-03/`** (compositions `Verite03-FR/AR`, `-Check`,
   `-Cover-*`, per-scene compositions), `public/verite-03/`,
   `scripts/verite-03/make-music.mjs` (copy episode 1's; end on a brighter, celebratory
   cue: the oom-pah in D major can become a fuller, faster groove), `package.json`
   render/cover scripts, the README table and `src/Root.tsx`.
3. **New kit pieces:**
   - A third stamp kind, gold, for **BRAVO**, able to land over an existing FAUX
     (`Stamp` / `Verdict` in `src/shared/ui/lineup.tsx`), and, if the optional beat is
     kept, a neutral grey-blue kind for **INVÉRIFIABLE**.
   - A ribbon rosette behind a placard (gold, two tails), as a `Placard` option.
   - Confetti (a light burst of paper squares in brand and gold colours, drawn from the
     frame, no randomness that changes between renders).
   - Arms up / clapping for the celebration: the busts in `src/shared/ui/people.tsx`
     have no arms today; a simple raised-hands overlay at the placard is enough.
4. **The 4-frame smile** during Zahra's line: drive her `mouth` from the scene's frame
   (smile for 4 frames, then back to `flat` with `worry`).
5. **Timing:** start from episode 1's timeline (57 beats, 28.5 s). The BRAVO beat and the
   celebration need about 2 more beats in `busted`; the optional Papa beat about 4 more
   in `outro`. Keep the whole video at 30 s or less.

## 6. Checks before delivering (from `CLAUDE.md`)

- `npm run typecheck`.
- Render and **look**: stills of every scene in FR and AR, with the `-Check`
  compositions (safe zones: nothing important under the top 220 px, the bottom 420 px or
  the right 140 px). Arabic is mirrored: placard 1 on the right.
- French no-break spaces before `?`, `!`, `:` and inside « ».
- Render both cuts and both covers; measure the audio (decode to WAV with Remotion's
  bundled ffmpeg and check peaks per second, as for episode 1).
- Report what was seen, not what should have happened. Do not commit unless asked.

## 7. Deliverables

`out/verite-03/render-FR.mp4`, `render-AR.mp4`, `cover-FR.jpg`, `cover-AR.jpg` (with and
without the optional Papa beat if it is built), and a short list of anything that needs
the owner's decision.
