# Brief: « La chèvre et le reçu »

Give this file to the agent building the video. It is self-contained. Before starting, read
the repository's `CLAUDE.md` and `README.md`, then one finished video for the house style:
`src/videos/verite-01/` (timeline, copy, scenes) and `src/shared/verite/` (the series engine).

**Video id:** `chevre-01`. It lives in `src/videos/chevre-01/`, `public/chevre-01/` and
`scripts/chevre-01/`, with compositions prefixed `Chevre01-` in a `<Folder name="chevre-01">`.
The goat could become a recurring character later (« La chèvre a encore frappé »), so
build it in the kit (`src/shared/`) and not inside the video.

**Publish:** as soon as it is ready, during fee collection at the start of the school year
(October 2026).

## 1. The idea in one paragraph

A father paid his child's school fees at the school counter. A month later, the school asks
him for the receipt: the goat ate it. **Nobody lies.** The father really paid and the
accountant is honest and polite. The only culprit is the goat. Rewind: the same payment with
MauriSchool. The accountant records it, the father's phone buzzes, and the receipt is in the
app. The goat eats the paper receipt again, but this time it doesn't matter. The goat then
eyes the phone, and the father lifts it out of reach.

Format: 1080×1920, about **27 s** (30 s maximum), **FR and AR**, no voice, music plus sound
effects, 120 BPM beat grid (1 beat = 0.5 s = 15 frames at 30 fps). It **loops**: the last
frame (the goat chewing, looking at the camera) matches the first.

## 2. Tone rules (from the owner, non-negotiable)

- **Nobody is a liar.** The father paid; his « J'ai déjà payé ! » is **true**. The accountant
  is not a villain: she asks for the receipt politely, which is her job. No « menteur », no
  « mensonge », no accusation.
- The father is endearing, never ridiculous: a moment of panic, then a winner's smile.
- Warm and funny. The goat is the comic engine: deadpan, it chews and stares at the camera.
- Audience: Facebook in Mauritania, mostly men aged 25–34, so young fathers. Secondary
  audience: school directors and accountants, the product's buyers.

## 3. Scene by scene

Timings are indicative (in beats of 0.5 s). Time the scenes with `useBeat()` / `useMarks()`,
never with raw frame numbers (`CLAUDE.md`).

| # | Beats | Scene | Headline (FR / AR placeholder) |
|---|---|---|---|
| 1 | 0–5 | **Hook.** Close-up of the goat chewing a scrap of paper. We can read « REÇU N° » and half of a number; the other half is in its mouth. It stares at the camera without blinking, then goes on chewing. | « Papa a payé. » / «بابا دفع.» |
| 2 | 5–10 | Pull back: a courtyard (sand-coloured wall, a door, the midday sun). Papa Ould Mocktar stands frozen, eyes on the goat, hands empty, pockets turned out. | « La chèvre a mangé la preuve. » / «والعنز أكلت الوصل.» |
| 3 | 10–22 | **The counter, one month later.** The accountant behind her counter, with a thick paper register open in front of her. Speech bubble: « Vous avez le reçu ? » / «عندك الوصل؟». Papa: « J'ai déjà payé ! » / «دفعتُ من قبل!». She flips pages of the register quickly (sound: paper). Cut back to the goat for 2 beats, still chewing. A stamp lands in the middle of the screen: **PREUVE : 0** / «الإثبات: 0». | (small tag) « Un mois plus tard… » / «بعد شهر…» |
| 4 | 22–26 | **Rewind.** VHS effect (lines, slight RGB shift, fast reverse sound): the scrap flies out of the goat's mouth, the pages flip back, back to the counter on payment day. | « Même jour. Avec MauriSchool. » / «نفس اليوم. مع MauriSchool.» |
| 5 | 26–32 | Papa hands over the envelope of cash (the `Father` bust already has an `envelope` prop). The accountant enters the payment on her phone: the existing `PaymentScreen` screen (« Enregistrer un paiement »), the amount typed in, then the button. Right after that, **Papa's pocket buzzes**: lock screen with the notification (title only plus the generic message, see section 4). | |
| 6 | 32–42 | **Papa's phone, in the app.** (a) The inbox: the `payment_received` row with the amount and the receipt number, readable (zoom ×2). (b) The **Frais** screen, **Historique** tab: the payment card with its « Télécharger le reçu » link. A tap. (c) The receipt PDF opens: « REÇU DE PAIEMENT ». | « Le reçu arrive tout seul. » / «الوصل يصلك وحده.» |
| 7 | 42–48 | **The twist.** Back in the courtyard. The paper receipt the accountant gave him is in Papa's hand; the goat snatches it and eats it again. Papa doesn't panic; he smiles and shows the phone to the camera. The goat turns its head toward the phone, takes one step. Papa lifts the phone above his head. The goat's ears droop. | « Le reçu ne se perd plus. » / «الوصل لا يضيع بعد اليوم.» |
| 8 | 48–54 | **Outro.** End card: MauriSchool logo, brand line, question for the comments. **Last frame: the goat chewing, looking at the camera**, identical to frame 0 (for the loop). | See section 5 |

