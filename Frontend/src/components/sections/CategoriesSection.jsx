import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Mountain, Users, Heart, Briefcase, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { categoryApi } from '../../api/endpoints';
import { useReveal } from '../../hooks/useReveal';
import { CAT_KEY } from '../../utils/categories';

const FALLBACK = [
  {
    name: 'Domestic Tours',
    icon: Compass,
    description: 'Discover rich culture, ancient heritage, and hidden gems across India.',
    highlights: ['Heritage Stays', 'Cultural Immersion'],
    color: 'bg-brand-50 text-brand-800 border-brand-200',
  },
  {
    name: 'Trekking Expeditions',
    icon: Mountain,
    description: 'Breathtaking high-altitude summit trails and wilderness camping.',
    highlights: ['Himalayan Passes', 'Expert Guides'],
    color: 'bg-cream-100 text-brand-800 border-cream-300',
  },
  {
    name: 'Group Tours',
    icon: Users,
    description: 'Travel with like-minded adventurers with seamless coordination.',
    highlights: ['Family Friendly', 'Group Discounts'],
    color: 'bg-brand-100 text-brand-900 border-brand-300',
  },
  {
    name: 'Honeymoon Packages',
    icon: Heart,
    description: 'Romantic handpicked getaways, candlelit dinners & private stays.',
    highlights: ['Romantic Villas', 'Private Transfer'],
    color: 'bg-cream-50 text-brand-700 border-brand-200',
  },
  {
    name: 'Corporate Tours',
    icon: Briefcase,
    description: 'Corporate retreats, team building offsites & luxury workcations.',
    highlights: ['Team Offsites', 'Custom Itineraries'],
    color: 'bg-brand-50 text-brand-900 border-cream-300',
  },
];

const ICON_MAP = {
  'Domestic Tours': Compass,
  'Trekking Expeditions': Mountain,
  'Group Tours': Users,
  'Honeymoon Packages': Heart,
  'Corporate Tours': Briefcase,
};

export default function CategoriesSection() {
  const { t } = useTranslation();
  const [cats, setCats] = useState(FALLBACK);
  const [ref, shown] = useReveal();

  useEffect(() => {
    categoryApi
      .list()
      .then((r) => {
        if (Array.isArray(r?.data) && r.data.length) {
          setCats(
            r.data.map((c, i) => ({
              ...c,
              icon: ICON_MAP[c.name] || Compass,
              color: FALLBACK[i % FALLBACK.length].color,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const localize = (c) => {
    const k = CAT_KEY[c.name];
    if (!k) return c;
    return {
      ...c,
      name: t(`categories.${k}.name`),
      description: t(`categories.${k}.description`),
      highlights: [t(`categories.${k}.h1`), t(`categories.${k}.h2`)],
    };
  };

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-cream-gradient relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-200/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-cream-300/40 blur-3xl pointer-events-none" />

      <div className="section relative">
        <SectionHeader
          eyebrow={t('categories.eyebrow')}
          title={t('categories.title')}
          subtitle={t('categories.subtitle')}
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {cats.map((c, i) => {
            const Icon = c.icon || ICON_MAP[c.name] || Compass;
            const loc = localize(c);
            return (
              <Link
                key={c.name}
                to={`/packages?category=${encodeURIComponent(c.name)}`}
                className={clsx(
                  'group card card-hover p-6 relative overflow-hidden flex flex-col justify-between border border-cream-200/90 hover:border-brand-300 bg-white/90 backdrop-blur-sm',
                  shown ? 'animate-fade-up' : 'opacity-0'
                )}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand-50/60 group-hover:bg-brand-100/80 transition-all duration-300 group-hover:scale-125" />

                <div className="relative z-10">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cream-100 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-soft">
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-5 font-display text-lg font-bold text-ink-900 group-hover:text-brand-800 transition-colors">
                    {loc.name}
                  </h3>

                  <p className="mt-2 text-xs text-ink-500 leading-relaxed line-clamp-3">
                    {loc.description}
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-cream-100">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(loc.highlights || []).slice(0, 2).map((h) => (
                      <span key={h} className="chip bg-cream-50 border border-cream-200/80 text-[11px]">
                        {h}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 group-hover:text-brand-900 group-hover:translate-x-1 transition-all">
                    {t('categories.browse')} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, center = true, light = false }) {
  return (
    <div className={clsx('max-w-3xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2', light ? 'bg-white/10 text-cream-200' : 'bg-brand-50 text-brand-800 border border-brand-200/60')}>
          {eyebrow}
        </span>
      )}
      <h2 className={clsx('font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight', light ? 'text-cream-50' : 'text-ink-900')}>
        {title}
      </h2>
      {subtitle && (
        <p className={clsx('mt-3 text-base sm:text-lg font-normal leading-relaxed', light ? 'text-cream-100/85' : 'text-ink-500')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

