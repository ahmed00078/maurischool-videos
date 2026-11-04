import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBeat } from '../../../shared/beat';
import { EndCard, SeriesTag, TOP_UNDER_BUG } from '../../../shared/chevre/marks';
import { SERIES } from '../../../shared/chevre/series';
import {
  Bits,
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
  SCRAP,
  SHOT,
  snatch,
  TopScrim,
  Yard,
} from '../../../shared/chevre/stage';
import { useBi, useLang } from '../../../shared/lang';
import { Sfx, Top } from '../../../shared/rig';
import { EASE_IN_OUT, tween } from '../../../shared/tokens';
import { DEVICE_H } from '../../../shared/ui/Device';
import { GoatState } from '../../../shared/ui/goat';
import { Headline } from '../../../shared/ui/Headline';
import { PaperReceipt, ReceiptSheet, SHEET } from '../../../shared/ui/paper';
import { ReceiptPdfScreen } from '../../../shared/ui/receiptDoc';
import { COPY } from '../copy';

export { Chewing, INK, TopScrim };

/** The scrap in her mouth: what is left of the receipt, « REÇU N° …0412 ». */
export const scrap = (): GoatState['paper'] => ({ node: <ReceiptSheet scrap bitten />, ...SCRAP });

/**
 * The hook's words, the cover's: the series' tag (its name, « ÉP. 1 », « Le
 * reçu »), « Papa a payé. », and the series' line under it once she has it.
 */
export const HookWords: React.FC<{ at: number; second?: number }> = ({ at, second }) => {
  const bi = useBi();
  const { rtl } = useLang();
  return (
    <Top gap={8} style={{ top: TOP_UNDER_BUG }}>
      <SeriesTag />
      <Headline text={bi(COPY.hook)} at={at} size={rtl ? 82 : 100} {...INK} />
      {second !== undefined ? <Headline text={bi(SERIES.catchphrase)} at={second} size={rtl ? 66 : 64} {...INK} /> : null}
    </Top>
  );
};

/** Where Papa's hand holds the receipt, at his belt, just right of her head. */
const HAND: [number, number] = [157, 622];
const PAPER_W = 170;

/** The paper receipt in his hand, on the canvas. */
const HeldPaper: React.FC = () => {
  const [px, py] = papaAt(PAPA_YARD, HAND);
  return (
    <div style={{ position: 'absolute', left: px - PAPER_W + 16, top: py - (PAPER_W * SHEET.h) / SHEET.w / 2, rotate: '6deg' }}>
      <PaperReceipt width={PAPER_W} />
    </div>
  );
};

/** Hook beats: the snatch, the chomp that leaves a scrap, her line, the pull back, his lunge and her dodge. */
// The scrap « REÇU N° …0412 » holds still in her mouth, close, for two seconds before the pull back.
const H = { snatch: 0.4, back: 0.8, close: 1.3, chomp: 1.6, words: 1.7, wide: 6.4, lunge: [6.7, 7.1], miss: 7.6 } as const;
/** The first shot: his hand, the receipt, her head, his face clear under the words. */
const MEDIUM = { zoom: 1.2, focus: [620, 1330] as [number, number], to: [530, 1380] as [number, number] };