**Easter egg for rewatches:** in scene 1 the half-eaten scrap shows the end of the same receipt
number the app shows in scene 6 (e.g. « …0412 »). Anyone who watches again can match them. It
is optional but cheap; keep it if it stays readable.

## 4. What the phone shows (checked in the code on 2026-09-30)

Rule (`CLAUDE.md`): every word on the phone is **verbatim** from the app. Always re-check it in
`../maurischool/mobile_app/src/i18n/{fr,ar}/` and `../maurischool/backend/app/core/notification_i18n.py`.

**Invented data** (add it to `src/shared/demo.ts` if it isn't there yet):

- Father: Papa Ould Mocktar (the `Father` bust from `people.tsx`, the same one as in the
  *Vérité* series).
- Pupil: **Sidi Ould Mocktar / سيدي ولد المختار** (already in `demo.ts`).
- Amount: **7 500 MRU**, printed `7 500` with a narrow no-break space (U+202F), as in
  `verite-03`.
- Receipt number: check the real format produced by `next_payment_number` (backend,
  `services/finance_service.py` says `RCP-YYYY-NNNNNN`, but `models/finance.py` mentions
  `MRS-RCP-2026-000001` with a school prefix). Use whatever the code produces today and pick
  a number ending in `0412`.
- School: `SCHOOL` in `demo.ts` (École Nour El Ilm).

**a) Lock screen (scene 5).** `payment_received` is a **sensitive** notification: a locked
phone shows **the title and the generic message**, never the amount.

- FR title: `Paiement enregistré — Sidi Ould Mocktar`
- FR message: `Ouvrez MauriSchool pour consulter le détail.`
- AR title: `تم تسجيل الدفع — سيدي ولد المختار`
- AR message: `افتحوا MauriSchool للاطّلاع على التفاصيل.`

(`SENSITIVE_PUSH_BODY` in `notification_i18n.py`; component: `LockScreen` + `Notification`
in `src/shared/ui/LockScreen.tsx`.)

**b) Inbox (scene 6a).** `InboxScreen` (`src/shared/ui/inbox.tsx`), category finance. The
wording is already in `src/shared/appCopy.ts` → `NOTIFS.payment_received`:

- FR: `7 500 MRU ont été enregistrés. Le reçu {receipt_number} est disponible. Aucune action requise.`
- AR: `تمّ تسجيل 7 500 أوقية. الوصل {receipt_number} متاح. لا يتطلّب أيّ إجراء.`

The message is clamped to two lines: check in FR **and** AR that the amount and the receipt
number are visible before the cut. If the number falls on the cut-off line, don't invent
anything: show it on the receipt (6c).

**c) Parent « Frais » screen (scene 6b).** New in the kit: rebuild it faithfully from
`../maurischool/mobile_app/app/(app)/(parent)/fees.tsx`, reusing `appkit.tsx`
(`ScreenHeader`, `StatCard`, `Card`, `FloatingTabBar`). Layout from top to bottom:
title, two `StatCard`s (« Total dû » = 0 in success green; « Montant en retard » = `0`),
a two-tab toggle (« Frais en attente (0) » / « Historique (1) », Historique active with
the `receipt-outline` icon), then the payment card: description in semibold, then
`Sidi Ould Mocktar - {invoice_number}`, amount in success green and date on the right,
and at the bottom, separated by a line, the brand-coloured link with the
`download-outline` icon.

