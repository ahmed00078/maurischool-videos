import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fill, TEACHER_COPY } from '../appCopy';
import { CLASS_ROSTER, CLASS_SIZE, LESSON, PUPIL_CLASS, TEST } from '../demo';
import { Lang, useBi, useLang } from '../lang';
import { APP, pt, Theme } from '../tokens';
import { AppScreen, Enter, FloatingTabBar, useApp, useWeights } from './appkit';
import { IconName, Ionicon } from './Ionicon';

/**
 * The teacher's workspace, rebuilt from mobile_app: the register
 * (app/(teacher)/classes/attendance.tsx), grade entry
 * (app/(teacher)/classes/evaluations/[id].tsx) and the shared pieces they use
 * (ScreenHeader + BackButton, Button, PinnedFooter, ConfirmDialog, AppToast,
 * Avatar, the teacher's FloatingTabBar). Sizes are the app's, in points.
 */

/** Where the tab pill sits: safe-area bottom (24) + BAR_GAP (10) + BAR_HEIGHT (60). */
const TAB_INSET = 24 + 10 + 60;

/**
 * The teacher's five tabs. A class, a register or a test has no tab of its
 * own, so the bar's wash stays on the first tab and no label is focused.
 */
export const TeacherTabBar: React.FC = () => {
  const bi = useBi();
  const t = TEACHER_COPY.tabs;
  const items: { label: string; icon: IconName | 'logo' }[] = [
    { label: bi(t.home), icon: 'logo' },
    { label: bi(t.teaching), icon: 'book-outline' },
    { label: bi(t.planning), icon: 'calendar-outline' },
    { label: bi(t.payments), icon: 'wallet-outline' },
    { label: bi(t.profile), icon: 'person-outline' },
  ];
  return <FloatingTabBar wash={0} items={items.map((i) => ({ ...i, focused: false }))} />;
};

/** Avatar: first letters of the first two words, on a brand tint. */
const Avatar: React.FC<{ name: string; size: number }> = ({ name, size }) => {
  const w = useWeights();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  return (
    <div
      style={{
        width: pt(size),
        height: pt(size),
        borderRadius: pt(size / 2),
        background: `${APP.brand[500]}20`,
        color: APP.brand[600],
        fontSize: pt(size * 0.38),
        fontWeight: w.semiBold,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

/** ScreenHeader with a BackButton leading: 20 pt bold title, 13 pt subtitle. */
const BackHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => {
  const { c } = useApp();
  const { rtl } = useLang();
  const w = useWeights();
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: `${pt(16)}px ${pt(16)}px ${pt(12)}px` }}>
      <div style={{ width: pt(44), height: pt(44), marginInlineEnd: pt(8), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicon name={rtl ? 'arrow-forward' : 'arrow-back'} size={pt(24)} color={c.text} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: pt(20), fontWeight: w.bold, color: c.text }}>{title}</div>
        {subtitle ? <div style={{ fontSize: pt(13), color: c.textSecondary, marginTop: pt(2) }}>{subtitle}</div> : null}
      </div>
      {action}
    </div>
  );
};

type Variant = 'primary' | 'secondary' | 'outline' | 'info';

/**
 * Button: single-line label with a tail ellipsis, the icon never shrinks.
 * `press` (0 to 1) dips it as a finger lands.
 */
export const AppButton: React.FC<{
  title: string;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: IconName;
  press?: number;
  style?: React.CSSProperties;
}> = ({ title, variant = 'primary', size = 'md', icon, press = 0, style }) => {
  const { c } = useApp();
  const w = useWeights();
  const m = size === 'lg' ? { minHeight: 52, py: 14, px: 20, font: 16, icon: 20 } : { minHeight: 44, py: 12, px: 16, font: 14, icon: 18 };
  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: APP.brand[500], fg: APP.white },
    secondary: { bg: c.surface, fg: c.text },
    outline: { bg: 'transparent', fg: APP.brand[500], border: APP.brand[500] },
    info: { bg: APP.info, fg: APP.white },
  };
  const p = palette[variant];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: pt(8),
        minHeight: pt(m.minHeight),
        padding: `${pt(m.py)}px ${pt(m.px)}px`,
        borderRadius: pt(12),
        background: p.bg,
        border: p.border ? `${pt(1)}px solid ${p.border}` : undefined,
        boxSizing: 'border-box',
        scale: String(1 - press * 0.04),
        opacity: 1 - press * 0.2,
        ...style,
      }}
    >
      {icon ? <Ionicon name={icon} size={pt(m.icon)} color={p.fg} /> : null}
      <span
        style={{
          minWidth: 0,
          fontSize: pt(m.font),
          lineHeight: 1.25,
          fontWeight: w.semiBold,
          color: p.fg,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </span>
    </div>
  );
};

