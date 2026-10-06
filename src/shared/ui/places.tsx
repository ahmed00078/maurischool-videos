import React from 'react';
import { Bi, useBi, useLang } from '../lang';
import { OUTFIT } from '../tokens';

/**
 * Places, drawn flat like the people: a family courtyard at midday and a
 * school's cash office with its counter. Both are laid out on the 1080 × 1920
 * canvas and run well past it on every side (OVER), so a camera can push in
 * or pull back without finding an edge.
 */

const OVER = 900;

/** A deterministic scatter, so plaster and pebbles sit in the same place on every frame. */
const scatter = (n: number, seed: number) => {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => [r(), r(), r()] as const);
};

/** The frame of the canvas and its margin, as an absolutely placed box. */
const Plate: React.FC<{ children: React.ReactNode; background: string }> = ({ children, background }) => (
  <div style={{ position: 'absolute', left: -OVER, top: -OVER, width: 1080 + OVER * 2, height: 1920 + OVER * 2, background, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: OVER, top: OVER, width: 1080, height: 1920 }}>{children}</div>
  </div>
);

const abs = (style: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', ...style });

/** Where the courtyard's ground meets the wall, in canvas px. */
export const COURTYARD_GROUND = 1420;

/**
 * A family courtyard at midday: hazy sky and a white sun, a sand-coloured
 * plastered wall, a blue metal door with its diamond panels, a clay water jar,
 * and the sand floor. Shadows are short: the sun is overhead.
 */
export const Courtyard: React.FC = () => {
  const wallTop = 600;
  const ground = COURTYARD_GROUND;
  return (
    <Plate background={`linear-gradient(180deg, #86c3e2 0%, #cde9f1 ${((OVER + 300) / (1920 + OVER * 2)) * 100}%, #f6ead2 ${((OVER + wallTop) / (1920 + OVER * 2)) * 100}%, #ecd3a2 ${((OVER + wallTop) / (1920 + OVER * 2)) * 100}%)`}>
      {/* The sun and its glare */}
      <div style={abs({ left: 880 - 420, top: 250 - 420, width: 840, height: 840, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,246,214,0.95) 0%, rgba(255,236,170,0.45) 18%, rgba(255,236,170,0) 60%)' })} />
      <div style={abs({ left: 880 - 62, top: 250 - 62, width: 124, height: 124, borderRadius: '50%', background: '#fffaf0', boxShadow: '0 0 60px 20px rgba(255,244,200,0.8)' })} />
      {/* The wall, far wider than the frame */}
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: wallTop, height: ground - wallTop, background: 'linear-gradient(180deg, #e6ba84 0%, #dfb07a 70%, #c9955f 100%)' })} />
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: wallTop - 26, height: 40, background: '#d3a06a', boxShadow: '0 10px 0 rgba(120,70,20,0.18)' })} />
      {/* Plaster: blotches and a crack or two */}
      {scatter(26, 7).map(([a, b, c], i) => (
        <div
          key={i}
          style={abs({
            left: -300 + a * 1700,
            top: wallTop + 60 + b * (ground - wallTop - 160),
            width: 60 + c * 160,
            height: 30 + c * 70,
            borderRadius: '50%',
            background: i % 3 ? 'rgba(160,100,40,0.10)' : 'rgba(255,240,210,0.22)',
            filter: 'blur(6px)',
          })}
        />
      ))}
      <svg width="1080" height="1920" style={abs({ left: 0, top: 0, overflow: 'visible' })}>
        <path d="M 150 700 l 18 40 l -10 30 l 22 50 M 168 740 l 26 8" stroke="rgba(120,70,30,0.35)" strokeWidth="3" fill="none" />
        <path d="M 930 980 l -14 36 l 12 26 l -8 40" stroke="rgba(120,70,30,0.3)" strokeWidth="3" fill="none" />
      </svg>
      {/* The door: a painted metal door in a darker frame, two leaves with diamond panels and studs */}
      <div style={abs({ left: 456, top: 880, width: 264, height: ground - 880, background: '#6a4a2e' })} />
      {[0, 1].map((leaf) => (
        <div
          key={leaf}
          style={abs({
            left: 470 + leaf * 120,
            top: 894,
            width: 116,
            height: ground - 894,
            background: 'linear-gradient(180deg, #2f93a8 0%, #267f93 100%)',
            boxShadow: 'inset 0 0 0 6px rgba(0,0,0,0.12)',
          })}
        >
          <svg width="116" height={ground - 894} style={{ position: 'absolute', inset: 0 }}>
            <rect x="16" y="30" width="84" height="170" fill="none" stroke="#6fc3d3" strokeWidth="5" />
            <path d="M 58 44 L 90 115 L 58 186 L 26 115 Z" fill="#3aa6bb" stroke="#8fd6e2" strokeWidth="4" />
            <rect x="16" y="240" width="84" height="220" fill="none" stroke="#6fc3d3" strokeWidth="5" />
            <path d="M 58 262 L 90 350 L 58 438 L 26 350 Z" fill="#3aa6bb" stroke="#8fd6e2" strokeWidth="4" />
            {[20, 480].map((y) => [14, 36, 58, 80, 102].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#1d6576" />))}
          </svg>
        </div>
      ))}
      <div style={abs({ left: 568, top: 1130, width: 26, height: 26, borderRadius: '50%', border: '5px solid #c9a24a' })} />
      {/* A clay water jar against the wall */}
      <svg width="200" height="240" viewBox="0 0 200 240" style={abs({ left: 40, top: ground - 216 })}>
        <ellipse cx="100" cy="226" rx="80" ry="12" fill="rgba(110,60,20,0.25)" />
        <path d="M 70 20 L 130 20 L 124 44 Q 190 70 184 140 Q 176 214 100 222 Q 24 214 16 140 Q 10 70 76 44 Z" fill="#b8643b" />
        <path d="M 30 120 Q 100 150 170 120" stroke="#8e4524" strokeWidth="5" fill="none" opacity="0.6" />
        <path d="M 40 90 Q 60 70 84 64" stroke="#d98a5c" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.7" />
        <rect x="66" y="12" width="68" height="14" rx="6" fill="#9c5230" />
      </svg>
      {/* The sand floor: the wall's short shadow, pebbles, a few straws */}
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: ground, height: 70, background: 'linear-gradient(180deg, rgba(120,80,30,0.22), rgba(120,80,30,0))' })} />
      <svg width="1080" height="600" style={abs({ left: 0, top: ground, overflow: 'visible' })}>
        {scatter(40, 3).map(([a, b, c], i) => (
          <ellipse key={i} cx={-200 + a * 1500} cy={30 + b * 520} rx={3 + c * 7} ry={2 + c * 4} fill={i % 2 ? '#c9a66b' : '#d8b983'} />
        ))}
        {scatter(8, 11).map(([a, b, c], i) => (
          <path key={`s${i}`} d={`M ${a * 1080} ${60 + b * 400} l ${20 + c * 30} ${-6 + c * 12}`} stroke="#d9b45a" strokeWidth="3" strokeLinecap="round" />
        ))}
      </svg>
    </Plate>
  );
};

