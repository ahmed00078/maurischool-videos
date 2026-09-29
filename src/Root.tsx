import React from 'react';
import { KitCompositions } from './shared/compositions';
import { Promo2026Compositions } from './videos/promo-2026/compositions';
import { PromoV1Compositions } from './videos/promo-v1/compositions';

/**
 * Every video registers its own compositions in src/videos/<video>/compositions.tsx,
 * inside a <Folder> named after it, with ids prefixed by it. Add a new video here.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Promo2026Compositions />
    <PromoV1Compositions />
    <KitCompositions />
  </>
);
