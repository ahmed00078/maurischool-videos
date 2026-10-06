import React from 'react';
import { CalculateMetadataFunction, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SafeZones } from '../../shared/fx';
import { Lang, LangProvider, useBi, useLang } from '../../shared/lang';
import { Sfx } from '../../shared/rig';
import { tween } from '../../shared/tokens';
import { BoardScene, CHALK, ChalkLine, ChalkUnderline, Eraser, Erasable } from '../../shared/ui/Chalkboard';
import { Ionicon } from '../../shared/ui/Ionicon';
import { COPY } from './copy';
import { ChalkSounds, COLUMN, Line, Lines } from './scenes/Board';

/**
 * Part 2, posted the day after: the promise kept. The names people wrote in
 * the comments of the first video are chalked on the board, six to a board,
 * wiped and continued, then "thank you to them" and an invitation to add
 * the one that is missing. Paste the names into the `names` prop (in the
 * Studio or with --props); the length follows.
 */

export type NamesProps = { lang: Lang; names: string[]; safeZones: boolean };

/** Invented placeholders: replace them with the names from the comments. */
export const PLACEHOLDER_NAMES: Record<Lang, string[]> = {
  fr: ['Mme Aïcha', 'M. Sidi Mohamed', 'Mme Mariem', 'M. Ahmed Salem', 'Mme Khadijetou', 'M. Brahim', 'Mme Zeinabou', 'M. Cheikh'],
  ar: ['الأستاذة عائشة', 'الأستاذ سيدي محمد', 'الأستاذة مريم', 'الأستاذ أحمد سالم', 'الأستاذة خديجتو', 'الأستاذ إبراهيم', 'الأستاذة زينبو', 'الأستاذ الشيخ'],
};

const PER_BOARD = 6;
/** Frames between two names starting, the hold on a full board, and the wipe. */
const STEP = 16;
const HOLD = 30;
const WIPE = 22;
const TAIL = 110;

/** When everything happens, from the names alone: the composition's length comes from here too. */
const plan = (names: string[]) => {
  const boards: { names: string[]; at: number[]; wipeAt: number | null }[] = [];
  let t = 8;
  for (let i = 0; i < Math.max(1, names.length); i += PER_BOARD) {
    const chunk = names.slice(i, i + PER_BOARD);
    const at = chunk.map((_, k) => t + k * STEP);
    t += chunk.length * STEP + HOLD;
    const last = i + PER_BOARD >= names.length;
    boards.push({ names: chunk, at, wipeAt: last ? null : t });
    if (!last) t += WIPE + 6;
  }
  const thanksAt = t - HOLD + 12;
  return { boards, thanksAt, moreAt: thanksAt + 30, total: thanksAt + 30 + TAIL };
};

export const namesMetadata: CalculateMetadataFunction<NamesProps> = ({ props }) => ({ durationInFrames: plan(props.names).total });

/** A name's chalk size: as large as fits the board's width. */
const nameSize = (name: string, rtl: boolean) => Math.round(Math.min(rtl ? 70 : 84, 840 / (Math.max(8, name.length) * (rtl ? 0.4 : 0.44))));

const NamesBoard: React.FC<{ names: string[] }> = ({ names }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bi = useBi();
  const { rtl, font, dir } = useLang();
  const { boards, thanksAt, moreAt } = plan(names);
  const top = { title: 365, names: 540, thanks: 1185, more: 1340 };
  const more = spring({ frame: frame - moreAt, fps, config: { damping: 14, stiffness: 150 } });
  const thanks: Line = { text: bi(COPY.names.thanks), at: thanksAt, dur: 16, size: rtl ? 110 : 120, color: CHALK.yellow };
  const written: Line[] = [];
  return (
    <BoardScene>
      <div style={{ ...COLUMN, top: 244 }}>
        <ChalkLine text={bi(COPY.names.date)} at={-60} dur={1} size={rtl ? 54 : 60} />
        <ChalkUnderline at={-60} dur={1} width={rtl ? 380 : 440} thickness={6} style={{ opacity: 0.8, marginTop: -6 }} />
      </div>
      <div style={{ ...COLUMN, top: top.title }}>
        <ChalkLine text={bi(COPY.names.title)} at={-60} dur={1} size={rtl ? 96 : 104} color={CHALK.yellow} />
        <ChalkUnderline at={-60} dur={1} width={rtl ? 460 : 560} color={CHALK.yellow} />
      </div>
      {boards.map((board, i) => {
        const lines = board.names.map((n, k) => {
          const l: Line = { text: n, at: board.at[k], dur: Math.min(STEP - 2, Math.max(8, Math.round(n.length * 0.8))), size: nameSize(n, rtl) };
          written.push(l);
          return l;
        });
        const content = <Lines lines={lines} top={top.names} gap={rtl ? 0 : 4} />;
        if (board.wipeAt === null) return <React.Fragment key={i}>{content}</React.Fragment>;
        return (
          <React.Fragment key={i}>
            <Erasable at={board.wipeAt} dur={WIPE} top={top.names - 10} bottom={top.thanks}>
              {content}
            </Erasable>
            <Eraser at={board.wipeAt} dur={WIPE} top={top.names - 10} bottom={top.thanks} />
            <Sfx at={board.wipeAt - 2} name="eraser" volume={0.7} />
          </React.Fragment>
        );
      })}
      <Lines lines={[thanks]} top={top.thanks} />
      <div style={{ ...COLUMN, top: top.more }}>
        <div
          dir={dir}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '22px 30px',
            borderRadius: 34,
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.22)',
            fontFamily: font,
            fontWeight: 800,
            fontSize: rtl ? 44 : 42,
            color: '#ffffff',
            opacity: Math.min(1, more * 1.4) * tween(frame, [moreAt - 2, moreAt + 2]),
            scale: String(0.85 + more * 0.15),
          }}
        >
          <Ionicon name="chatbubble-ellipses-outline" size={58} color={CHALK.yellow} />
          <span>{bi(COPY.names.more)}</span>
        </div>
      </div>
      <ChalkSounds lines={[...written, thanks]} />
      <Sfx at={moreAt} name="soft-whoosh" volume={0.35} rate={1.4} />
    </BoardScene>
  );
};

export const Names: React.FC<NamesProps> = ({ lang, names, safeZones }) => (
  <LangProvider lang={lang}>
    <NamesBoard names={names} />
    <SafeZones show={safeZones} />
  </LangProvider>
);
