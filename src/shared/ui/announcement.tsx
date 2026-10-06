import React from 'react';
import { ANNOUNCEMENT_COPY, fill, pluralKey, TABS, TEACHER_COPY } from '../appCopy';
import { Bi, useBi, useLang } from '../lang';
import { APP, pt, Theme } from '../tokens';
import { AppScreen, Card, FloatingTabBar, useApp, useWeights } from './appkit';
import { Ionicon } from './Ionicon';
import { AppButton, ConfirmDialog, PinnedFooter } from './teacher';

/**
 * The director's « Nouvelle annonce » (mobile_app/src/components/admin/
 * AnnouncementComposer.tsx), filled in: the header and its subtitle, the
 * « Message » section (title and content with their counters), the
 * « Destinataires » section (the audience tray, the class picker, the
 * recipients preview: the total, then one chip per role as the backend sorts
 * them), and « Envoyer l’annonce » pinned over the admin's tab bar. The
 * confirmation dialog opens over it.
 *
 * Title and content are the director's own words, shown as typed, in the
 * language they were written in.
 */

export type AnnouncementRole = 'parent' | 'student' | 'teacher';

export type AnnouncementDraft = {
  title: string;
  body: string;
  audience: 'school' | 'role' | 'class';
  /** The picked class's name, as the school named it. */
  className: string;
  /** The preview: the total and the breakdown, sorted by role (parent, student, teacher). */
  total: number;
  breakdown: { role: AnnouncementRole; count: number }[];
};

/** The header, the sections and the rows, in points: where a scene aims its camera and taps. */
export const COMPOSER = {
  /** The header's centre line. */
  header: 44 + 24,
  /** « Envoyer l’annonce »: the lg button over the tab pill (24 + 10 + 60 + 12 + 26). */
  send: 844 - 132,
  /** The dialog's « Envoyer », for a message of two lines (measured). */
  confirm: (rtl: boolean) => [pt(rtl ? 115 : 275), pt(530)] as const,
} as const;

/** The header's height: 12 + the title (18 pt) and the subtitle (12 pt) + 12. */
const COMPOSER_HEADER = 64;

/** A label and its counter over an input: « Titre » … « 26/120 ». */
const FieldHead: React.FC<{ label: string; count: string; top?: number }> = ({ label, count, top = 0 }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: pt(6), marginTop: pt(top) }}>
      <span style={{ fontSize: pt(13), fontWeight: w.medium, color: c.text }}>{label}</span>
      <span style={{ fontSize: pt(12), color: c.textSecondary, direction: 'ltr' }}>{count}</span>
    </div>
  );
};

/** The composer's inputs: card background, 1 pt border, 12 pt radius, 15 pt text. */
const Input: React.FC<{ children: React.ReactNode; minHeight?: number }> = ({ children, minHeight }) => {
  const { c } = useApp();
  return (
    <div
      style={{
        background: c.card,
        border: `${pt(1)}px solid ${c.border}`,
        borderRadius: pt(12),
        padding: `${pt(12)}px ${pt(14)}px`,
        fontSize: pt(15),
        lineHeight: 1.35,
        color: c.text,
        minHeight: minHeight ? pt(minHeight) : undefined,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

/** FormSection: a 17 pt semibold title, then its card. */
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: pt(8) }}>
      <div style={{ padding: `0 ${pt(4)}px`, fontSize: pt(17), fontWeight: w.semiBold, color: c.text }}>{title}</div>
      <Card>{children}</Card>
    </div>
  );
};

