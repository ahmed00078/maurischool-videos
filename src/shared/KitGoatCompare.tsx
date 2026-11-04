import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Lang, LangProvider } from './lang';
import { OUTFIT } from './tokens';
import { Goat, GOAT_HEAD, goatHeadPoint, GoatState } from './ui/goat';
import { GoatV1 } from './ui/goatV1';
import { TestSheet, TestWords } from './ui/paper';
import { Courtyard } from './ui/places';

/**
 * TEMPORARY: the goat before and after her redraw, side by side (left
 * « avant », right « après »): full body in the yard, the cover's close-up
 * with the 17/20 in her mouth, and two poses (the snatch, the sad ears).
 * Delete with goatV1.tsx once the new goat is approved.
 */
const WORDS: TestWords = { name: 'Sidi Ould Mocktar', heading: 'Devoir de mathématiques', mark: '17/20', praise: 'Très bien !', work: [] };
type G = React.FC<{ state?: GoatState; width?: number; shadow?: boolean }>;

const Column: React.FC<{ Draw: G; label: string; x: number; chew: number; idle: number }> = ({ Draw, label, x, chew, idle }) => {
  const scrap = { node: <TestSheet words={WORDS} scrap bitten />, angle: -6, scale: 0.6 };
  const [hx, hy] = goatHeadPoint(GOAT_HEAD);
  const closeW = 1500;
  const k = closeW / 600;
  return (
    <div style={{ position: 'absolute', left: x, top: 0, width: 540, height: 1920 }}>
      <div style={{ position: 'absolute', top: 40, width: 540, textAlign: 'center', fontFamily: OUTFIT, fontWeight: 800, fontSize: 64, color: '#2a1d1a', textShadow: '0 0 14px #fff8ec' }}>{label}</div>
      {/* Full body, as the wide shots show her */}
      <div style={{ position: 'absolute', left: 10, top: 150 }}>
        <Draw width={520} state={{ chew, idle, paper: scrap, lids: 0.35 }} />
      </div>
      {/* The cover's close-up */}
      <div style={{ position: 'absolute', left: 20, top: 720, width: 500, height: 560, overflow: 'hidden', borderRadius: 30, background: '#e6ba84', boxShadow: '0 10px 30px rgba(60,35,10,0.3)' }}>
        <div style={{ position: 'absolute', left: 250 - hx * k, top: 300 - hy * k }}>
          <Draw width={closeW} shadow={false} state={{ chew, idle, paper: scrap, lids: 0.35 }} />
        </div>
      </div>
      {/* Two poses: the snatch, and losing */}
      <div style={{ position: 'absolute', left: 0, top: 1340, display: 'flex' }}>
        <Draw width={270} state={{ reach: 50, open: 1, turn: -10, idle, wag: 1 }} />
        <Draw width={270} state={{ chew, idle, ears: 1, lids: 0.55, look: [0, 0.4], sad: 1, brows: -0.2 }} />
      </div>
    </div>
  );
};

export const KitGoatCompare: React.FC<{ lang: Lang }> = ({ lang }) => {
  const frame = useCurrentFrame();
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        <Courtyard />
        <div style={{ position: 'absolute', left: 538, top: 0, width: 4, height: 1920, background: 'rgba(42,29,26,0.35)' }} />
        <Column Draw={GoatV1} label="Avant" x={0} chew={frame / 15} idle={frame / 30} />
        <Column Draw={Goat} label="Après" x={540} chew={frame / 15} idle={frame / 30} />
      </AbsoluteFill>
    </LangProvider>
  );
};
