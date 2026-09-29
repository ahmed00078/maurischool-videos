import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fill, FINANCE_COPY, NOTIFS } from '../../../shared/appCopy';
import { COPY } from '../copy';
import { Camera } from '../../../shared/fx';
import { FINANCE, PUPIL, PUPIL_CLASS, TODAY } from '../../../shared/demo';
import { amount, useBi, useLang } from '../../../shared/lang';
import { useBeat } from '../../../shared/beat';
import { APP, EASE_IN, EASE_IN_OUT, pt, SCREEN_H, SCREEN_W, tween } from '../../../shared/tokens';
import { BEZEL, Device } from '../../../shared/ui/Device';
import { Headline, RoleChip } from '../../../shared/ui/Headline';
import { Ionicon } from '../../../shared/ui/Ionicon';
import { LockScreen, Notification } from '../../../shared/ui/LockScreen';
import { ReportCardDoc } from '../../../shared/ui/props';
import { FinanceScreen, HomeScreen } from '../../../shared/ui/screens';
import { AttendanceScreen, GradesScreen, OVERALL_AVERAGE, PaymentScreen, PERIOD } from '../../../shared/ui/screens2';
import { LAYOUT, mix, PhoneRig, Pose, Scene, screenToCanvas, Sfx, Tap, Top } from '../../../shared/rig';

const RECEIPT = 'NEI-RCP-2026-000418';

/** A screen-sized layer inside a PhoneRig, exactly over the phone's screen, with no frame. */
const ScreenLayer: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H, ...style }}>{children}</div>
);

/** Where a lock-screen notification sits on the canvas, when its phone is centred: the camera pushes in on it. */
const NOTIFICATION_FOCUS = screenToCanvas({}, SCREEN_W / 2, 480);

/** A short buzz: the phone shivers as a notification lands. */
const buzz = (frame: number, at: number) => {
  const t = frame - at;
  return t >= 0 && t < 18 ? Math.sin(t * 3.1) * 2.2 * (1 - t / 18) : 0;
};

/**
 * 4 · Director's home. The phone rises in a 3D turn, the camera pushes in
 * on "À traiter en priorité", and the two alerts lift out of the screen.
 */
export const HomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const side = rtl ? 1 : -1;
  const enter = spring({ frame: frame - b(-0.3), fps, config: { damping: 18, stiffness: 70 } });
  const flat = tween(frame, [b(4), b(5.5)], [0, 1], EASE_IN_OUT);
  const pose = mix(
    mix({ y: LAYOUT.phone.y + 1000, rx: 32, ry: side * 26, rz: side * 6 }, { rx: 8, ry: side * 12, rz: 0 }, enter),
    {},
    flat,
  );
  const focus = screenToCanvas({}, SCREEN_W / 2, 356);
  const lift: [number, number] = [tween(frame, [b(6), b(6.8)]), tween(frame, [b(7.5), b(8.3)])];
  return (
    <Scene mood="paper">
      <Camera drift={0.02} push={[b(4), b(6.5), 1.32]} focus={[focus[0], focus[1]]}>
        <PhoneRig pose={pose}>
          <Device glare={0.5 + (1 - flat) * 0.3}>
            <HomeScreen enterFrom={b(0.3)} lift={lift} />
          </Device>
        </PhoneRig>
        {flat > 0.99 ? (
          <PhoneRig pose={pose}>
            <ScreenLayer>
              <HomeScreen enterFrom={b(0.3)} isolate lift={lift} />
            </ScreenLayer>
          </PhoneRig>
        ) : null}
      </Camera>
      <Top>
        <RoleChip label={bi(COPY.home.chip)} icon="business-outline" at={b(0)} tone="light" />
        <Headline text={bi(COPY.home.headline)} at={b(0.4)} size={82} color={APP.light.text} accent={APP.brand[600]} highlight={APP.brand[100]} />
      </Top>
      <Sfx at={b(-0.3)} name="soft-whoosh" volume={0.7} />
      <Sfx at={b(6)} name="switch" volume={0.8} rate={1.2} />
      <Sfx at={b(7.5)} name="switch" volume={0.8} rate={1.35} />
    </Scene>
  );
};

/**
 * 5 · Finance. First the number alone, full frame: the collection rate
 * counting up and who is late. Then the camera pulls back through it and
 * the number was on the phone all along; the six-month chart grows.
 */
