import React from 'react';
import { AbsoluteFill } from 'remotion';
import { useStoryFrame } from '../../shared/beat';
import { CameraPath, Grain, Shot, Vignette } from '../../shared/fx';
import { DeskLamp, DeskTop, TeaGlass } from '../../shared/ui/desk';
import { Arm, Boy, BustLayer, Face, Father, FATHER_COLORS, FATHER_SHOULDERS } from '../../shared/ui/people';
import { CalendarPage, LIVING_ROOM, LivingRoom, RoomLight, RoomShade, WallCalendar } from '../../shared/ui/places';
import { DeviceBack, DEVICE_H, DEVICE_W } from '../../shared/ui/Device';
import { COPY } from './copy';

/**
 * Where everyone is in « Le groupe des parents », and the two sets: the salon
 * (Papa on the mattress along the wall, the calendar, Sidi in the doorway) and
 * the table where they revise on Wednesday night. Scenes are cut from these
 * sets and only say what changes: faces, the phone, the light, the camera.
 */

type Pt = [number, number];

/** Papa on the mattress: 560 px wide (1.4 px per unit). */
export const PAPA = { left: 470, top: 640, width: 560 } as const;
const PK = PAPA.width / 400;
export const papaAt = ([x, y]: Pt): Pt => [PAPA.left + x * PK, PAPA.top + y * PK];
export const PAPA_FACE = papaAt([200, 236]);

/** Sidi in the doorway: 290 px wide. */
export const SIDI = { left: 15, top: 741, width: 330 } as const;
const SK = SIDI.width / 400;
export const SIDI_FACE: Pt = [SIDI.left + 200 * SK, SIDI.top + 250 * SK];

/** The calendar's leaves: Tuesday 20, Wednesday 21, Thursday 22 October. */
export const CALENDAR: CalendarPage[] = [
  { month: COPY.month, day: 20, weekday: COPY.weekdays.tuesday },
  { month: COPY.month, day: 21, weekday: COPY.weekdays.wednesday },
  { month: COPY.month, day: 22, weekday: COPY.weekdays.thursday },
];
export const CALENDAR_BOX = { x: LIVING_ROOM.calendar.x, y: LIVING_ROOM.calendar.y, width: 140 } as const;
export const CALENDAR_CENTER: Pt = [CALENDAR_BOX.x + 70, CALENDAR_BOX.y + 95];

/** Everyone blinks now and then, on the video's clock, each at their own rhythm. */
const useBlink = (cycle: number, offset: number) => {
  const g = useStoryFrame();
  const b = (g + offset) % cycle;
  return b < 3 ? b / 2 : b < 6 ? (6 - b) / 3 : 0;
};

export type PapaState = {
  face: Face;
  tilt?: number;
  /** His phone held up in both hands in front of his chest (1), or lowered out of the frame (0). */
  phone?: { up: number; glow?: number; bob?: number };
  /** His phone in his chest pocket, buzzing. */
  pocket?: { rise: number; shake?: number };
};

/** The phone in his hands, in bust units: its centre and its size. */
const HELD = { x: 200, y: 590, w: 100 } as const;

const Papa: React.FC<{ state: PapaState }> = ({ state }) => {
  const g = useStoryFrame();
  const blink = useBlink(97, 30);
  const face: Face = { ...state.face, blink: Math.max(blink, state.face.blink ?? 0), t: g / 30 };
  const [l, r] = FATHER_SHOULDERS;
  const up = state.phone?.up ?? 0;
  const drop = (1 - up) * 700;
  const bob = state.phone?.bob ?? 0;
  const ph = { x: HELD.x, y: HELD.y + drop + bob, w: HELD.w, h: (HELD.w * DEVICE_H) / DEVICE_W };
  return (
    <div style={{ position: 'absolute', left: PAPA.left, top: PAPA.top + Math.sin(g / 21) * 3, width: PAPA.width }}>
      <Father width={PAPA.width} face={face} tilt={state.tilt ?? 0} phone={state.pocket} />
      {state.phone && up > 0.01 ? (
        <>
          {/* The phone from behind, then his hands round its lower half */}
          <div style={{ position: 'absolute', left: (ph.x - ph.w / 2) * PK, top: (ph.y - ph.h / 2) * PK, width: DEVICE_W, height: DEVICE_H, scale: String((ph.w * PK) / DEVICE_W), transformOrigin: '0 0' }}>
            <DeviceBack />
          </div>
          <BustLayer width={PAPA.width}>
            <Arm from={l} to={[ph.x - ph.w * 0.42, ph.y + ph.h * 0.28]} bend={-60} thickness={78} thumb={1} {...FATHER_COLORS} />
            <Arm from={r} to={[ph.x + ph.w * 0.42, ph.y + ph.h * 0.3]} bend={60} thickness={78} thumb={-1} {...FATHER_COLORS} />
          </BustLayer>
        </>
      ) : null}
    </div>
  );
};

