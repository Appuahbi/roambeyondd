import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Mountain, Palmtree, Castle, TreePine, Leaf, Bug } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { useGetPackagesQuery } from '../../services/packagesService'

const regions = [
  { id: 'north', name: 'North India', states: 'Himachal, Uttarakhand, Kashmir, Ladakh', icon: Mountain, destinations: ['Manali', 'Shimla', 'Ladakh', 'Kashmir', 'Rishikesh', 'Mussoorie'] },
  { id: 'south', name: 'South India', states: 'Kerala, Tamil Nadu, Karnataka, Goa', icon: Palmtree, destinations: ['Kerala', 'Goa', 'Ooty', 'Coorg', 'Munnar', 'Alleppey'] },
  { id: 'west', name: 'West India', states: 'Rajasthan, Gujarat, Maharashtra', icon: Castle, destinations: ['Rajasthan', 'Udaipur', 'Jaipur', 'Jodhpur'] },
  { id: 'east', name: 'East India', states: 'West Bengal, Sikkim, Odisha', icon: TreePine, destinations: ['Darjeeling', 'Sikkim', 'Puri'] },
  { id: 'northeast', name: 'Northeast India', states: 'Assam, Meghalaya, Manipur', icon: Leaf, destinations: ['Meghalaya', 'Assam', 'Shillong'] },
  { id: 'central', name: 'Central India', states: 'Madhya Pradesh, Chhattisgarh', icon: Bug, destinations: ['Jim Corbett', 'Bandhavgarh'] },
]

export default function IndiaMap() {
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const { data } = useGetPackagesQuery()
  const packages = data?.data || []
  const getCount = (region) => packages.filter((p) => region.destinations.some((d) => p.destination?.toLowerCase().includes(d.toLowerCase()))).length

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -right-20 top-10 h-[300px] w-[300px] rounded-full bg-primary/[0.03] blur-[80px]" />
        <div className="animate-blob-alt absolute -bottom-20 left-10 h-[250px] w-[250px] rounded-full bg-secondary/[0.04] blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Explore India</p>
          <h2>Choose Your Region</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">Click a region to discover packages from that part of India</p>
        </AnimatedSection>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {regions.map((region, i) => {
            const count = getCount(region)
            const isHovered = hoveredRegion === region.id
            const Icon = region.icon
            return (
              <motion.div key={region.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHoveredRegion(region.id)} onMouseLeave={() => setHoveredRegion(null)}>
                <Link to={`/packages?destination=${encodeURIComponent(region.name)}`}
                  className={`group relative block overflow-hidden rounded-xl border-2 p-5 text-center transition-all duration-300 ${
                    isHovered ? 'border-primary shadow-[0_8px_30px_rgba(47,82,51,0.15)] bg-white -translate-y-2' : 'border-border shadow-subtle hover:border-primary/30 hover:shadow-medium hover:-translate-y-0.5'
                  }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-[0.06]' : ''}`} />
                  <div className="relative">
                    <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light transition-all duration-300 ${isHovered ? 'scale-110 shadow-medium' : ''}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-ink group-hover:text-primary">{region.name}</h3>
                    <p className="mb-2 text-xs text-muted">{region.states}</p>
                    <span className="inline-block rounded-lg bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary">{count} packages</span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {hoveredRegion && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="mt-4 hidden sm:block">
            {(() => {
              const region = regions.find((r) => r.id === hoveredRegion)
              if (!region) return null
              return (
                <div className="mx-auto max-w-md rounded-xl border border-border bg-white/90 p-4 shadow-medium backdrop-blur-md">
                  <p className="mb-2 text-xs font-semibold text-primary">{region.name} — Popular Destinations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {region.destinations.map((d) => (
                      <Link key={d} to={`/packages?destination=${encodeURIComponent(d)}`}
                        className="rounded-lg border border-border bg-cream/50 px-2.5 py-1 text-xs font-medium text-ink transition-all hover:border-primary hover:bg-primary/5 hover:text-primary">
                        <MapPin className="mr-1 inline h-3 w-3" />{d}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </div>
    </section>
  )
}