export const FinanceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const bi = useBi();
  const { font, dir } = useLang();
  const count = tween(frame, [b(0.4), b(3)], [0, 1], EASE_IN_OUT);
  const through = tween(frame, [b(5), b(6)], [0, 1], EASE_IN);
  const reveal = tween(frame, [b(5), b(6.8)], [0, 1], EASE_IN_OUT);
  const late = spring({ frame: frame - b(3.5), fps: 30, config: { damping: 12, stiffness: 160 } });
  const phoneScale = 2.6 - 1.8 * reveal;
  return (
    <Scene mood="brand">
      {/* Part one: the number, full frame */}
      <AbsoluteFill
        dir={dir}
        style={{
          alignItems: 'center',
          fontFamily: font,
          color: '#fff',
          opacity: 1 - through,
          scale: String(1 + through * 0.6),
          filter: `blur(${through * 8}px)`,
        }}
      >
        <div style={{ position: 'absolute', top: 740, fontSize: 52, fontWeight: 600, opacity: 0.85 }}>{bi(FINANCE_COPY.collectionRate)}</div>
        <div style={{ position: 'absolute', top: 810, fontSize: 250, fontWeight: 800, letterSpacing: -6, direction: 'ltr' }}>
          {(FINANCE.collectionRate * count).toFixed(2)}%
        </div>
        <div style={{ position: 'absolute', top: 1110, width: 820, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.22)', overflow: 'hidden' }}>
          <div style={{ width: `${FINANCE.collectionRate * count}%`, height: '100%', background: '#fff', borderRadius: 17, marginInlineStart: 0 }} />
        </div>
        <div style={{ position: 'absolute', top: 1175, fontSize: 44, opacity: tween(frame, [b(2.5), b(3)]) * 0.85 }}>
          {fill(bi(FINANCE_COPY.paidOfIssued), { paid: FINANCE.paidInvoices, total: FINANCE.totalInvoices })}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1290,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '18px 34px',
            borderRadius: 999,
            background: '#fff',
            color: APP.error,
            fontSize: 46,
            fontWeight: 800,
            scale: String(late),
            opacity: Math.min(1, late * 2),
          }}
        >
          <Ionicon name="alert-circle" size={50} color={APP.error} />
          {bi(FINANCE_COPY.overdue)} · {`⁦${amount(FINANCE.overdue)} MRU⁩`}
        </div>
      </AbsoluteFill>
      {/* Part two: it was the phone */}
      {reveal > 0 ? (
        <AbsoluteFill style={{ opacity: tween(frame, [b(5), b(5.4)]) }}>
          <PhoneRig
            pose={{ scale: phoneScale, x: LAYOUT.phone.x, y: LAYOUT.phone.y }}
            // Zoom about the collection card, about 700 px down the screen.
            style={{ transformOrigin: `${BEZEL + SCREEN_W / 2}px ${BEZEL + 700}px` }}
          >
            <Device>
              <FinanceScreen
                progress={1}
                scroll={tween(frame, [b(7.5), b(9.5)], [0, 250], EASE_IN_OUT)}
                chart={tween(frame, [b(8.5), b(10.5)])}
              />
            </Device>
          </PhoneRig>
        </AbsoluteFill>
      ) : null}
      <Top>
        <Headline text={bi(COPY.finance.headline)} at={b(0.3)} size={86} color="#fff" accent="#fff" highlight={`${APP.error}cc`} />
      </Top>
      <Sfx at={b(3.5)} name="ding" volume={0.5} rate={0.8} />
      <Sfx at={b(5)} name="whoosh" volume={0.6} />
    </Scene>
  );
};

/**
 * 6 · Payment. The accountant types 3 000 and saves; a receipt leaves the
 * button and the camera follows it across to the parent's phone, where the
 * real "Paiement enregistré" notification lands.
 */