| Key (`common.json`) | FR | AR |
|---|---|---|
| `fees` (title and tab) | Frais | الرسوم |
| `totalDue` | Total dû | المبلغ المستحق |
| `overdueAmount` | Montant en retard | المبلغ المتأخر |
| `pendingFees` | Frais en attente | الرسوم المعلقة |
| `paymentHistory` | Historique | السجل |
| `downloadReceipt` | Télécharger le reçu | تحميل الإيصال |

The payment's description comes from the school (it is not an app string): invent a
plausible one in both languages, e.g. « Scolarité — Octobre » / «رسوم الدراسة — أكتوبر».
Invoice number: check `next_invoice_number` for the format (`INV-YYYY-NNNNNN`).
Date: `TODAY` from `demo.ts` or a nearby date, in the app's format (dd/mm/yyyy).

**d) The receipt PDF (scene 6c).** The template is
`../maurischool/backend/app/templates/documents/financial.html` (called by `pdf_service.py`,
`document_type="payment_receipt"`); the title is « REÇU DE PAIEMENT » / «إيصال دفع». Rebuild
a simplified but faithful version (header with the school, title, number, pupil, amount,
date). Look at the real template before drawing it.

**e) The accountant's side (scene 5).** `PaymentScreen` (`src/shared/ui/screens2.tsx`)
already exists with « Enregistrer un paiement ». Check that the pupil shown is Sidi (the
component currently uses `PUPIL`, i.e. Mariem Mint Ahmed: make it a prop, without
breaking the videos that use it).

**Accuracy:** payment happens **at the counter, in cash**. The app has no online payment
(fees.tsx comment: "there is no payment gateway"). Never show payment inside the app.

## 5. Video copy (in `src/videos/chevre-01/copy.ts`)

All the video's text goes in `copy.ts`. The Arabic lines below are **standard-Arabic
placeholders**; the owner will have them rewritten in Hassaniya, so keep them in one place.
For "receipt", the video uses **الوصل** (the word in the notification, and the everyday one);
the phone shows whatever the app says (الإيصال on the button).

| Key | FR | AR (placeholder) |
|---|---|---|
| hook | Papa a payé. | بابا دفع. |
| hook2 | La chèvre a mangé *la preuve*. | والعنز أكلت *الوصل*. |
| later | Un mois plus tard… | بعد شهر… |
| askReceipt (accountant) | Vous avez le reçu ? | عندك الوصل؟ |
| paid (Papa) | J'ai déjà payé ! | دفعتُ من قبل! |
| stamp | PREUVE : 0 | الإثبات: 0 |
| rewind | Même jour. *Avec MauriSchool.* | نفس اليوم. *مع MauriSchool.* |
| auto | Le reçu arrive *tout seul*. | الوصل يصلك *وحده*. |
| end | Le reçu *ne se perd plus*. | الوصل *لا يضيع* بعد اليوم. |
| brand | Notes, absences, paiements : *les parents savent*. | الدرجات، الغياب، المدفوعات: *الأولياء يعلمون*. |
| ask (comments) | Et chez vous, la chèvre a mangé quoi ? | وعندكم، ماذا أكلت العنز؟ |
| tag (caption bar, optional) | Identifie celui qui perd toujours ses reçus. | أشِر إلى من يُضيّع وصولاته دائمًا. |

French: no-break space (U+00A0) before `?`, `!`, `:` and inside « » (`CLAUDE.md`).
`brand` is the same line as in the *Vérité* series (`verite-03/copy.ts`): reuse it rather
than copying it.

**Suggested caption for the post** (not in the video):
FR « Et chez vous, la chèvre a mangé quoi ? 🐐 #MauriSchool #Mauritanie #école »;
AR «وعندكم، ماذا أكلت العنز؟ 🐐 #MauriSchool #موريتانيا».

## 6. What to build

