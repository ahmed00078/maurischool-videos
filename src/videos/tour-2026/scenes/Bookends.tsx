import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FEES_COPY, fill, NOTIFS, SENSITIVE_PUSH_BODY } from '../../../shared/appCopy';
import { useBeat, useMarks } from '../../../shared/beat';
import { CONTACT } from '../../../shared/brand';
import { FEES_PAYMENT, PUPIL_CODE, PUPIL_FATHER } from '../../../shared/demo';
import { useBi, useLang } from '../../../shared/lang';
import { PhoneRig, Pose, Scene, Sfx } from '../../../shared/rig';
import { APP, BEAT, EASE_IN, EASE_IN_OUT, OUTFIT, pt, tween } from '../../../shared/tokens';
import { Device } from '../../../shared/ui/Device';
import { ReceiptSheet } from '../../../shared/ui/documents';
import { Headline } from '../../../shared/ui/Headline';
import { IconName, Ionicon } from '../../../shared/ui/Ionicon';
import { LockScreen, Notification } from '../../../shared/ui/LockScreen';
import { LogoAssemble } from '../../../shared/ui/props';
import { Lift, Side, useMirror, WIDE } from '../../../shared/wide';
import { COPY } from '../copy';
import { KHADI, PAYMENT } from '../data';
import { BANNER, BANNER_CARD, Paper } from './Chapters';

/**
 * The tour's opening, the cards that announce its three acts, its « Et aussi… »
 * strip and its closing: the scenes around the ten chapters.
 */

const ACT_ICONS: IconName[] = ['cash-outline', 'school-outline', 'people-outline'];

/** An act's name in a pill, on a dark or a brand background. */
const ActChip: React.FC<{ icon: IconName; label: string; p: number; size?: number }> = ({ icon, label, p, size = 40 }) => {
  const { font } = useLang();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.45,
        padding: `${size * 0.55}px ${size * 0.95}px`,
        borderRadius: size * 0.7,
        background: 'rgba(255,255,255,0.12)',
        border: '2px solid rgba(255,255,255,0.26)',
        color: '#fff',
        fontFamily: font,
        fontSize: size,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, p * 1.6),
        scale: String(0.8 + 0.2 * p),
      }}
    >
      <Ionicon name={icon} size={size * 1.15} color="#fff" />
      {label}
    </div>
  );
};