export const PaymentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  // The parent's phone is further along the reading direction.
  const dirSign = rtl ? -1 : 1;
  const pan = tween(frame, [b(5), b(6.6)], [0, 1], EASE_IN_OUT);
  const worldX = -dirSign * 1080 * pan;
  const enter = spring({ frame: frame - b(-0.3), fps, config: { damping: 18, stiffness: 80 } });
  const poseA: Pose = mix({ y: LAYOUT.phone.y + 900, rx: 20 }, { rx: 0 }, enter);
  const poseB: Pose = { x: LAYOUT.phone.x + dirSign * 1080, rz: buzz(frame, b(7)) };
  const press = tween(frame, [b(4) - 3, b(4)]) * (1 - tween(frame, [b(4) + 2, b(4) + 7]));
  const done = frame >= b(4) + 4 ? 1 : 0;
  const button = screenToCanvas(poseA, SCREEN_W / 2, SCREEN_H - pt(60));
  const target = screenToCanvas(poseB, SCREEN_W / 2, pt(300));
  const fly = tween(frame, [b(4.4), b(7)], [0, 1], EASE_IN_OUT);
  const tokenX = button[0] + (target[0] - button[0]) * fly;
  const tokenY = button[1] + (target[1] - button[1]) * fly - Math.sin(fly * Math.PI) * 380;
  const tokenOn = frame >= b(4.4) && frame < b(7) + 2;
  const n = NOTIFS.payment_received;
  const params = { student_name: bi(PUPIL), amount: amount(3000), receipt_number: RECEIPT };
  return (
    <Scene mood="night">
      <Camera drift={0.02} push={[b(7), b(8.6), 1.28]} focus={[NOTIFICATION_FOCUS[0], NOTIFICATION_FOCUS[1]]} shift={[0, 230]}>
      <AbsoluteFill style={{ translate: `${worldX}px 0px` }}>
        <PhoneRig pose={poseA}>
          <Device>
            <PaymentScreen enterFrom={b(0.2)} value={3000} typed={tween(frame, [b(1.5), b(3)])} press={press} done={done} />
          </Device>
        </PhoneRig>
        <PhoneRig pose={poseB}>
          <Device statusTone="light">
            <LockScreen>
              <Notification at={b(7)} title={fill(bi(n.title), params)} message={fill(bi(n.message), params)} />
            </LockScreen>
          </Device>
        </PhoneRig>
        <Tap x={button[0]} y={button[1]} at={b(4)} />
        {tokenOn ? (
          <div
            style={{
              position: 'absolute',
              left: tokenX,
              top: tokenY,
              translate: '-50% -50%',
              scale: String(1.1 - fly * 0.5),
              rotate: `${Math.sin(fly * Math.PI) * -12 * dirSign}deg`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '18px 26px',
              borderRadius: 24,
              background: '#fff',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              fontFamily: 'inherit',
              fontSize: 38,
              fontWeight: 800,
              color: APP.success,
              direction: 'ltr',
              zIndex: 30,
            }}
          >
            <Ionicon name="receipt" size={44} color={APP.success} />
            {amount(3000)} MRU
          </div>
        ) : null}
      </AbsoluteFill>
      </Camera>
      <Top>
        <div style={{ position: 'relative', height: 68, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <RoleChip label={bi(COPY.payment.chipA)} icon="calculator-outline" at={b(0)} out={b(5)} style={{ position: 'absolute' }} />
          <RoleChip label={bi(COPY.payment.chipB)} icon="heart-outline" at={b(6)} style={{ position: 'absolute' }} />
        </div>
        <Headline text={bi(COPY.payment.headline)} at={b(0.4)} size={80} accent={APP.brand[300]} />
      </Top>
      {[1.6, 2, 2.4, 2.8].map((t) => (
        <Sfx key={t} at={b(t)} name="mouse-click" volume={0.45} rate={1.6} />
      ))}
      <Sfx at={b(4)} name="mouse-click" volume={0.9} />
      <Sfx at={b(4.4)} name="whoosh" volume={0.55} />
      <Sfx at={b(7)} name="ding" volume={0.9} />
    </Scene>
  );
};

/**
 * 7 · Attendance. "Tous présents" fills the register in a wave; the teacher
 * taps Mariem absent and saves. The phones swap and the parent is told.
 */
export const AttendanceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const s = rtl ? -1 : 1;
  const swing = spring({ frame: frame - b(-0.3), fps, config: { damping: 16, stiffness: 70 } });
  const swap = tween(frame, [b(5.5), b(6.6)], [0, 1], EASE_IN_OUT);
  const poseA: Pose = mix(
    mix({ ry: s * -75, x: LAYOUT.phone.x + s * 300, opacity: 0 }, { ry: s * -8 }, swing),
    { x: LAYOUT.phone.x - s * 1150, rz: -s * 10, ry: s * -30 },
    swap,
  );
  const poseB: Pose = mix({ x: LAYOUT.phone.x + s * 1150, rz: s * 10, ry: s * 30 }, { rz: buzz(frame, b(7)) }, swap);
  // Tap targets on the register, measured on the screen.
  const allAt = screenToCanvas(poseA, rtl ? 90 : SCREEN_W - 90, 196);
  const absentAt = screenToCanvas(poseA, rtl ? 92 : SCREEN_W - 92, 458);
  const saveAt = screenToCanvas(poseA, SCREEN_W / 2, SCREEN_H - pt(60));
  const n = NOTIFS.absence_marked;
  const params = { student_name: bi(PUPIL), date: TODAY, class_name: bi(PUPIL_CLASS) };
  const tapAbsent = tween(frame, [b(4), b(4) + 16]);
  const savePress = tween(frame, [b(5) - 3, b(5)]) * (1 - tween(frame, [b(5) + 2, b(5) + 7]));
  return (
    <Scene mood="paper">
      <Camera drift={0.03} push={[b(7), b(8.6), 1.28]} focus={[NOTIFICATION_FOCUS[0], NOTIFICATION_FOCUS[1]]} shift={[0, 230]}>
        <PhoneRig pose={poseA}>
          <Device>
            <AttendanceScreen
              enterFrom={b(0.2)}
              marked={tween(frame, [b(2.1), b(3.1)])}
              allPress={tween(frame, [b(2) - 3, b(2)]) * (1 - tween(frame, [b(2) + 2, b(2) + 8]))}
              absent={frame >= b(4) + 1 ? 1 : 0}
              tap={tapAbsent}
              savePress={savePress}
              saved={frame >= b(5) + 4 ? 1 : 0}
            />
          </Device>
        </PhoneRig>
        <PhoneRig pose={poseB}>
          <Device statusTone="light">
            <LockScreen>
              <Notification at={b(7)} title={fill(bi(n.title), params)} message={fill(bi(n.message), params)} />
            </LockScreen>
          </Device>
        </PhoneRig>
        <Tap x={allAt[0]} y={allAt[1]} at={b(2)} />
        <Tap x={absentAt[0]} y={absentAt[1]} at={b(4)} />
        <Tap x={saveAt[0]} y={saveAt[1]} at={b(5)} />
      </Camera>
      <Top>
        <div style={{ position: 'relative', height: 68, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <RoleChip label={bi(COPY.attendance.chipA)} icon="easel-outline" at={b(0)} out={b(5.5)} tone="light" style={{ position: 'absolute' }} />
          <RoleChip label={bi(COPY.attendance.chipB)} icon="heart-outline" at={b(6.2)} tone="light" style={{ position: 'absolute' }} />
        </div>
        <Headline text={bi(COPY.attendance.headline)} at={b(0.4)} size={78} color={APP.light.text} accent={APP.error} />
      </Top>
      <Sfx at={b(2)} name="mouse-click" volume={0.8} />
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={i} at={b(2.1) + i * 2} name="mouse-click" volume={0.25} rate={1.8} />
      ))}
      <Sfx at={b(4)} name="mouse-click" volume={1} rate={0.9} />
      <Sfx at={b(5)} name="mouse-click" volume={0.8} />
      <Sfx at={b(5.5)} name="whip" volume={0.45} />
      <Sfx at={b(7)} name="ding" volume={0.9} />
    </Scene>
  );
};

