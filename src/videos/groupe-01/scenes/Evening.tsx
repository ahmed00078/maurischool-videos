import React, { useContext } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useBeat } from '../../../shared/beat';
import { Grain, Vignette } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { Sfx, Top } from '../../../shared/rig';
import { EASE_IN_OUT, tween } from '../../../shared/tokens';
import { ChatPush } from '../../../shared/ui/chat';
import { DEVICE_H, DEVICE_W, TurningDevice } from '../../../shared/ui/Device';
import { Headline, PlaceTag } from '../../../shared/ui/Headline';
import { LockScreen } from '../../../shared/ui/LockScreen';
import { COPY, GROUP } from '../copy';
import { Table, TableState } from '../stage';
import { INK_NIGHT } from './List';
import { GagContext } from './Salon';

/** Evening beats: the tag, the phone lighting up, the close-up, the hand, the turn, back to the table, the words, the second buzz. */
const E = { tag: [0.1, 2.4], lit: 2.6, insert: [2.9, 5.4], push: 3.05, hand: [3.75, 4.25], turn: [4.3, 4.9], handOut: [5.0, 5.35], words: 5.6, buzz2: 7.1 } as const;

/** The whole table moved up a little, so the book and the phone sit above the captions. */
const WIDE = [{ at: 0, zoom: 1, focus: [540, 1250] as [number, number], to: [540, 1110] as [number, number] }];

