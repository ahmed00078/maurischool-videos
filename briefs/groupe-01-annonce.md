# Brief: « Le groupe des parents »

Give this file to the agent building the video. It is self-contained. Before starting, read
the repository's `CLAUDE.md` and `README.md`, then the latest finished video for the house
style and the newest kit pieces: `src/videos/chevre-01/` (timeline, copy, scenes, `stage.tsx`).

**Video id:** `groupe-01`. It lives in `src/videos/groupe-01/`, `public/groupe-01/` and
`scripts/groupe-01/`, with compositions prefixed `Groupe01-` in a `<Folder name="groupe-01">`.

**Publish:** mid-October 2026, while parents' groups are flooded with start-of-year messages.

## 1. The idea in one paragraph

Every parent in Mauritania is in a class group chat with hundreds of unread messages:
good-morning flowers, voice notes, « Amine 🤲 », forwarded chains, a lost jumper. On Tuesday
the director posted the one message that mattered: « Composition de maths jeudi ». It sank
under the flood. On Thursday morning Sidi asks « c'est la compo aujourd'hui ?! » and Papa finds
the message, two days late. Rewind: on Tuesday the director sends **one MauriSchool
announcement** to the class. Papa's phone shows it straight away, and on Wednesday evening father
and son revise together. The group keeps buzzing; Papa turns the phone face down and smiles.

Format: 1080×1920, about **28 s** (30 s maximum), **FR and AR**, no voice, music plus sound
effects, 120 BPM beat grid (1 beat = 0.5 s = 15 frames at 30 fps). It **loops**: the last
frame (the unread counter climbing) matches the first.

## 2. Tone rules (from the owner, non-negotiable)

