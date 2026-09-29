import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Backdrop, Camera, Grain, Mood, SafeZones, Vignette } from './fx';
import { Lang, LangProvider } from './lang';
import { Theme, tween } from './tokens';
import { Device } from './ui/Device';
import { FinanceScreen, HomeScreen } from './ui/screens';

export type KitProps = {
  lang: Lang;
  theme: Theme;
  screen: 'home' | 'finance';
  mood: Mood;
  safeZones: boolean;
};

/**
 * Checkpoint 1: one rebuilt app screen on the v2 stage, to compare against
 * phone screenshots before any scene is animated. The screen enters, the
 * figures count up, and the phone settles into a slight 3D turn.
 */
export const Kit: React.FC<KitProps> = ({ lang, theme, screen, mood, safeZones }) => {
  const frame = useCurrentFrame();
  const turn = tween(frame, [0, 40]);
  const Screen = screen === 'home' ? HomeScreen : FinanceScreen;
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill>
        <Backdrop mood={mood} />
        <Camera>
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', perspective: 2400 }}>
            <Device
              statusTone={theme === 'dark' ? 'light' : 'dark'}
              glare={0.6}
              style={{
                rotate: `y ${(lang === 'ar' ? 1 : -1) * (14 - turn * 8)}deg`,
                translate: `0px ${(1 - turn) * 60}px`,
                scale: String(0.92 + turn * 0.04),
              }}
            >
              <Screen theme={theme} enterFrom={6} progress={tween(frame, [14, 60])} />
            </Device>
          </AbsoluteFill>
        </Camera>
        <Vignette strength={mood === 'paper' ? 0.12 : 0.35} />
        <Grain />
        <SafeZones show={safeZones} />
      </AbsoluteFill>
    </LangProvider>
  );
};
