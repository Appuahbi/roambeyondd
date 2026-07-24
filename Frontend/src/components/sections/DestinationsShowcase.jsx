import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Star, Waves, Palmtree, Mountain, Castle, Snowflake, Fish, Leaf } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const destinations = [
  { name: 'Goa', tagline: 'Sun, Sand & Sea', icon: Waves, packages: 'Beach resorts, water sports, nightlife', rating: 4.8, color: 'from-cyan-500 to-blue-400' },
  { name: 'Kerala', tagline: 'God\'s Own Country', icon: Palmtree, packages: 'Backwaters, hill stations, Ayurveda', rating: 4.9, color: 'from-emerald-500 to-green-400' },
  { name: 'Manali', tagline: 'Valley of Gods', icon: Mountain, packages: 'Snow peaks, adventure sports, temples', rating: 4.7, color: 'from-slate-500 to-blue-400' },
  { name: 'Rajasthan', tagline: 'Land of Kings', icon: Castle, packages: 'Palaces, deserts, folk culture', rating: 4.8, color: 'from-amber-500 to-orange-400' },
  { name: 'Ladakh', tagline: 'The Roof of the World', icon: Snowflake, packages: 'High passes, monasteries, lakes', rating: 4.9, color: 'from-indigo-500 to-purple-400' },
  { name: 'Andaman', tagline: 'Tropical Paradise', icon: Fish, packages: 'Snorkeling, pristine beaches, history', rating: 4.7, color: 'from-teal-500 to-cyan-400' },
  { name: 'Darjeeling', tagline: 'Queen of Hills', icon: Leaf, packages: 'Tea gardens, toy train, Kanchenjunga', rating: 4.6, color: 'from-green-500 to-emerald-400' },
  { name: 'Shimla', tagline: 'Heart of Himachal', icon: Mountain, packages: 'Colonial charm, snow activities, malls', rating: 4.5, color: 'from-sky-500 to-blue-400' },
]

export default function DestinationsShowcase() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -right-20 top-10 h-[250px] w-[250px] rounded-full bg-primary/[0.02] blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Destinations</p>
              <h2>Popular Destinations</h2>
            </div>
            <Link to="/packages" className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {destinations.map((dest, i) => (
            <motion.div key={dest.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}>
              <Link to={`/packages?destination=${encodeURIComponent(dest.name)}`}
                className="group block overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-1">
                <div className={`relative h-32 bg-gradient-to-br ${dest.color} p-4`}>
                  <dest.icon className="absolute right-4 top-4 h-8 w-8 text-white/30" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-1 text-xs text-white/60"><MapPin className="h-3 w-3" /> India</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-ink group-hover:text-primary">{dest.name}</h3>
                    <div className="flex items-center gap-0.5 text-xs"><Star className="h-3 w-3 fill-gold text-gold" /><span className="font-medium text-ink">{dest.rating}</span></div>
                  </div>
                  <p className="mb-2 text-sm font-medium text-primary/80">{dest.tagline}</p>
                  <p className="text-xs text-muted line-clamp-2">{dest.packages}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 sm:hidden scrollbar-none">
          {destinations.map((dest, i) => (
            <motion.div key={dest.name} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }} className="shrink-0">
              <Link to={`/packages?destination=${encodeURIComponent(dest.name)}`}
                className="block w-44 overflow-hidden rounded-xl border border-border bg-white">
                <div className={`flex h-20 items-center bg-gradient-to-br ${dest.color} px-4`}>
                  <dest.icon className="h-6 w-6 text-white/60" />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-bold text-ink">{dest.name}</h4>
                  <p className="text-xs text-muted">{dest.tagline}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/packages" className="inline-flex items-center gap-1 text-sm font-medium text-primary">View all destinations <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  )
}
