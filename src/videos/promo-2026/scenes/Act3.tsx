import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COPY, WHATSAPP } from '../copy';
import { Camera } from '../../../shared/fx';
import { LangProvider, useBi, useLang } from '../../../shared/lang';
import { useBeat, useMarks } from '../../../shared/beat';
import { APP, EASE_IN_OUT, OUTFIT, SCREEN_W, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { Headline } from '../../../shared/ui/Headline';
import { IconName, Ionicon } from '../../../shared/ui/Ionicon';
import { LogoMark } from '../../../shared/ui/LogoMark';
import { Laptop, LogoAssemble } from '../../../shared/ui/props';
import { HomeScreen } from '../../../shared/ui/screens';
import { LAYOUT, PhoneRig, Scene, Sfx, Top } from '../../../shared/rig';

/**
 * 9 · Languages and themes. The same home screen turns over like a card and
 * comes back in the other language, mirrored; then dark mode spreads from
 * the corner in a circle.
 */
export const LanguagesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const mark = useMarks();
  const bi = useBi();
  const { lang } = useLang();
  const other = lang === 'fr' ? 'ar' : 'fr';
  // Dark mode arrives on "de jour comme de nuit" when there is a voice.
  const d = mark('dark', 5.2);
  const turn = tween(frame, [b(2), b(3.2)], [0, 1], EASE_IN_OUT);
  const bump = Math.sin(turn * Math.PI);
  const dark = tween(frame, [b(d), b(d + 1.6)], [0, 1], EASE_IN_OUT);
  // Dark mode spreads from the bell, which sits at the reading end of the header.
  const bellX = other === 'ar' ? 60 : SCREEN_W - 60;
  const sway = Math.sin(frame / 40) * 4;
  return (
    <Scene mood="night">
      <Camera drift={0.04}>
        <PhoneRig pose={{ scale: LAYOUT.phone.scale + bump * 0.05, ry: sway, rz: bump * -3 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              transform: `rotateY(${turn * 180}deg)`,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
              <Device>
                <HomeScreen />
              </Device>
            </div>
            <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <LangProvider lang={other}>
                <Device statusTone={dark > 0.5 ? 'light' : 'dark'}>
                  <HomeScreen />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      clipPath: `circle(${dark * 1500}px at ${bellX}px 110px)`,
                    }}
                  >
                    <HomeScreen theme="dark" />
                  </div>
                </Device>
              </LangProvider>
            </div>
          </div>
        </PhoneRig>
      </Camera>
      <Top>
        <Headline text={bi(COPY.languages.headline1)} at={b(0.3)} out={b(d - 0.6)} size={92} accent={APP.brand[300]} />
      </Top>
      <Top>
        <Headline text={bi(COPY.languages.headline2)} at={b(d)} size={92} accent={APP.brand[300]} />
      </Top>
      <Sfx at={b(2)} name="whip" volume={0.6} />
      <Sfx at={b(d)} name="switch" volume={0.8} />
    </Scene>
  );
};

/** In the order the voice names them: director, accountant, teacher, supervisor, parent, pupil. */
const ROLE_ICONS: IconName[] = ['business-outline', 'calculator-outline', 'easel-outline', 'eye-outline', 'heart-outline', 'school-outline'];

/**
 * 10 · Everyone. The six roles of a school orbit the mark; then the orbit
 * rises and the web workspace slides in beside the phone.
 */