/** PinnedFooter: the primary action floating above the tab pill, the list fading out behind it. */
const PinnedFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { c } = useApp();
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: pt(TAB_INSET), zIndex: 4 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(${c.background}00 0%, ${c.background} 60%)`,
        }}
      />
      <div style={{ position: 'relative', padding: `${pt(28)}px ${pt(16)}px ${pt(12)}px` }}>{children}</div>
    </div>
  );
};

/** formatWeekdayDate(date, locale, 'short'): "lun. 05/10/2026", "الاثنين 05/10/2026". */
export const weekdayDate = (date: Date, lang: Lang) => {
  const weekday = date.toLocaleDateString(lang === 'ar' ? 'ar' : 'fr-FR', { weekday: 'short' });
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${weekday} ${dd}/${mm}/${date.getFullYear()}`;
};

/**
 * The register for today's maths lesson in 5e A, the way the redesigned
 * attendance screen draws it: a thin progress line, the day-and-session
 * picker, "Tous présents" and the count, then one row per pupil with two
 * segments. Nothing is marked until the teacher acts.
 */
export const RegisterScreen: React.FC<{
  theme?: Theme;
  enterFrom?: number;
  /** 0 to 1: "Tous présents" landing, the rows turning present top to bottom. */
  filled: number;
  /** Per visible row, 0 to 1: switched to absent. */
  absent: number[];
  allPress?: number;
  savePress?: number;
  /** Saved while offline: the register locks and waits to send. */
  queued?: boolean;
}> = ({ theme = 'light', enterFrom, filled, absent, allPress = 0, savePress = 0, queued = false }) => {
  const bi = useBi();
  const { lang } = useLang();
  const { c } = themeOf(theme);
  const w = weightsOf(lang);
  const marked = filled > 0;
  const markedCount = marked ? CLASS_SIZE : 0;
  const absentCount = absent.filter((a) => a > 0.5).length;
  const a = TEACHER_COPY.attendance;
  const session = `${weekdayDate(LESSON.date, lang)} · ${bi(LESSON.subject)} ${LESSON.start} – ${LESSON.end}`;
  return (
    <AppScreen theme={theme} enterFrom={enterFrom}>
      <Enter order={0}>
        <BackHeader title={bi(PUPIL_CLASS)} />
        <div style={{ height: pt(2), margin: `0 ${pt(16)}px`, background: c.border }}>
          <div style={{ height: '100%', width: `${Math.min(1, filled) * 100}%`, background: APP.brand[500] }} />
        </div>
      </Enter>
      <Enter order={1}>
        <div style={{ padding: `0 ${pt(16)}px` }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: pt(8),
              marginTop: pt(10),
              minHeight: pt(44),
              padding: `0 ${pt(12)}px`,
              border: `${pt(1)}px solid ${c.border}`,
              borderRadius: pt(10),
              boxSizing: 'border-box',
            }}
          >
            <span style={{ flex: 1, minWidth: 0, fontSize: pt(13), fontWeight: w.semiBold, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session}
            </span>
            <Ionicon name="chevron-down" size={pt(16)} color={c.textSecondary} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', minHeight: pt(36) }}>
            <span style={{ flex: 1 }}>
              {marked ? null : (
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: pt(13),
                    fontWeight: w.semiBold,
                    color: APP.brand[500],
                    scale: String(1 - allPress * 0.08),
                    opacity: 1 - allPress * 0.3,
                  }}
                >
                  {bi(a.allPresent)}
                </span>
              )}
            </span>
            <span style={{ fontSize: pt(13), fontWeight: w.semiBold, color: c.textSecondary, direction: 'ltr' }}>
              {fill(bi(a.progressShort), { marked: markedCount, total: CLASS_SIZE })}
            </span>
          </div>
        </div>
      </Enter>
      <div style={{ paddingTop: pt(2) }}>
        {CLASS_ROSTER.map((name, i) => {
          // "Tous présents" lands on every row at once; the sweep is a few frames long.
          const present = filled * (CLASS_ROSTER.length + 2) > i + 1;
          const isAbsent = (absent[i] ?? 0) > 0.5;
          return (
            <Enter key={i} order={2 + i * 0.35}>
              <RegisterRow
                name={bi(name)}
                status={isAbsent ? 'absent' : present ? 'present' : undefined}
                disabled={queued}
              />
            </Enter>
          );
        })}
      </div>
      <PinnedFooter>
        {queued ? (
          <div style={{ padding: `${pt(14)}px 0`, textAlign: 'center', fontSize: pt(13), fontWeight: w.semiBold, color: APP.warning }}>
            {bi(a.pendingSend)}
          </div>
        ) : marked ? (
          <AppButton
            size="lg"
            icon="checkmark-circle"
            press={savePress}
            title={fill(bi(a.saveWithCounts), { present: CLASS_SIZE - absentCount, absent: absentCount })}
          />
        ) : (
          <AppButton size="lg" variant="secondary" icon="arrow-down-circle-outline" title={fill(bi(a.markRemaining), { count: CLASS_SIZE })} />
        )}
      </PinnedFooter>
      <TeacherTabBar />
    </AppScreen>
  );
};

