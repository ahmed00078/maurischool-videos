import React from 'react';
import { KitCompositions } from './shared/compositions';
import { Promo2026Compositions } from './videos/promo-2026/compositions';
import { PromoV1Compositions } from './videos/promo-v1/compositions';
import { Verite01Compositions } from './videos/verite-01/compositions';
import { Verite02Compositions } from './videos/verite-02/compositions';
import { Verite03Compositions } from './videos/verite-03/compositions';
import { TeachersDay2026Compositions } from './videos/teachers-day-2026/compositions';

/**
 * Every video registers its own compositions in src/videos/<video>/compositions.tsx,
 * inside a <Folder> named after it, with ids prefixed by it. Add a new video here.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Verite03Compositions />
    <Verite02Compositions />
    <Verite01Compositions />
    <TeachersDay2026Compositions />
    <Promo2026Compositions />
    <PromoV1Compositions />
    <KitCompositions />
  </>
);
