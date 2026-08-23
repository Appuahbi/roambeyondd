import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../../hooks/useReveal';
import { statsApi } from '../../api/endpoints';
import { Users, MapPin, Star, HeartHandshake } from 'lucide-react';

const DEFAULTS = { packagesCount: 180, destinationsCount: 45, blogCount: 62, averageRating: 4.9 };

export default function StatsBar() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(DEFAULTS);
  const [ref, inView] = useInView();

  useEffect(() => {
    statsApi
      .public()
      .then((r) => {
        if (r?.data) {
          setStats({
            packagesCount: r.data.packagesCount || DEFAULTS.packagesCount,
            destinationsCount: r.data.destinationsCount || DEFAULTS.destinationsCount,
            blogCount: r.data.blogCount || DEFAULTS.blogCount,
            averageRating: r.data.averageRating || DEFAULTS.averageRating,
          });
        }
      })
      .catch(() => {});
  }, []);

  const items = [
    { icon: MapPin, value: stats.destinationsCount, label: t('stats.destinations'), sub: t('stats.destinationsSub') },
    { icon: Users, value: stats.packagesCount, label: t('stats.packages'), sub: t('stats.packagesSub') },
    { icon: Star, value: stats.averageRating, label: t('stats.rating'), suffix: ' ★', sub: t('stats.ratingSub') },
    { icon: HeartHandshake, value: 99, label: t('stats.satisfaction'), suffix: '%', sub: t('stats.satisfactionSub') },
  ];

  return (
    <section ref={ref} className="relative -mt-10 sm:-mt-14 z-20">
      <div className="section">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 rounded-3xl bg-white shadow-lift border border-cream-200/80 p-5 sm:p-7 backdrop-blur-xl">
          {items.map((it, idx) => (
            <StatItem key={it.label} {...it} active={inView} isLast={idx === items.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatItem({ icon: Icon, value, label, suffix, sub, active, isLast }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const dur = 1400;
    const from = 0;
    const to = Number(value) || 0;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value]);

  const display = Number.isInteger(value) ? Math.round(n) : n.toFixed(1);

  return (
    <div className={`flex items-start gap-4 p-2 relative ${!isLast ? 'lg:border-r lg:border-cream-200/80' : ''}`}>
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 border border-brand-100 text-brand-700 shrink-0 shadow-sm">
        <Icon size={22} />
      </div>
      <div>
        <p className="font-display text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
          {display}
          <span className="text-brand-600 font-bold">{suffix || ''}</span>
        </p>
        <p className="text-xs font-bold text-ink-900 mt-0.5">{label}</p>
        <p className="text-[11px] text-ink-500">{sub}</p>
      </div>
    </div>
  );
}