/** AttendanceRegisterRow: the name over a hairline, then Présent / Absent. */
const RegisterRow: React.FC<{ name: string; status?: 'present' | 'absent'; disabled: boolean }> = ({ name, status, disabled }) => {
  const bi = useBi();
  const { c } = useApp();
  const w = useWeights();
  const segment = (key: 'present' | 'absent') => {
    const checked = status === key;
    const color = key === 'present' ? APP.success : APP.error;
    return (
      <div
        style={{
          minWidth: pt(68),
          minHeight: pt(44),
          padding: `0 ${pt(8)}px`,
          boxSizing: 'border-box',
          borderRadius: pt(9),
          border: `${pt(1)}px solid ${checked ? color : c.border}`,
          background: checked ? color : c.surface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: pt(11),
          fontWeight: w.semiBold,
          color: checked ? APP.white : c.text,
          opacity: disabled ? 0.55 : 1,
        }}
      >
        {bi(TEACHER_COPY.status[key])}
      </div>
    );
  };
  return (
    <div style={{ minHeight: pt(60), margin: `0 ${pt(16)}px`, display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `${pt(1)}px solid ${c.border}`,
          paddingInlineEnd: pt(10),
        }}
      >
        <span style={{ fontSize: pt(15), fontWeight: w.medium, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </span>
      </div>
      <div style={{ display: 'flex', gap: pt(4) }}>
        {segment('present')}
        {segment('absent')}
      </div>
    </div>
  );
};

/** Where a register row's segment sits on the screen, in screen px, to aim a tap at it. */
export const registerSegmentAt = (row: number, key: 'present' | 'absent', rtl: boolean) => {
  // Status bar 44, header 16 + 44 + 12, progress 2, picker 10 + 44, count row 36, list top 2.
  const top = 44 + 72 + 2 + 54 + 36 + 2;
  const y = top + row * 60 + 30;
  // From the end edge: 16 margin, Absent 68, gap 4, Présent 68.
  const fromEnd = key === 'absent' ? 16 + 34 : 16 + 68 + 4 + 34;
  const x = rtl ? fromEnd : 390 - fromEnd;
  return [pt(x), pt(y)] as const;
};

/** Where "Tous présents" and the save button sit, in screen px. */
export const REGISTER_TARGETS = {
  allPresent: (rtl: boolean) => [pt(rtl ? 390 - 56 : 56), pt(44 + 72 + 2 + 54 + 18)] as const,
  save: () => [pt(195), pt(844 - TAB_INSET - 12 - 26)] as const,
};

/**
 * Entering a test's scores (BulkGradeEntry): one card per pupil with the
 * score box and the absent toggle; draft badge in the header; "Enregistrer le
 * brouillon" and "Publier" pinned at the bottom. `typed` (0 to 1) types the
 * first pupil's score.
 */
export const EvaluationScreen: React.FC<{
  theme?: Theme;
  enterFrom?: number;
  typed: number;
  publishPress?: number;
  /** 0 to 1: the "Publier l'évaluation ?" dialog. */
  dialog?: number;
  confirmPress?: number;
}> = ({ theme = 'light', enterFrom, typed, publishPress = 0, dialog = 0, confirmPress = 0 }) => {
  const bi = useBi();
  const { lang } = useLang();
  const { c } = themeOf(theme);
  const w = weightsOf(lang);
  const g = TEST;
  return (
    <AppScreen theme={theme} enterFrom={enterFrom}>
      <Enter order={0}>
        <BackHeader
          title={bi(g.title)}
          subtitle={`${bi(PUPIL_CLASS)} • ${bi(LESSON.subject)}`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: pt(4) }}>
              <span
                style={{
                  background: `${c.textSecondary}20`,
                  color: c.textSecondary,
                  borderRadius: pt(8),
                  padding: `${pt(3)}px ${pt(8)}px`,
                  fontSize: pt(11),
                  fontWeight: w.semiBold,
                }}
              >
                {bi(TEACHER_COPY.grades.draft)}
              </span>
              <div style={{ padding: pt(8), display: 'flex' }}>
                <Ionicon name="ellipsis-horizontal" size={pt(20)} color={c.text} />
              </div>
            </div>
          }
        />
      </Enter>
      <div style={{ paddingTop: pt(8) }}>
        {CLASS_ROSTER.map((name, i) => {
          const score = g.scores[i];
          const full = score === null ? '' : String(score);
          const shown = i === 0 ? full.slice(0, Math.round(full.length * typed)) : full;
          return (
            <Enter key={i} order={1 + i * 0.35}>
              <GradeRow name={bi(name)} score={shown} absent={score === null} caret={i === 0 && typed > 0 && typed < 1} />
            </Enter>
          );
        })}
      </div>
      <PinnedFooter>
        <div style={{ display: 'flex', gap: pt(10) }}>
          <AppButton variant="outline" title={bi(TEACHER_COPY.grades.saveDraft)} style={{ flex: 1, minWidth: 0 }} />
          <AppButton title={bi(TEACHER_COPY.grades.publish)} press={publishPress} style={{ flex: 1, minWidth: 0 }} />
        </div>
      </PinnedFooter>
      <TeacherTabBar />
      {dialog > 0 ? (
        <ConfirmDialog
          open={dialog}
          title={bi(TEACHER_COPY.grades.publishConfirmTitle)}
          message={bi(TEACHER_COPY.grades.publishConfirmMessage)}
          confirm={bi(TEACHER_COPY.grades.publish)}
          cancel={bi(TEACHER_COPY.cancel)}
          confirmPress={confirmPress}
        />
      ) : null}
    </AppScreen>
  );
};

