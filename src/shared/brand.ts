import type { Bi } from './lang';

/**
 * The line every video signs with, over the logo: what a parent gets from
 * MauriSchool, in the video's voice (not app wording). *Starred* words are the
 * headline's accent. French puts a no-break space before the colon.
 */
export const BRAND_LINE: Bi = { fr: 'Notes, absences, paiements : *les parents savent*.', ar: 'الدرجات، الغياب، المدفوعات: *الأولياء يعلمون*.' };

/** Where a school asks for a demonstration: the team's WhatsApp line and the site. */
export const CONTACT = { whatsapp: '+222 33 08 25 42', site: 'maurischool.com' } as const;