export type SidiState = { face: Face; tilt?: number };

const Sidi: React.FC<{ state: SidiState }> = ({ state }) => {
  const g = useStoryFrame();
  const blink = useBlink(113, 71);
  const face: Face = { ...state.face, blink: Math.max(blink, state.face.blink ?? 0), t: g / 30 };
  return (
    <div style={{ position: 'absolute', left: SIDI.left, top: SIDI.top + Math.sin(g / 17) * 2, width: SIDI.width }}>
      <Boy width={SIDI.width} face={face} tilt={state.tilt ?? 0} />
    </div>
  );
};

/** The glow of a phone's screen on the face above it. */
export const phoneGlow = (amount: number) => ({ x: PAPA_FACE[0], y: PAPA_FACE[1] + 190, r: 340, color: 'rgba(160, 195, 255, 0.85)', amount });

/**
 * The salon: the room in its light, the calendar (`flip` tears its leaves),
 * Papa on the mattress, Sidi in the doorway when he is there, then the light
 * over all of them. `items` go over everything, in canvas px.
 */
export const Salon: React.FC<{
  light: RoomLight;
  papa: PapaState;
  sidi?: SidiState;
  flip?: number;
  shots?: Shot[];
  move?: number;
  items?: React.ReactNode;
}> = ({ light, papa, sidi, flip = 0, shots = [{ at: 0, zoom: 1, focus: [540, 960] }], move, items }) => (
  <AbsoluteFill style={{ overflow: 'hidden', background: '#efc9a0' }}>
    <CameraPath shots={shots} move={move}>
      <LivingRoom light={light} />
      <WallCalendar pages={CALENDAR} flip={flip} x={CALENDAR_BOX.x} y={CALENDAR_BOX.y} width={CALENDAR_BOX.width} />
      {sidi ? <Sidi state={sidi} /> : null}
      <Papa state={papa} />
      <RoomShade light={light} glows={papa.phone ? [phoneGlow((papa.phone.glow ?? 1) * papa.phone.up)] : []} />
      {items}
    </CameraPath>
    <Vignette strength={light === 'night' ? 0.45 : 0.22} />
    <Grain />
  </AbsoluteFill>
);

// ── the table, Wednesday night ──

/** At the table: Sidi on the left, Papa on the right, the table's edge across the frame. */
export const TABLE = { top: 1390 } as const;
export const TABLE_SIDI = { left: 20, top: 690, width: 360 } as const;
export const TABLE_PAPA = { left: 560, top: 590, width: 520 } as const;
const TSK = TABLE_SIDI.width / 400;
const TPK = TABLE_PAPA.width / 400;
const tableSidiAt = ([x, y]: Pt): Pt => [TABLE_SIDI.left + x * TSK, TABLE_SIDI.top + y * TSK];
const toTablePapa = ([x, y]: Pt): Pt => [(x - TABLE_PAPA.left) / TPK, (y - TABLE_PAPA.top) / TPK];
const toTableSidi = ([x, y]: Pt): Pt => [(x - TABLE_SIDI.left) / TSK, (y - TABLE_SIDI.top) / TSK];
export const TABLE_PAPA_FACE: Pt = [TABLE_PAPA.left + 200 * TPK, TABLE_PAPA.top + 236 * TPK];
export const TABLE_SIDI_FACE = tableSidiAt([200, 250]);

/** The exercise book open on the table, and where the phone lies. */
export const BOOK = { x: 520, y: 1520, width: 420 } as const;
export const TABLE_PHONE = { x: 870, y: 1565 } as const;

