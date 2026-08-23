import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import clsx from 'clsx';

export default function Testimonials() {
  const { t } = useTranslation();
  const TESTIMONIALS = [
    { name: 'Priya Sharma', place: t('testimonials.t1.place'), avatar: 'P', text: t('testimonials.t1.text'), rating: 5 },
    { name: 'Arjun Mehta', place: t('testimonials.t2.place'), avatar: 'A', text: t('testimonials.t2.text'), rating: 5 },
    { name: 'Neha Verma', place: t('testimonials.t3.place'), avatar: 'N', text: t('testimonials.t3.text'), rating: 5 },
    { name: 'Rohan Iyer', place: t('testimonials.t4.place'), avatar: 'R', text: t('testimonials.t4.text'), rating: 4 },
  ];
  const [i, setI] = useState(0);
  const pauseRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pauseRef.current) setI((v) => (v + 1) % TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(id);
  }, [TESTIMONIALS.length]);

  const go = (d) => setI((v) => (v + d + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section
      className="py-16 sm:py-20 bg-cream-gradient"
      onMouseEnter={() => (pauseRef.current = true)}
      onMouseLeave={() => (pauseRef.current = false)}
    >
      <div className="section">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">{t('testimonials.eyebrow')}</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-ink-900">{t('testimonials.title')}</h2>
        </div>

        <div className="mt-10 relative max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-soft p-8 sm:p-10">
            <Quote className="absolute -top-2 -left-2 text-cream-200" size={80} />
            <div className="relative">
              {TESTIMONIALS.map((tt, idx) => (
                <div
                  key={tt.name}
                  className={clsx(
                    'transition-all duration-500',
                    idx === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute inset-0 pointer-events-none'
                  )}
                >
                  <p className="text-lg sm:text-xl text-ink-700 leading-relaxed">“{tt.text}”</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-brand-600 text-white grid place-items-center font-bold">
                      {tt.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900">{tt.name}</p>
                      <p className="text-xs text-ink-500">{tt.place}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: tt.rating }).map((_, k) => (
                        <Star key={k} size={14} className="fill-cream-500 text-cream-500" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            <button onClick={() => go(-1)} className="h-10 w-10 grid place-items-center rounded-full bg-white hover:bg-cream-100 shadow-soft" aria-label={t('common.previous')}>
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  aria-label={t('common.slide', { n: k + 1 })}
                  className={clsx('h-2 rounded-full transition-all', k === i ? 'w-8 bg-brand-600' : 'w-2 bg-cream-200')}
                />
              ))}
            </div>
            <button onClick={() => go(1)} className="h-10 w-10 grid place-items-center rounded-full bg-white hover:bg-cream-100 shadow-soft" aria-label={t('common.next')}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