/**
 * 8 · Grades. The report-card notification drops onto the parent's screen,
 * the grades and average fill in, then the bulletin itself comes out of the
 * phone as a real page.
 */
export const GradesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const enter = spring({ frame: frame - b(-0.4), fps, config: { damping: 18, stiffness: 80 } });
  const out = tween(frame, [b(5), b(6.4)], [0, 1], EASE_IN_OUT);
  const pose: Pose = mix(mix({ scale: 0.55, ry: rtl ? 30 : -30, opacity: 0 }, {}, enter), { scale: 0.7, y: LAYOUT.phone.y + 60, opacity: 0.55 }, out);
  const banner = tween(frame, [b(0.3), b(0.9)]) * (1 - tween(frame, [b(2.4), b(3)], [0, 1], EASE_IN));
  const n = NOTIFS.report_card_available_parent;
  const params = { student_name: bi(PUPIL), period: bi(PERIOD), overall_average: OVERALL_AVERAGE.toFixed(2) };
  const row = screenToCanvas({}, SCREEN_W / 2, 775);
  const docW = 690;
  return (
    <Scene mood="brand">
      <Camera drift={0.03}>
        <PhoneRig pose={pose} style={{ filter: `blur(${out * 4}px)` }}>
          <Device>
            <GradesScreen enterFrom={b(0.6)} average={OVERALL_AVERAGE * tween(frame, [b(2), b(3.5)], [0, 1], EASE_IN_OUT)} card={tween(frame, [b(3.5), b(4.2)])} />
            <div style={{ position: 'absolute', top: pt(40), left: pt(8), right: pt(8), zIndex: 15, translate: `0px ${(banner - 1) * pt(200)}px` }}>
              <Notification at={b(0.3)} title={fill(bi(n.title), params)} message={fill(bi(n.message), params)} />
            </div>
          </Device>
        </PhoneRig>
        {out > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: row[0] + (540 - row[0]) * out,
              top: row[1] + (1160 - row[1]) * out,
              translate: '-50% -50%',
              scale: String(0.12 + 0.88 * out),
              rotate: `${(rtl ? 1 : -1) * 3 * out}deg`,
              opacity: Math.min(1, out * 3),
            }}
          >
            <ReportCardDoc width={docW} />
          </div>
        ) : null}
      </Camera>
      <Top>
        <RoleChip label={bi(COPY.grades.chip)} icon="heart-outline" at={b(0)} />
        <Headline text={bi(COPY.grades.headline)} at={b(0.4)} size={80} accent="#fff" highlight={`${APP.brand[900]}aa`} />
      </Top>
      <Sfx at={b(0.3)} name="ding" volume={0.8} />
      <Sfx at={b(5)} name="whoosh" volume={0.6} />
    </Scene>
  );
};
