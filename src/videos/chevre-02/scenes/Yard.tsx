import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { NOTIFS, fill } from '../../../shared/appCopy';
import { useBeat } from '../../../shared/beat';
import { dramaZoom, DramaSound, EndCard, ReplayBand, ReplayLook, SeriesTag, TOP_UNDER_BUG } from '../../../shared/chevre/marks';
import { SERIES } from '../../../shared/chevre/series';
import {
  Bits,
  BOY_COLORS,
  Chewing,
  GOAT,
  GOAT_FACE,
  GoatClose,
  goatMouth,
  HeldPhone,
  INK,
  PAPA_YARD,
  papaAt,
  PapaState,
  SHOT,
  SIDI_YARD,
  sidiAt,
  SidiState,
  snatch,
  Yard,
} from '../../../shared/chevre/stage';
import { FAMILY, GRADE_TEST } from '../../../shared/demo';
import { useBi, useLang } from '../../../shared/lang';
import { Sfx, Top } from '../../../shared/rig';
import { EASE_IN_OUT, tween } from '../../../shared/tokens';
import { DEVICE_H } from '../../../shared/ui/Device';
import { GoatState } from '../../../shared/ui/goat';
import { Headline } from '../../../shared/ui/Headline';
import { InboxScreen } from '../../../shared/ui/inbox';
import { TEST_SHEET, TestSheet } from '../../../shared/ui/paper';
import { COPY, TEST_WORDS } from '../copy';

type Pt = [number, number];

/** The test in this cut's language. */
const useTest = () => TEST_WORDS[useLang().lang];

/** The scrap in her mouth: the red « 17/20 » and « Très bien ! », sticking out where you can read it. */
const Scrap: React.FC = () => <TestSheet words={useTest()} scrap bitten />;
const SCRAP_AT = { angle: -6, scale: 0.6 } as const;
export const scrapPaper = (): GoatState['paper'] => ({ node: <Scrap />, ...SCRAP_AT });

// ── 1 · hook: the cover ──

/**
 * 1 · hook, and the cover: her face close, chewing on the beat, staring at
 * you; the scrap in her mouth shows the red 17/20, still and readable from the
 * first frame. The series' tag, « ÉP. 2 », « La copie », and « Sidi a eu 17. »
 * Behind her, blurred, Sidi with his hands still up.
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  // A slow blink at 3, then her eyes slide to the side, toward Sidi, and back to you.
  const side = tween(frame, [b(4.2), b(4.5)]) * (1 - tween(frame, [b(5.3), b(5.6)]));
  return (
    <AbsoluteFill>
      <GoatClose
        goat={{ paper: scrapPaper(), lids: 0.35, blink: Math.max(0, 1 - Math.abs(frame - b(3)) / 4), look: [0.9 * side, 0.1 * side] }}
        papa={null}
        sidi={{ face: { mouth: 'wobble', brows: 0.5, worry: 1, look: [-0.6, 0.6] }, left: { to: [180, 560], bend: -40 }, right: { to: [330, 560], bend: 40 } }}
      />
      <Top gap={8} style={{ top: TOP_UNDER_BUG }}>
        <SeriesTag />
        <Headline text={bi(COPY.hook)} at={-100} size={rtl ? 90 : 104} {...INK} />
      </Top>
      <Chewing from={0} to={6} volume={0.5} />
    </AbsoluteFill>
  );
};

// ── 2 · replay ──

/** Where Sidi holds his test: its top-left corner on the canvas, its width. */
const TEST_AT = { x: 600, y: 1228, width: 300 } as const;
const TEST_K = TEST_AT.width / TEST_SHEET.w;
/** His hands on the sheet's edges, a third of the way down, in his own units. */
const toSidi = ([x, y]: Pt): Pt => [(x - SIDI_YARD.left) / (SIDI_YARD.width / 400), (y - SIDI_YARD.top) / (SIDI_YARD.width / 400)];
// Low enough on the sheet that neither hand covers the mark.
const GRIP_L: Pt = [TEST_AT.x + 14, TEST_AT.y + 220];
const GRIP_R: Pt = [TEST_AT.x + TEST_AT.width - 10, TEST_AT.y + 250];

