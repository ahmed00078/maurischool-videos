import React from 'react';
import { Lang, LangProvider, useBi, useLang } from '../../shared/lang';
import { APP, OUTFIT } from '../../shared/tokens';
import { BoardScene, CHALK, ChalkLine, ChalkUnderline } from '../../shared/ui/Chalkboard';
import { LogoMark } from '../../shared/ui/LogoMark';
import { COPY } from './copy';
import type { NamesProps } from './Names';

/**
 * The names from the comments as one image for the feed (4:5): the board of
 * part 2 with everything already written, signed with the mark. Same `names`
 * prop as Names.tsx; the chalk shrinks to fit however many there are.
 */

/** Height the names may take, in px, between the title and the thanks. */
const NAMES_HEIGHT = 720;

const Card: React.FC<{ names: string[] }> = ({ names }) => {
  const bi = useBi();
  const { rtl } = useLang();
  const lineHeight = rtl ? 1.5 : 1.15;
  const longest = Math.max(8, ...names.map((n) => n.length));
  const size = Math.round(
    Math.min(rtl ? 70 : 84, NAMES_HEIGHT / (Math.max(1, names.length) * lineHeight), 860 / (longest * (rtl ? 0.4 : 0.44))),
  );
  const written = { at: -60, dur: 1 };
  return (
    <BoardScene>
      <div
        style={{
          position: 'absolute',
          inset: '70px 70px 96px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ChalkLine text={bi(COPY.names.date)} {...written} size={rtl ? 44 : 50} style={{ opacity: 0.85 }} />
          <ChalkLine text={bi(COPY.names.title)} {...written} size={rtl ? 92 : 100} color={CHALK.yellow} style={{ marginTop: rtl ? -14 : 0 }} />
          <ChalkUnderline {...written} width={rtl ? 460 : 560} color={CHALK.yellow} style={{ marginTop: rtl ? -14 : -4 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {names.map((n, i) => (
            <ChalkLine key={i} text={n} {...written} size={size} />
          ))}
        </div>
        <ChalkLine text={bi(COPY.names.thanks)} {...written} size={rtl ? 84 : 96} color={CHALK.yellow} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, direction: 'ltr' }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 21,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
            }}
          >
            <LogoMark width={54} />
          </div>
          <div style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: 54, letterSpacing: -1.2, color: '#ffffff' }}>
            Mauri<span style={{ color: APP.brand[300] }}>School</span>
          </div>
        </div>
      </div>
    </BoardScene>
  );
};

export const NamesCard: React.FC<NamesProps> = ({ lang, names }) => (
  <LangProvider lang={lang as Lang}>
    <Card names={names} />
  </LangProvider>
);
