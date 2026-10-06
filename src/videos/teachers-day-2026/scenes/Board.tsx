import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBeat } from '../../../shared/beat';
import { SAFE } from '../../../shared/fx';
import { useBi, useLang } from '../../../shared/lang';
import { Sfx } from '../../../shared/rig';
import { APP, OUTFIT, tween } from '../../../shared/tokens';
import { BoardScene, CHALK, ChalkArrow, ChalkLine, ChalkUnderline, Eraser, Erasable } from '../../../shared/ui/Chalkboard';
import { IconName, Ionicon } from '../../../shared/ui/Ionicon';
import { LogoAssemble } from '../../../shared/ui/props';
import { COPY } from '../copy';

/** The writable part of the board: clear of the platform's top bar, bottom caption and right-hand buttons. */
export const COLUMN: React.CSSProperties = {
  position: 'absolute',
  left: SAFE.side + 30,
  right: SAFE.right + 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export type Line = { text: string; at: number; dur: number; size: number; color?: string };

/** Lines written one under the other, centred, from `top`. */
export const Lines: React.FC<{ lines: Line[]; top: number; gap?: number }> = ({ lines, top, gap = 0 }) => (
  <div style={{ ...COLUMN, top, gap }}>
    {lines.map((l, i) => (
      <ChalkLine key={i} text={l.text} at={l.at} dur={l.dur} size={l.size} color={l.color} />
    ))}
  </div>
);

/** Share `dur` frames between lines by their length, so the chalk keeps one pace. */
export const paced = (texts: string[], at: number, dur: number, size: number, color?: string): Line[] => {
  const total = texts.reduce((n, t) => n + t.length, 0);
  let t = at;
  return texts.map((text) => {
    const d = Math.max(6, Math.round((dur * text.length) / total));
    const line = { text, at: t, dur: d, size, color };
    t += d + 2;
    return line;
  });
};

/** The date a teacher writes at the top of the board every morning, already there when the video opens. */
export const BoardDate: React.FC = () => {
  const bi = useBi();
  const { rtl } = useLang();
  return (
    <div style={{ ...COLUMN, top: SAFE.top + 24 }}>
      <ChalkLine text={bi(COPY.board.date)} at={-60} dur={1} size={rtl ? 54 : 60} color={CHALK.white} />
      <ChalkUnderline at={-60} dur={1} width={rtl ? 380 : 440} thickness={6} style={{ opacity: 0.8, marginTop: -6 }} />
    </div>
  );
};

/** Chalk sounds for written lines: the scratch for each, a tap on its full stop or question mark. */
export const ChalkSounds: React.FC<{ lines: Line[] }> = ({ lines }) => (
  <>
    {lines.map((l, i) =>
      l.at < 0 ? null : (
        <React.Fragment key={i}>
          <Sfx at={l.at} name="chalk" length={l.dur + 2} volume={0.55} rate={1 + (i % 3) * 0.04} />
          {/[.?؟:]$/.test(l.text) ? <Sfx at={l.at + l.dur} name="chalk-tap" volume={0.6} /> : null}
        </React.Fragment>
      ),
    )}
  </>
);

/** Where the question sits, so the last frame can write it back exactly where the first frame shows it. */
const questionLayout = (rtl: boolean) => {
  const lines = COPY.board.question[rtl ? 'ar' : 'fr'].length;
  const lineHeight = rtl ? 198 : 143;
  const top = rtl ? 560 : 540;
  return { size: rtl ? 132 : 124, top, bottom: top + lines * lineHeight };
};

/**
 * The opening question with its yellow underline. `at` < 0 has it already on
 * the board; otherwise it is written from `at` over `dur` frames.
 */
const useQuestion = (at: number, dur: number) => {
  const { rtl } = useLang();
  const q = questionLayout(rtl);
  const lines = paced(COPY.board.question[rtl ? 'ar' : 'fr'], at, dur, q.size);
  const last = lines[lines.length - 1];
  const underlineAt = at < 0 ? at : last.at + last.dur + 1;
  const node = (
    <>
      <Lines lines={lines} top={q.top} />
      <div style={{ ...COLUMN, top: q.bottom - 6 }}>
        <ChalkUnderline at={underlineAt} dur={at < 0 ? 1 : 7} width={rtl ? 520 : 560} color={CHALK.yellow} />
      </div>
    </>
  );
  return { node, lines, underlineAt, layout: q };
};

/**
 * 1 · Board. The first frame is already the question, so it reads with the
 * sound off before anyone thinks of scrolling: your first teacher, do you
 * remember their name? The school bell rings (again at every loop), the ask
 * and the promise are chalked under it, then an example answer so the viewer
 * sees what to write, and an arrow points at the comments.
 */
export const BoardHook: React.FC = () => {
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const question = useQuestion(-60, 1);
  const promise = paced(COPY.board.promise[rtl ? 'ar' : 'fr'], b(0.6), 44, rtl ? 72 : 64, CHALK.yellow);
  const promiseTop = question.layout.bottom + 64;
  const promiseEnd = promise[promise.length - 1];
  const example: Line = { text: bi(COPY.board.example), at: promiseEnd.at + promiseEnd.dur + 5, dur: 22, size: rtl ? 54 : 52, color: CHALK.blue };
  const exampleTop = promiseTop + (rtl ? 232 : 170);
  const arrowAt = example.at + example.dur + 5;
  const arrowY = exampleTop + (rtl ? 110 : 90);
  return (
    <BoardScene>
      <BoardDate />
      {question.node}
      <Lines lines={promise} top={promiseTop} gap={rtl ? 0 : 8} />
      <Lines lines={[example]} top={exampleTop} />
      {/* Towards the platform's comment button, bottom right. */}
      <ChalkArrow at={arrowAt} dur={12} from={[560, arrowY]} to={[880, arrowY + 130]} bend={0.28} color={CHALK.yellow} />
      {/* The school bell: the lesson starts. */}
      <Sfx at={0} name="bell" volume={0.5} />
      <ChalkSounds lines={[...promise, example]} />
      <Sfx at={arrowAt} name="chalk" length={12} volume={0.45} rate={1.15} />
    </BoardScene>
  );
};

/** A card on the board for what the viewer can do now: an icon, a strong line and a second one. */
const ActionCard: React.FC<{ icon: IconName; lines: string[]; at: number; out: number }> = ({ icon, lines, at, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font, dir, rtl } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 150 } });
  const gone = tween(frame, [out, out + 8]);
  return (
    <div
      dir={dir}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        width: 820,
        boxSizing: 'border-box',
        padding: '22px 30px',
        borderRadius: 34,
        background: 'rgba(255,255,255,0.1)',
        border: '2px solid rgba(255,255,255,0.22)',
        fontFamily: font,
        color: '#ffffff',
        opacity: Math.min(1, p * 1.4) * (1 - gone),
        scale: String(0.85 + p * 0.15),
      }}
    >
      <Ionicon name={icon} size={60} color={CHALK.yellow} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontWeight: 800, fontSize: rtl ? 46 : 44, lineHeight: 1.3 }}>{lines[0]}</span>
        <span style={{ fontWeight: 600, fontSize: rtl ? 40 : 38, lineHeight: 1.3, color: 'rgba(255,255,255,0.85)' }}>{lines[1]}</span>
      </div>
    </div>
  );
};