/** The test in his hands, his hands over its edges. */
const HeldTest: React.FC = () => {
  const words = useTest();
  return (
    <>
      <svg
        width={TEST_AT.width}
        height={TEST_SHEET.h * TEST_K}
        viewBox={`0 0 ${TEST_SHEET.w} ${TEST_SHEET.h}`}
        style={{ position: 'absolute', left: TEST_AT.x, top: TEST_AT.y, overflow: 'visible', rotate: '3deg', filter: 'drop-shadow(0 8px 14px rgba(40,25,10,0.3))' }}
      >
        <TestSheet words={words} />
      </svg>
      {[GRIP_L, GRIP_R].map(([x, y], i) => (
        <div key={i} style={{ position: 'absolute', left: x - 28, top: y - 30, width: 56, height: 60, borderRadius: 26, background: BOY_COLORS.skin, boxShadow: 'inset -6px -4px 0 rgba(0,0,0,0.12)' }} />
      ))}
    </>
  );
};

/** The replay on its own clock: real time to the bite's lead-in, then about a third of real speed. */
const SLOW = 0.35;
/**
 * Replay beats. On the slowed clock (`t`): she turns to the paper, bites,
 * pulls it home, chomps it to a scrap. In real beats: the band, the words, the
 * slow motion's start and the replay's end.
 */
const RP = { band: 0.15, words: 0.5, slowFrom: 2.0, eye: 1.2, bite: 2.35, back: 2.9, chomp: 3.2, end: 6.85 } as const;
/** The replay's shot: Sidi's face, the test's mark and her head in one frame. */
const REPLAY_SHOT = { zoom: 1.32, focus: [700, 1270] as Pt, to: [560, 1150] as Pt };

/**
 * 2 · replay, in slow motion (« RALENTI »): the yard, Sidi beaming, the whole
 * test held up toward the house, the red 17/20 readable. Her head comes in,
 * bites, pulls it out of his hands; his grin turns to an « o ». « La chèvre a
 * mangé la preuve. »
 */
export const ReplayScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const words = useTest();
  const from = b(RP.slowFrom);
  // Real time to `from`, then slowed: `t` is the clock the action runs on.
  const t = frame < from ? frame : from + (frame - from) * SLOW;
  // Events are beats of `t`, the slowed clock: the bite at 2.35 lands at real beat 2.95.
  const at = b;
  const s = snatch(t, at(RP.bite), at(RP.back));
  const chomped = t >= at(RP.chomp);
  const eyeOn = tween(t, [b(RP.eye), b(RP.eye) + 6]);
  const goat: GoatState = {
    chew: s.chewing ? t / 15 : 0,
    reach: s.reach,
    open: s.open,
    turn: 6 * eyeOn * (s.taken ? 0 : 1),
    look: s.chewing ? [0, 0] : [0.9 * eyeOn, 0.1],
    lids: s.chewing ? 0.35 : 0.1,
    paper: s.taken
      ? chomped
        ? scrapPaper()
        : { node: <TestSheet words={words} bitten />, angle: 16, scale: (TEST_AT.width / TEST_SHEET.w) / 1.517 }
      : undefined,
  };
  const gasp = tween(t, [at(RP.bite), at(RP.bite) + 6]);
  const sidi: SidiState = {
    face: s.taken
      ? { mouth: 'o', brows: 1, worry: 0.5 * gasp, look: [-0.8, 0.7] }
      : { mouth: 'grin', brows: 0.6, look: [0.1, 0.2] },
    // His hands stay where the paper was: frozen, empty.
    left: { to: toSidi(GRIP_L), bend: -30 },
    right: { to: toSidi(GRIP_R), bend: 30 },
  };
  const mouth = goatMouth({ reach: goat.reach, turn: goat.turn });
  return (
    <AbsoluteFill>
      <ReplayLook from={0} to={b(RP.end)}>
        <Yard
          goat={goat}
          papa={null}
          sidi={sidi}
          shots={[{ at: 0, ...REPLAY_SHOT }]}
          under={!s.taken ? <HeldTest /> : null}
          items={
            <>
              {s.taken ? (
                [GRIP_L, GRIP_R].map(([x, y], i) => (
                  <div key={i} style={{ position: 'absolute', left: x - 28, top: y - 30, width: 56, height: 60, borderRadius: 26, background: BOY_COLORS.skin }} />
                ))
              ) : null}
              <Bits at={at(RP.chomp)} mouth={mouth} clock={t} color="#fdfdf7" />
            </>
          }
        />
      </ReplayLook>
      <ReplayBand at={b(RP.band)} out={b(RP.end)} />
      <Top style={{ top: TOP_UNDER_BUG }}>
        <Headline text={bi(SERIES.catchphrase)} at={b(RP.words)} size={rtl ? 76 : 76} {...INK} />
      </Top>
      <Sfx at={0} name="whoosh" volume={0.4} rate={0.7} />
      {/* The bite, slowed: the whip and the tear a fifth lower */}
      <Sfx at={from + (at(RP.bite) - 3 - from) / SLOW} name="whip" volume={0.6} rate={0.55} />
      <Sfx at={from + (at(RP.bite) + 2 - from) / SLOW} name="paper" volume={0.6} rate={0.6} />
      <Sfx at={from + (at(RP.chomp) - from) / SLOW} name="tear" volume={0.5} rate={0.6} />
    </AbsoluteFill>
  );
};