/**
 * 1 · hook: it happens at once. Papa has the receipt in his hand, « Papa a
 * payé. »; she takes it, chews it down to a scrap and stares at you, « La
 * chèvre a mangé la preuve. » The camera pulls back: he lunges for what is
 * left, she leans out of reach without looking away from you.
 */
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const s = snatch(frame, b(H.snatch), b(H.back));
  const chomped = frame >= b(H.chomp);
  const close = tween(frame, [b(H.close) - 12, b(H.close)], [0, 1], EASE_IN_OUT) * (1 - tween(frame, [b(H.wide) - 14, b(H.wide)], [0, 1], EASE_IN_OUT));
  // His lunge for the scrap, and her head leaning away from it.
  const lunge = tween(frame, [b(H.lunge[0]), b(H.lunge[1])], [0, 1], EASE_IN_OUT);
  const dodge = tween(frame, [b(H.lunge[0]) + 2, b(H.lunge[1])], [0, 1], EASE_IN_OUT) * (1 - 0.5 * tween(frame, [b(H.miss), b(H.miss) + 10], [0, 1], EASE_IN_OUT));
  const goat: GoatState = {
    reach: s.reach - 84 * dodge,
    open: s.open,
    turn: -12 * dodge,
    look: chomped ? [0.5 * dodge * (1 - tween(frame, [b(H.miss), b(H.miss) + 6])), 0] : [0.9, 0.1],
    lids: chomped ? 0.35 : 0.08,
    ...(s.chewing ? {} : { chew: 0 }),
    paper: s.taken ? { node: <ReceiptSheet scrap={chomped} bitten />, angle: chomped ? SCRAP.angle : 18, scale: SCRAP.scale } : undefined,
  };
  const papa: PapaState = {
    face: !s.taken
      ? { mouth: 'smile', brows: 0.4, look: [-0.5, 0.9] }
      : frame < b(H.lunge[0])
        ? { mouth: 'o', brows: 1, worry: 0.3, look: [-0.9, 0.7] }
        : frame < b(H.miss)
          ? { mouth: 'o', brows: 0.6, worry: 0.6, look: [-0.9, 0.8] }
          : { mouth: 'wobble', brows: 0.5, worry: 1, sweat: 1, look: [-0.8, 0.7] },
    tilt: 5 * lunge,
    left: { to: [HAND[0] - 112 * lunge, HAND[1] + 6 * lunge], bend: -20 - 10 * lunge },
  };
  const mouth = goatMouth({ reach: goat.reach, turn: goat.turn });
  return (
    <AbsoluteFill>
      <Yard
        goat={goat}
        papa={papa}
        shots={[
          { at: 0, ...MEDIUM },
          { at: b(H.close), ...SHOT.close },
          { at: b(H.wide), ...SHOT.wide },
        ]}
        move={14}
        dof={5 * close}
        items={
          <>
            {!s.taken ? <HeldPaper /> : null}
            <Bits at={b(H.chomp)} mouth={mouth} />
          </>
        }
      />
      <HookWords at={-100} second={b(H.words)} />
      <Sfx at={Math.max(0, b(H.snatch) - 3)} name="whip" volume={0.6} />
      <Sfx at={b(H.snatch) + 2} name="paper" volume={0.65} rate={1.3} />
      <Sfx at={b(H.chomp)} name="tear" volume={0.5} />
      <Chewing from={2} to={8} />
      <Sfx at={b(H.close) - 12} name="soft-whoosh" volume={0.35} />
      <Sfx at={b(H.wide) - 14} name="soft-whoosh" volume={0.4} rate={0.8} />
      <Sfx at={b(H.lunge[0])} name="whoosh" volume={0.35} rate={1.3} />
    </AbsoluteFill>
  );
};

/** Twist beats: the snatch, the chomp, the phone out, her eyes on it, her steps, the phone up, her neck after it, the ears, her stare. */
// The whistle (the score bug, shared/chevre/episode.tsx) blows at beat 5.8, as her ears drop: TWIST_GOAL.
const T = { snatch: 0.6, back: 1.0, chomp: 1.5, show: 2.0, words: 2.3, look: 3.0, step: [3.2, 4.0], lift: [4.0, 4.5], stretch: [4.6, 5.2], ears: 5.6, stare: 6.6 } as const;
export const TWIST_GOAL = 5.8;

/**
 * 6 · twist: back in the courtyard, the same day, the paper receipt in his
 * hand. She snatches it and eats it again. He does not panic: he smiles and
 * shows his phone, the receipt is on it. Her eyes go to the phone; she walks
 * up to it; he lifts it over his head; she stretches her neck after it, gives
 * up, and looks at you. Her ears droop.
 */