/**
 * 4 · Thanks. "Merci" in yellow chalk to every teacher, the day, the mark.
 * Then the two things to do: send it to a teacher, write their name. The
 * board is wiped and the opening question is written back where it was, so
 * the last frame is the first and the video loops.
 */
export const BoardThanks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const top = rtl
    ? { merci: 330, underline: 660, all: 690, day: 830, logo: 945, cards: 1095 }
    : { merci: 380, underline: 650, all: 690, day: 815, logo: 915, cards: 1075 };
  const merci: Line = { text: bi(COPY.thanks.merci), at: b(0.3), dur: 14, size: rtl ? 230 : 250, color: CHALK.yellow };
  const all: Line = { text: bi(COPY.thanks.all), at: b(1.6), dur: 18, size: rtl ? 84 : 92 };
  const day: Line = { text: `${bi(COPY.day.date)} · ${bi(COPY.day.name)}`, at: b(2.9), dur: 20, size: rtl ? 58 : 50, color: CHALK.pink };
  const logoAt = b(4);
  const word = spring({ frame: frame - logoAt - 10, fps, config: { damping: 18, stiffness: 120 } });
  const forwardAt = b(5.2);
  const commentAt = b(6.6);
  const erase = { at: b(12), dur: 24, top: top.merci - 20, bottom: top.cards + 360 };
  const again = useQuestion(b(13.3), rtl ? 30 : 36);
  return (
    <BoardScene>
      <BoardDate />
      <Erasable at={erase.at} dur={erase.dur} top={erase.top} bottom={erase.bottom}>
        <Lines lines={[merci]} top={top.merci} />
        <div style={{ ...COLUMN, top: top.underline }}>
          <ChalkUnderline at={b(1.2)} dur={8} width={rtl ? 380 : 440} color={CHALK.yellow} thickness={10} />
        </div>
        <Lines lines={[all]} top={top.all} />
        <Lines lines={[day]} top={top.day} />
        {/* The mark, assembling like a stamp on the board, and the wordmark beside it. */}
        <div style={{ ...COLUMN, top: top.logo, flexDirection: 'row', justifyContent: 'center', gap: 22, direction: 'ltr' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 26,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 16px 30px rgba(0,0,0,0.35)',
              opacity: tween(frame, [logoAt - 4, logoAt + 4]),
            }}
          >
            <LogoAssemble width={68} start={logoAt} step={2} from={(i) => [Math.cos(i) * 400, Math.sin(i) * 400, (i % 2 ? 1 : -1) * 90]} />
          </div>
          <div
            style={{
              fontFamily: OUTFIT,
              fontWeight: 800,
              fontSize: 70,
              letterSpacing: -1.5,
              color: '#ffffff',
              opacity: word,
              translate: `${(1 - word) * -30}px 0px`,
            }}
          >
            Mauri<span style={{ color: APP.brand[300] }}>School</span>
          </div>
        </div>
      </Erasable>
      <div style={{ ...COLUMN, top: top.cards, gap: 20 }}>
        <ActionCard icon="paper-plane-outline" lines={COPY.thanks.forward[rtl ? 'ar' : 'fr']} at={forwardAt} out={erase.at - 6} />
        <ActionCard icon="chatbubble-ellipses-outline" lines={COPY.thanks.comment[rtl ? 'ar' : 'fr']} at={commentAt} out={erase.at - 6} />
      </div>
      <Eraser at={erase.at} dur={erase.dur} top={erase.top} bottom={erase.bottom} passes={4} />
      {again.node}
      <ChalkSounds lines={[merci, all, day, ...again.lines]} />
      <Sfx at={b(1.2)} name="chalk" length={8} volume={0.45} rate={1.2} />
      <Sfx at={logoAt + 8} name="ding" volume={0.5} rate={0.9} />
      <Sfx at={forwardAt} name="soft-whoosh" volume={0.35} rate={1.3} />
      <Sfx at={commentAt} name="soft-whoosh" volume={0.35} rate={1.4} />
      <Sfx at={erase.at - 2} name="eraser" volume={0.7} />
      <Sfx at={again.underlineAt} name="chalk" length={7} volume={0.45} rate={1.2} />
    </BoardScene>
  );
};