- **Nobody is at fault.** The director did send the message; the parents in the group are
  kind people wishing each other a good morning. The only problem is that one important
  message gets lost among 312. Never mock a parent, a religious expression (« Amine », a
  du'a, a Friday greeting) or anyone's way of writing. The humour is the **volume**, not the
  people.
- Papa is endearing: a moment of panic on Thursday, then relief and complicity with his son.
- Sidi never lies and is not scolded.
- Audience: Facebook in Mauritania, mostly men aged 25–34, so young fathers. Secondary
  audience: school directors, the buyers, who all know that "I posted it in the group" isn't
  enough.

**Brand caution (important):** do **not** reproduce WhatsApp's logo, name, icons or exact
interface. Draw a **generic chat app** that evokes it (green header, bubbles, a tiled
background, an unread badge, double ticks) without copying it. The word "WhatsApp" appears
nowhere in the video (the video copy says « le groupe des parents »). The existing
`WhatsAppGlyph` in `Illustrations.tsx` must **not** be used in this video.

## 3. Scene by scene

Timings are indicative (in beats of 0.5 s). Time the scenes with `useBeat()` / `useMarks()`,
never with raw frame numbers (`CLAUDE.md`).

| # | Beats | Scene | Headline (FR / AR placeholder) |
|---|---|---|---|
| 1 | 0–4 | **Hook.** A close-up of the phone: the chat list, the row « Parents 5e A 🎒 » with a green badge counting up fast (+1 sound on each tick) and freezing at **312**. | « 312 messages non lus. » / «312 رسالة غير مقروءة.» |
| 2 | 4–14 | **The flood.** Tuesday evening, Papa Ould Mocktar (the `Father` bust) on the sofa, face lit by the phone. He scrolls; bubbles fly past faster and faster (see section 4 for the list). Among them, for about **6 frames**, the director's message goes by: « Composition de maths jeudi. Révisez le chapitre 3. » Papa's eyes glaze; he yawns and puts the phone down. | « Le message important est là. *Quelque part.* » / «الرسالة المهمة هنا. *في مكان ما.*» |
| 3 | 14–21 | **Thursday morning.** The wall calendar (`WallCalendar` from `places.tsx`) flips from Tuesday to Thursday. Sidi in the doorway, schoolbag on his back, eyes wide: « Papa… c'est la compo aujourd'hui ?! » / «بابا… الامتحان اليوم؟!». Papa scrolls up frantically, finds the message and its date: **Mardi 18:04**. Freeze on his face. | « Lu jeudi. » / «قُرئت الخميس.» |
| 4 | 21–24 | **Rewind.** The `Vhs` effect from `fx.tsx` with `osd="rew"`: the bubbles scroll back down, the calendar goes back to Tuesday. | « Mardi. *Avec MauriSchool.* » / «الثلاثاء. *مع MauriSchool.*» |
| 5 | 24–31 | **The director's side**, in the app (section 5a): the « Nouvelle annonce » screen already filled in (title, content), audience « Par classe » → 5e A, the recipients count, a tap on « Envoyer l'annonce », the confirmation, then the toast « Annonce envoyée à … destinataire(s) ». Three quick moments, not every step. | « Un seul message. *À toute la classe.* » / «رسالة واحدة. *لكل القسم.*» |
| 6 | 31–38 | **Papa's phone, Tuesday 18:04.** It buzzes: the lock screen shows the announcement **with its text** (section 5b). A tap: the inbox, the announcement row on top, megaphone tile. | « Il le voit *le jour même*. » / «يراها *في نفس اليوم*.» |
| 7 | 38–47 | **Wednesday evening.** Papa and Sidi at the table (`DeskLamp`, `TeaGlass` from `desk.tsx`), Sidi writing, Papa pointing at the exercise book. Papa's phone lights up again: a new group bubble, « Amine 🤲 ». Papa smiles, turns the phone **face down**, and goes back to the exercise. | « Le groupe peut attendre. » / «المجموعة يمكنها الانتظار.» |
| 8 | 47–56 | **Outro.** End card: MauriSchool logo, brand line, question for the comments. **Last frame:** the chat-list row again, its badge climbing, identical to frame 0 (for the loop). | See section 6 |

**Easter egg for rewatches:** in scene 2 the director's message is visible for about 6 frames
in the flood. Anyone who pauses can find it. Make it legible at full size, even if it goes by
fast.

**Optional gag (the agent may propose it; the owner decides):** in scene 7, a parent in the
group posts « Quelqu'un sait s'il y a compo jeudi ? », a nod to the whole problem.

## 4. The group chat (invented, not the app)

This part is **not** MauriSchool, so the verbatim rule does not apply. Data is invented;
do not use the names of real people. Write it in both languages (the AR cut shows Arabic
bubbles, RTL). Suggested content, in scroll order (the agent can adjust):

- « Bonjour à tous 🌸 » with a flower picture (a drawn image, not a photo)
- a voice note 0:47, then another 2:13
- « Amine 🤲 » ×5 from different parents (different avatar colours)
- « Qui a vu le pull bleu de Mariem ? »
- a forwarded message with the « Transféré plusieurs fois » tag (generic label, any
  wording that isn't a copy of WhatsApp's)
- **the director:** « Composition de maths jeudi. Révisez le chapitre 3. » — sender
  « Directeur », Tuesday 18:04
- a big good-morning picture, a sticker, « Amine 🤲 » ×3
- a voice note 4:58

Group name: « Parents 5e A 🎒 » / «أولياء الخامسة أ 🎒». The class is `PUPIL_CLASS` in
`src/shared/demo.ts` (5e A). Chat sender names: « Maman de Mariem », « Papa d'Ahmed »… /
«أم مريم»، «أبو أحمد»… (invented).

Build it as a reusable kit component (`src/shared/ui/chat.tsx`): `ChatList` (rows with
avatar, name, last message, time, badge) and `ChatThread` (bubbles: text, voice note, image,
sticker, forwarded, with a scroll driven by the frame). A future video will want it.

## 5. What the MauriSchool app shows (checked in the code on 2026-09-30)

Rule (`CLAUDE.md`): every word of the **app** on the phone is **verbatim**. Always re-check it
in `../maurischool/mobile_app/src/i18n/{fr,ar}/` and in the backend.

**How announcements work** (`backend/app/schemas/announcement.py`,
`backend/app/services/announcement_service.py`, `backend/app/core/notification_catalog.py`):

- Only the **school admin** (the director) can send one (`Capability.ANNOUNCEMENT_MANAGE`).
- The title (≤ 120 characters) and body (≤ 1000) are **free text** written by the director and
  shown **verbatim**, whatever the reader's language. So the title and body are invented data:
  in French in the FR cut, in Arabic in the AR cut (the director writes in the parents'
  language).
- Audience: « Toute l'école », « Par rôle » or « Par classe ». For a class, the recipients are
  **the class's pupils, their guardians and its assigned teachers**; the sender is excluded.
- In the inbox: category `announcements` → icon **`megaphone`**, **brand** colour
  (`mobile_app/src/components/shared/notificationCategories.ts`); priority **HIGH** → filled
  tile (`elevated: true` in `src/shared/ui/inbox.tsx`, which does not have the
  `announcements` category yet: add it).
- Not sensitive: unlike a payment or a grade, the text **is visible on the lock screen**.
  Check this in the push delivery path (`notification_event_service.py`: which title and body
  go to the push for an `ANNOUNCEMENT`) before drawing it.

**Invented announcement:**

| | FR | AR |
|---|---|---|
| Title | Composition de maths jeudi | امتحان الرياضيات يوم الخميس |
| Body | Révisez le chapitre 3. Apportez une calculatrice. | راجعوا الفصل الثالث. أحضروا آلة حاسبة. |

It must be the **same text** as the director's message in the group (scene 2): same sender,
same day, same content, different channel. Only the channel changes.

**a) The composer (scene 5)**: rebuild it faithfully from
`../maurischool/mobile_app/src/components/admin/AnnouncementComposer.tsx` (read the layout:
sections, fields, audience picker, recipients breakdown, button) with `appkit.tsx`. Wording
(`admin.json` → `announcements`):