const GradeRow: React.FC<{ name: string; score: string; absent: boolean; caret: boolean }> = ({ name, score, absent, caret }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        background: c.card,
        borderRadius: pt(12),
        border: `${pt(1)}px solid ${absent ? APP.warning : c.border}`,
        padding: pt(12),
        margin: `0 ${pt(16)}px ${pt(8)}px`,
        opacity: absent ? 0.7 : 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Avatar name={name} size={36} />
      <div style={{ flex: 1, minWidth: 0, marginInlineStart: pt(10), fontSize: pt(15), fontWeight: w.semiBold, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: pt(8) }}>
        <div
          style={{
            width: pt(70),
            height: pt(40),
            borderRadius: pt(8),
            border: `${pt(1)}px solid ${c.border}`,
            background: absent ? c.border : c.surface,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: pt(16),
            fontWeight: w.semiBold,
            color: score ? c.text : c.textSecondary,
            direction: 'ltr',
          }}
        >
          {score || (absent ? '' : '/20')}
          {caret ? <span style={{ width: pt(1.5), height: pt(20), marginInlineStart: pt(1), background: APP.brand[500] }} /> : null}
        </div>
        <div
          style={{
            width: pt(40),
            height: pt(40),
            borderRadius: pt(8),
            background: absent ? APP.warning : c.surface,
            border: absent ? undefined : `${pt(1)}px solid ${c.border}`,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicon name={absent ? 'person-remove' : 'person-remove-outline'} size={pt(18)} color={absent ? APP.white : c.textSecondary} />
        </div>
      </div>
    </div>
  );
};

/** Where the grade screen's targets sit, in screen px (the dialog's from its measured card). */
export const EVALUATION_TARGETS = {
  firstScore: (rtl: boolean) => [pt(rtl ? 111 : 390 - 111), pt(44 + 72 + 8 + 33)] as const,
  publish: (rtl: boolean) => [pt(rtl ? 103 : 287), pt(844 - TAB_INSET - 12 - 22)] as const,
  /** The dialog's action: the second of two buttons, at the reading end. */
  confirm: (rtl: boolean) => [pt(rtl ? 115 : 275), pt(527)] as const,
};

/**
 * ConfirmDialog (type "info"): a 16 pt card on a 50 % scrim, the icon in a
 * tinted disc, centred title and message, then Annuler / the action.
 */
const ConfirmDialog: React.FC<{ open: number; title: string; message: string; confirm: string; cancel: string; confirmPress: number }> = ({
  open,
  title,
  message,
  confirm,
  cancel,
  confirmPress,
}) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `0 ${pt(20)}px`,
        background: `rgba(0,0,0,${0.5 * open})`,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: pt(360),
          background: c.card,
          borderRadius: pt(16),
          overflow: 'hidden',
          opacity: open,
          scale: String(0.94 + open * 0.06),
        }}
      >
        <div style={{ padding: pt(20), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: pt(56),
              height: pt(56),
              borderRadius: pt(28),
              background: `${APP.info}1a`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: pt(14),
            }}
          >
            <Ionicon name="information-circle" size={pt(28)} color={APP.info} />
          </div>
          <div style={{ fontSize: pt(18), fontWeight: w.semiBold, color: c.text, textAlign: 'center' }}>{title}</div>
          <div style={{ fontSize: pt(14), lineHeight: `${pt(20)}px`, color: c.textSecondary, marginTop: pt(6), textAlign: 'center', marginBottom: pt(16) }}>
            {message}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${c.border}`, padding: `${pt(16)}px ${pt(20)}px ${pt(20)}px`, display: 'flex', gap: pt(10) }}>
          <AppButton variant="secondary" title={cancel} style={{ flex: 1, minWidth: 0 }} />
          <AppButton variant="info" title={confirm} press={confirmPress} style={{ flex: 1, minWidth: 0 }} />
        </div>
      </div>
    </div>
  );
};

/**
 * AppToast: the card that drops from the top (topOffset 48), a 5 pt accent
 * on its start edge, a 15 pt title and a 13 pt detail. `at` is when it lands.
 */
export const AppToast: React.FC<{ title: string; message?: string; accent: string; at: number; theme?: Theme }> = ({
  title,
  message,
  accent,
  at,
  theme = 'light',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { dir, font, rtl } = useLang();
  const c = APP[theme];
  const w = weightsOf(rtl ? 'ar' : 'fr');
  const s = spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 170 } });
  if (frame < at) return null;
  return (
    <div dir={dir} style={{ position: 'absolute', top: pt(48), left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30, fontFamily: font }}>
      <div
        style={{
          width: '92%',
          minHeight: pt(72),
          boxSizing: 'border-box',
          background: c.card,
          border: `${pt(1)}px solid ${c.border}`,
          borderInlineStart: `${pt(5)}px solid ${accent}`,
          borderRadius: pt(12),
          padding: `${pt(10)}px ${pt(16)}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: `0 ${pt(6)}px ${pt(18)}px rgba(15, 23, 42, 0.14)`,
          opacity: Math.min(1, s * 1.5),
          translate: `0px ${(1 - s) * -pt(120)}px`,
        }}
      >
        <div style={{ fontSize: pt(15), lineHeight: `${pt(22)}px`, fontWeight: w.semiBold, color: c.text }}>{title}</div>
        {message ? <div style={{ fontSize: pt(13), lineHeight: `${pt(19)}px`, color: c.textSecondary }}>{message}</div> : null}
      </div>
    </div>
  );
};

// The screens set their own context, so the few values read above it come from here.
const themeOf = (theme: Theme) => ({ c: APP[theme] });
const weightsOf = (lang: Lang) => ({ regular: 400, medium: 500, semiBold: lang === 'ar' ? 700 : 600, bold: 700 }) as const;
