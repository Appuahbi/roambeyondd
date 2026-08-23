import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CheckCircle2, MapPin } from 'lucide-react';

export default function ItineraryTimeline({ days = [], included = [] }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  if (!days.length) return null;
  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <ol className="lg:col-span-5 space-y-2">
        {days.map((d, i) => (
          <li key={i}>
            <button
              onClick={() => setActive(i)}
              className={clsx(
                'w-full text-left rounded-2xl p-4 border transition',
                i === active
                  ? 'border-brand-300 bg-brand-50 shadow-soft'
                  : 'border-cream-200 hover:border-brand-200 bg-white'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'h-9 w-9 grid place-items-center rounded-full text-sm font-bold shrink-0',
                  i === active ? 'bg-brand-600 text-white' : 'bg-cream-100 text-brand-800'
                )}>
                  D{d.day}
                </div>
                <div>
                  <p className="font-semibold text-ink-900 line-clamp-1">{d.title}</p>
                  <p className="text-xs text-ink-500 line-clamp-2">{d.description}</p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ol>
      <div className="lg:col-span-7 card p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-700">
          <MapPin size={12} /> {t('package.dayLabel', { day: days[active]?.day })}
        </div>
        <h3 className="mt-2 font-display text-2xl font-semibold text-ink-900">{days[active]?.title}</h3>
        <p className="mt-3 text-ink-700 leading-relaxed">{days[active]?.description}</p>
        {included.length > 0 && (
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {included.map((text) => (
              <Bullet key={text} text={text} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Bullet({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-700">
      <CheckCircle2 size={16} className="text-brand-600" />
      {text}
    </div>
  );
}
