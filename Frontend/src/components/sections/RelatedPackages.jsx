import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { formatPrice } from '../../utils/helpers'

export default function RelatedPackages({ packages = [], currentSlug = '' }) {
  const related = packages.filter((p) => p.slug !== currentSlug).slice(0, 4)

  if (!related.length) return null

  return (
    <section>
      <AnimatedSection>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">
            You May Also Like
          </h2>
          <Link
            to="/packages"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AnimatedSection>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((pkg, i) => (
          <motion.div
            key={pkg._id || pkg.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/packages/${pkg.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                {pkg.images?.[0]?.url ? (
                  <img
                    src={pkg.images[0].url}
                    alt={pkg.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary/20" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="mb-1 text-sm font-semibold text-ink transition-colors group-hover:text-primary line-clamp-1">
                  {pkg.title}
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(pkg.discountPrice || pkg.price)}
                  </span>
                  <span className="text-xs text-muted">/person</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