| Key | FR | AR |
|---|---|---|
| `title` | Nouvelle annonce | إعلان جديد |
| `subtitle` | Message immédiat à la communauté | رسالة فورية إلى المجتمع المدرسي |
| `messageSection` | Message | الرسالة |
| `titleLabel` | Titre | العنوان |
| `bodyLabel` | Contenu | المحتوى |
| `audienceSection` | Destinataires | المستلمون |
| `audience_school` / `_role` / `_class` | Toute l'école / Par rôle / Par classe | كل المدرسة / حسب الدور / حسب القسم |
| `recipientsTitle` | Destinataires | المستلمون |
| `roleCount.*` | élèves, parents, enseignants | Arabic plural forms: use `_few` / `_many` / `_other` by count, as i18next would |
| `send` | Envoyer l'annonce | إرسال الإعلان |
| `confirmTitle` | Envoyer l'annonce ? | إرسال الإعلان؟ |
| `confirmMessage` | Cette annonce sera envoyée à {{count}} destinataire(s) : {{audience}}. | سيُرسَل هذا الإعلان إلى {{count}} مستلم: {{audience}}. |
| `confirmSend` | Envoyer | إرسال |
| `successToast` | Annonce envoyée à {{count}} destinataire(s) | تم إرسال الإعلان إلى {{count}} مستلم |

The French apostrophes in these strings are typographic (’): copy them from the JSON file,
do not retype them.

Recipient count: plausible and consistent. 5e A has `CLASS_SIZE` = 28 pupils in `demo.ts`,
so for example 28 pupils + 41 parents + 9 teachers = **78**. Check how the composer shows the
breakdown (per role, then total) and follow it exactly. Toast: `AppToast` in `teacher.tsx`
if it matches the app's toast; otherwise rebuild the success toast from the app.

**b) Papa's lock screen (scene 6)**: `LockScreen` + `Notification`
(`src/shared/ui/LockScreen.tsx`), time **18:04**, title and body of the announcement (after
checking section 5 above). Then the inbox (`InboxScreen`): the announcement row on top, unread,
megaphone in a filled brand-coloured tile, time 18:04.

## 6. Video copy (in `src/videos/groupe-01/copy.ts`)

All the video's text goes in `copy.ts`. The Arabic lines are **standard-Arabic placeholders**;
the owner will have them rewritten in Hassaniya, so keep them in one place.

