import React from 'react';
import { Audio } from '@remotion/media';
import { interpolate, Sequence, staticFile } from 'remotion';
import { T } from './theme';

// Music level. Lower it (about 0.2) once the voice track is added.
const MUSIC = 0.48;

type Cue = { at: number; src: string; volume: number };

/**
 * Background music plus sound effects, cued from scene starts so they follow
 * any retiming of SCENES. `frames` are the scene lengths in order.
 */
export const Soundtrack: React.FC<{ frames: number[] }> = ({ frames }) => {
  const start = (i: number) => frames.slice(0, i).reduce((s, f) => s + f, 0) - i * T;
  const [, s2, s3, s4, s5, s6, s7, s8] = frames.map((_, i) => start(i));

  const cues: Cue[] = [
    // A soft whoosh on every scene change, peaking mid-transition.
    ...[s2, s3, s4, s5, s6, s7, s8].map((at) => ({ at: at - 3, src: 'sfx/soft-whoosh.wav', volume: 1 })),
    // Logo lands.
    { at: s3 + 22, src: 'sfx/switch.wav', volume: 1 },
    // Director's phone → parent's phone, then the reminder arrives.
    { at: s4 + 84, src: 'sfx/whip.wav', volume: 0.5 },
    { at: s4 + 104, src: 'sfx/ding.wav', volume: 0.9 },
    // Teacher taps "absent", then the parent is notified.
    { at: s5 + 34, src: 'sfx/mouse-click.wav', volume: 1 },
    { at: s5 + 64, src: 'sfx/whip.wav', volume: 0.5 },
    { at: s5 + 80, src: 'sfx/ding.wav', volume: 0.9 },
    // Trust badges tick in.
    ...[4, 16, 28].map((d) => ({ at: s7 + d, src: 'sfx/mouse-click.wav', volume: 1 })),
    // WhatsApp number pops.
    { at: s8 + 20, src: 'sfx/switch.wav', volume: 1 },
  ];

  return (
    <>
      <Audio
        src={staticFile('music.wav')}
        volume={(f) => interpolate(f, [0, 20], [0, MUSIC], { extrapolateRight: 'clamp' })}
      />
      {cues.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.at)} layout="none" name={`sfx ${c.src}`}>
          <Audio src={staticFile(c.src)} volume={c.volume} />
        </Sequence>
      ))}
    </>
  );
};
