import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Compass } from 'lucide-react';
import { destinationApi } from '../api/endpoints';
import { useReveal } from '../hooks/useReveal';
import DestinationCard from '../components/sections/DestinationCard';
import Seo from '../components/seo/Seo';
import clsx from 'clsx';

export default function Destinations() {
  const { t } = useTranslation();
  const [dests, setDests] = useState([]);
  const [q, setQ] = useState('');
  const [ref, shown] = useReveal();
  useEffect(() => {
    destinationApi.list().then((r) => setDests(r?.data || [])).catch(() => {});
  }, []);

  const filtered = dests.filter((d) => !q || d.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="bg-cream-gradient min-h-screen">
      <Seo title={t('destinations.title')} description={t('destinations.homeSubtitle')} path="/destinations" />
      <div className="section py-12 text-center max-w-2xl mx-auto">
        <p className="eyebrow justify-center">{t('destinations.eyebrow')}</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink-900">{t('destinations.title')}</h1>
        <p className="mt-2.5 text-ink-500">{t('destinations.homeSubtitle')}</p>
        <div className="mt-6 relative max-w-md mx-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('destinations.searchPlaceholder')}
            className="input pl-11 h-12 rounded-full"
          />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-400">
          {t('destinations.count', { count: filtered.length })}
        </p>
      </div>

      <div className="section pb-16" ref={ref}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-cream-100 text-brand-700">
              <Compass size={28} />
            </div>
            <p className="mt-4 text-ink-500">{t('destinations.noResults')}</p>
          </div>
        ) : (
          <div className={clsx('grid sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-[14rem] sm:auto-rows-[17rem] lg:auto-rows-[20rem]', shown ? 'animate-fade-up' : 'opacity-0')}>
            {filtered.map((d) => (
              <DestinationCard key={d.name} dest={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
