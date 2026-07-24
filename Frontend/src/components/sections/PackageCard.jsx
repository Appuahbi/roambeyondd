import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, MapPin, ArrowUpRight } from 'lucide-react'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'
import { formatPrice, truncate } from '../../utils/helpers'

export default function PackageCard({ pkg }) {
  const discount =
    pkg.discountPrice > 0
      ? Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100)
      : 0

  return (
    <Link to={`/packages/${pkg.slug}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/5"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-gold/10">
          {pkg.images?.[0]?.url ? (
            <img
              src={pkg.images[0].url}
              alt={pkg.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-12 w-12 text-primary/30" />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* View button on hover */}
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
            <ArrowUpRight className="h-4 w-4" />
          </div>

          {discount > 0 && (
            <div className="absolute left-3 top-3 rounded-lg bg-error px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              {discount}% OFF
            </div>
          )}
          {pkg.featured && (
            <div className="absolute right-3 top-3">
              <Badge color="gold">Featured</Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge color="secondary">{pkg.category}</Badge>
          </div>

          <h3 className="mb-1 font-display text-lg font-semibold text-ink transition-colors group-hover:text-primary">
            {pkg.title}
          </h3>

          <p className="mb-3 text-sm text-muted">
            {truncate(pkg.shortDescription, 80)}
          </p>

          <div className="mb-3 flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {pkg.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Max {pkg.maxGroupSize}
            </span>
          </div>

          {pkg.rating > 0 && (
            <div className="mb-3">
              <StarRating rating={pkg.rating} count={pkg.reviewsCount} />
            </div>
          )}

          <div className="flex items-baseline gap-2 border-t border-border pt-3">
            <span className="text-lg font-bold text-primary">
              {formatPrice(pkg.discountPrice || pkg.price)}
            </span>
            {pkg.discountPrice > 0 && (
              <span className="text-sm text-muted line-through">
                {formatPrice(pkg.price)}
              </span>
            )}
            <span className="ml-auto text-xs text-muted">/person</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
