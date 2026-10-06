import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Backdrop } from './fx';
import { Lang, LangProvider } from './lang';
import { Boy, Face, Father, Girl } from './ui/people';

/**
 * The cast on its own, every expression side by side, to check the drawings
 * before a scene animates them. Row by row: rest, pleased, suspicious, caught.
 */
const ROWS: { label: string; face: Face }[] = [
  { label: 'rest', face: { mouth: 'smile' } },
  { label: 'grin', face: { mouth: 'grin', brows: 0.6, blush: 0.6 } },
  { label: 'side-eye', face: { mouth: 'smirk', look: [-1, 0], brows: -0.6 } },
  { label: 'caught', face: { mouth: 'wobble', worry: 1, sweat: 1, look: [1, 0.3], brows: 0.4 } },
];

export const KitCast: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill>
        <Backdrop mood="night" grid={false} />
        {ROWS.map((row, i) => (
          <div key={row.label} style={{ position: 'absolute', top: 40 + i * 470, left: 0, right: 0, height: 460, overflow: 'hidden', display: 'flex', justifyContent: 'center', gap: 20 }}>
            <Boy width={300} face={{ ...row.face, t }} style={{ marginTop: 40 }} paper={i === 3 ? 0.6 : 0} paperLabel="7,5" />
            <Girl width={300} face={{ ...row.face, t }} style={{ marginTop: 20 }} />
            <Father width={300} face={{ ...row.face, t }} envelope={i === 3 ? 0.6 : 0} envelopeLabel="Scolarité" />
          </div>
        ))}
      </AbsoluteFill>
    </LangProvider>
  );
};
