const LOGO_BASE = 'https://res.cloudinary.com/dqaec3439/image/upload';

/*
Brand lockup is a single white-on-transparent PNG (mountain mark + wordmark,
tagline baked in below). The source image is a tall vertical lockup where the
wordmark and tagline share a thin band, so the tagline cannot be cropped out —
both variants serve the whole lockup.
Both are optimized with q_auto/f_auto. The mark is white, so surfaces must
recolor it (CSS brightness-0 on light backgrounds; white as-is on dark).
*/
export const LOGO_WORDMARK =
  `${LOGO_BASE}/e_trim/w_500,q_auto,f_auto/v1785780593/roambeyondlogo_ivxlbl.png`;

export const LOGO_FULL =
  `${LOGO_BASE}/e_trim/w_500,q_auto,f_auto/v1785780593/roambeyondlogo_ivxlbl.png`;