/** The light in the living room: late at night (one lamp), at sunset, or in the morning sun. */
export type RoomLight = 'night' | 'dusk' | 'morning';

/**
 * Where things are in the living room, in canvas px: the top of the bolster
 * cushions along the wall, the seat, the doorway (left), the window (right),
 * a free patch of wall for a calendar.
 */
export const LIVING_ROOM = {
  cushion: 1120,
  seat: 1350,
  door: { left: 20, width: 320, top: 560 },
  window: { left: 790, top: 520, width: 250, height: 340 },
  calendar: { x: 402, y: 596 },
} as const;

const SKY: Record<RoomLight, string> = {
  night: 'linear-gradient(180deg, #0d1640 0%, #1d2a66 100%)',
  dusk: 'linear-gradient(180deg, #5b4c9a 0%, #e0788a 55%, #ffb36b 100%)',
  morning: 'linear-gradient(180deg, #8fd0f0 0%, #d6f0fb 100%)',
};

/**
 * A family's living room, the salon: warm plastered walls over a painted
 * band, a long mattress on the floor along the wall with its row of bolster
 * cushions in a red and gold print, a carpet, a window with blue shutters
 * (night sky, sunset or morning), and a doorway on the left to the rest of the
 * house. Draw people over it, then <RoomShade> over everything for the light.
 */
