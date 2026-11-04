import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Grain } from '../fx';
import { TeaGlass } from '../ui/desk';
import { WallClock } from '../ui/Illustrations';
import { Arm, BustLayer, Director, DIRECTOR_COLORS, DIRECTOR_SHOULDERS, Face } from '../ui/people';
import { abs, AppTile, Mirrored, PhoneBackSvg, useStage, W } from './stage';

/** A white daraa sleeve on a white daraa: drawn over a darker one, so the arm reads against the body. */
const Sleeve: React.FC<React.ComponentProps<typeof Arm>> = (props) => (
  <>
    <Arm {...props} sleeve="#c9c4b4" thickness={(props.thickness ?? 64) + 10} />
    <Arm {...props} sleeve="#f1efe6" />
  </>
);

/**
 * The director's morning, in his office at 10:24, two ways.
 *
 * - `before`: the old way. His phone at his ear, a pile of paper registers,
 *   the tea gone cold: he is calling every teacher to learn who is absent.
 * - `after`: the same office, the same hour. The tea is still hot; he reads
 *   his phone, where the morning is already summed up.
 *
 * The wall above the scene is left plain for the headline. `t` is the time in
 * seconds (steam, blinks, the receiver's cord), so a Reel can play it and a
 * post freezes it.
 */
export type DirectorMoment = 'before' | 'after';

const WALL = 'linear-gradient(180deg, #f4ecdb 0%, #f1e6cf 55%, #ecdfc4 100%)';
const DADO = '#9cc9b4';
const DADO_EDGE = '#7fb09a';
const DESK_TOP = 1220;

/** The office wall: plaster over a green dado, the window with its blue shutters and the morning light. */
const OfficeWall: React.FC<{ height: number; dy: number }> = ({ height, dy }) => (
  <>
    <div style={abs({ left: 0, top: 0, width: W, height, background: WALL })} />
    <div style={abs({ left: 0, top: dy + 960, width: W, height: height - dy - 960, background: DADO })} />
    <div style={abs({ left: 0, top: dy + 952, width: W, height: 12, background: DADO_EDGE })} />
    {/* The window, at the far side: blue frame and shutters, the bright yard */}
    <div style={abs({ left: 724, top: dy + 560, width: 56, height: 380, background: '#3d7fa8', borderRadius: 4 })} />
    <div style={abs({ left: 780, top: dy + 576, width: 240, height: 348, background: 'linear-gradient(180deg, #d9f0f7 0%, #fff6de 100%)', border: '13px solid #3d7fa8', boxSizing: 'border-box' })}>
      <div style={abs({ left: 100, top: 0, width: 14, height: '100%', background: '#3d7fa8' })} />
      <div style={abs({ left: 0, top: 150, width: '100%', height: 12, background: '#3d7fa8' })} />
    </div>
    <div style={abs({ left: 1020, top: dy + 560, width: 56, height: 380, background: '#4a8db5', borderRadius: 4 })} />
    {/* The light from the window, falling across the wall towards the desk */}
    <div
      style={abs({
        left: 300,
        top: dy + 640,
        width: 620,
        height: 520,
        background: 'linear-gradient(245deg, rgba(255,248,220,0.45), rgba(255,248,220,0))',
        clipPath: 'polygon(45% 0, 100% 8%, 70% 100%, 0 100%)',
        filter: 'blur(16px)',
      })}
    />
  </>
);

/** The desk: a wooden top and its front, running off the bottom of the frame. */
const Desk: React.FC<{ dy: number; height: number }> = ({ dy, height }) => (
  <>
    <div style={abs({ left: 0, top: dy + DESK_TOP, width: W, height: 30, background: 'linear-gradient(#a8693b, #8a532c)', boxShadow: '0 -2px 0 #c58a55' })} />
    <div style={abs({ left: 0, top: dy + DESK_TOP + 30, width: W, height: height - dy - DESK_TOP - 30, background: 'linear-gradient(#7a4724, #5e3519)' })} />
    <div style={abs({ left: 0, top: dy + DESK_TOP + 30, width: W, height: 14, background: 'rgba(0,0,0,0.18)' })} />
  </>
);

/** Paper registers and loose sheets, piled on the desk: one class's book open on top. */
const RegisterPile: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const books = ['#2e86c1', '#27ae60', '#c0392b', '#f1c40f', '#8e44ad', '#2e86c1'];
  return (
    <>
      {books.map((c, i) => (
        <div
          key={i}
          style={abs({
            left: x - 130 + Math.sin(i * 2.1) * 14,
            top: y - 26 - i * 24,
            width: 260,
            height: 26,
            background: c,
            borderRadius: 3,
            boxShadow: 'inset 0 -5px 0 rgba(0,0,0,0.18), 0 2px 0 #fbf8ef',
            rotate: `${Math.sin(i * 1.7) * 2.5}deg`,
          })}
        />
      ))}
      {/* Loose lists sticking out */}
      {[-1, 1].map((s, i) => (
        <div key={i} style={abs({ left: x - 90 + s * 70, top: y - 150 - i * 30, width: 150, height: 90, background: 'repeating-linear-gradient(180deg, #fffdf6 0 14px, #c9d3e6 14px 16px)', borderRadius: 2, rotate: `${s * 9}deg`, boxShadow: '0 1px 0 #d8d2bf' })} />
      ))}
    </>
  );
};