**Reuse (don't rewrite):** `people.tsx` (`Father` with `envelope`, `Face` for expressions),
`LockScreen.tsx`, `inbox.tsx`, `screens2.tsx` (`PaymentScreen`), `appkit.tsx`, `Device.tsx`,
`lineup.tsx` (`Stamp`, `SpeechBubble`), `fx.tsx` (`Camera`, `CameraPath`, `Backdrop`,
`Grain`, `SafeZones`), `LogoMark`, `sound.ts` and `public/shared/sfx/` (stamp, pop, whoosh,
paper…), `beat.ts`.

**New pieces, in the kit (`src/shared/`):**

1. **The goat** (`src/shared/ui/goat.tsx`): side/three-quarter view, flat vector style
   consistent with `people.tsx`. Props driven by the frame: `chew` (jaw cycle), `look`
   (toward the camera / toward an object), `blink`, `ears` (up / droopy), `step`, and a
   `paper` option (a scrap in its mouth with a label). Colours: white and light brown, or
   black and white (common in Mauritania). This is the most important piece: its stare at
   the camera makes the video.
2. **The accountant**: a woman's bust in a melhfa (in the spirit of `Girl`, but an adult),
   neutral and friendly. If a mother character exists or is planned for *Vérité*, don't
   reuse her here: this is a stranger.
3. **The courtyard** (sand wall, door, sun, ground) and **the counter** (a school desk seen
   from the front, with a « Caisse » / «الصندوق» sign? only if it stays sober) with the
   register (thick open notebook, pages that flip).
4. **The paper receipt** (a prop: a small carbon-copy sheet, torn scrap version).
5. **`ParentFeesScreen`** (section 4c) and **`ReceiptDoc`** (4d), in `src/shared/ui/`.
6. **The VHS rewind** in `fx.tsx` or `transitions.ts` (scanlines, RGB shift, "◀◀"
   overlay, reverse sound). Reusable.
7. A stamp label that is not a *VRAI/FAUX* verdict (`PREUVE : 0`): extend `Stamp` without
   breaking `verite-*`.

**Plumbing:** compositions `Chevre01-FR`, `Chevre01-AR`, `Chevre01-Check` (safe zones),
`Chevre01-Cover-FR/AR`, one composition per scene; `src/Root.tsx`; `package.json`
render/cover scripts on the model of `verite-*`; the video table in `README.md`;
`scripts/chevre-01/make-music.mjs` (copy `scripts/verite-01/make-music.mjs`: playful and
light, a small "suspense" cue for the counter, a rewind, then a bright ending; 120 BPM).
Sound effects: chewing (loop), paper, stamp, rewind, phone vibration, a disappointed
little "bêê" at the end (generate them with a script like `scripts/make-lineup-sfx.mjs`,
no downloads).

**Cover** (first frame and cover image): the goat with the scrap « REÇU N° … » in its
mouth, staring at the camera, plus « Papa a payé. La chèvre a mangé la preuve. » It has to
read as a thumbnail on a profile grid.

## 7. Checks before delivering (`CLAUDE.md`)

- `npm run typecheck`.
- Render and **look**: a still of every scene, FR and AR, with `Chevre01-Check` (nothing
  important in the top 220 px, the bottom 420 px, or the right 140 px). Arabic is mirrored
  (RTL): check the phone, the bubbles and the stamp.
- The app in light mode (the default parent phone); check dark mode if a screen supports it.
- Every word on the phone compared against the app files (section 4); the amount never
  visible on the lock screen.
- The loop: compare the last frame and frame 0.
- Render both cuts and both covers; measure the audio (decode to WAV with Remotion's
  bundled ffmpeg, check peaks per second). Pipe renders through `set -o pipefail`.
- `verite-01/02/03` and `teachers-day-2026` still render the same after the kit changes
  (`PaymentScreen`, `Stamp`): a still of each affected scene before and after.
- Report what was seen, not what should have happened. **Don't commit** unless asked.

## 8. Deliverables

`out/chevre-01/render-FR.mp4`, `render-AR.mp4`, `cover-FR.jpg`, `cover-AR.jpg`, a contact
sheet per language (`scripts/contact-sheet.mjs`), and a short list of decisions left to
the owner (e.g. the goat's colour, the accountant's wording, the optional easter egg, the
Arabic lines to rewrite in Hassaniya).