| Key | FR | AR (placeholder) |
|---|---|---|
| hook | 312 messages non lus. | 312 رسالة غير مقروءة. |
| lost | Le message important est là. *Quelque part.* | الرسالة المهمة هنا. *في مكان ما.* |
| sidi (bubble) | Papa… c'est la compo aujourd'hui ?! | بابا… الامتحان اليوم؟! |
| late | Lu jeudi. | قُرئت الخميس. |
| rewind | Mardi. *Avec MauriSchool.* | الثلاثاء. *مع MauriSchool.* |
| one | Un seul message. *À toute la classe.* | رسالة واحدة. *لكل القسم.* |
| sameDay | Il le voit *le jour même*. | يراها *في نفس اليوم*. |
| wait | Le groupe peut attendre. | المجموعة يمكنها الانتظار. |
| end | L'école vous parle. *Directement.* | المدرسة تكلّمكم. *مباشرة.* |
| brand | `BRAND_LINE` from `src/shared/brand.ts` (don't copy it) | |
| ask (comments) | Combien de messages non lus dans ton groupe ? | كم رسالة غير مقروءة في مجموعتك؟ |

In Mauritania « la compo » (composition) is the word for a class test; keep it. French:
no-break space (U+00A0) before `?`, `!`, `:` and inside « » (`CLAUDE.md`).

**Suggested caption for the post** (not in the video):
FR « Combien de messages non lus dans ton groupe de parents ? 📱 #MauriSchool #Mauritanie »;
AR «كم رسالة غير مقروءة في مجموعة الأولياء؟ 📱 #MauriSchool #موريتانيا».

## 7. What to build

**Reuse (don't rewrite):** `people.tsx` (`Father`, `Boy` for Sidi, `Face`), `places.tsx`
(`WallCalendar`, and a room if one fits), `desk.tsx` (`DeskLamp`, `TeaGlass`, `WritingHand`),
`fx.tsx` (`Vhs`, `Camera`, `CameraPath`, `Backdrop`, `Grain`, `SafeZones`), `lineup.tsx`
(`SpeechBubble`), `LockScreen.tsx`, `inbox.tsx`, `appkit.tsx`, `Device.tsx`, `teacher.tsx`
(`AppToast`, `AppButton`), `LogoMark`, `brand.ts`, `sound.ts`, `public/shared/sfx/` (pop, tick,
whoosh, rewind…), `beat.ts`. Sidi and Papa are the Ould Mocktar family from `demo.ts`.

**New pieces, in the kit (`src/shared/`):**

1. **`chat.tsx`**: the generic chat app (section 4). Light theme, RTL in Arabic.
2. **`AnnouncementComposerScreen`** (section 5a), in `src/shared/ui/`.
3. The **`announcements`** category in `inbox.tsx` (megaphone, brand colour); `megaphone`
   (filled) in `Ionicon.tsx` if it is missing (only `megaphone-outline` is there today).
4. A **living room** (a sofa or mattress with cushions, evening light) if `places.tsx` has
   nothing suitable, and a table for the revision scene.
5. **Sound effects:** a notification "pop" in a rapid series for the counter (reuse `pop` or
   `tick`), a phone vibration, the swoosh of a fast scroll. Generate any missing ones with a
   script in the style of `scripts/make-goat-sfx.mjs`, no downloads.

**Plumbing:** compositions `Groupe01-FR`, `Groupe01-AR`, `Groupe01-Check` (safe zones),
`Groupe01-Cover-FR/AR`, one composition per scene; `src/Root.tsx`; `package.json`
render/cover scripts on the model of `chevre-01`; the video table in `README.md`;
`scripts/groupe-01/make-music.mjs` (copy `chevre-01`'s: a busy, bubbly start, a "panic" hit
on Thursday, the rewind, then a calm, warm groove for the evening revision; 120 BPM).

**Cover:** the chat-list row with the **312** badge in big type plus « 312 messages non lus. »
It has to read as a thumbnail on a profile grid.

## 8. Checks before delivering (`CLAUDE.md`)

- `npm run typecheck`.
- Render and **look**: a still of every scene, FR and AR, with `Groupe01-Check` (nothing
  important in the top 220 px, the bottom 420 px, or the right 140 px). Arabic is mirrored
  (RTL): the chat, the composer, the phone.
- Every **app** word compared against the files (section 5); the announcement push checked in
  the backend before it is drawn with its text on the lock screen.
- No WhatsApp logo, name or copied interface anywhere, cover included.
- The director's message in the group and the announcement are the same text.
- The easter egg (scene 2) is readable on a paused frame.
- The loop: compare the last frame and frame 0.
- Render both cuts and both covers; measure the audio (decode to WAV with Remotion's bundled
  ffmpeg, check peaks per second). Pipe renders through `set -o pipefail`.
- If kit components change (`inbox.tsx`, `Ionicon.tsx`, `places.tsx`…), the videos that use
  them (`chevre-01`, `verite-*`, `teachers-day-2026`) still render the same: a still of each
  affected scene before and after.
- Report what was seen, not what should have happened. **Don't commit** unless asked.

## 9. Deliverables

`out/groupe-01/render-FR.mp4`, `render-AR.mp4`, `cover-FR.jpg`, `cover-AR.jpg`, a contact
sheet per language (`scripts/contact-sheet.mjs`), and a short list of decisions left to the
owner (e.g. the optional gag, the group's content, the Arabic lines to rewrite in Hassaniya).
