import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBeat } from '../../../shared/beat';
import { useBi, useLang } from '../../../shared/lang';
import { Sfx, Top } from '../../../shared/rig';
import { APP, EASE_IN_OUT, OUTFIT, tween } from '../../../shared/tokens';
import { Device, DEVICE_H, DEVICE_W } from '../../../shared/ui/Device';
import { GoatState } from '../../../shared/ui/goat';
import { Headline } from '../../../shared/ui/Headline';
import { LogoMark } from '../../../shared/ui/LogoMark';
import { PaperReceipt, ReceiptSheet, SHEET } from '../../../shared/ui/paper';
import { ReceiptPdfScreen } from '../../../shared/ui/receiptDoc';
import { COPY } from '../copy';
import { GoatClose, goatMouth, PAPA_YARD, papaAt, PapaState, SCRAP, SHOT, Yard } from '../stage';

/** Words over the courtyard: dark ink, the brand's blue for the accent, a soft light halo against the wall. */
export const INK = {
  color: '#2a1d1a',
  accent: APP.brand[600],
  style: { textShadow: '0 0 18px rgba(255,248,235,0.95), 0 0 6px rgba(255,248,235,0.9)' },
} as const;

/** The scrap in her mouth: what is left of the receipt, « REÇU N° …0412 ». */
export const scrap = (): GoatState['paper'] => ({ node: <ReceiptSheet scrap bitten />, ...SCRAP });

/** A crunch on every beat while she is in the shot. */
export const Chewing: React.FC<{ from: number; to: number; volume?: number }> = ({ from, to, volume = 0.45 }) => {
  const b = useBeat();
  const beats: number[] = [];
  for (let i = Math.ceil(from); i < to; i++) beats.push(i);
  return (
    <>
      {beats.map((i) => (
        <Sfx key={i} at={b(i)} name="chew" volume={volume * (i % 2 ? 0.8 : 1)} rate={i % 3 === 1 ? 1.08 : 0.96} />
      ))}
    </>
  );
};

/** The hook's words, the cover's: « Papa a payé. » and, on the cover, the goat's line under it. */
export const HookWords: React.FC<{ at: number; second?: number }> = ({ at, second }) => {
  const bi = useBi();
  const { rtl } = useLang();
  return (
    <Top gap={4}>
      <Headline text={bi(COPY.hook)} at={at} size={rtl ? 104 : 112} {...INK} />
      {second !== undefined ? <Headline text={bi(COPY.hook2)} at={second} size={rtl ? 76 : 80} {...INK} /> : null}
    </Top>
  );
};

/**
 * 1 · hook: her face, close. She chews the scrap of a receipt and stares at
 * you without blinking. « Papa a payé. »
 */
export const HookScene: React.FC = () => {
  const b = useBeat();
  return (
    <AbsoluteFill>
      <GoatClose goat={{ paper: scrap() }} />
      <HookWords at={b(0.3)} />
      <Chewing from={0} to={5} />
    </AbsoluteFill>
  );
};

/**
 * 2 · yard: the camera pulls back. The courtyard at midday, the goat, and
 * Papa behind her, frozen: his hand still out where the receipt was, his
 * pocket turned out. « La chèvre a mangé la preuve. »
 */
export const YardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const back = tween(frame, [b(0.3), b(1.8)], [0, 1], EASE_IN_OUT);
  const papa: PapaState = {
    face: frame < b(2.6) ? { mouth: 'o', brows: 0.9, worry: 0.4, look: [-0.8, 0.7] } : { mouth: 'flat', brows: 0.5, worry: 0.8, look: [-0.8, 0.7] },
    pocketOut: 1,
    left: { to: EMPTY_HAND, bend: -20 },
  };
  return (
    <AbsoluteFill>
      <Yard
        goat={{ paper: scrap() }}
        papa={papa}
        shots={[
          { at: 0, ...SHOT.close },
          { at: b(1.8), ...SHOT.wide },
        ]}
        move={b(1.5)}
        dof={5 * (1 - back)}
      />
      <HookWords at={-100} second={b(1.9)} />
      <Chewing from={0} to={5} volume={0.35} />
      <Sfx at={b(0.3)} name="soft-whoosh" volume={0.4} rate={0.8} />
    </AbsoluteFill>
  );
};

/** Where Papa's hand was holding the receipt, at his belt, just right of her head: empty in the yard. */
const EMPTY_HAND: [number, number] = [157, 622];

