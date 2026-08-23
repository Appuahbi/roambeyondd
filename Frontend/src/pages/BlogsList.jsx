import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Search, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { blogApi, categoryApi } from '../api/endpoints';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import Skeleton from '../components/ui/Skeleton';
import Seo from '../components/seo/Seo';
import { formatDate } from '../utils/format';
import { useReveal } from '../hooks/useReveal';

export default function BlogsList() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, shown] = useReveal();
  const search = params.get('q') || '';
  const category = params.get('category') || '';

  useEffect(() => {
    categoryApi.blogList().then((r) => setCats(r?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 12 };
    if (search) params.search = search;
    if (category) params.category = category;
    blogApi.list(params)
      .then((r) => setBlogs(r?.data?.blogs || r?.data?.items || r?.data?.data || []))
      .finally(() => setLoading(false));
  }, [search, category]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <div className="bg-cream-gradient min-h-screen">
      <Seo title={t('blogs.title')} description={t('blogs.homeSubtitle')} path="/blogs" />
      <div className="section py-12">
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow justify-center">{t('blogs.eyebrow')}</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink-900">{t('blogs.title')}</h1>
          <p className="mt-2.5 text-ink-500">{t('blogs.homeSubtitle')}</p>
        </div>

        <div className="mt-8 max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder={t('blogs.searchPlaceholder')}
              className="input pl-11 h-12"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          <button onClick={() => setParam('category', '')} className={clsx('chip', !category && 'bg-brand-600 text-white')}>{t('blogs.all')}</button>
          {cats.map((c) => (
            <button key={c.name || c._id} onClick={() => setParam('category', c.name)} className={clsx('chip', category === c.name && 'bg-brand-600 text-white')}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="section pb-16" ref={ref}>
        {loading ? (
          <div className="grid lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-center text-ink-500 py-12">{t('blogs.noResults')}</p>
        ) : (
          <>
            {featured && !search && !category && (
              <Link to={`/blogs/${featured.slug}`} className={clsx('card card-hover block grid lg:grid-cols-2 overflow-hidden mb-10', shown ? 'animate-fade-up' : 'opacity-0')}>
                <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                  <ImageWithFallback item={featured} kind="blog" alt={featured.title} className="transition-transform duration-700 hover:scale-110" />
                </div>
                <div className="p-7 flex flex-col justify-center">
                  <span className="chip-brand self-start">{featured.category}</span>
                  <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink-900 hover:text-brand-700">{featured.title}</h2>
                  <p className="mt-3 text-ink-500 line-clamp-3">{featured.excerpt}</p>
                  <p className="mt-4 text-xs text-ink-500 inline-flex items-center gap-2"><Clock size={12} /> {formatDate(featured.publishedAt || featured.createdAt)}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">{t('blogs.readArticle')} <ArrowRight size={14} /></span>
                </div>
              </Link>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(search || category ? blogs : rest).map((b) => (
                <Link key={b._id} to={`/blogs/${b.slug}`} className="card card-hover overflow-hidden block">
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageWithFallback item={b} kind="blog" alt={b.title} className="transition-transform duration-700 hover:scale-110" />
                  </div>
                  <div className="p-5">
                    <span className="chip-brand">{b.category}</span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-ink-900 line-clamp-2 hover:text-brand-700">{b.title}</h3>
                    <p className="mt-2 text-sm text-ink-500 line-clamp-2">{b.excerpt}</p>
                    <p className="mt-3 text-xs text-ink-500 inline-flex items-center gap-2"><Clock size={12} /> {formatDate(b.publishedAt || b.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
