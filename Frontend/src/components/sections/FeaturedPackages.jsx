import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { packageApi } from '../../api/endpoints';
import PackageCard from './PackageCard';
import Skeleton from '../ui/Skeleton';
import { SectionHeader } from './CategoriesSection';

function usePerPage() {
  const [perPage, setPerPage] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerPage(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return perPage;
}

export default function FeaturedPackages({ title, eyebrow, subtitle, featured = true }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const perPage = usePerPage();
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  const heading = {
    title: title || t('home.featuredTitle'),
    eyebrow: eyebrow || t('home.featuredEyebrow'),
    subtitle: subtitle || t('home.featuredSubtitle'),
  };

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  useEffect(() => {
    setLoading(true);
    packageApi.list({ limit: 12, featured: featured ? 'true' : undefined, sort: 'popular' })
      .then((r) => setItems(r?.data?.items || r?.data?.packages || r?.data?.data || []))
      .finally(() => setLoading(false));
  }, [featured]);

  useEffect(() => {
    setIndex((i) => (totalPages > 1 ? Math.min(i, totalPages) : 0));
  }, [totalPages]);

  useEffect(() => {
    if (!animate) {
      const raf = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [animate]);

  useEffect(() => {
    if (index !== totalPages) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 600);
    return () => clearTimeout(t);
  }, [index, totalPages]);

  useEffect(() => {
    if (paused || totalPages <= 1 || items.length === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i < totalPages ? i + 1 : i));
    }, 2000);
    return () => clearInterval(t);
  }, [index, paused, totalPages, items.length]);

  const pages = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  const track = totalPages > 1 ? [...pages, pages[0]] : pages;
  const activePage = index === totalPages ? 0 : index;

  const next = () => setIndex((i) => Math.min(i + 1, totalPages));
  const prev = () => setIndex((i) => (i === 0 ? Math.max(0, totalPages - 1) : i - 1));

  const onTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (index === totalPages) {
      setAnimate(false);
      setIndex(0);
    }
  };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -40) next();
    else if (delta > 40) prev();
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="section">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <SectionHeader
            eyebrow={heading.eyebrow}
            title={heading.title}
            subtitle={heading.subtitle}
            center={false}
          />
          <div className="flex items-center gap-2">
            <Link to="/packages" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
              {t('common.viewAll')} <ArrowRight size={14} />
            </Link>
            {totalPages > 1 && (
              <div className="hidden md:flex gap-1.5">
                <button
                  onClick={prev}
                  aria-label={t('common.previousPage')}
                  className="h-10 w-10 grid place-items-center rounded-full bg-cream-100 hover:bg-cream-200 text-ink-900"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  aria-label={t('common.nextPage')}
                  className="h-10 w-10 grid place-items-center rounded-full bg-cream-100 hover:bg-cream-200 text-ink-900"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: perPage }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-10 text-sm text-ink-500 text-center py-8">{t('home.noFeatured')}</p>
        ) : (
          <div
            className="relative mt-8 overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className={clsx('flex', animate ? 'transition-transform duration-500 ease-out' : 'transition-none')}
              style={{ transform: `translateX(-${index * 100}%)` }}
              onTransitionEnd={onTransitionEnd}
            >
              {track.map((pageItems, i) => (
                <div key={i} className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-px">
                  {pageItems.map((p) => (
                    <PackageCard key={p._id} pkg={p} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={t('common.goToPage', { page: i + 1 })}
                aria-current={activePage === i ? 'true' : undefined}
                className={clsx(
                  'h-2.5 rounded-full transition-all duration-300',
                  activePage === i ? 'w-8 bg-brand-600' : 'w-2.5 bg-cream-300 hover:bg-brand-300'
                )}
              />
            ))}
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Link to="/packages" className="btn-secondary">{t('home.viewAllTours')}</Link>
        </div>
      </div>
    </section>
  );
}