/**
 * Opening, on the tour's strongest moment and no preamble: a parent's phone
 * is on screen from the first frame, the payment's notification lands on it
 * at the minute the counter took the money, then the receipt rises. Only then
 * the title: MauriSchool in 10 points, and the three acts they come in.
 */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const m = useMarks();
  const bi = useBi();
  const { font, dir, rtl, lang } = useLang();
  const mirror = useMirror();
  const ring = b(m('ring', 0.6));
  const receipt = b(m('receipt', 4.5));
  const title = b(m('title', 8));
  const n = NOTIFS.payment_received;

  // The phone: in its place on frame 0 (it only settles back a little), gone when the receipt comes.
  const side = rtl ? -1 : 1;
  const phoneX = mirror(WIDE.phone.x);
  const settle = tween(frame, [0, 24], [1, 0]);
  const leave = tween(frame, [receipt - 13, receipt - 1], [0, 1], EASE_IN);
  const float = Math.sin(frame / 46) * 6;
  const pose: Pose = { x: phoneX + side * leave * 420, y: WIDE.phone.y + float, scale: WIDE.phone.scale * (1 + settle * 0.06), ry: -side * (settle * 8 + leave * 18), opacity: 1 - leave };
  const flat: Pose = { x: phoneX, y: WIDE.phone.y + float, scale: WIDE.phone.scale };
  const rect = BANNER(1);
  const up = spring({ frame: frame - ring - 12, fps, config: { damping: 17, stiffness: 95 } });
  const t = Math.max(0, up - tween(frame, [receipt - 22, receipt - 12], [0, 1], EASE_IN_OUT));
  const screen = (
    <LockScreen time={PAYMENT.time}>
      <Notification at={ring} title={fill(bi(n.title), { student_name: bi(KHADI) })} message={bi(SENSITIVE_PUSH_BODY)} />
    </LockScreen>
  );

  const out = tween(frame, [title - 9, title - 1], [0, 1], EASE_IN);
  const proof = spring({ frame: frame - receipt - 12, fps, config: { damping: 15, stiffness: 140 } });
  const titleIn = spring({ frame: frame - title, fps, config: { damping: 17, stiffness: 110 } });
  return (
    <Scene mood="night">
      {/* The moment */}
      <AbsoluteFill style={{ opacity: 1 - out }}>
        {leave < 1 ? (
          <>
            <PhoneRig pose={pose}>
              <Device time={PAYMENT.time} statusTone="light" glare={0.45}>
                {screen}
              </Device>
            </PhoneRig>
            <Lift pose={flat} rect={rect} to={{ x: 1085, y: 548, scale: Math.min(BANNER_CARD.fit[0] / pt(rect.w), BANNER_CARD.fit[1] / pt(rect.h)) }} t={t} opacity={t > 0.02 ? 1 : 0} drift={Math.sin((frame + 30) / 38) * 5 * t}>
              {screen}
            </Lift>
          </>
        ) : null}
        {frame >= receipt - 2 ? (
          <Paper c={{ f: frame - receipt, beats: (k) => Math.round(k * BEAT) }} x={1310} width={760} height={760} caption={bi(FEES_COPY.downloadReceipt)} captionIcon="download-outline">
            <ReceiptSheet
              width={760}
              lang={lang}
              data={{ number: PAYMENT.receipt, date: PAYMENT.date, time: PAYMENT.time, invoice: PAYMENT.invoice, amount: PAYMENT.amount, student: bi(KHADI), code: PUPIL_CODE, payer: bi(PUPIL_FATHER), cashier: bi(FEES_PAYMENT.cashier) }}
            />
          </Paper>
        ) : null}
        <Side gap={10} style={{ translate: `0px ${-out * 40}px` }}>
          <Headline text={bi(COPY.intro.hook[0])} at={b(0)} size={74} align="start" />
          <Headline text={bi(COPY.intro.hook[1])} at={ring + 16} size={74} accent={APP.brand[300]} highlight="rgba(165,180,252,0.2)" align="start" />
          <div dir={dir} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 30, fontFamily: font, fontSize: 40, fontWeight: 600, color: 'rgba(255,255,255,0.9)', opacity: Math.min(1, proof * 1.4), translate: `0px ${(1 - proof) * 20}px` }}>
            <Ionicon name="checkmark-circle" size={46} color="#4ade80" />
            {bi(COPY.chapters[0].steps[2])}
          </div>
        </Side>
      </AbsoluteFill>
      {/* The title */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: frame >= title ? 1 : 0 }}>
        <div style={{ marginBottom: 40 }}>{frame >= title - 2 ? <LogoAssemble width={150} start={title} step={2} violet="#ffffff" ink={APP.brand[300]} /> : null}</div>
        <Headline text={bi(COPY.intro.title)} at={title + 4} size={118} accent={APP.brand[300]} />
        <div dir={dir} style={{ marginTop: 22, fontFamily: font, fontSize: 44, fontWeight: 500, color: 'rgba(255,255,255,0.78)', opacity: titleIn, translate: `0px ${(1 - titleIn) * 24}px` }}>
          {bi(COPY.intro.sub)}
        </div>
        <div dir={dir} style={{ display: 'flex', gap: 26, marginTop: 56 }}>
          {COPY.acts.map((act, i) => (
            <ActChip key={i} icon={ACT_ICONS[i]} label={bi(act.label)} p={spring({ frame: frame - title - 22 - i * 6, fps, config: { damping: 13, stiffness: 150 } })} size={36} />
          ))}
        </div>
      </AbsoluteFill>
      <Sfx at={0} name="soft-whoosh" volume={0.5} />
      <Sfx at={ring} name="ding" volume={0.7} />
      <Sfx at={receipt - 2} name="paper" volume={0.55} />
      <Sfx at={title - 4} name="whoosh" volume={0.55} />
      {COPY.acts.map((_, i) => (
        <Sfx key={i} at={title + 22 + i * 6} name="pop" volume={0.4} rate={1 + i * 0.1} />
      ))}
    </Scene>
  );
};

/**
 * An act's card, between chapters: its place among the three, its name, and
 * the chapters it holds with their numbers. On the brand colour, so the eye
 * gets a break from ten chapters on paper.
 */