export const LivingRoom: React.FC<{ light: RoomLight }> = ({ light }) => {
  const { cushion, seat, door, window: win } = LIVING_ROOM;
  const fabric = { base: '#a3222d', dark: '#7d1822', gold: '#e8b44c', light: '#c63a44' };
  const cushions = Array.from({ length: 13 }, (_, i) => -900 + i * 236);
  return (
    <Plate background="#efc9a0">
      {/* The wall: plaster above, a band of paint to shoulder height */}
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: -OVER, height: OVER + 1000, background: 'linear-gradient(180deg, #f3d8b4 0%, #efc9a0 100%)' })} />
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: 1000, height: 1000, background: '#d9a36f' })} />
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: 992, height: 14, background: '#c48a55' })} />
      {/* A frieze under the ceiling: a row of little painted diamonds */}
      <svg width={1080 + OVER * 2} height="40" style={abs({ left: -OVER, top: 380 })}>
        {Array.from({ length: 70 }, (_, i) => (
          <path key={i} d={`M ${i * 42 + 21} 6 L ${i * 42 + 33} 20 L ${i * 42 + 21} 34 L ${i * 42 + 9} 20 Z`} fill={i % 2 ? '#c9774a' : '#2f8a8a'} opacity="0.55" />
        ))}
      </svg>
      {/* The doorway: a dark (or lit) hall behind a wooden frame */}
      <div style={abs({ left: door.left - 24, top: door.top - 24, width: door.width + 48, height: 1920, background: '#8a5a34' })} />
      <div
        style={abs({
          left: door.left,
          top: door.top,
          width: door.width,
          height: 1920,
          background: light === 'morning' ? 'linear-gradient(180deg, #f2ddb8 0%, #e3c392 100%)' : light === 'dusk' ? 'linear-gradient(180deg, #b98a5e, #8d6340)' : 'linear-gradient(180deg, #2c2233 0%, #1d1822 100%)',
        })}
      >
        {/* The far wall of the hall, and a patch of light on its floor in the morning */}
        <div style={abs({ left: 40, top: 120, width: door.width - 80, height: 1400, background: 'rgba(0,0,0,0.08)' })} />
        {light === 'morning' ? <div style={abs({ left: 0, right: 0, top: 820, height: 300, background: 'linear-gradient(180deg, rgba(255,247,220,0), rgba(255,247,220,0.8))' })} /> : null}
      </div>
      {/* The window: shutters open, the sky outside */}
      <div style={abs({ left: win.left - 18, top: win.top - 18, width: win.width + 36, height: win.height + 36, background: '#e8d3b0', borderRadius: 6 })} />
      <div style={abs({ left: win.left, top: win.top, width: win.width, height: win.height, background: SKY[light], overflow: 'hidden', boxShadow: 'inset 0 0 0 12px #2f7fb0' })}>
        {light === 'night' ? (
          <>
            <div style={abs({ left: 150, top: 60, width: 46, height: 46, borderRadius: '50%', background: '#fff6d6', boxShadow: '0 0 30px 10px rgba(255,246,214,0.35)' })} />
            <div style={abs({ left: 164, top: 52, width: 44, height: 44, borderRadius: '50%', background: '#16215a' })} />
            {scatter(14, 5).map(([a, b, c], i) => (
              <div key={i} style={abs({ left: 20 + a * 210, top: 20 + b * 280, width: 3 + c * 3, height: 3 + c * 3, borderRadius: '50%', background: '#fff', opacity: 0.4 + c * 0.5 })} />
            ))}
          </>
        ) : light === 'dusk' ? (
          <div style={abs({ left: 60, top: 230, width: 120, height: 120, borderRadius: '50%', background: '#ffe2a0', boxShadow: '0 0 60px 30px rgba(255,200,120,0.5)' })} />
        ) : (
          <div style={abs({ left: -80, top: -80, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,240,0.95), rgba(255,255,240,0) 70%)' })} />
        )}
        {/* The cross of the frame */}
        <div style={abs({ left: win.width / 2 - 7, top: 0, width: 14, height: win.height, background: '#2f7fb0' })} />
        <div style={abs({ left: 0, top: win.height * 0.45, width: win.width, height: 14, background: '#2f7fb0' })} />
      </div>
      {[win.left - 18 - 64, win.left + win.width + 18].map((x, i) => (
        <div key={i} style={abs({ left: x, top: win.top - 18, width: 64, height: win.height + 36, background: 'repeating-linear-gradient(180deg, #3a8dc0 0px, #3a8dc0 22px, #2c77a6 22px, #2c77a6 28px)', borderRadius: 4 })} />
      ))}
      {/* The morning sun through the window, across the wall */}
      {light !== 'night' ? (
        <div
          style={abs({
            left: win.left - 420,
            top: win.top + 120,
            width: 520,
            height: 900,
            background: light === 'morning' ? 'linear-gradient(200deg, rgba(255,250,225,0.55), rgba(255,250,225,0))' : 'linear-gradient(200deg, rgba(255,170,110,0.45), rgba(255,170,110,0))',
            clipPath: 'polygon(78% 0, 100% 0, 60% 100%, 0 100%)',
          })}
        />
      ) : null}
      {/* The mattress along the wall, its row of bolster cushions */}
      {cushions.map((x, i) => (
        <div
          key={i}
          style={abs({
            left: x,
            top: cushion,
            width: 226,
            height: seat - cushion + 40,
            borderRadius: '40px 40px 10px 10px',
            background: `repeating-linear-gradient(90deg, ${fabric.base} 0px, ${fabric.base} 34px, ${fabric.light} 34px, ${fabric.light} 40px)`,
            boxShadow: 'inset 0 -24px 30px rgba(0,0,0,0.25), inset 0 10px 18px rgba(255,255,255,0.12)',
          })}
        >
          <svg width="226" height="120" style={{ position: 'absolute', left: 0, top: 50 }}>
            <path d="M 0 30 L 28 6 L 56 30 L 84 6 L 112 30 L 140 6 L 168 30 L 196 6 L 226 30" stroke={fabric.gold} strokeWidth="6" fill="none" />
            <path d="M 0 60 L 28 84 L 56 60 L 84 84 L 112 60 L 140 84 L 168 60 L 196 84 L 226 60" stroke={fabric.gold} strokeWidth="6" fill="none" />
            {[28, 84, 140, 196].map((cx) => (
              <circle key={cx} cx={cx} cy="45" r="7" fill={fabric.gold} />
            ))}
          </svg>
        </div>
      ))}
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: seat, height: 150, background: `linear-gradient(180deg, ${fabric.dark} 0%, ${fabric.base} 30%, ${fabric.dark} 100%)` })} />
      <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: seat + 18, height: 12, background: fabric.gold, opacity: 0.7 })} />
      {/* The carpet */}
      <div
        style={abs({
          left: -OVER,
          width: 1080 + OVER * 2,
          top: seat + 150,
          height: 1920 - seat + OVER,
          background: 'repeating-linear-gradient(90deg, #6a2130 0px, #6a2130 60px, #1f3f6a 60px, #1f3f6a 66px, #6a2130 66px, #6a2130 120px, #d49a3a 120px, #d49a3a 124px)',
        })}
      />
    </Plate>
  );
};

