import React, { createContext, useContext } from 'react';
import { OUTFIT, TAJAWAL } from './tokens';

export type Lang = 'fr' | 'ar';

type LangInfo = {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  /** Outfit for French, Tajawal for Arabic, as in the app. */
  font: string;
  rtl: boolean;
};

const info = (lang: Lang): LangInfo => ({
  lang,
  dir: lang === 'ar' ? 'rtl' : 'ltr',
  font: lang === 'ar' ? TAJAWAL : OUTFIT,
  rtl: lang === 'ar',
});

const LangContext = createContext<LangInfo>(info('fr'));

/**
 * One video, two cuts. Everything under this provider reads its language,
 * direction and font from here, so a scene never hardcodes either.
 */
export const LangProvider: React.FC<{ lang: Lang; children: React.ReactNode }> = ({ lang, children }) => (
  <LangContext.Provider value={info(lang)}>{children}</LangContext.Provider>
);

/** Lets one subtree switch language (the FR ⇄ AR flip scene). */
export const useLang = () => useContext(LangContext);

/** Pick the string for the current language. */
export type Bi<T = string> = { fr: T; ar: T };
export const useBi = () => {
  const { lang } = useLang();
  return <T,>(value: Bi<T>): T => value[lang];
};

/** Western digits with a thin-space thousands separator, as formatAmount does in the app. */
export const amount = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** "163 985 MRU", kept left-to-right inside Arabic text as formatCurrency does. */
export const Money: React.FC<{ value: number }> = ({ value }) => (
  <bdi dir="ltr" style={{ unicodeBidi: 'isolate' }}>
    {amount(value)} MRU
  </bdi>
);

/** formatPercentage: at most two decimals, no trailing zeros. */
export const percent = (n: number) => `${Math.round(n * 100) / 100}%`;

/** formatMonthShort: the short month name in the app's locale. */
export const monthShort = (month: number, lang: Lang) =>
  new Date(2000, month - 1, 15).toLocaleDateString(lang === 'ar' ? 'ar' : 'fr-FR', { month: 'short' });
