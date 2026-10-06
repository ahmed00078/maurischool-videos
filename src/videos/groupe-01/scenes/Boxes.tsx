import React from 'react';
import { Video } from '@remotion/media';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { useBeat } from '../../../shared/beat';
import { useBi, useLang } from '../../../shared/lang';
import { Sfx, Top } from '../../../shared/rig';
import { useSilent } from '../../../shared/sound';
import { EASE_IN_OUT, tween } from '../../../shared/tokens';
import { Headline } from '../../../shared/ui/Headline';
import { COPY } from '../copy';
import { INK_NIGHT } from './List';

/** A found clip (1.77 s, 53 frames): a worker opens a container and the wall of boxes inside falls on him. */
export const BOXES_CLIP = 'groupe-01/hook-boxes.mp4';
/** Slowed a touch so the clip fills the scene's four beats and the fall lands just before the cut. */
const RATE = 0.9;
/** The boxes hit, in frames of the scene (frame 45 of the clip, slowed). */
const IMPACT = Math.round(45 / RATE);

/**
 * 0 · boxes: the hook before the hook. « Quand tu ouvres le groupe des
 * parents… » over a man opening a container: the boxes come down on him, and
 * on the beat it cuts to the badge counting to 312. Nobody is hurt; it is the
 * volume that buries him, as it buries the director's message.
 */
export const BoxesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const silent = useSilent();
  // A small punch-in as the boxes land.
  const punch = tween(frame, [IMPACT - 2, IMPACT + 4], [0, 1], EASE_IN_OUT) * (1 - 0.5 * tween(frame, [IMPACT + 4, b(4)]));
  return (
    <AbsoluteFill style={{ background: '#1a1830', overflow: 'hidden' }}>
      <AbsoluteFill style={{ scale: String(1.04 + 0.06 * punch), transformOrigin: '50% 40%' }}>
        <Video src={staticFile(BOXES_CLIP)} playbackRate={RATE} muted={silent} volume={0.7} objectFit="cover" style={{ width: '100%', height: '100%' }} />
      </AbsoluteFill>
      {/* A shadow under the words, as on the phone shots. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 700, background: 'linear-gradient(180deg, rgba(12,12,34,0.7) 0%, rgba(12,12,34,0.4) 60%, rgba(12,12,34,0) 100%)' }} />
      <Top>
        <Headline text={bi(COPY.open)} at={b(0.1)} size={rtl ? 96 : 100} {...INK_NIGHT} />
      </Top>
      {/* The clip's own crash is faint: a thud under it, so the fall lands by ear too. */}
      <Sfx at={IMPACT} name="stamp" volume={0.6} rate={0.8} />
    </AbsoluteFill>
  );
};
