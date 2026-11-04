import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Grain } from '../fx';
import { useBi } from '../lang';
import { CHALK, ChalkDefs, ChalkLine } from '../ui/Chalkboard';
import { DeskLamp, DeskTop, TeaGlass } from '../ui/desk';
import { WallClock } from '../ui/Illustrations';
import { Arm, BustLayer, Face, PupilBack, Teacher, TEACHER_COLORS } from '../ui/people';
import { abs, AppTile, FLOAT, Mirrored, PhoneBackSvg, useStage, W } from './stage';

/**
 * The teacher's register, two ways.
 *
 * - `before`: 23:40 at home, under the lamp. The day's paper register is open
 *   and she copies it out again, yawning, the tea long cold.
 * - `after`: in class, in front of the board and today's subject. The
 *   register is on her phone; the network is gone (the crossed bars) and the
 *   call is saved anyway (the green tick). No date on the board: a post is
 *   seen, and shared again, on other days.
 */
export type TeacherMoment = 'before' | 'after';

const SHOULDERS: [[number, number], [number, number]] = [
  [78, 560],
  [322, 560],
];

/** The lesson, chalked at the top of the board. */
const SUBJECT = { fr: 'Mathématiques', ar: 'الرياضيات' };

const Board: React.FC<{ dy: number }> = ({ dy }) => (
  <>
    <div style={abs({ left: 50, top: dy + 548, width: W - 100, height: 470, background: '#6e4424', borderRadius: 8, boxShadow: '0 14px 26px rgba(40,30,20,0.25)' })} />
    <div
      style={abs({
        left: 70,
        top: dy + 566,
        width: W - 140,
        height: 434,
        borderRadius: 4,
        background: 'radial-gradient(120% 90% at 40% 30%, #345a49 0%, #26443a 60%, #1b3129 100%)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.4)',
      })}
    />
    {/* Old chalk never quite wiped off */}
    <div style={abs({ left: 520, top: dy + 760, width: 360, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(24px)' })} />
    <div style={abs({ left: 50, top: dy + 1004, width: W - 100, height: 26, background: 'linear-gradient(#7a4b28, #4a2c12)' })} />
    <div style={abs({ left: 760, top: dy + 994, width: 80, height: 16, borderRadius: 8, background: CHALK.white, rotate: '-4deg' })} />
  </>
);

/** The crossed signal bars, and the green tick of a call saved on the phone: drawn, not written. */
const OfflineSaved: React.FC<{ x: number; y: number; rtl: boolean }> = ({ x, y, rtl }) => (
  <div style={abs({ left: x - 141, top: y - 56, width: 282, display: 'flex', gap: 18, flexDirection: rtl ? 'row-reverse' : 'row' })}>
    <div style={{ width: 112, height: 112, borderRadius: 30, background: '#ffffff', boxShadow: FLOAT, display: 'grid', placeItems: 'center' }}>
      <svg width="76" height="76" viewBox="0 0 32 32">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={3 + i * 6} y={22 - i * 5} width="4.4" height={6 + i * 5} rx="1.4" fill="#1f2937" fillOpacity="0.25" />
        ))}
        <path d="M 17 4 l 11 11 M 28 4 l -11 11" stroke="#d92d20" strokeWidth="3.4" strokeLinecap="round" />
      </svg>
    </div>
 <div style={{ width: 112, height: 112, borderRadius: 56, background: '#16a34a', boxShadow: FLOAT, display: 'grid', placeItems: 'center' }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
  </div>
);

/** The paper register open on the desk: a grid of names and ticks, and her pen. */
const PaperRegister: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={520} height={190} viewBox="0 0 520 190" style={abs({ left: x - 260, top: y - 170, overflow: 'visible' })}>
    <path d="M 10 180 L 40 10 L 258 22 L 260 186 Z" fill="#fbf8ef" />
    <path d="M 260 186 L 262 22 L 480 10 L 510 180 Z" fill="#f6f2e6" />
    <path d="M 258 22 L 260 186" stroke="#d6cfba" strokeWidth="4" />
    {Array.from({ length: 8 }, (_, i) => (
      <g key={i}>
        <line x1={44 - i * 3.6} x2="252" y1={36 + i * 19} y2={38 + i * 19} stroke="#c9d3e6" strokeWidth="2" />
        <line x1="268" x2={474 + i * 3.6} y1={38 + i * 19} y2={36 + i * 19} stroke="#c9d3e6" strokeWidth="2" />
        <line x1={60 - i * 3} x2={150 - i * 2} y1={30 + i * 19} y2={31 + i * 19} stroke="#6b7280" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {i < 6 ? <path d={`M ${300 + (i % 3) * 40} ${28 + i * 19} l 5 6 l 10 -12`} stroke="#2563eb" strokeWidth="3" fill="none" strokeLinecap="round" /> : null}
      </g>
    ))}
    {[328, 368, 408, 448].map((gx) => (
      <line key={gx} x1={gx} x2={gx + 6} y1="24" y2="178" stroke="#c9d3e6" strokeWidth="2" />
    ))}
  </svg>
);

/** A pile of marked copies waiting their turn, squared off but not quite. */
const Copies: React.FC<{ x: number; y: number; n?: number }> = ({ x, y, n = 9 }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <div key={i} style={abs({ left: x - 110 + Math.sin(i * 2.3) * 8, top: y - 12 - i * 9, width: 220, height: 12, background: i % 2 ? '#fbfaf4' : '#f1eee2', borderRadius: 2, rotate: `${Math.sin(i * 1.9) * 2}deg`, boxShadow: '0 1px 0 #d6d0bd' })} />
    ))}
  </>
);

