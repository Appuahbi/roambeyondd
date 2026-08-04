// Currency / Indian number formatter
export const formatINR = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-IN').format(n || 0);

export const formatDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const timeAgo = (d) => {
  if (!d) return '';
  const seconds = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  const intervals = [
    [31536000, 'year'],
    [2592000, 'month'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, label] of intervals) {
    const v = Math.floor(seconds / secs);
    if (v >= 1) return `${v} ${label}${v > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const discountPercent = (price, discount) => {
  if (!price || !discount || discount >= price) return 0;
  return Math.round(((price - discount) / price) * 100);
};
