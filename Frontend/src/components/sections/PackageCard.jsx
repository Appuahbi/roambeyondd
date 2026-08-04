import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Sparkles, ArrowRight } from 'lucide-react';
import Rating from '../ui/Rating';
import Heart from '../ui/Heart';
import ImageWithFallback from '../ui/ImageWithFallback';
import { formatINR, discountPercent } from '../../utils/format';

export default function PackageCard({ pkg, compact = false }) {
  if (!pkg) return null;
  const id = pkg._id || pkg.id;
  const slug = pkg.slug;
  if (!slug) return null;
  const off = discountPercent(pkg.price, pkg.discountPrice);

  return (
    <Link
      to={`/packages/${slug}`}
      className="card card-hover group block overflow-hidden bg-white rounded-3xl border border-cream-200/90 shadow-soft transition-all duration-300 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-cream-100">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
          <ImageWithFallback item={pkg} alt={pkg.title} kind="package" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-black/20" />

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          {pkg.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream-300 text-ink-900 text-[11px] font-bold shadow-sm">
              <Sparkles size={11} className="text-brand-700" /> Featured
            </span>
          )}
          {off > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-700 text-white text-[11px] font-bold shadow-sm">
              {off}% OFF
            </span>
          )}
        </div>

        <div className="absolute top-3.5 right-3.5 z-10">
          <Heart packageId={id} />
        </div>

        <div className="absolute bottom-3.5 left-3.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 text-xs font-semibold">
            {pkg.category || 'Tour'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-brand-700 flex items-center gap-1">
              <MapPin size={13} className="text-brand-600" /> {pkg.destination}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold leading-snug text-ink-900 line-clamp-1 group-hover:text-brand-800 transition-colors">
              {pkg.title}
            </h3>
          </div>
          <div className="shrink-0 pt-0.5">
            <Rating value={pkg.rating || 4.8} />
          </div>
        </div>

        {!compact && (
          <p className="mt-2 text-xs text-ink-500 leading-relaxed line-clamp-2">
            {pkg.shortDescription}
          </p>
        )}

        <div className="mt-3.5 flex items-center gap-4 text-xs font-medium text-ink-500 border-t border-cream-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-ink-700">
            <Clock size={14} className="text-brand-600" /> {pkg.duration}
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-700">
            <Users size={14} className="text-brand-600" /> Max {pkg.maxGroupSize || 12}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between pt-2">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Starting from</p>
            {off > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-brand-800">{formatINR(pkg.discountPrice)}</span>
                <span className="text-xs text-ink-400 line-through">{formatINR(pkg.price)}</span>
              </div>
            ) : (
              <span className="text-xl font-extrabold text-brand-800">{formatINR(pkg.price)}</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-800 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-all">
            Explore <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

