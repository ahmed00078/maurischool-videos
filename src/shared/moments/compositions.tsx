import React from 'react';
import { AbsoluteFill, Composition, Folder, Still, useCurrentFrame, useVideoConfig } from 'remotion';
import { PORTRAIT, POST } from '../formats';
import { Lang, LangProvider } from '../lang';
import { FPS } from '../tokens';
import { DirectorMoment, DirectorScene } from './director';
import { TeacherMoment, TeacherScene } from './teacher';

/**
 * moments — the cast in the school, drawn once for the feed and for Reels.
 *
 *   Moments-<scene>-<moment>-FR/AR          a 4:5 post still (1080 × 1350), wall left plain for the headline
 *   Moments-<scene>-<moment>-FR/AR-Reel     the same, 9:16 and alive (steam, blinks), 4 s that loop
 *
 * The posts in social/ render the stills (`npx remotion still`) and lay their
 * headline and stamp over them.
 */
type SceneProps = { lang: Lang; moment: string };

const SCENES: { id: string; moments: string[]; Component: React.FC<{ moment: any; height: number; t: number }> }[] = [
  { id: 'Director', moments: ['before', 'after'] satisfies DirectorMoment[], Component: DirectorScene },
  { id: 'Teacher', moments: ['before', 'after'] satisfies TeacherMoment[], Component: TeacherScene },
];

const make = (Component: React.FC<{ moment: any; height: number; t: number }>): React.FC<SceneProps> => {
  const Wrapped: React.FC<SceneProps> = ({ lang, moment }) => {
    const frame = useCurrentFrame();
    const { height } = useVideoConfig();
    return (
      <LangProvider lang={lang}>
        <AbsoluteFill>
          <Component moment={moment} height={height} t={frame / FPS} />
        </AbsoluteFill>
      </LangProvider>
    );
  };
  return Wrapped;
};

export const MomentsCompositions: React.FC = () => (
  <Folder name="moments">
    {SCENES.flatMap(({ id, moments, Component }) => {
      const C = make(Component);
      return moments.flatMap((moment) =>
        (['fr', 'ar'] as Lang[]).flatMap((lang) => {
          const base = `Moments-${id}-${moment[0].toUpperCase()}${moment.slice(1)}-${lang.toUpperCase()}`;
          return [
            <Still key={base} id={base} component={C} {...POST} defaultProps={{ lang, moment }} />,
            <Composition key={`${base}-Reel`} id={`${base}-Reel`} component={C} {...PORTRAIT} fps={FPS} durationInFrames={FPS * 4} defaultProps={{ lang, moment }} />,
          ];
        }),
      );
    })}
  </Folder>
);