/** SegmentedControl, `filled`, with no margin of its own. */
const Segments: React.FC<{ labels: string[]; active: number }> = ({ labels, active }) => {
  const { c } = useApp();
  const w = useWeights();
  return (
    <div style={{ display: 'flex', background: c.surface, borderRadius: pt(12), padding: pt(3) }}>
      {labels.map((label, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: pt(44),
            padding: `${pt(8)}px ${pt(6)}px`,
            boxSizing: 'border-box',
            borderRadius: pt(10),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: i === active ? APP.brand[500] : 'transparent',
            color: i === active ? APP.white : c.textSecondary,
            fontSize: pt(14),
            fontWeight: i === active ? w.semiBold : w.medium,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

/** i18next's plural form of a counted noun. */
const counted = (forms: Bi<Record<string, string>>, lang: 'fr' | 'ar', count: number) => forms[lang][pluralKey(lang, count)] ?? forms[lang].other;

export const AnnouncementComposerScreen: React.FC<{
  draft: AnnouncementDraft;
  theme?: Theme;
  /** How far the form is scrolled, in points. */
  scroll?: number;
  sendPress?: number;
  /** 0 to 1: the confirmation dialog. */
  dialog?: number;
  confirmPress?: number;
}> = ({ draft, theme = 'light', scroll = 0, sendPress = 0, dialog = 0, confirmPress = 0 }) => {
  const bi = useBi();
  const a = ANNOUNCEMENT_COPY;
  return (
    <AppScreen theme={theme}>
      <Body draft={draft} scroll={scroll} />
      <PinnedFooter>
        <AppButton title={bi(a.send)} size="lg" icon="megaphone-outline" press={sendPress} />
      </PinnedFooter>
      <AdminTabBar />
      {dialog > 0 ? (
        <ConfirmDialog
          open={dialog}
          icon="megaphone-outline"
          title={bi(a.confirmTitle)}
          message={fill(bi(a.confirmMessage), { count: draft.total, audience: draft.className })}
          confirm={bi(a.confirmSend)}
          cancel={bi(TEACHER_COPY.cancel)}
          confirmPress={confirmPress}
        />
      ) : null}
    </AppScreen>
  );
};

const Body: React.FC<{ draft: AnnouncementDraft; scroll: number }> = ({ draft, scroll }) => {
  const bi = useBi();
  const { lang, rtl } = useLang();
  const { c } = useApp();
  const w = useWeights();
  const a = ANNOUNCEMENT_COPY;
  const audiences = ['school', 'role', 'class'] as const;
  return (
    <>
      {/* The header: back, « Nouvelle annonce », its subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', height: pt(COMPOSER_HEADER), boxSizing: 'border-box', padding: `${pt(12)}px ${pt(16)}px` }}>
        <div style={{ marginInlineEnd: pt(12), display: 'flex' }}>
          <Ionicon name={rtl ? 'arrow-forward' : 'arrow-back'} size={pt(24)} color={c.text} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: pt(18), fontWeight: w.semiBold, color: c.text }}>{bi(a.title)}</div>
          <div style={{ fontSize: pt(12), color: c.textSecondary, marginTop: pt(1) }}>{bi(a.subtitle)}</div>
        </div>
      </div>
      {/* The form scrolls under the header, clipped at its edge */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: pt(44 + COMPOSER_HEADER), bottom: 0, overflow: 'hidden' }}>
      <div style={{ padding: pt(16), display: 'flex', flexDirection: 'column', gap: pt(16), translate: `0px ${-pt(scroll)}px` }}>
        <FormSection title={bi(a.messageSection)}>
          <FieldHead label={bi(a.titleLabel)} count={`${draft.title.length}/120`} />
          <Input>{draft.title}</Input>
          <FieldHead label={bi(a.bodyLabel)} count={`${draft.body.length}/1000`} top={14} />
          <Input minHeight={120}>{draft.body}</Input>
        </FormSection>
        <FormSection title={bi(a.audienceSection)}>
          <Segments labels={audiences.map((k) => bi(a[`audience_${k}`]))} active={audiences.indexOf(draft.audience)} />
          {/* EntityPicker: the chosen class */}
          <div
            style={{
              marginTop: pt(14),
              display: 'flex',
              alignItems: 'center',
              minHeight: pt(48),
              padding: `${pt(12)}px ${pt(14)}px`,
              boxSizing: 'border-box',
              background: c.card,
              border: `${pt(1)}px solid ${c.border}`,
              borderRadius: pt(12),
            }}
          >
            <span style={{ flex: 1, fontSize: pt(15), fontWeight: w.medium, color: c.text }}>{draft.className}</span>
            <Ionicon name="chevron-down" size={pt(18)} color={c.textSecondary} />
          </div>
          {/* The recipients preview */}
          <div style={{ marginTop: pt(14), borderRadius: pt(12), background: c.surface, padding: pt(14) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: pt(8) }}>
              <Ionicon name="people-outline" size={pt(18)} color={APP.brand[500]} />
              <span style={{ fontSize: pt(13), fontWeight: w.semiBold, color: c.text }}>{bi(a.recipientsTitle)}</span>
            </div>
            <div style={{ marginTop: pt(6), fontSize: pt(22), fontWeight: w.bold, color: c.text }}>
              {draft.total}
              <span style={{ fontSize: pt(13), fontWeight: w.regular, color: c.textSecondary, whiteSpace: 'pre' }}>
                {'  '}
                {counted(a.recipientsUnit, lang, draft.total)}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: pt(6), marginTop: pt(8) }}>
              {draft.breakdown.map((g) => (
                <div key={g.role} style={{ padding: `${pt(4)}px ${pt(10)}px`, borderRadius: pt(8), background: c.card, fontSize: pt(12), color: c.textSecondary }}>
                  <span style={{ fontWeight: w.semiBold, color: c.text }}>{g.count}</span> {counted(a.roleCount[g.role], lang, g.count)}
                </div>
              ))}
            </div>
          </div>
        </FormSection>
      </div>
      </div>
    </>
  );
};

/** The admin's tab pill on a screen with no tab of its own: the wash on the first tab, nothing focused. */
export const AdminTabBar: React.FC = () => {
  const bi = useBi();
  return (
    <FloatingTabBar
      wash={0}
      items={[
        { label: bi(TABS.home), icon: 'logo', focused: false },
        { label: bi(TABS.people), icon: 'people-outline', focused: false },
        { label: bi(TABS.academics), icon: 'school-outline', focused: false },
        { label: bi(TABS.finance), icon: 'wallet-outline', focused: false },
        { label: bi(TABS.more), icon: 'ellipsis-horizontal', focused: false },
      ]}
    />
  );
};
