import React from 'react';
import { Composition, Folder } from 'remotion';
import { PORTRAIT } from './formats';
import { Kit, KitProps } from './Kit';
import { KitAnnounce, KitRoom } from './KitAnnounce';
import { KitCast } from './KitCast';
import { KitChat } from './KitChat';
import { KitFees } from './KitFees';
import { KitGoat, KitGoatClose } from './KitGoat';
import { KitInbox } from './KitInbox';
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
    <Composition id="Kit-Cast" component={KitCast} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const }} />
    <Composition id="Kit-Inbox-FR" component={KitInbox} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const }} />
    <Composition id="Kit-Inbox-AR" component={KitInbox} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'ar' as const }} />
    <Composition id="Kit-Goat-FR" component={KitGoat} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const }} />
    <Composition id="Kit-Goat-AR" component={KitGoat} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'ar' as const }} />
    <Composition id="Kit-Fees-FR" component={KitFees} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const }} />
    <Composition id="Kit-Fees-AR" component={KitFees} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'ar' as const }} />
    <Composition id="Kit-Chat-FR" component={KitChat} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const }} />
    <Composition id="Kit-Chat-AR" component={KitChat} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'ar' as const }} />
    <Composition id="Kit-Announce-FR" component={KitAnnounce} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const }} />
    <Composition id="Kit-Announce-AR" component={KitAnnounce} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'ar' as const }} />
    {(['night', 'dusk', 'morning'] as const).map((light) => (
      <Composition key={light} id={`Kit-Room-${light}`} component={KitRoom} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const, light }} />
    ))}
    <Composition id="Kit-Goat-Close" component={KitGoatClose} {...PORTRAIT} fps={FPS} durationInFrames={90} defaultProps={{ lang: 'fr' as const, coat: 'caramel' as const }} />
  </Folder>
);