// ── 3 · drama ──

/** Sidi's face on the canvas. */
const SIDI_FACE = sidiAt([200, 250]);
/** The three hits, in beats. */
const DZ = [0.45, 1.05, 1.75] as const;

/**
 * 3 · drama: normal speed again. Sidi, empty-handed, frozen; three hard steps
 * in on his face, « dun, dun, DUN ». Beside him she chews and stares at you.
 * « Papa ne le saura jamais. »
 */
export const DramaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const hits = DZ.map((x) => b(x)) as [number, number, number];
  const zoom = dramaZoom(frame, hits, [1.0, 1.3, 1.65, 2.15]);
  const g = frame / 30;
  return (
    <AbsoluteFill>
      <Yard
        goat={{ paper: scrapPaper(), lids: 0.35 }}
        papa={null}
        sidi={{ face: { mouth: 'wobble', brows: 0.4, worry: 1, sweat: tween(frame, [b(1.8), b(2.2)]), look: [0, 0.1], t: g }, tilt: -3 }}
        // His face drifts up the frame as the camera goes in, clear of the words, her face still in the corner.
        shots={[{ at: 0, zoom, focus: SIDI_FACE, to: [560 - 20 * (zoom - 1), 1080 + 40 * (zoom - 1)] }]}
      />
      <Top style={{ top: TOP_UNDER_BUG }}>
        <Headline text={bi(COPY.never)} at={b(0.15)} size={rtl ? 80 : 80} {...INK} />
      </Top>
      <DramaSound hits={hits} />
      <Chewing from={0.5} to={4} volume={0.35} />
    </AbsoluteFill>
  );
};

// ── 6 · revenge ──

/**
 * Revenge beats: Papa there with his phone (the grade on it), Sidi's grin,
 * her eyes on the phone, her steps, the phone up, her neck after it, her
 * ears; the whistle (the score bug, shared/chevre/episode.tsx) at
 * REVENGE_GOAL, and her stare.
 */
const RV = { look: 0.9, step: [1.2, 2.0], lift: [2.0, 2.5], stretch: [2.6, 3.1], ears: 3.3, stare: 4.0 } as const;
export const REVENGE_GOAL = 3.5;
/** Sidi a step to the side, so his father's phone is clear of him. */
const SIDI_ASIDE = -110;

/** Papa's inbox, small in his hand: the grade on top. */
export const useInboxItems = () => {
  const { lang } = useLang();
  const g = NOTIFS.grade_published_parent;
  const p = NOTIFS.payment_received;
  return [
    {
      category: 'grades' as const,
      time: GRADE_TEST.time,
      title: fill(g.title[lang], { student_name: FAMILY.son[lang] }),
      message: fill(g.message[lang], { grade: GRADE_TEST.grade, subject_name: GRADE_TEST.subject[lang], period: GRADE_TEST.period[lang] }),
    },
    {
      category: 'finance' as const,
      unread: false,
      time: GRADE_TEST.earlier,
      title: fill(p.title[lang], { student_name: FAMILY.son[lang] }),
      message: fill(p.message[lang], { amount: '7 500', receipt_number: 'RCP-2026-000412' }),
    },
  ];
};

/**
 * 6 · revenge: the yard. Papa has come out, proud, his phone in his hand
 * with the grade on it; Sidi grins up at him. Her eyes go to the phone; she
 * steps up to it; he lifts it over his head; she stretches her neck after it,
 * gives up and looks at you. Her ears drop. Whistle: 0 – 2.
 */
