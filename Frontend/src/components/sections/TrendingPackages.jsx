import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, Clock, Users, MapPin, Star, ArrowRight } from 'lucide-react'
import { useGetPackagesQuery } from '../../services/packagesService'
import AnimatedSection from '../ui/AnimatedSection'
import { formatPrice } from '../../utils/helpers'

export default function TrendingPackages() {
  const { data, isLoading } = useGetPackagesQuery()
  const packages = (data?.data || []).slice(0, 8)
  const scrollRef = useRef(null)
  const [wishlist, setWishlist] = useState({})
  const toggleWishlist = (id, e) => { e.preventDefault(); e.stopPropagation(); setWishlist((p) => ({ ...p, [id]: !p[id] })) }
  const scroll = (dir) => { scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' }) }

  if (isLoading || !packages.length) return null

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -right-20 top-20 h-[250px] w-[250px] rounded-full bg-gold/[0.03] blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Popular</p>
              <h2>Trending Packages</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => scroll(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted shadow-subtle transition-all hover:border-primary hover:text-primary hover:shadow-medium hover:-translate-y-0.5">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll(1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted shadow-subtle transition-all hover:border-primary hover:text-primary hover:shadow-medium hover:-translate-y-0.5">
                <ChevronRight className="h-4 w-4" />
              </button>
              <Link to="/packages" className="ml-2 hidden items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark sm:flex">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <div ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:px-6 lg:px-8"
        style={{ scrollSnapType: 'x mandatory' }}>
        {packages.map((pkg, i) => {
          const discount = pkg.discountPrice > 0 ? Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100) : 0
          return (
            <motion.div key={pkg._id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }} className="shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <Link to={`/packages/${pkg.slug}`}
                className="group block w-72 overflow-hidden rounded-xl border border-border bg-white shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20">
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/15 to-secondary/10">
                  {pkg.images?.[0]?.url ? (
                    <img src={pkg.images[0].url} alt={pkg.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><MapPin className="h-10 w-10 text-primary/20" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <motion.button onClick={(e) => toggleWishlist(pkg._id, e)} whileTap={{ scale: 0.7 }}
                    animate={wishlist[pkg._id] ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-subtle backdrop-blur-sm transition-all hover:bg-white hover:shadow-medium">
                    <Heart className={`h-4 w-4 transition-all ${wishlist[pkg._id] ? 'fill-error text-error scale-110' : 'text-muted'}`} />
                  </motion.button>
                  {discount > 0 && (
                    <div className="absolute left-3 top-3 rounded-lg bg-gradient-to-br from-error to-amber-700 px-2 py-0.5 text-[11px] font-bold text-white shadow-subtle">{discount}% OFF</div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-lg bg-white/92 px-2.5 py-0.5 text-[11px] font-medium text-primary backdrop-blur-sm shadow-subtle">{pkg.category}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="mb-1 font-display text-base font-semibold text-ink transition-colors group-hover:text-primary line-clamp-1">{pkg.title}</h3>
                  <div className="mb-2 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3" /> {pkg.destination}</div>
                  <div className="mb-3 flex items-center gap-3 text-[11px] text-muted">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {pkg.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Max {pkg.maxGroupSize}</span>
                    {pkg.rating > 0 && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-gold text-gold" /> {pkg.rating}</span>}
                  </div>
                  <div className="flex items-baseline gap-2 border-t border-border pt-3">
                    <span className="text-lg font-bold text-primary">{formatPrice(pkg.discountPrice || pkg.price)}</span>
                    {pkg.discountPrice > 0 && <span className="text-xs text-muted line-through">{formatPrice(pkg.price)}</span>}
                    <span className="ml-auto text-[11px] text-muted">/person</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