/** The exercise book, open, seen from across the table: two ruled pages, chapter 3's equations, Sidi's working. */
const ExerciseBook: React.FC<{ written: number }> = ({ written }) => {
  const w = BOOK.width;
  const h = w * 0.42;
  const line = (x: number, y: number, len: number, k: number) => (
    <path key={`${x}-${y}`} d={`M ${x} ${y} q 6 -6 12 0 t 12 0 t ${len / 3} 0 t ${len / 3} 0`} stroke="#2c4f9e" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity={0.85} strokeDasharray={200} strokeDashoffset={200 * (1 - Math.max(0, Math.min(1, k)))} />
  );
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: BOOK.x - w / 2, top: BOOK.y - h / 2, overflow: 'visible' }}>
      <path d={`M 30 0 L ${w - 30} 0 L ${w} ${h} L 0 ${h} Z`} fill="#2e5c8a" transform="translate(0 6)" />
      <path d={`M 34 0 L ${w / 2} 4 L ${w / 2} ${h} L 6 ${h} Z`} fill="#fbf8ef" />
      <path d={`M ${w / 2} 4 L ${w - 34} 0 L ${w - 6} ${h} L ${w / 2} ${h} Z`} fill="#f3efe2" />
      {Array.from({ length: 6 }, (_, i) => {
        const y = 22 + i * 26;
        const inset = 30 - (y / h) * 24;
        return <line key={i} x1={inset + 10} x2={w - inset - 10} y1={y} y2={y} stroke="#b9cce6" strokeWidth="1.5" />;
      })}
      <line x1={w / 2} x2={w / 2} y1="4" y2={h} stroke="#d8d0bb" strokeWidth="3" />
      {/* Right page: the exercise, as the book prints it; left page: his working, written as he goes */}
      <text x={w / 2 + 30} y="36" fontSize="17" fontWeight="700" fill="#c0392b" fontFamily="Outfit">3.</text>
      <text x={w / 2 + 54} y="36" fontSize="16" fill="#2b2b3a" fontFamily="Outfit">2x + 5 = 17</text>
      <text x={w / 2 + 30} y="88" fontSize="16" fill="#2b2b3a" fontFamily="Outfit">3x − 4 = 11</text>
      {line(46, 36, 120, written * 3)}
      {line(40, 62, 90, written * 3 - 1)}
      {line(34, 88, 110, written * 3 - 2)}
    </svg>
  );
};

export type TablePhone = { lit: number; turn: number; shake?: number };

/**
 * The phone lying on the table in front of Papa, seen at a low angle: a thin
 * slab whose screen lights the wood when a message lands; `turn` (0 to 1)
 * turns it face down.
 */
