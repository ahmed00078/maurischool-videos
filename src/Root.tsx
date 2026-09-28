import React from 'react';
import { Composition, Folder } from 'remotion';
import { Promo, SCENES, TOTAL } from './Promo';
import { FPS } from './theme';

const W = 1080;
const H = 1920;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} width={W} height={H} fps={FPS} durationInFrames={TOTAL} />
    <Composition id="PromoWide" component={Promo} width={H} height={W} fps={FPS} durationInFrames={TOTAL} />
    <Folder name="Scenes">
      {SCENES.map((s) => (
        <Composition
          key={s.id}
          id={s.id}
          component={s.component}
          width={W}
          height={H}
          fps={FPS}
          durationInFrames={s.frames}
        />
      ))}
    </Folder>
  </>
);