export const TwistScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();

  const s = snatch(frame, b(T.snatch), b(T.back));
  const chomped = frame >= b(T.chomp);
  const stepT = tween(frame, [b(T.step[0]), b(T.step[1])], [0, 1], EASE_IN_OUT);
  const goatDx = 64 * stepT;
  const looking = frame >= b(T.look);
  const lifted = tween(frame, [b(T.lift[0]), b(T.lift[1])], [0, 1], EASE_IN_OUT);
  const ears = tween(frame, [b(T.ears), b(T.ears) + 8]);
  const stretch = tween(frame, [b(T.stretch[0]), b(T.stretch[1])], [0, 1], EASE_IN_OUT) * (1 - tween(frame, [b(T.ears) - 3, b(T.ears) + 6], [0, 1], EASE_IN_OUT));
  const stare = tween(frame, [b(T.stare), b(T.stare) + 6], [0, 1], EASE_IN_OUT);
  // Her eyes: on the paper, then wide on the phone as it goes up, down when she gives up, and back on you.
  const eyes: [number, number] = !looking ? [0.9, 0.1] : ears > 0 ? [0.3 * (1 - stare), 0.7 * (1 - stare)] : [0.75, -0.5 - 0.5 * lifted];
  const goat: GoatState = {
    reach: s.reach + 40 * stretch,
    open: s.open,
    turn: looking ? 10 * (1 - ears) - 8 * stretch : 4,
    look: eyes,
    lids: ears > 0 ? 0.45 - 0.2 * stare : looking ? 0.04 : 0.35,
    ears,
    step: 2 * stepT,
    // While she bites and pulls, no chewing; then the chomps, and the paper becomes a scrap.
    ...(s.chewing ? {} : { chew: 0 }),
    paper: s.taken ? { node: <ReceiptSheet scrap={chomped} bitten />, angle: chomped ? SCRAP.angle : 18, scale: SCRAP.scale } : undefined,
  };

  // Papa: the paper held out to her, then the phone shown, then the phone up high.
  const showP = spring({ frame: frame - b(T.show), fps, config: { damping: 15, stiffness: 140 } });
  const surprised = frame >= b(T.snatch) && frame < b(T.snatch + 0.9);
  // Up high, he waggles it a little: out of reach.
  const waggle = lifted * Math.sin(frame / 4) * 6;
  const rightHand: [number, number] = [
    330 + (160 - 330) * showP + (225 - 160) * lifted + waggle,
    1150 + (560 - 1150) * showP + (110 - 560) * lifted,
  ];
  const papa: PapaState = {
    face: surprised
      ? { mouth: 'o', brows: 1, look: [-0.9, 0.7] }
      : frame >= b(T.stare)
        ? { mouth: 'grin', brows: 0.7, look: [0, 0.1] }
        : frame >= b(T.lift[1])
          ? { mouth: 'grin', brows: 0.7, look: [-0.6, 0.6] }
          : frame >= b(T.show)
            ? { mouth: 'grin', brows: 0.6, look: [0, 0.1] }
            : { mouth: 'smile', brows: 0.3, look: [-0.8, 0.6] },
    tilt: frame >= b(T.lift[1]) ? -4 : 0,
    // The empty hand drops out of the frame as the other one brings the phone up.
    left: showP < 0.4 ? { to: [HAND[0] - 40 * (showP / 0.4), HAND[1] + 520 * (showP / 0.4)], bend: -20 } : undefined,
    right: showP > 0.01 ? { to: rightHand, bend: 40 + 40 * lifted } : undefined,
  };

  // What is in his hands, on the canvas.
  const [hx, hy] = papaAt(PAPA_YARD, rightHand);
  const phoneScale = 0.19 + 0.02 * (1 - lifted);
  const phoneY = hy - (DEVICE_H * phoneScale) / 2 + 26;
  const mouth = goatMouth({ reach: goat.reach, turn: goat.turn }, goatDx);
  const items = (
    <>
      {!s.taken ? <HeldPaper /> : null}
      {showP > 0.01 ? (
        <HeldPhone x={hx} y={phoneY} scale={phoneScale} rz={(rtl ? 1 : -1) * 4 * (1 - lifted) + waggle * 0.5}>
          <ReceiptPdfScreen />
        </HeldPhone>
      ) : null}
      {/* His thumb over the phone's edge */}
      {showP > 0.01 ? <div style={{ position: 'absolute', left: hx - 16, top: hy - 30, width: 30, height: 40, borderRadius: 16, background: '#8f5b3b' }} /> : null}
      <Bits at={b(T.chomp)} mouth={mouth} />
    </>
  );
  return (
    <AbsoluteFill>
      <Yard goat={goat} goatDx={goatDx} papa={papa} shots={[{ at: 0, ...SHOT.wide }]} items={items} />
      {/* Under the sun, not on it */}
      <Top style={{ top: 356 }}>
        <Headline text={bi(COPY.end)} at={b(T.words)} size={rtl ? 66 : 68} {...INK} />
      </Top>
      <Sfx at={b(T.snatch) - 3} name="whip" volume={0.55} />
      <Sfx at={b(T.snatch) + 2} name="paper" volume={0.6} rate={1.3} />
      <Sfx at={b(T.chomp)} name="tear" volume={0.45} />
      <Chewing from={T.back + 0.5} to={12} volume={0.5} />
      <Sfx at={b(T.show)} name="soft-whoosh" volume={0.35} />
      <Sfx at={b(T.words)} name="ding" volume={0.35} />
      <Sfx at={b(T.lift[0])} name="whoosh" volume={0.3} rate={1.3} />
      <Sfx at={b(T.ears)} name="bleat" volume={0.75} />
    </AbsoluteFill>
  );
};

/** The end card's shot: her face a little further and lower, the top of the frame left to the card. */
const END = { zoom: 2 * (620 / GOAT.width), focus: GOAT_FACE, to: [500, 1240] as [number, number] };

/**
 * 7 · outro: her face again, the scrap in her mouth, the camera easing back to
 * leave the top of the frame to the series' end card. The music loops; the
 * picture cuts back to the receipt in his hand: she is at it again.
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  // Still sulking from the twist, the ears come back up: she is the hook's goat again.
  const ears = 1 - tween(frame, [b(0.6), b(1.8)], [0, 1], EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <GoatClose
        goat={{ paper: scrap(), ears, lids: 0.35 + 0.2 * ears }}
        // He has left with his phone: the frame is hers and the end card's.
        papa={null}
        shots={[
          { at: 0, ...SHOT.close },
          { at: b(1.0), ...END },
        ]}
      />
      <EndCard />
      <Chewing from={0} to={7} volume={0.4} />
    </AbsoluteFill>
  );
};
