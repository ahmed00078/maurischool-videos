/** Frame sizes the videos are made in. Reels, TikTok, Shorts and WhatsApp Status are all portrait. */
export const PORTRAIT = { width: 1080, height: 1920 } as const;
export const LANDSCAPE = { width: 1920, height: 1080 } as const;
/** A feed post (Facebook, Instagram): 4:5, the tallest a feed shows whole. */
export const POST = { width: 1080, height: 1350 } as const;