export const RevengeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const { rtl } = useLang();
  const items = useInboxItems();
  const stepT = tween(frame, [b(RV.step[0]), b(RV.step[1])], [0, 1], EASE_IN_OUT);
  const goatDx = 70 * stepT;
  const looking = frame >= b(RV.look);
  const lifted = tween(frame, [b(RV.lift[0]), b(RV.lift[1])], [0, 1], EASE_IN_OUT);
  const ears = tween(frame, [b(RV.ears), b(RV.ears) + 8]);
  const stretch = tween(frame, [b(RV.stretch[0]), b(RV.stretch[1])], [0, 1], EASE_IN_OUT) * (1 - tween(frame, [b(RV.ears) - 3, b(RV.ears) + 6], [0, 1], EASE_IN_OUT));
  const stare = tween(frame, [b(RV.stare), b(RV.stare) + 6], [0, 1], EASE_IN_OUT);
  const eyes: Pt = !looking ? [0, 0] : ears > 0 ? [0.3 * (1 - stare), 0.7 * (1 - stare)] : [0.75, -0.5 - 0.5 * lifted];
  const goat: GoatState = {
    reach: 40 * stretch,
    turn: looking ? 10 * (1 - ears) - 8 * stretch : 0,
    look: eyes,
    lids: ears > 0 ? 0.45 - 0.2 * stare : looking ? 0.04 : 0.35,
    ears,
    step: 2 * stepT,
    paper: scrapPaper(),
  };
  // Papa's phone hand: in front of his chest, screen to us, then up high, waggling out of her reach.
  const waggle = lifted * Math.sin(frame / 4) * 6;
  const rightHand: Pt = [160 + (225 - 160) * lifted + waggle, 560 + (110 - 560) * lifted];
  const papa: PapaState = {
    face: frame >= b(RV.stare) ? { mouth: 'grin', brows: 0.7, look: [0, 0.1] } : frame >= b(RV.lift[1]) ? { mouth: 'grin', brows: 0.7, look: [-0.6, 0.6] } : { mouth: 'grin', brows: 0.6, look: [-0.7, 0.6] },
    tilt: frame >= b(RV.lift[1]) ? -4 : 3,
    right: { to: rightHand, bend: 40 + 40 * lifted },
  };
  const sidi: SidiState = {
    face: frame >= b(RV.stare) ? { mouth: 'grin', brows: 0.8, look: [0, 0.1] } : { mouth: 'grin', brows: 0.8, look: [0.7, -0.6] },
    tilt: 4,
    dx: SIDI_ASIDE,
  };
  const [hx, hy] = papaAt(PAPA_YARD, rightHand);
  const phoneScale = 0.19 + 0.02 * (1 - lifted);
  const phoneY = hy - (DEVICE_H * phoneScale) / 2 + 26;
  return (
    <AbsoluteFill>
      <Yard
        goat={goat}
        goatDx={goatDx}
        papa={papa}
        sidi={sidi}
        shots={[{ at: 0, ...SHOT.wide }]}
        items={
          <>
            <HeldPhone x={hx} y={phoneY} scale={phoneScale} rz={(rtl ? 1 : -1) * 4 * (1 - lifted) + waggle * 0.5} time={GRADE_TEST.time} tone="dark">
              <InboxScreen items={items} />
            </HeldPhone>
            <div style={{ position: 'absolute', left: hx - 16, top: hy - 30, width: 30, height: 40, borderRadius: 16, background: '#8f5b3b' }} />
          </>
        }
      />
      <Chewing from={0} to={9} volume={0.45} />
      <Sfx at={b(RV.look)} name="soft-whoosh" volume={0.3} />
      <Sfx at={b(RV.lift[0])} name="whoosh" volume={0.3} rate={1.3} />
      <Sfx at={b(RV.ears)} name="bleat" volume={0.6} />
      <Sfx at={b(RV.ears) + 10} name="wahwah" volume={0.3} />
    </AbsoluteFill>
  );
};

// ── 7 · outro ──

/** The end card's shot: her face a little further and lower, the top of the frame left to the card. */
const END = { zoom: 2 * (620 / GOAT.width), focus: GOAT_FACE, to: [500, 1240] as Pt };

/**
 * 7 · outro: her face again, the scrap in her mouth, the camera easing back
 * to leave the top of the frame to the series' end card: « La chèvre mange le
 * papier. Pas l'appli. », the logo, the series and the question: she has no
 * name yet. The music loops; the picture cuts back to the cover.
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  // Still sulking from the revenge, the ears come back up: she is the cover's goat again.
  const ears = 1 - tween(frame, [b(0.6), b(1.8)], [0, 1], EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <GoatClose
        goat={{ paper: scrapPaper(), ears, lids: 0.35 + 0.2 * ears }}
        papa={null}
        sidi={{ face: { mouth: 'smile', brows: 0.3, look: [-0.6, 0.6] } }}
        shots={[
          { at: 0, ...SHOT.close },
          { at: b(1.0), ...END },
        ]}
      />
      <EndCard line={0.3} card={1.3} ask={2.4} />
      <Chewing from={0} to={7} volume={0.4} />
    </AbsoluteFill>
  );
};