export const ActScene: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { font, dir } = useLang();
  const act = COPY.acts[index];
  const chapters = COPY.chapters.map((c, i) => ({ ...c, n: i + 1 })).filter((c) => c.act === index);
  const tile = spring({ frame: frame - b(0), fps, config: { damping: 12, stiffness: 140 } });
  return (
    <Scene mood="brand">
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 34, direction: 'ltr', opacity: Math.min(1, tile * 1.5), scale: String(0.7 + 0.3 * tile) }}>
          <div style={{ width: 124, height: 124, borderRadius: 36, background: '#fff', boxShadow: '0 30px 70px rgba(18,26,71,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicon name={ACT_ICONS[index]} size={70} color={APP.brand[500]} />
          </div>
          <div style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 54, color: 'rgba(255,255,255,0.75)' }}>
            <span style={{ color: '#fff' }}>{index + 1}</span> / {COPY.acts.length}
          </div>
        </div>
        <Headline text={bi(act.headline)} at={b(0.4)} size={168} accent="#fff" highlight="rgba(255,255,255,0.22)" />
        <div dir={dir} style={{ display: 'flex', gap: 22, marginTop: 64 }}>
          {chapters.map((c, i) => {
            const p = spring({ frame: frame - b(1.6 + i * 0.5), fps, config: { damping: 13, stiffness: 150 } });
            return (
              <div
                key={c.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 30px 18px 20px',
                  borderRadius: 26,
                  background: 'rgba(255,255,255,0.14)',
                  border: '2px solid rgba(255,255,255,0.28)',
                  fontFamily: font,
                  fontSize: 38,
                  fontWeight: 700,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  opacity: Math.min(1, p * 1.6),
                  translate: `0px ${(1 - p) * 30}px`,
                }}
              >
                <span style={{ fontFamily: OUTFIT, fontSize: 30, fontWeight: 800, color: APP.brand[600], background: '#fff', borderRadius: 14, padding: '6px 14px', direction: 'ltr' }}>{String(c.n).padStart(2, '0')}</span>
                {bi(c.title)}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Sfx at={b(0)} name="whoosh" volume={0.5} />
      {chapters.map((c, i) => (
        <Sfx key={c.n} at={b(1.6 + i * 0.5)} name="pop" volume={0.4} rate={1 + i * 0.08} />
      ))}
    </Scene>
  );
};

const MORE_ICONS: IconName[] = ['cloud-upload-outline', 'language-outline', 'people-outline', 'cloud-offline-outline', 'desktop-outline', 'shield-checkmark-outline'];

/** « Et aussi… »: six more things, one tile each, a beat apart. */
export const MoreScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const m = useMarks();
  const bi = useBi();
  const { font, dir } = useLang();
  return (
    <Scene mood="paper">
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0 }}>
        <Headline text={bi(COPY.more.headline)} at={b(0)} size={92} color={APP.light.text} accent={APP.brand[600]} />
      </div>
      <div dir={dir} style={{ position: 'absolute', left: 150, right: 150, top: 286, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 34 }}>
        {COPY.more.items.map((item, i) => {
          const at = b(m(`i${i + 1}`, 1.5 + i * 1.6));
          const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 150 } });
          return (
            <div
              key={i}
              style={{
                height: 280,
                borderRadius: 34,
                background: '#fff',
                border: `2px solid ${APP.brand[100]}`,
                boxShadow: '0 24px 60px rgba(31,43,111,0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 22,
                padding: '0 34px',
                opacity: Math.min(1, p * 1.6),
                scale: String(0.82 + 0.18 * p),
                translate: `0px ${(1 - p) * 40}px`,
              }}
            >
              <div style={{ width: 104, height: 104, borderRadius: 30, background: APP.brand[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicon name={MORE_ICONS[i]} size={58} color={APP.brand[500]} />
              </div>
              <div style={{ fontFamily: font, fontSize: 36, fontWeight: 700, lineHeight: 1.25, textAlign: 'center', color: APP.light.text }}>{bi(item)}</div>
            </div>
          );
        })}
      </div>
      {COPY.more.items.map((_, i) => (
        <Sfx key={i} at={b(m(`i${i + 1}`, 1.5 + i * 1.6))} name="pop" volume={0.4} rate={1 + i * 0.06} />
      ))}
    </Scene>
  );
};

