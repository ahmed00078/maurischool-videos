import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useLang } from '../lang';
import { APP, EASE_IN, tween } from '../tokens';
import { IconName, Ionicon } from './Ionicon';

type Token = { word: string; marked: boolean };

/** "Qui est *en retard*." → words, with the starred run flagged. */
const tokenize = (text: string): Token[] => {
  const out: Token[] = [];
  let marked = false;
  for (const raw of text.split(' ')) {
    let w = raw;
    const opens = w.startsWith('*');
    if (opens) {
      marked = true;
      w = w.slice(1);
    }
    const closes = w.includes('*');
    w = w.replace(/\*/g, '');
    out.push({ word: w, marked });
    if (closes) marked = false;
  }
  return out;
};

/**
 * Kinetic headline: each word rises out of its own mask, a few frames after
 * the one before, in the reading order of the language. Starred words are
 * painted in the accent colour over a highlight that grows in the reading
 * direction.
 */
export const Headline: React.FC<{
  text: string;
  /** Frame the first word starts. */
  at: number;
  /** Frame the headline starts leaving; omit to stay. */
  out?: number;
  size?: number;
  color?: string;
  accent?: string;
  highlight?: string;
  style?: React.CSSProperties;
  align?: 'center' | 'start';
}> = ({ text, at, out, size = 84, color = '#fff', accent = APP.brand[300], highlight, style, align = 'center' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { dir, font, rtl } = useLang();
  const tokens = tokenize(text);
  const leave = out === undefined ? 0 : tween(frame, [out, out + 10], [0, 1], EASE_IN);
  return (
    <div
      dir={dir}
      style={{
        fontFamily: font,
        fontWeight: 800,
        fontSize: size,
        lineHeight: rtl ? 1.45 : 1.08,
        letterSpacing: rtl ? 0 : -1.5,
        color,
        textAlign: align,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        columnGap: size * 0.26,
        // Before its cue nothing shows: a tall glyph's top would peek out of its word's clip.
        opacity: frame < at ? 0 : 1 - leave,
        translate: `0px ${-leave * 40}px`,
        ...style,
      }}
    >
      {tokens.map((t, i) => {
        const p = spring({ frame: frame - at - i * 3, fps, config: { damping: 16, stiffness: 150 } });
        const hl = tween(frame, [at + i * 3 + 6, at + i * 3 + 18]);
        return (
          <span
            key={i}
            style={{
              position: 'relative',
              display: 'inline-block',
              overflow: 'hidden',
              // Room for Arabic ascenders and descenders inside the mask.
              padding: rtl ? `${size * 0.08}px 0.04em` : '0 0.02em 0.08em',
            }}
          >
            {t.marked && highlight ? (
              <span
                style={{
                  position: 'absolute',
                  insetInline: `-${size * 0.06}px`,
                  bottom: size * 0.1,
                  height: size * 0.34,
                  borderRadius: size * 0.08,
                  background: highlight,
                  transformOrigin: rtl ? 'right center' : 'left center',
                  scale: `${hl} 1`,
                }}
              />
            ) : null}
            <span
              style={{
                position: 'relative',
                display: 'inline-block',
                color: t.marked ? accent : color,
                translate: `0px ${(1 - p) * 110}%`,
              }}
            >
              {t.word}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Whose phone we are looking at: a small pill with an icon. */
export const RoleChip: React.FC<{
  label: string;
  icon: IconName;
  at: number;
  out?: number;
  tone?: 'light' | 'dark';
  style?: React.CSSProperties;
}> = ({ label, icon, at, out, tone = 'dark', style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font, dir } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 160 } });
  const leave = out === undefined ? 0 : tween(frame, [out, out + 8], [0, 1], EASE_IN);
  const onDark = tone === 'dark';
  return (
    <div
      dir={dir}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 28px 12px 18px',
        borderRadius: 999,
        background: onDark ? 'rgba(255,255,255,0.12)' : APP.brand[50],
        border: `2px solid ${onDark ? 'rgba(255,255,255,0.18)' : APP.brand[100]}`,
        color: onDark ? '#fff' : APP.brand[600],
        fontFamily: font,
        fontWeight: 700,
        fontSize: 36,
        opacity: Math.min(1, p * 1.4) * (1 - leave),
        scale: String(0.8 + p * 0.2),
        ...style,
      }}
    >
      <Ionicon name={icon} size={38} color={onDark ? '#fff' : APP.brand[500]} />
      {label}
    </div>
  );
};

/**
 * A small caption in a dark pill: where and when we are (« Mardi soir »,
 * « Un mois plus tard… »). Pops in at `at`, leaves at `out`.
 */
export const PlaceTag: React.FC<{ text: string; at: number; out?: number; style?: React.CSSProperties }> = ({ text, at, out, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { font, dir, rtl } = useLang();
  const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 160 } });
  const leave = out === undefined ? 0 : tween(frame, [out, out + 8], [0, 1], EASE_IN);
  if (frame < at) return null;
  return (
    <div
      dir={dir}
      style={{
        padding: rtl ? '6px 28px 12px' : '10px 28px',
        borderRadius: 999,
        background: 'rgba(30,22,18,0.82)',
        color: '#fff4dc',
        fontFamily: font,
        fontWeight: 700,
        fontSize: 40,
        fontStyle: rtl ? 'normal' : 'italic',
        whiteSpace: 'nowrap',
        opacity: Math.min(1, p * 1.5) * (1 - leave),
        scale: String(0.85 + 0.15 * p),
        ...style,
      }}
    >
      {text}
    </div>
  );
};
