import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Lang, LangProvider } from './lang';
import { Goat, GOAT_HEAD, GoatCoat, goatHeadPoint, GoatState } from './ui/goat';
import { ReceiptSheet } from './ui/paper';
import { Accountant, Father } from './ui/people';
import { Courtyard } from './ui/places';

/**
 * The goat on her own, in both coats, and the people of « La chèvre et le
 * reçu », to check the drawings before a scene animates them. Top: the
 * accountant and the father with his pocket turned out. Then, per coat: the
 * deadpan stare with a scrap, a snatch, looking up at a phone mid-stride, and
 * ears down.
 */
const STATES: { label: string; state: (chew: number) => GoatState }[] = [
  { label: 'stare', state: (chew) => ({ chew, paper: { node: <ReceiptSheet scrap bitten />, angle: 10, scale: 0.55 } }) },
  { label: 'snatch', state: () => ({ reach: 40, open: 1, turn: -10 }) },
  { label: 'eyes up', state: (chew) => ({ chew, look: [0.8, -1], turn: -14, step: 0.25, lids: 0.1 }) },
  { label: 'ears down', state: (chew) => ({ chew, ears: 1, lids: 0.55, look: [0, 0.4] }) },
];

export const KitGoat: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const coats: GoatCoat[] = ['caramel', 'pie'];
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Courtyard />
        <div style={{ position: 'absolute', top: 40, left: 0, right: 0, height: 700, overflow: 'hidden', display: 'flex', justifyContent: 'center', gap: 40 }}>
          <Accountant width={380} face={{ mouth: 'smile', t }} />
          <Father width={380} face={{ mouth: 'o', worry: 0.6, brows: 0.8, look: [-0.8, 0.6], t }} pocketOut={1} />
        </div>
        {coats.map((coat, row) => (
          <div key={coat} style={{ position: 'absolute', top: 760 + row * 560, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            {STATES.map((s) => (
              <Goat key={s.label} coat={coat} width={270} state={s.state(frame / 15)} />
            ))}
          </div>
        ))}
      </AbsoluteFill>
    </LangProvider>
  );
};

/** The face the video lives on, big: the deadpan stare with the scrap, as the hook frames it. */
export const KitGoatClose: React.FC<{ lang: Lang; coat: GoatCoat }> = ({ lang, coat }) => {
  const frame = useCurrentFrame();
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ overflow: 'hidden', background: '#e6ba84' }}>
        <div style={{ position: 'absolute', left: 540 - goatHeadPoint(GOAT_HEAD)[0] * 3.8, top: 1150 - goatHeadPoint(GOAT_HEAD)[1] * 3.8 }}>
          <Goat coat={coat} width={2280} state={{ chew: frame / 15, paper: { node: <ReceiptSheet scrap bitten />, angle: 10, scale: 0.55 } }} />
        </div>
      </AbsoluteFill>
    </LangProvider>
  );
};