const LyingPhone: React.FC<{ phone: TablePhone }> = ({ phone }) => {
  const w = 190;
  const h = 86;
  const down = phone.turn > 0.5;
  const squash = Math.abs(Math.cos(phone.turn * Math.PI));
  return (
    <div style={{ position: 'absolute', left: TABLE_PHONE.x - w / 2 + (phone.shake ?? 0), top: TABLE_PHONE.y - h / 2, width: w, height: h }}>
      {!down && phone.lit > 0 ? (
        <div style={{ position: 'absolute', left: -120, top: -80, width: w + 240, height: h + 160, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(160,200,255,0.55), rgba(160,200,255,0))', opacity: phone.lit }} />
      ) : null}
      <div style={{ position: 'absolute', inset: 0, transform: `perspective(500px) rotateX(64deg) rotateZ(-8deg) scaleX(${0.2 + 0.8 * squash})`, transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: down ? 'linear-gradient(150deg, #3c4258, #23273a)' : '#161a28', boxShadow: '0 0 0 3px #3a3f55, 0 18px 18px rgba(0,0,0,0.45)' }}>
          {!down ? <div style={{ position: 'absolute', inset: 5, borderRadius: 10, background: `linear-gradient(170deg, rgba(95,120,230,${phone.lit}), rgba(20,30,90,${phone.lit}))` }} /> : null}
          {down ? <div style={{ position: 'absolute', left: 8, top: 8, width: 30, height: 30, borderRadius: 9, background: '#171a28' }} /> : null}
        </div>
      </div>
    </div>
  );
};

export type TableState = {
  papa: { face: Face; tilt?: number; point: number };
  sidi: { face: Face; tilt?: number };
  /** Sidi's pen: how far his working has got (0 to 1); it moves while he writes. */
  written: number;
  writing: boolean;
  phone: TablePhone;
};

/**
 * The table on Wednesday night: the salon behind in the dark, the lamp's cone
 * on the exercise book, a glass of atay, Sidi writing, Papa's finger on the
 * exercise, and the phone lying by Papa's hand.
 */
export const Table: React.FC<{ state: TableState; shots?: Shot[]; move?: number; items?: React.ReactNode }> = ({ state, shots = [{ at: 0, zoom: 1, focus: [540, 960] }], move, items }) => {
  const g = useStoryFrame();
  const papaBlink = useBlink(97, 30);
  const sidiBlink = useBlink(113, 71);
  const papaFace: Face = { ...state.papa.face, blink: Math.max(papaBlink, state.papa.face.blink ?? 0), t: g / 30 };
  const sidiFace: Face = { ...state.sidi.face, blink: Math.max(sidiBlink, state.sidi.face.blink ?? 0), t: g / 30 };
  // Papa's finger on the exercise, drawn back to his side when he is not pointing.
  const target: Pt = [BOOK.x + 110 + Math.sin(g / 9) * 4 * state.papa.point, BOOK.y - 40];
  const rest: Pt = [TABLE_PAPA.left + 70, 1560];
  const hand: Pt = [rest[0] + (target[0] - rest[0]) * state.papa.point, rest[1] + (target[1] - rest[1]) * state.papa.point];
  const pen: Pt = [BOOK.x - 150 + (state.writing ? Math.sin(g * 0.9) * 8 + ((g * 2) % 60) : 0), BOOK.y - 30 + (state.writing ? Math.cos(g * 0.7) * 5 : 0)];
  const [pl] = FATHER_SHOULDERS;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#2a2238' }}>
      <CameraPath shots={shots} move={move}>
        <LivingRoom light="night" />
        <WallCalendar pages={CALENDAR} flip={1} x={CALENDAR_BOX.x} y={CALENDAR_BOX.y + 170} width={CALENDAR_BOX.width} />
        <div style={{ position: 'absolute', left: TABLE_SIDI.left, top: TABLE_SIDI.top + Math.sin(g / 17) * 2, width: TABLE_SIDI.width }}>
          <Boy width={TABLE_SIDI.width} face={sidiFace} tilt={state.sidi.tilt ?? 0} />
        </div>
        <div style={{ position: 'absolute', left: TABLE_PAPA.left, top: TABLE_PAPA.top + Math.sin(g / 21) * 3, width: TABLE_PAPA.width }}>
          <Father width={TABLE_PAPA.width} face={papaFace} tilt={state.papa.tilt ?? 0} />
        </div>
        {/* The night over the room and the people; the lamp relights the table and their faces. */}
        <RoomShade
          light="night"
          glows={[
            { x: BOOK.x - 60, y: BOOK.y - 80, r: 560, color: 'rgba(255, 214, 150, 0.95)', amount: 0.75 },
            { x: TABLE_SIDI_FACE[0], y: TABLE_SIDI_FACE[1] + 60, r: 300, color: 'rgba(255, 214, 150, 0.9)', amount: 0.45 },
            { x: TABLE_PAPA_FACE[0], y: TABLE_PAPA_FACE[1] + 60, r: 330, color: 'rgba(255, 214, 150, 0.9)', amount: 0.4 },
            { x: TABLE_PAPA_FACE[0], y: TABLE_PAPA_FACE[1] + 160, r: 300, color: 'rgba(150, 190, 255, 0.95)', amount: state.phone.turn < 0.5 ? state.phone.lit * 0.55 : 0 },
          ]}
        />
        <div style={{ position: 'absolute', left: 0, right: 0, top: TABLE.top, bottom: -400 }}>
          <DeskTop top={0} />
        </div>
        <ExerciseBook written={state.written} />
        <TeaGlass x={760} y={1500} t={g / 30} />
        <LyingPhone phone={state.phone} />
        {/* Their arms on the table: Sidi's writing hand with its pen, Papa's pointing finger */}
        <div style={{ position: 'absolute', left: TABLE_SIDI.left, top: TABLE_SIDI.top, width: TABLE_SIDI.width }}>
          <BustLayer width={TABLE_SIDI.width}>
            <Arm from={[300, 540]} to={toTableSidi(pen)} bend={40} thickness={58} thumb={-1} sleeve="#eef3fb" skin="#b3744b" />
            <line x1={toTableSidi(pen)[0] - 6} y1={toTableSidi(pen)[1] - 30} x2={toTableSidi(pen)[0] + 14} y2={toTableSidi(pen)[1] + 22} stroke="#1f5fae" strokeWidth="9" strokeLinecap="round" />
          </BustLayer>
        </div>
        <div style={{ position: 'absolute', left: TABLE_PAPA.left, top: TABLE_PAPA.top, width: TABLE_PAPA.width }}>
          <BustLayer width={TABLE_PAPA.width}>
            <Arm from={pl} to={toTablePapa(hand)} bend={-40} thickness={62} thumb={1} {...FATHER_COLORS} />
          </BustLayer>
        </div>
        <DeskLamp x={-40} y={1470} on={1} />
        {items}
      </CameraPath>
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};
