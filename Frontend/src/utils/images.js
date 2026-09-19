// Curated travel image fallbacks (royalty-free Unsplash IDs)
const FALLBACKS = {
  default:
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80&auto=format&fit=crop',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80&auto=format&fit=crop',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80&auto=format&fit=crop',
  manali: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop',
  rajasthan: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80&auto=format&fit=crop',
  ladakh: 'https://images.unsplash.com/photo-1591019479261-1a103585c559?w=1200&q=80&auto=format&fit=crop',
  andaman: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&q=80&auto=format&fit=crop',
  darjeeling: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80&auto=format&fit=crop',
  shimla: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&q=80&auto=format&fit=crop',
  udaipur: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80&auto=format&fit=crop',
  kashmir: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=80&auto=format&fit=crop',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80&auto=format&fit=crop',
  trek: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80&auto=format&fit=crop',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80&auto=format&fit=crop',
};

const CLOUDINARY_MARKER = '/image/upload/';

const isCloudinaryOptimized = (url) => {
  const segment = url.split(CLOUDINARY_MARKER)[1] || '';
  return /^[^/]*w_/.test(segment);
};

/*
Appends Cloudinary on-the-fly transformation (width + auto quality/format).
q_auto/f_auto typically cut image payloads by 50-80% with no visible loss.
Already-optimized URLs are returned untouched.
*/
export const optimizedImage = (url, width = 800) => {
  if (!url || !url.includes(CLOUDINARY_MARKER) || isCloudinaryOptimized(url)) {
    return url;
  }
  return url.replace(
    CLOUDINARY_MARKER,
    `${CLOUDINARY_MARKER}w_${width},q_auto,f_auto/`
  );
};

export const srcSetFor = (url, widths = [400, 800, 1200]) => {
  if (!url || !url.includes(CLOUDINARY_MARKER)) return undefined;
  return widths
    .map((w) => `${optimizedImage(url, w)} ${w}w`)
    .join(', ');
};

export const imageFor = (item, kind = 'package') => {
  if (!item) return FALLBACKS.default;
  if (item.images?.length) {
    const first = item.images[0];
    if (first?.url) return optimizedImage(first.url);
  }
  if (item.featuredImage?.url) return optimizedImage(item.featuredImage.url);
  if (item.image) return optimizedImage(item.image);
  const key = (item.destination || item.title || '').toLowerCase().trim();
  for (const k of Object.keys(FALLBACKS)) {
    if (key.includes(k)) return FALLBACKS[k];
  }
  if (kind === 'blog') {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80&auto=format&fit=crop';
  }
  return FALLBACKS.default;
};

export const galleryFor = (item) => {
  if (!item) return [FALLBACKS.default];
  if (Array.isArray(item.images) && item.images.length) {
    return item.images.map((i) => optimizedImage(i.url, 1200)).filter(Boolean);
  }
  if (item.featuredImage?.url) return [optimizedImage(item.featuredImage.url, 1200)];
  return [imageFor(item)];
};
