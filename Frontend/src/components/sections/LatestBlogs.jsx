import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock } from 'lucide-react';
import clsx from 'clsx';
import { blogApi } from '../../api/endpoints';
import { formatDate } from '../../utils/format';
import ImageWithFallback from '../ui/ImageWithFallback';
import { SectionHeader } from './CategoriesSection';
import { useReveal } from '../../hooks/useReveal';

export default function LatestBlogs() {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState([]);
  const [ref, shown] = useReveal();
  useEffect(() => {
    blogApi.list({ limit: 3 }).then((r) => setBlogs(r?.data?.blogs || r?.data?.items || r?.data?.data || [])).catch(() => {});
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="section">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <SectionHeader
            eyebrow={t('blogs.eyebrow')}
            title={t('blogs.homeTitle')}
            subtitle={t('blogs.homeSubtitle')}
            center={false}
          />
          <Link to="/blogs" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
            {t('blogs.allArticles')} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map((b, i) => (
            <Link
              key={b._id}
              to={`/blogs/${b.slug}`}
              className={clsx('card card-hover overflow-hidden block', shown ? 'animate-fade-up' : 'opacity-0')}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback item={b} kind="blog" alt={b.title} className="transition-transform duration-700 hover:scale-110" />
                <div className="absolute top-3 left-3">
                  <span className="chip-brand">{b.category}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-ink-500 inline-flex items-center gap-2">
                  <Clock size={12} /> {formatDate(b.publishedAt || b.createdAt)}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink-900 line-clamp-2 hover:text-brand-700">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-ink-500 line-clamp-2">{b.excerpt}</p>
              </div>
            </Link>
          ))}
          {blogs.length === 0 && (
            <p className="text-sm text-ink-500 col-span-full text-center py-8">{t('blogs.comingSoon')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
