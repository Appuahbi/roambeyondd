import { Helmet } from 'react-helmet-async';
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from '../../utils/branding';

/*
Per-page SEO manager. Renders title, meta description, canonical URL, Open
Graph + Twitter cards and JSON-LD structured data into <head>.
*/
export default function Seo({
  title,
  description,
  path = '/',
  ogType = 'website',
  ogImage,
  noindex = false,
  jsonLd,
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL.replace(/\/$/, '');
  const url = `${origin}${path === '/' ? '/' : path}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;
  const fallbackDesc = description || SITE_TAGLINE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fallbackDesc} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fallbackDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fallbackDesc} />

      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
