import { createContext, useContext } from 'react';

/**
 * Whether this subtree may play sound. The sped-up cuts play the picture
 * silently at 1.3–1.4× and lay a pitch-preserving time-stretched mix on top
 * (see PromoFast.tsx), so voice, music and effects must all go quiet inside.
 */
export const SoundContext = createContext({ silent: false });
export const useSilent = () => useContext(SoundContext).silent;