/** Closing: the school is not left alone (import, training, follow-up), then the offer and where to ask. */
export const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const m = useMarks();
  const bi = useBi();
  const { font, dir } = useLang();
  const offer = b(m('offer', 9));
  const out = tween(frame, [offer - 8, offer], [0, 1], EASE_IN);
  const word = spring({ frame: frame - offer - 18, fps, config: { damping: 18, stiffness: 120 } });
  const pill = spring({ frame: frame - offer - 44, fps, config: { damping: 11, stiffness: 140 } });
  const pulse = 1 + Math.sin(Math.max(0, frame - offer - 70) / 7) * 0.015;
  const icons: IconName[] = ['cloud-upload-outline', 'people-outline', 'heart-outline'];
  return (
    <Scene mood="brand">
      {/* We stay with you */}
      <AbsoluteFill style={{ alignItems: 'center', opacity: 1 - out, translate: `0px ${-out * 50}px` }}>
        <div style={{ position: 'absolute', top: 250, left: 200, right: 200 }}>
          <Headline text={bi(COPY.close.headline)} at={b(0)} size={120} accent="#fff" highlight="rgba(255,255,255,0.22)" />
        </div>
        <div dir={dir} style={{ position: 'absolute', top: 560, display: 'flex', gap: 30 }}>
          {COPY.close.steps.map((s, i) => {
            const p = spring({ frame: frame - b(2 + i * 1.5), fps, config: { damping: 13, stiffness: 150 } });
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '24px 38px',
                  borderRadius: 28,
                  background: 'rgba(255,255,255,0.14)',
                  border: '2px solid rgba(255,255,255,0.28)',
                  color: '#fff',
                  fontFamily: font,
                  fontSize: 40,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  opacity: Math.min(1, p * 1.6),
                  scale: String(0.8 + 0.2 * p),
                }}
              >
                <Ionicon name={icons[i]} size={46} color="#fff" />
                {bi(s)}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* The offer */}
      <AbsoluteFill style={{ alignItems: 'center', opacity: frame >= offer ? 1 : 0 }}>
        <div style={{ position: 'absolute', top: 120 }}>{frame >= offer - 2 ? <LogoAssemble width={210} start={offer} step={3} violet="#ffffff" ink={APP.brand[900]} /> : null}</div>
        <div style={{ position: 'absolute', top: 300, fontFamily: OUTFIT, fontWeight: 800, fontSize: 96, letterSpacing: -2.5, color: '#fff', opacity: word, translate: `0px ${(1 - word) * 30}px` }}>
          Mauri<span style={{ color: APP.brand[900] }}>School</span>
        </div>
        <div style={{ position: 'absolute', top: 470, left: 160, right: 160 }}>
          <Headline text={bi(COPY.close.offer)} at={offer + 28} size={96} />
        </div>
        <div style={{ position: 'absolute', top: 650, display: 'flex', gap: 30, direction: 'ltr', scale: String((0.7 + pill * 0.3) * pulse), opacity: Math.min(1, pill * 1.5) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 42px', borderRadius: 999, background: '#fff', boxShadow: '0 30px 70px rgba(18,26,71,0.4)' }}>
            <Ionicon name="logo-whatsapp" size={64} color={APP.success} />
            <span style={{ fontFamily: OUTFIT, fontWeight: 800, fontSize: 58, color: APP.light.text, whiteSpace: 'nowrap' }}>{CONTACT.whatsapp}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 42px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', border: '2px solid rgba(255,255,255,0.4)' }}>
            <Ionicon name="globe-outline" size={52} color="#fff" />
            <span style={{ fontFamily: OUTFIT, fontWeight: 700, fontSize: 50, color: '#fff', whiteSpace: 'nowrap' }}>{CONTACT.site}</span>
          </div>
        </div>
        <div dir={dir} style={{ position: 'absolute', top: 850, fontFamily: font, fontSize: 40, color: 'rgba(255,255,255,0.82)', opacity: tween(frame, [offer + 60, offer + 74]) }}>
          {bi(COPY.close.tagline)}
        </div>
      </AbsoluteFill>
      {COPY.close.steps.map((_, i) => (
        <Sfx key={i} at={b(2 + i * 1.5)} name="pop" volume={0.4} rate={1 + i * 0.08} />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={`c${i}`} at={offer + i * 3 + 9} name="mouse-click" volume={0.35} rate={1.5} />
      ))}
      <Sfx at={offer + 44} name="ding" volume={0.7} />
    </Scene>
  );
};