/**
 * The light over the living room and whoever is in it: the dark of the night
 * or the warmth of a sunset, and `glows`, pools of light (a phone's screen on
 * a face, a lamp), added on top. Everything is multiply and screen, so it
 * shades what is under it rather than covering it.
 */
export const RoomShade: React.FC<{ light: RoomLight; glows?: { x: number; y: number; r: number; color: string; amount: number }[] }> = ({ light, glows = [] }) => (
  <div style={abs({ left: -OVER, top: -OVER, width: 1080 + OVER * 2, height: 1920 + OVER * 2, pointerEvents: 'none' })}>
    {light === 'night' ? <div style={abs({ inset: 0, background: '#3b3a6e', mixBlendMode: 'multiply', opacity: 0.6 })} /> : null}
    {light === 'dusk' ? <div style={abs({ inset: 0, background: '#e9a27a', mixBlendMode: 'multiply', opacity: 0.35 })} /> : null}
    {glows.map((g, i) =>
      g.amount > 0.01 ? (
        <div
          key={i}
          style={abs({
            left: OVER + g.x - g.r,
            top: OVER + g.y - g.r,
            width: g.r * 2,
            height: g.r * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${g.color} 0%, rgba(0,0,0,0) 70%)`,
            mixBlendMode: 'screen',
            opacity: g.amount,
          })}
        />
      ) : null,
    )}
  </div>
);

/** Where the office's counter top begins, in canvas px, unless a scene sets its own. */
export const COUNTER_TOP = 1330;

/**
 * The school's cash office, the wall behind the counter: cream plaster over a
 * painted green dado, a window with its blue shutters and the light coming in,
 * a shelf of binders. The calendar and the counter are drawn apart (they move).
 */
export const Office: React.FC = () => (
  <Plate background="linear-gradient(180deg, #f3ead7 0%, #f0e5cf 60%, #eadfc6 100%)">
    {/* The dado, a strip of green paint to hip height */}
    <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: 1010, height: 1400, background: '#9cc9b4' })} />
    <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: 1000, height: 14, background: '#7fb09a' })} />
    {/* The window, top left: blue frame, open shutters, the bright yard outside */}
    <div style={abs({ left: -40, top: 380, width: 70, height: 440, background: '#3d7fa8', borderRadius: 4 })} />
    <div style={abs({ left: 30, top: 400, width: 260, height: 400, background: 'linear-gradient(180deg, #d9f0f7 0%, #fff6de 100%)', border: '14px solid #3d7fa8', boxSizing: 'border-box' })}>
      <div style={abs({ left: 101, top: 0, width: 16, height: '100%', background: '#3d7fa8' })} />
      <div style={abs({ left: 0, top: 170, width: '100%', height: 14, background: '#3d7fa8' })} />
    </div>
    <div style={abs({ left: 290, top: 380, width: 70, height: 440, background: '#4a8db5', borderRadius: 4 })} />
    {/* The light from the window, falling across the wall */}
    <div
      style={abs({
        left: 200,
        top: 560,
        width: 560,
        height: 700,
        background: 'linear-gradient(115deg, rgba(255,248,220,0.55), rgba(255,248,220,0))',
        clipPath: 'polygon(0 0, 55% 10%, 100% 100%, 35% 100%)',
      })}
    />
    {/* A shelf of binders, right, behind where the father stands */}
    <div style={abs({ left: 700, top: 560, width: 460, height: 16, background: '#8a5a34' })} />
    {['#c0392b', '#2e86c1', '#27ae60', '#f1c40f', '#8e44ad', '#2e86c1', '#e67e22'].map((c, i) => (
      <div key={i} style={abs({ left: 716 + i * 52, top: 400 + (i % 3) * 8, width: 44, height: 160 - (i % 3) * 8, background: c, borderRadius: 3, boxShadow: 'inset -6px 0 0 rgba(0,0,0,0.15)' })}>
        <div style={abs({ left: 10, top: 30, width: 24, height: 40, background: 'rgba(255,255,255,0.8)', borderRadius: 2 })} />
      </div>
    ))}
  </Plate>
);

/** One leaf of a tear-off calendar: the month, the day, and the weekday under it if given. */
export type CalendarPage = { month: Bi; day: number; weekday?: Bi };

const CalendarLeaf: React.FC<{ page: CalendarPage; width: number; height: number }> = ({ page, width, height }) => {
  const bi = useBi();
  const { font, rtl } = useLang();
  return (
    <div style={{ position: 'absolute', inset: 0, width, height, background: '#fffdf6', textAlign: 'center' }}>
      <div style={{ height: width * 0.34, background: '#d64541', color: '#fff', fontFamily: font, fontWeight: 800, fontSize: width * 0.2, lineHeight: `${width * 0.34}px` }}>{bi(page.month)}</div>
      <div style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: width * 0.52, color: '#2b2b3a', lineHeight: `${width * 0.75}px` }}>{page.day}</div>
      {page.weekday ? (
        <div style={{ marginTop: -width * 0.06, fontFamily: font, fontWeight: 800, fontSize: width * (rtl ? 0.15 : 0.14), letterSpacing: rtl ? 0 : 1, textTransform: 'uppercase', color: '#d64541', lineHeight: 1.3 }}>
          {bi(page.weekday)}
        </div>
      ) : null}
    </div>
  );
};

/**
 * A tear-off wall calendar: a red band with the month, the day in big
 * numerals, and the weekday under it when the leaf has one. Give `pages` and
 * `flip` to tear leaves off: `flip` counts leaves gone, continuous (1.5 is the
 * first gone and the second half torn), and going back down puts them back, as
 * a rewind does. Without `pages`, one leaf of `month` and `day`.
 */
export const WallCalendar: React.FC<{ month?: Bi; day?: number; pages?: CalendarPage[]; flip?: number; x: number; y: number; width?: number }> = ({
  month,
  day,
  pages,
  flip = 0,
  x,
  y,
  width = 150,
}) => {
  const leaves = pages ?? [{ month: month ?? { fr: '', ar: '' }, day: day ?? 1 }];
  const height = width * (leaves.some((p) => p.weekday) ? 1.36 : 1.15);
  const f = Math.max(0, Math.min(leaves.length - 1, flip));
  const gone = Math.floor(f);
  const t = f - gone;
  const under = leaves[Math.min(leaves.length - 1, gone + (t > 0 ? 1 : 0))];
  return (
    <div style={abs({ left: x, top: y, width, height })}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 8, boxShadow: '0 10px 20px rgba(60,40,20,0.2)', overflow: 'hidden' }}>
        <CalendarLeaf page={under} width={width} height={height} />
        <Rings width={width} />
      </div>
      {/* The leaf being torn: it lifts off the top edge, swings up and away, and fades. */}
      {t > 0 ? (
        <div style={{ position: 'absolute', inset: 0, perspective: 900 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 8,
              overflow: 'hidden',
              transformOrigin: '50% 0%',
              transform: `translate(${t * width * 0.9}px, ${-t * t * width * 0.6}px) rotateX(${t * 75}deg) rotateZ(${t * 28}deg)`,
              opacity: 1 - Math.max(0, (t - 0.6) / 0.4),
              boxShadow: `0 ${10 + t * 20}px ${20 + t * 20}px rgba(60,40,20,${0.25 * (1 - t)})`,
            }}
          >
            <CalendarLeaf page={leaves[gone]} width={width} height={height} />
          </div>
        </div>
      ) : null}
      {t > 0 ? (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 8, overflow: 'hidden', pointerEvents: 'none' }}>
          <Rings width={width} />
        </div>
      ) : null}
    </div>
  );
};

/** The two binding rings at the top, where the leaves are torn from. */
const Rings: React.FC<{ width: number }> = ({ width }) => (
  <>
    <div style={abs({ left: width * 0.3, top: -6, width: 12, height: 18, borderRadius: 6, background: '#555' })} />
    <div style={abs({ right: width * 0.3, top: -6, width: 12, height: 18, borderRadius: 6, background: '#555' })} />
  </>
);

/**
 * The counter, seen from the customer's side: a wooden top (`depth` px of it
 * seen from above) and its front panel down past the frame. `children` sit on
 * the top (the register, a sign).
 */
export const Counter: React.FC<{ top?: number; depth?: number; children?: React.ReactNode }> = ({ top = COUNTER_TOP, depth = 70, children }) => (
  <>
    <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top, height: depth, background: 'linear-gradient(180deg, #d9a872 0%, #cf9b62 100%)' })} />
    <div style={abs({ left: -OVER, width: 1080 + OVER * 2, top: top + depth - 10, height: 10, background: '#e2b37c' })} />
    <div
      style={abs({
        left: -OVER,
        width: 1080 + OVER * 2,
        top: top + depth,
        height: 1920 - top + OVER,
        background: 'repeating-linear-gradient(90deg, #b27a47 0px, #b27a47 176px, #9d6a3c 176px, #9d6a3c 184px)',
        boxShadow: 'inset 0 14px 0 rgba(0,0,0,0.18)',
      })}
    />
    {children}
  </>
);

/** A tent-shaped nameplate on the counter: « Caisse ». */
export const DeskSign: React.FC<{ label: string; x: number; y: number }> = ({ label, x, y }) => {
  const { font, rtl } = useLang();
  return (
    <div style={abs({ left: x, top: y, translate: '-50% -100%' })}>
      <div
        style={{
          padding: rtl ? '6px 26px 12px' : '10px 26px',
          background: 'linear-gradient(180deg, #2b3a55, #1f2b42)',
          color: '#f4e7c3',
          fontFamily: font,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: rtl ? 0 : 3,
          textTransform: 'uppercase',
          borderRadius: 6,
          boxShadow: '0 8px 0 #141c2c, 0 14px 20px rgba(40,25,10,0.3)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** Pseudo-handwritten ledger lines: a name, then an amount, in blue ink. */
const LedgerPage: React.FC<{ seed: number; side: 'left' | 'right' }> = ({ seed, side }) => {
  const rows = scatter(9, seed + 1);
  return (
    <svg width="100%" height="100%" viewBox="0 0 220 300" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1="10" x2="210" y1={28 + i * 25} y2={28 + i * 25} stroke="#b9cce6" strokeWidth="1.4" />
      ))}
      <line x1={side === 'left' ? 160 : 150} x2={side === 'left' ? 160 : 150} y1="10" y2="292" stroke="#e8a0a0" strokeWidth="1.4" />
      {rows.map(([a, b, c], i) => (
        <g key={i} stroke="#2c4f9e" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity={0.85}>
          <path d={`M 16 ${22 + i * 25} q 8 -8 16 0 t 16 0 t ${10 + a * 20} 0 t ${10 + b * 20} 0 q 6 -6 ${8 + c * 16} 0`} />
          <path d={`M ${side === 'left' ? 168 : 158} ${22 + i * 25} l 8 -6 l 4 6 l 8 -6 l 4 6 l ${6 + a * 10} -4`} />
        </g>
      ))}
    </svg>
  );
};

/**
 * The accountant's register: a thick ledger lying open on the counter, seen
 * from across it. `flip` counts pages turned (right to left), continuous: 2.5
 * is two pages over and the third standing up. Lower it to turn pages back.
 */
export const Register: React.FC<{ x: number; y: number; width?: number; flip?: number }> = ({ x, y, width = 460, flip = 0 }) => {
  const h = width * 0.66;
  const page = width / 2;
  const turned = Math.max(0, Math.floor(flip));
  const t = flip - turned;
  const face = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    background: side === 'left' ? 'linear-gradient(90deg, #fbf8ef 0%, #f1ecdd 100%)' : 'linear-gradient(90deg, #eee8d6 0%, #fbf8ef 12%)',
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  });
  return (
    <div style={abs({ left: x - width / 2, top: y - h / 2, width, height: h, perspective: 1400 })}>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: 'rotateX(52deg)', transformOrigin: '50% 100%' }}>
        {/* The block of pages under both sides: its thickness shows along the bottom edge */}
        <div style={abs({ left: -8, top: 8, width: width + 16, height: h + 22, background: 'repeating-linear-gradient(180deg, #e9e2cc 0px, #e9e2cc 3px, #d8cfb4 3px, #d8cfb4 4px)', borderRadius: 6, transform: 'translateZ(-18px)' })} />
        <div style={abs({ left: -12, top: -6, width: width + 24, height: h + 16, background: '#7a2e2a', borderRadius: 8, transform: 'translateZ(-22px)' })} />
        <div style={abs({ left: 0, top: 0, width: page, height: h })}>
          <div style={face('left')}>
            <LedgerPage seed={turned * 2 + 1} side="left" />
          </div>
        </div>
        <div style={abs({ left: page, top: 0, width: page, height: h })}>
          <div style={face('right')}>
            {/* While a page stands up, the next one already shows under it. */}
            <LedgerPage seed={turned * 2 + (t > 0 ? 6 : 4)} side="right" />
          </div>
        </div>
        {/* The page being turned, hinged on the spine */}
        {t > 0 ? (
          <div style={abs({ left: page, top: 0, width: page, height: h, transformStyle: 'preserve-3d', transformOrigin: '0 50%', transform: `rotateY(${-180 * t}deg) translateZ(1px)` })}>
            <div style={face('right')}>
              <LedgerPage seed={turned * 2 + 4} side="right" />
            </div>
            <div style={{ ...face('left'), transform: 'rotateY(180deg)' }}>
              <LedgerPage seed={turned * 2 + 3} side="left" />
            </div>
          </div>
        ) : null}
        <div style={abs({ left: page - 3, top: 0, width: 6, height: h, background: 'linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0))', transform: 'translateZ(2px)' })} />
      </div>
    </div>
  );
};