export const RolesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const mark = useMarks();
  const bi = useBi();
  const { font } = useLang();
  // Each role appears as it is named; the devices come in on "sur téléphone".
  const roleAt = COPY.roles.names.map((_, i) => b(mark(`role${i}`, i * 0.5)));
  const dev = mark('devices', 4);
  const up = tween(frame, [b(dev - 0.4), b(dev + 0.8)], [0, 1], EASE_IN_OUT);
  const laptop = spring({ frame: frame - b(dev), fps, config: { damping: 18, stiffness: 80 } });
  const phone = spring({ frame: frame - b(dev + 0.6), fps, config: { damping: 16, stiffness: 90 } });
  const cx = 540;
  // The orbit rises into the gap between the headline and the laptop.
  const cy = 900 - up * 220;
  const orbitScale = 1 - up * 0.5;
  return (
    <Scene mood="paper">
      <Camera drift={0.03}>
        <div style={{ position: 'absolute', left: cx, top: cy, translate: '-50% -50%', scale: String(orbitScale) }}>
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 84,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 30px 70px rgba(31, 43, 111, 0.22)',
            }}
          >
            <LogoMark width={210} />
          </div>
        </div>
        {COPY.roles.names.map((name, i) => {
          const p = spring({ frame: frame - roleAt[i], fps, config: { damping: 13, stiffness: 150 } });
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + frame * 0.006;
          const x = cx + Math.cos(a) * 360 * orbitScale * (0.6 + 0.4 * p);
          const y = cy + Math.sin(a) * 330 * orbitScale * (0.6 + 0.4 * p);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                translate: '-50% -50%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 26px 14px 18px',
                borderRadius: 999,
                background: '#fff',
                border: `2px solid ${APP.brand[100]}`,
                boxShadow: '0 12px 30px rgba(31, 43, 111, 0.14)',
                fontFamily: font,
                fontWeight: 700,
                fontSize: 36 * (0.7 + 0.3 * orbitScale),
                color: APP.light.text,
                scale: String(p * (0.55 + 0.45 * orbitScale)),
                opacity: Math.min(1, p * 2),
                whiteSpace: 'nowrap',
              }}
            >
              <Ionicon name={ROLE_ICONS[i]} size={40} color={APP.brand[500]} />
              {bi(name)}
            </div>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 1150 + (1 - laptop) * 900,
            translate: '-50% -50%',
            opacity: Math.min(1, laptop * 2),
          }}
        >
          <Laptop width={880} grow={tween(frame, [b(dev + 1), b(dev + 3)])} />
        </div>
        <PhoneRig pose={{ x: 900, y: 1290 + (1 - phone) * 900, scale: 0.34, rz: 6 - phone * 6 }}>
          <Device>
            <HomeScreen />
          </Device>
        </PhoneRig>
      </Camera>
      <Top gap={18}>
        <Headline text={bi(COPY.roles.headline)} at={b(dev + 0.2)} size={80} color={APP.light.text} accent={APP.brand[600]} highlight={APP.brand[100]} />
        <div
          style={{
            fontFamily: OUTFIT,
            fontWeight: 600,
            fontSize: 42,
            color: APP.light.textSecondary,
            letterSpacing: 1,
            opacity: tween(frame, [b(dev + 2), b(dev + 2.6)]),
          }}
        >
          {bi(COPY.roles.platforms)}
        </div>
      </Top>
      {roleAt.map((a, i) => (
        <Sfx key={i} at={a} name="mouse-click" volume={0.35} rate={1.2 + i * 0.08} />
      ))}
      <Sfx at={b(dev)} name="soft-whoosh" volume={0.7} />
    </Scene>
  );
};

/**
 * 11 · Call to action. The mark assembles one last time, the offer lands,
 * and the WhatsApp number holds long enough to be written down.
 */
export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { font, dir } = useLang();
  const word = spring({ frame: frame - b(1.4), fps, config: { damping: 18, stiffness: 120 } });
  const pill = spring({ frame: frame - b(3.5), fps, config: { damping: 11, stiffness: 140 } });
  const pulse = 1 + Math.sin(Math.max(0, frame - b(5)) / 6) * 0.02;
  return (
    <Scene mood="brand">
      <Camera drift={0.03}>
        <AbsoluteFill style={{ alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: 330 }}>
            <LogoAssemble width={330} start={b(0)} step={3} violet="#ffffff" ink={APP.brand[900]} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 600,
              fontFamily: OUTFIT,
              fontWeight: 800,
              fontSize: 112,
              letterSpacing: -2.5,
              color: '#fff',
              opacity: word,
              translate: `0px ${(1 - word) * 40}px`,
            }}
          >
            Mauri<span style={{ color: APP.brand[900] }}>School</span>
          </div>
          <div style={{ position: 'absolute', top: 800, left: 80, right: 80 }}>
            <Headline text={bi(COPY.cta.offer)} at={b(2.5)} size={104} />
            <Headline text={bi(COPY.cta.channel)} at={b(3)} size={60} color="rgba(255,255,255,0.85)" style={{ marginTop: 6 }} />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 1090,
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '30px 48px',
              borderRadius: 999,
              background: '#fff',
              boxShadow: '0 30px 70px rgba(18,26,71,0.4)',
              scale: String((0.7 + pill * 0.3) * pulse),
              opacity: Math.min(1, pill * 1.5),
              direction: 'ltr',
            }}
          >
            <Ionicon name="logo-whatsapp" size={86} color={APP.success} />
            <span style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: 74, color: APP.light.text, whiteSpace: 'nowrap' }}>
              {WHATSAPP}
            </span>
          </div>
          <div
            dir={dir}
            style={{
              position: 'absolute',
              top: 1330,
              fontFamily: font,
              fontSize: 46,
              color: 'rgba(255,255,255,0.8)',
              opacity: tween(frame, [b(5), b(5.8)]),
            }}
          >
            {bi(COPY.cta.tagline)}
          </div>
        </AbsoluteFill>
      </Camera>
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={i} at={b(0) + i * 3 + 9} name="mouse-click" volume={0.4} rate={1.5} />
      ))}
      <Sfx at={b(3.5)} name="ding" volume={0.8} />
    </Scene>
  );
};