/** His hand, seen from above: the sleeve from the right edge of the frame, the fingers over the phone's edge. */
const Hand: React.FC<{ x: number; y: number; grip: number }> = ({ x, y, grip }) => (
  <svg width={900} height={700} viewBox="0 0 900 700" style={{ position: 'absolute', left: x - 120, top: y - 250, overflow: 'visible', filter: 'drop-shadow(0 24px 22px rgba(0,0,0,0.45))' }}>
    <path d="M 900 470 L 300 330" stroke="#6aa6dd" strokeWidth="190" strokeLinecap="round" />
    <path d="M 900 520 L 330 400" stroke="rgba(0,0,0,0.12)" strokeWidth="60" strokeLinecap="round" />
    <ellipse cx="190" cy="290" rx="130" ry="105" fill="#8f5b3b" />
    {/* Four fingers curling over the edge, the thumb under */}
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M ${150 - i * 4} ${215 + i * 48} q ${-70 - 10 * grip} ${-6 + i * 3} ${-110 - 20 * grip} ${10 + i * 4}`} stroke="#8f5b3b" strokeWidth="44" strokeLinecap="round" fill="none" />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <path key={`n${i}`} d={`M ${40 - 20 * grip - i * 4} ${230 + i * 52} l -16 2`} stroke="#b88467" strokeWidth="16" strokeLinecap="round" />
    ))}
    <path d="M 250 380 q -60 50 -150 40" stroke="#7a4b30" strokeWidth="50" strokeLinecap="round" fill="none" />
  </svg>
);

/** The close-up: the phone on the table from above, the chat's banner on its lock screen, his hand turning it over. */
const Insert: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { lang } = useLang();
  const gag = useContext(GagContext);
  const turn = tween(frame, [b(E.turn[0]), b(E.turn[1])], [0, 1], EASE_IN_OUT);
  const handIn = tween(frame, [b(E.hand[0]), b(E.hand[1])], [0, 1], EASE_IN_OUT);
  const handOut = tween(frame, [b(E.handOut[0]), b(E.handOut[1])], [0, 1], EASE_IN_OUT);
  const buzz = frame >= b(E.push) - 2 && frame < b(E.push) + 10 ? Math.sin(frame * 2.7) * 5 : 0;
  const scale = 1.05;
  const cx = 520 + buzz;
  const cy = 1180;
  const who = gag ? GROUP.people.oumar : GROUP.people.mariem;
  const said = gag ? GROUP.says.gag : GROUP.says.amine;
  // The hand reaches the phone's right edge (left edge in the turn's middle), lifts it and leaves.
  const edge = cx + ((DEVICE_W * scale) / 2) * Math.cos(turn * Math.PI);
  const hx = 1180 + (edge + 10 - 1180) * handIn + 700 * handOut;
  const hy = cy + 40 - 50 * Math.sin(Math.PI * turn) + 200 * handOut;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#2e1c10' }}>
      {/* The table from above: dark wood, its grain, the lamp's pool of light, the corner of the book */}
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(8deg, #3a2415 0px, #3a2415 26px, #33200f 26px, #33200f 30px, #402817 30px, #402817 64px)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(60% 45% at 25% 30%, rgba(255,214,150,0.35), rgba(255,214,150,0) 70%)' }} />
      <div style={{ position: 'absolute', left: -120, top: 300, width: 420, height: 560, background: '#fbf8ef', rotate: '-14deg', boxShadow: '0 20px 30px rgba(0,0,0,0.4)' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ position: 'absolute', left: 20, right: 20, top: 40 + i * 42, height: 2, background: '#b9cce6' }} />
        ))}
      </div>
      {/* The phone's light on the wood while the screen is up */}
      <div style={{ position: 'absolute', left: cx - 460, top: cy - 700, width: 920, height: 1400, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(140,170,255,0.3), rgba(140,170,255,0))', opacity: 1 - turn }} />
      <div style={{ position: 'absolute', left: cx - DEVICE_W / 2, top: cy - DEVICE_H / 2, width: DEVICE_W, height: DEVICE_H, perspective: 2400 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `scale(${scale * (1 + 0.06 * Math.sin(Math.PI * turn))}) rotateZ(-6deg)` }}>
          <TurningDevice turn={turn} statusTone="light" time="21:15" glare={0.4}>
            <LockScreen time="21:15" date={COPY.lockDateWednesday}>
              <ChatPush at={b(E.push)} title={bi(GROUP.name)} message={`${who[lang]}${lang === 'fr' ? ' : ' : ': '}${said[lang]}`} />
            </LockScreen>
          </TurningDevice>
        </div>
      </div>
      {handIn > 0.01 && handOut < 0.99 ? <Hand x={hx} y={hy} grip={handIn} /> : null}
      <Vignette strength={0.45} />
      <Grain />
    </AbsoluteFill>
  );
};

/**
 * 7 · evening: Wednesday night, Papa and Sidi at the table under the lamp,
 * Sidi writing, Papa's finger on the exercise. The phone lights up: the group,
 * « Amine 🤲 ». Papa smiles, turns it face down, and goes back to the exercise.
 * It buzzes again, face down; nobody looks. « Le groupe peut attendre. »
 */
export const EveningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const inInsert = frame >= b(E.insert[0]) && frame < b(E.insert[1]);
  const after = frame >= b(E.insert[1]);
  const lit = after ? 0 : tween(frame, [b(E.lit), b(E.lit) + 3]);
  const buzz2 = frame >= b(E.buzz2) && frame < b(E.buzz2) + 12;
  const glance = frame >= b(E.lit) + 2 && !after;
  const state: TableState = {
    papa: {
      face: glance ? { mouth: 'smile', brows: 0.5, look: [0.5, 1] } : after ? { mouth: 'grin', brows: 0.5, look: [-0.8, 0.6] } : { mouth: 'smile', brows: 0.3, look: [-0.7, 0.8] },
      tilt: after ? -3 : 0,
      point: glance ? 0.3 : 1,
    },
    sidi: { face: after ? { mouth: 'grin', look: [0.2, 1], brows: 0.3 } : { mouth: 'smile', look: [0.2, 1], brows: 0.1 }, tilt: 4 },
    written: tween(frame, [0, b(9)], [0.1, 1], (x) => x),
    writing: !glance,
    phone: { lit, turn: after ? 1 : 0, shake: buzz2 ? Math.sin(frame * 2.9) * 5 : 0 },
  };
  return (
    <AbsoluteFill>
      {inInsert ? <Insert /> : <Table state={state} shots={WIDE} />}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: 'linear-gradient(180deg, rgba(12,12,34,0.7) 0%, rgba(12,12,34,0.4) 60%, rgba(12,12,34,0) 100%)' }} />
      <Top gap={18}>
        <PlaceTag text={bi(COPY.tags.wednesdayEvening)} at={b(E.tag[0])} out={b(E.tag[1])} />
        {frame >= b(E.words) ? <Headline text={bi(COPY.wait)} at={b(E.words)} size={rtl ? 84 : 90} {...INK_NIGHT} /> : null}
      </Top>
      <Sfx at={b(E.lit)} name="buzz" volume={0.8} />
      <Sfx at={b(E.lit)} name="blip" volume={0.45} />
      <Sfx at={b(E.turn[0])} name="soft-whoosh" volume={0.35} rate={1.2} />
      <Sfx at={b(E.turn[1])} name="chalk-tap" volume={0.6} rate={0.8} />
      <Sfx at={b(E.words)} name="ding" volume={0.35} rate={0.9} />
      <Sfx at={b(E.buzz2)} name="buzz" volume={0.55} rate={0.9} />
    </AbsoluteFill>
  );
};
