import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, Waves, Palmtree, Mountain, Castle, Snowflake, Fish, Leaf, Building, Flame, Compass } from 'lucide-react'
import { useGetPackagesQuery } from '../services/packagesService'
import AnimatedSection from '../components/ui/AnimatedSection'

const allDestinations = [
  { name: 'Goa', icon: Waves, tagline: 'Sun, Sand & Sea', description: 'India\'s smallest state packs a punch with golden beaches, vibrant nightlife, and Portuguese heritage.', color: 'from-cyan-500 to-blue-400' },
  { name: 'Kerala', icon: Palmtree, tagline: 'God\'s Own Country', description: 'Serene backwaters, lush hill stations, Ayurvedic retreats, and spice plantations.', color: 'from-emerald-500 to-green-400' },
  { name: 'Manali', icon: Mountain, tagline: 'Valley of Gods', description: 'Snow-capped peaks, ancient temples, and thrilling adventure sports in the Kullu Valley.', color: 'from-slate-500 to-blue-400' },
  { name: 'Rajasthan', icon: Castle, tagline: 'Land of Kings', description: 'Majestic palaces, golden deserts, colorful bazaars, and rich folk traditions.', color: 'from-amber-500 to-orange-400' },
  { name: 'Ladakh', icon: Snowflake, tagline: 'The Roof of the World', description: 'Otherworldly landscapes, ancient monasteries, and crystal-clear lakes.', color: 'from-indigo-500 to-purple-400' },
  { name: 'Andaman', icon: Fish, tagline: 'Tropical Paradise', description: 'Pristine white-sand beaches, vibrant coral reefs, and WWII history.', color: 'from-teal-500 to-cyan-400' },
  { name: 'Darjeeling', icon: Leaf, tagline: 'Queen of Hills', description: 'Misty tea gardens, the charming toy train, and Kanchenjunga views.', color: 'from-green-500 to-emerald-400' },
  { name: 'Shimla', icon: Mountain, tagline: 'Heart of Himachal', description: 'Colonial architecture, snow-covered peaks, and the lively Mall Road.', color: 'from-sky-500 to-blue-400' },
  { name: 'Varanasi', icon: Flame, tagline: 'Spiritual Capital', description: 'One of the world\'s oldest cities with mesmerizing Ganga aartis.', color: 'from-orange-500 to-amber-400' },
  { name: 'Udaipur', icon: Compass, tagline: 'City of Lakes', description: 'Romantic lakeside palaces, artistic heritage, and the Aravalli hills.', color: 'from-rose-500 to-pink-400' },
]

export default function DestinationsPage() {
  const { data } = useGetPackagesQuery()
  const packages = data?.data || []
  const getCount = (dest) => packages.filter((p) => p.destination?.toLowerCase() === dest.toLowerCase()).length

  return (
    <div className="bg-cream">
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1>Destinations</h1>
            <p className="mt-2 text-muted">Explore India's most incredible places</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {allDestinations.map((dest, i) => {
            const count = getCount(dest.name)
            return (
              <motion.div key={dest.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}>
                <Link to={`/packages?destination=${encodeURIComponent(dest.name)}`}
                  className="group block overflow-hidden rounded-xl border border-divider bg-white transition-all hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-1">
                  <div className={`relative h-40 bg-gradient-to-br ${dest.color} flex items-end p-5`}>
                    <dest.icon className="absolute right-4 top-4 h-10 w-10 text-white/30" />
                    <div>
                      <div className="mb-1 flex items-center gap-1 text-xs text-white/70"><MapPin className="h-3 w-3" /> India</div>
                      <h2 className="font-display text-2xl font-bold text-white">{dest.name}</h2>
                      <p className="text-sm text-white/80">{dest.tagline}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-3 text-sm text-muted line-clamp-2">{dest.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">{count} package{count !== 1 ? 's' : ''}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">Explore <ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
