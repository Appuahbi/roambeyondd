import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { formatINR } from '../../utils/format';
import { imageFor, optimizedImage } from '../../utils/images';

const DEST_FALLBACK_IMAGES = {
  Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80&auto=format&fit=crop',
  Kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80&auto=format&fit=crop',
  Manali: 'https://images.unsplash.com/photo-1626714324015-2c4db4ee7fde?w=800&q=80&auto=format&fit=crop',
  Ladakh: 'https://images.unsplash.com/photo-1591019479261-1a103585c559?w=800&q=80&auto=format&fit=crop',
  Rajasthan: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80&auto=format&fit=crop',
  Andaman: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80&auto=format&fit=crop',
  Darjeeling: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80&auto=format&fit=crop',
  Shimla: 'https://images.unsplash.com/photo-1626714324015-2c4db4ee7fde?w=800&q=80&auto=format&fit=crop',
  Varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80&auto=format&fit=crop',
  Udaipur: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80&auto=format&fit=crop',
  Kashmir: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=800&q=80&auto=format&fit=crop',
};

export default function DestinationCard({ dest, feature = false, className }) {
  const { t } = useTranslation();
  const imgSrc = optimizedImage(dest.image) || DEST_FALLBACK_IMAGES[dest.name] || imageFor({ destination: dest.name });
  const tourCount = dest.packageCount || 5;

  return (
    <Link
      to={`/packages?destination=${encodeURIComponent(dest.name)}`}
      className={clsx(
        'group relative h-full rounded-3xl overflow-hidden shadow-soft hover:shadow-lift transition-all duration-500 block bg-ink-900 border border-cream-200/50',
        className
      )}
    >
      <img
        src={imgSrc}
        alt={dest.name}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
        onError={(e) => { e.currentTarget.src = imageFor({ destination: dest.name }); }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />

      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 text-xs font-semibold">
          <MapPin size={12} className="text-cream-400" /> {t('destinations.tourCount', { count: tourCount })}
        </span>
      </div>

      <div className={clsx('absolute inset-0 flex flex-col justify-end text-white z-10', feature ? 'p-7' : 'p-5')}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-cream-300">
          {dest.state || 'India'}
        </p>
        <h3 className={clsx(
          'mt-1 font-display font-bold leading-tight group-hover:text-cream-200 transition-colors',
          feature ? 'text-3xl sm:text-4xl' : 'text-2xl'
        )}>
          {dest.name}
        </h3>

        {dest.tagline && (
          <p className={clsx('text-xs text-cream-100/85 mt-1 line-clamp-1', feature && 'sm:text-sm')}>{dest.tagline}</p>
        )}
        {feature && dest.description && (
          <p className="hidden sm:block text-sm text-cream-100/85 mt-2 line-clamp-2 max-w-md">{dest.description}</p>
        )}

        <div className={clsx('mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between', feature && 'mt-5')}>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-cream-200/80">{t('common.from')}</p>
            <p className="text-sm font-extrabold text-white">
              {formatINR(dest.minPrice || 8999)}
            </p>
          </div>

          <span className="h-8 w-8 rounded-full bg-white/20 group-hover:bg-brand-600 backdrop-blur-md grid place-items-center text-white transition-all">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
