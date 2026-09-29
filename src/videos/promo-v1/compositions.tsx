import React from 'react';
import { Composition, Folder } from 'remotion';
import { LANDSCAPE, PORTRAIT } from '../../shared/formats';
import { Promo, SCENES, TOTAL } from './Promo';
import { FPS } from './theme';

/**
 * promo-v1 — the first 30-second WhatsApp promo (September 2026), kept as it
 * was shipped. It predates the shared kit and uses its own components; new
 * videos should start from src/shared instead.
 */
export const PromoV1Compositions: React.FC = () => (
  <Folder name="promo-v1">
    <Composition id="PromoV1" component={Promo} {...PORTRAIT} fps={FPS} durationInFrames={TOTAL} />
    <Composition id="PromoV1-Wide" component={Promo} {...LANDSCAPE} fps={FPS} durationInFrames={TOTAL} />
    <Folder name="promo-v1-scenes">
      {SCENES.map((s) => (
        <Composition
          key={s.id}
          id={`PromoV1-${s.id}`}
          component={s.component}
          {...PORTRAIT}
          fps={FPS}
          durationInFrames={s.frames}
        />
      ))}
    </Folder>
  </Folder>
);
