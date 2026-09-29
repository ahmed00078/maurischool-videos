import React from 'react';
import { AbsoluteFill, Easing, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Caption } from '../components/Caption';
import { ChatBubbles, Notebook, RingingPhone, Spreadsheet } from '../components/Icons';
import { ease, toneBg, useLandscape } from '../theme';

// Landscape: the same four tools in one row.
const LAND: [number, number][] = [
  [430, 430],
  [800, 400],
  [1140, 450],
  [1490, 420],
];

type Item = {
  el: React.ReactNode;
  x: number; // resting centre, px
  y: number;
  rot: number;
  at: number; // frame it lands
  fly: [number, number]; // scatter direction
};

const ITEMS: Item[] = [
  { el: <Notebook size={300} />, x: 350, y: 560, rot: -9, at: 4, fly: [-900, -300] },
  { el: <Spreadsheet size={330} />, x: 720, y: 520, rot: 7, at: 14, fly: [900, -400] },
  { el: <ChatBubbles size={320} />, x: 380, y: 930, rot: 5, at: 24, fly: [-900, 500] },
  { el: <RingingPhone size={270} />, x: 730, y: 950, rot: -6, at: 34, fly: [900, 600] },
];

// 0:03 — the tools of today pile up, wobble, then scatter.
export const S2Chaos: React.FC = () => {
  const frame = useCurrentFrame();
  const land = useLandscape();
  const { fps } = useVideoConfig();
  const SCATTER = 98;
  const shake = frame > 70 && frame < SCATTER ? Math.sin(frame * 1.9) * 7 : 0;
  return (
    <AbsoluteFill style={{ background: toneBg.light }}>
      {ITEMS.map((it, i) => {
        const land = spring({ frame: frame - it.at, fps, config: { damping: 13, stiffness: 120 } });
        const go = ease(frame, [SCATTER + i * 2, SCATTER + 22 + i * 2], [0, 1], Easing.in(Easing.cubic));
        const ring = i === 3 && frame > it.at + 10 && frame < SCATTER ? Math.sin(frame * 2.6) * 8 : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: land ? LAND[i][0] : it.x,
              top: land ? LAND[i][1] : it.y,
              translate: `calc(-50% + ${it.fly[0] * go + shake}px) calc(-50% + ${(1 - land) * -900 + it.fly[1] * go}px)`,
              rotate: `${it.rot + ring + go * it.rot * 6}deg`,
              filter: 'drop-shadow(0 26px 40px rgba(29,36,64,0.18))',
            }}
          >
            {it.el}
          </div>
        );
      })}
      <Caption
        tone="light"
        from={10}
        ar="دفاتر، وإكسل، ورسائل واتساب… والمعلومة دائمًا ضائعة."
        fr="Cahiers, Excel, WhatsApp… l'information se perd."
      />
    </AbsoluteFill>
  );
};