/** The glass of atay, larger than life: the running joke of the pair (cold before, steaming after), in the same place in both. */
const Tea: React.FC<{ x: number; y: number; t: number; hot: boolean }> = ({ x, y, t, hot }) => (
  <div style={abs({ left: x, top: y, width: 0, height: 0, scale: '1.45', transformOrigin: '0 0' })}>
    <TeaGlass x={0} y={0} t={t} steam={hot ? 1 : 0} />
  </div>
);

const Clock: React.FC<{ x: number; y: number; size?: number; hours?: number; minutes?: number; t: number }> = ({ x, y, size = 150, hours = 10, minutes = 24, t }) => (
  <div style={abs({ left: x - size / 2, top: y - size / 2, filter: 'drop-shadow(0 6px 8px rgba(60,40,20,0.18))' })}>
    <WallClock size={size} hours={hours} minutes={minutes} seconds={(t * 1) % 60} />
  </div>
);

export const DirectorScene: React.FC<{ moment: DirectorMoment; height: number; t: number }> = ({ moment, height, t }) => {
  const s = useStage(height);
  const after = moment === 'after';
  const blink = (t % 3.4) > 3.25 ? 1 : 0;
  const width = 540;
  const bx = 110;
  const by = s.y(420);
  const face: Face = after
    ? { mouth: 'grin', look: [0.55, 0.75], brows: 0.35, blush: 0.35, blink, t }
    : { mouth: 'talk', open: 0.35 + 0.35 * Math.abs(Math.sin(t * 7)), look: [-0.8, -0.15], brows: 0.5, worry: 0.9, sweat: 1, t };
  const [ls, rs] = DIRECTOR_SHOULDERS;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Mirrored height={height}>
        <OfficeWall height={height} dy={s.dy} />
        <div style={abs({ left: bx, top: by, width })}>
          <Director width={width} face={face} tilt={after ? 3 : -5} />
          <BustLayer width={width}>
            {after ? (
              <>
                {/* His left hand holds the phone up to read; the right rests by the glass */}
                <Sleeve from={ls} to={[40, 610]} sleeve="" skin={DIRECTOR_COLORS.skin} bend={-50} thickness={70} />
                <Sleeve from={rs} to={[292, 560]} sleeve="" skin={DIRECTOR_COLORS.skin} bend={70} thickness={70} thumb={-1} />
                <PhoneBackSvg x={286} y={482} w={96} rot={-12} />
                {/* Fingers round the phone's edges */}
                <ellipse cx="236" cy="520" rx="13" ry="20" fill={DIRECTOR_COLORS.skin} transform="rotate(-12 236 520)" />
                <ellipse cx="334" cy="510" rx="12" ry="18" fill={DIRECTOR_COLORS.skin} transform="rotate(-12 334 510)" />
              </>
            ) : (
              <>
                {/* His phone at his ear: the elbow out, the hand over the phone's back */}
                <Sleeve from={[96, 470]} to={[70, 286]} sleeve="" skin={DIRECTOR_COLORS.skin} bend={-70} thickness={70} />
                <g transform="rotate(14 58 250)">
                  <rect x="34" y="176" width="52" height="150" rx="12" fill="#262a3d" />
                  <rect x="38" y="180" width="44" height="142" rx="10" fill="none" stroke="#4a5068" strokeWidth="3" />
                </g>
                <circle cx="66" cy="296" r="27" fill={DIRECTOR_COLORS.skin} />
                <Sleeve from={rs} to={[330, 600]} sleeve="" skin={DIRECTOR_COLORS.skin} bend={50} thickness={70} thumb={-1} />
              </>
            )}
          </BustLayer>
        </div>
        <Desk dy={s.dy} height={height} />
        {after ? null : <RegisterPile x={520} y={s.y(DESK_TOP + 24)} />}
        <Tea x={150} y={s.y(DESK_TOP + 26)} t={t} hot={after} />
      </Mirrored>
      {after ? <AppTile x={s.x(610)} y={s.y(940)} size={112} /> : null}
      {/* The clock is not mirrored: 10:24 reads the same in both languages */}
      <Clock x={s.x(660)} y={s.y(690)} t={t} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