/** Papa's phone in his hand, `scale` of a real one, showing the receipt. */
const HeldPhone: React.FC<{ x: number; y: number; scale: number; rz?: number }> = ({ x, y, scale, rz = 0 }) => (
  <div style={{ position: 'absolute', left: x - DEVICE_W / 2, top: y - DEVICE_H / 2, width: DEVICE_W, height: DEVICE_H, scale: String(scale), rotate: `${rz}deg` }}>
    <Device statusTone="light" glare={0.5} time="10:26">
      <ReceiptPdfScreen />
    </Device>
  </div>
);

/** Twist beats: the snatch, the chomp that leaves a scrap, the phone out, her step, the phone up, the ears. */
const T = { snatch: 0.8, back: 1.2, chomp: 1.9, show: 2.2, words: 2.5, look: 3.0, step: [3.2, 3.9], lift: [3.9, 4.4], ears: 4.6 } as const;

/**
 * 7 · twist: back in the courtyard, the same day, the paper receipt in his
 * hand. She snatches it and eats it again. He does not panic: he smiles and
 * shows his phone, the receipt is on it. She eyes the phone and takes a step;
 * he lifts it over his head. Her ears droop.
 */
export const TwistScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();

  // The snatch: her head shoots out to the paper, mouth open, and back with it.
  const out = tween(frame, [b(T.snatch) - 3, b(T.snatch) + 2]);
  const back = tween(frame, [b(T.back) - 2, b(T.back) + 6], [0, 1], EASE_IN_OUT);
  const reach = 74 * out * (1 - back);
  const taken = frame >= b(T.snatch) + 2;
  const stepT = tween(frame, [b(T.step[0]), b(T.step[1])], [0, 1], EASE_IN_OUT);
  const goatDx = 46 * stepT;
  const looking = frame >= b(T.look);
  const ears = tween(frame, [b(T.ears), b(T.ears) + 8]);
  const lifted = tween(frame, [b(T.lift[0]), b(T.lift[1])], [0, 1], EASE_IN_OUT);
  const goat: GoatState = {
    reach,
    open: out * (1 - back),
    turn: looking ? 10 * (1 - ears) : 4,
    look: ears > 0 ? [0.2, 0.5 * ears] : looking ? [0.7, -0.9 + 0.5 * (1 - lifted)] : [0.9, 0.1],
    lids: ears > 0 ? 0.35 + 0.25 * ears : looking ? 0.08 : 0.35,
    ears,
    step: stepT,
    // While she bites and pulls, no chewing; then the chomps, and the paper becomes a scrap.
    ...(frame < b(T.back) + 6 ? { chew: 0 } : {}),
    paper: taken ? { node: <ReceiptSheet scrap={frame >= b(T.chomp)} bitten />, angle: frame >= b(T.chomp) ? SCRAP.angle : 18, scale: SCRAP.scale } : undefined,
  };

  // Papa: the paper held out to her, then the phone shown, then the phone up high.
  const showP = spring({ frame: frame - b(T.show), fps, config: { damping: 15, stiffness: 140 } });
  const hand = EMPTY_HAND;
  const surprised = frame >= b(T.snatch) && frame < b(T.snatch + 0.9);
  const rightHand: [number, number] = [
    330 + (160 - 330) * showP + (225 - 160) * lifted,
    1150 + (560 - 1150) * showP + (110 - 560) * lifted,
  ];
  const papa: PapaState = {
    face: surprised
      ? { mouth: 'o', brows: 1, look: [-0.9, 0.7] }
      : frame >= b(T.lift[1])
        ? { mouth: 'grin', brows: 0.7, look: [-0.6, 0.6] }
        : frame >= b(T.show)
          ? { mouth: 'grin', brows: 0.6, look: [0, 0.1] }
          : { mouth: 'smile', brows: 0.3, look: [-0.8, 0.6] },
    tilt: frame >= b(T.lift[1]) ? -4 : 0,
    // The empty hand drops out of the frame as the other one brings the phone up.
    left: showP < 0.4 ? { to: [hand[0] - 40 * (showP / 0.4), hand[1] + 520 * (showP / 0.4)], bend: -20 } : undefined,
    right: showP > 0.01 ? { to: rightHand, bend: 40 + 40 * lifted } : undefined,
  };

  // What is in his hands, on the canvas.
  const [px, py] = papaAt(PAPA_YARD, hand);
  const paperW = 170;
  const [hx, hy] = papaAt(PAPA_YARD, rightHand);
  const phoneScale = 0.19 + 0.02 * (1 - lifted);
  const phoneY = hy - (DEVICE_H * phoneScale) / 2 + 26;
  const mouth = goatMouth({ reach, turn: goat.turn }, goatDx);
  const items = (
    <>
      {!taken ? (
        <div style={{ position: 'absolute', left: px - paperW + 16, top: py - (paperW * SHEET.h) / SHEET.w / 2, rotate: '6deg' }}>
          <PaperReceipt width={paperW} />
        </div>
      ) : null}
      {showP > 0.01 ? <HeldPhone x={hx} y={phoneY} scale={phoneScale} rz={(rtl ? 1 : -1) * 4 * (1 - lifted)} /> : null}
      {/* His thumb over the phone's edge */}
      {showP > 0.01 ? <div style={{ position: 'absolute', left: hx - 16, top: hy - 30, width: 30, height: 40, borderRadius: 16, background: '#8f5b3b' }} /> : null}
      {/* The bite: a flash of paper bits at her mouth */}
      {frame >= b(T.chomp) && frame < b(T.chomp) + 8
        ? [0, 1, 2, 3, 4].map((i) => {
            const t = (frame - b(T.chomp)) / 8;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: mouth[0] + 20 + Math.cos(i * 1.3) * 60 * t,
                  top: mouth[1] - 10 + Math.sin(i * 1.3) * 40 * t + 60 * t * t,
                  width: 12,
                  height: 9,
                  background: '#fbf5d6',
                  rotate: `${i * 40 + frame * 20}deg`,
                  opacity: 1 - t,
                }}
              />
            );
          })
        : null}
    </>
  );
  return (
    <AbsoluteFill>
      <Yard goat={goat} goatDx={goatDx} papa={papa} shots={[{ at: 0, ...SHOT.wide }]} items={items} />
      <Top>
        <Headline text={bi(COPY.end)} at={b(T.words)} size={rtl ? 64 : 66} {...INK} />
      </Top>
      <Sfx at={b(T.snatch) - 3} name="whip" volume={0.55} />
      <Sfx at={b(T.snatch) + 2} name="paper" volume={0.6} rate={1.3} />
      <Chewing from={T.back + 0.5} to={6} volume={0.5} />
      <Sfx at={b(T.show)} name="soft-whoosh" volume={0.35} />
      <Sfx at={b(T.words)} name="ding" volume={0.35} />
      <Sfx at={b(T.lift[0])} name="whoosh" volume={0.3} rate={1.3} />
      <Sfx at={b(T.ears)} name="bleat" volume={0.75} />
    </AbsoluteFill>
  );
};

