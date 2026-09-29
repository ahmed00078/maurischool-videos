import React from 'react';
import { Composition, Folder } from 'remotion';
import { PORTRAIT } from './formats';
import { Kit, KitProps } from './Kit';
import { FPS } from './tokens';

/**
 * The shared kit on its own: each rebuilt app screen on the stage, per
 * language and theme. Check these against phone screenshots whenever the app's
 * design changes, before any video uses the new screens.
 */
const KITS: { id: string; props: KitProps }[] = [
  { id: 'Kit-Home-FR-Light', props: { lang: 'fr', theme: 'light', screen: 'home', mood: 'paper', safeZones: false } },
  { id: 'Kit-Home-AR-Dark', props: { lang: 'ar', theme: 'dark', screen: 'home', mood: 'night', safeZones: false } },
  { id: 'Kit-Finance-FR-Light', props: { lang: 'fr', theme: 'light', screen: 'finance', mood: 'brand', safeZones: false } },
  { id: 'Kit-Finance-AR-Light', props: { lang: 'ar', theme: 'light', screen: 'finance', mood: 'brand', safeZones: false } },
];

export const KitCompositions: React.FC = () => (
  <Folder name="kit">
    {KITS.map((k) => (
      <Composition key={k.id} id={k.id} component={Kit} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={k.props} />
    ))}
  </Folder>
);