export const TeacherScene: React.FC<{ moment: TeacherMoment; height: number; t: number }> = ({ moment, height, t }) => {
  const s = useStage(height);
  const bi = useBi();
  const after = moment === 'after';
  const blink = (t % 3.1) > 2.95 ? 1 : 0;
  const width = 520;
  const bx = 130;
  const [ls, rs] = SHOULDERS;
  if (after) {
    const by = s.y(400);
    const face: Face = { mouth: 'smile', look: [0.5, 0.7], brows: 0.3, blink, t };
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <ChalkDefs />
        <Mirrored height={height}>
          <div style={abs({ left: 0, top: 0, width: W, height, background: 'linear-gradient(180deg, #e9eff1 0%, #e1e9ec 100%)' })} />
          <div style={abs({ left: 0, top: s.y(1040), width: W, height: height - s.y(1040), background: '#a9c3d3' })} />
          <Board dy={s.dy} />
          <div style={abs({ left: bx, top: by, width })}>
            <Teacher width={width} face={face} tilt={3} />
            <BustLayer width={width}>
              <Arm from={ls} to={[60, 640]} sleeve={TEACHER_COLORS.sleeve} skin={TEACHER_COLORS.skin} bend={-40} thickness={66} />
              <Arm from={rs} to={[292, 560]} sleeve={TEACHER_COLORS.sleeve} skin={TEACHER_COLORS.skin} bend={70} thickness={66} thumb={-1} />
              <PhoneBackSvg x={286} y={484} w={96} rot={-12} />
              <ellipse cx="236" cy="522" rx="13" ry="20" fill={TEACHER_COLORS.skin} transform="rotate(-12 236 522)" />
              <ellipse cx="334" cy="512" rx="12" ry="18" fill={TEACHER_COLORS.skin} transform="rotate(-12 334 512)" />
            </BustLayer>
          </div>
          {/* The front row, from behind */}
          {[
            { x: -60, scarf: '#c2456b' },
            { x: 170, hair: '#1d1a1f' },
            { x: 420, scarf: '#1f9486' },
            { x: 660, hair: '#2a2321', skin: '#8f5b3b' },
            { x: 890, scarf: '#e39b2d' },
          ].map((p, i) => (
            <PupilBack key={i} width={250} extend={s.dy ? 400 : 0} scarf={p.scarf} hair={p.hair} skin={p.skin} style={abs({ left: p.x, top: s.y(1160 + (i % 2) * 24) })} />
          ))}
        </Mirrored>
        {/* Chalk and icons are not mirrored: they read in the language's own direction */}
        {/* On the half of the board she is not standing in front of */}
        <div style={abs({ [s.rtl ? 'left' : 'right']: 150, top: s.y(596) })}>
          <ChalkLine text={bi(SUBJECT)} at={-10} dur={1} size={64} />
        </div>
        <div style={abs({ [s.rtl ? 'left' : 'right']: 150, top: s.y(730), direction: 'ltr' })}>
          <ChalkLine text="3x + 5 = 20" at={-10} dur={1} size={62} color={CHALK.yellow} />
        </div>
        {/* By her phone, off the board: which app, no network, saved */}
        <AppTile x={s.x(680)} y={s.y(1094)} size={112} />
        <OfflineSaved x={s.x(880)} y={s.y(1094)} rtl={s.rtl} />
        <Grain opacity={0.05} />
      </AbsoluteFill>
    );
  }
  const by = s.y(430);
  const face: Face = { mouth: 'flat', blink: 0.62 + 0.3 * Math.max(0, Math.sin(t * 1.4)), brows: -0.2, worry: 0.6, look: [0.35, 0.9], t };
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Mirrored height={height}>
        <div style={abs({ left: 0, top: 0, width: W, height, background: 'linear-gradient(180deg, #1c2440 0%, #242d4d 60%, #2b3352 100%)' })} />
        <div style={abs({ left: 0, top: 0, width: W, height, background: 'radial-gradient(55% 40% at 72% 78%, rgba(255,196,110,0.22) 0%, rgba(255,196,110,0) 70%)' })} />
        {/* The lamp stands behind her shoulder, so its light falls on the paper, not over her */}
        <DeskLamp x={960} y={s.y(1230)} on={1} flip />
        <div style={abs({ left: bx, top: by, width })}>
          <Teacher width={width} face={face} tilt={-11} />
          <BustLayer width={width}>
            {/* Her head propped on one hand, the other still writing */}
            <Arm from={ls} to={[118, 372]} sleeve={TEACHER_COLORS.sleeve} skin={TEACHER_COLORS.skin} bend={-150} thickness={66} />
          </BustLayer>
        </div>
        <DeskTop top={s.y(1200)} />
        <PaperRegister x={560} y={s.y(1300)} />
        <Copies x={140} y={s.y(1250)} />
        <div style={abs({ left: 330, top: s.y(1252), width: 0, height: 0, scale: '1.35', transformOrigin: '0 0' })}>
          <TeaGlass x={0} y={0} t={t} steam={0} />
        </div>
        {/* The writing hand over the register's page, so it is drawn after the paper */}
        <div style={abs({ left: bx, top: by, width })}>
          <BustLayer width={width}>
            <Arm from={rs} to={[352, 618]} sleeve={TEACHER_COLORS.sleeve} skin={TEACHER_COLORS.skin} bend={30} thickness={66} thumb={-1} />
            <line x1="364" y1="612" x2="406" y2="574" stroke="#1f2a4f" strokeWidth="9" strokeLinecap="round" />
          </BustLayer>
        </div>
      </Mirrored>
      <div style={abs({ left: s.x(800) - 70, top: s.y(560), filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))' })}>
        <WallClock size={140} hours={23} minutes={40} seconds={t % 60} />
      </div>
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