/**
 * 8 · outro: her face again, close, the scrap in her mouth; the question for
 * the comments, the brand line, the logo. The words leave before the end: the
 * last frame is her stare alone, the first frame of the video (it loops).
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const leave = b(4.6);
  const logo = spring({ frame: frame - b(2.2), fps, config: { damping: 14, stiffness: 150 } });
  const logoOut = tween(frame, [leave + 4, leave + 14]);
  // Still sulking from the twist, the ears come back up: by the end she is the hook's goat again.
  const ears = 1 - tween(frame, [b(0.6), b(1.8)], [0, 1], EASE_IN_OUT);
  return (
    <AbsoluteFill>
      <GoatClose goat={{ paper: scrap(), ears, lids: 0.35 + 0.2 * ears }} />
      <Top gap={18}>
        <Headline text={bi(COPY.ask)} at={b(0.3)} out={leave} size={rtl ? 70 : 72} {...INK} />
        <Headline text={bi(COPY.brand)} at={b(1.4)} out={leave + 2} size={rtl ? 42 : 42} {...INK} color="#4a3a33" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            direction: 'ltr',
            marginTop: 4,
            opacity: Math.min(1, logo * 1.4) * (1 - logoOut),
            scale: String(0.8 + 0.2 * logo),
            filter: 'drop-shadow(0 0 14px rgba(255,248,235,0.9))',
          }}
        >
          <LogoMark width={66} violet={APP.logo.violet} ink={APP.logo.ink} />
          <span style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 58, letterSpacing: -0.8, color: APP.logo.violet }}>
            Mauri<span style={{ color: APP.logo.ink }}>School</span>
          </span>
        </div>
      </Top>
      <Chewing from={0} to={6} volume={0.4} />
      <Sfx at={b(0.3)} name="pop" volume={0.4} />
      <Sfx at={b(2.2)} name="ding" volume={0.45} />
    </AbsoluteFill>
  );
};
