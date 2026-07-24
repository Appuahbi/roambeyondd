import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mountain, Waves, TreePalm, Church, Castle, Tent, Ship, Heart, Gem } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'
import { useGetPackagesQuery } from '../../services/packagesService'

const categoryData = [
  { name: 'Hill Stations', icon: Mountain, description: 'Misty peaks & cool retreats' },
  { name: 'Beaches', icon: Waves, description: 'Sun, sand & coastal vibes' },
  { name: 'Wildlife & Nature', icon: TreePalm, description: 'Safari & ecological wonders' },
  { name: 'Pilgrimage & Spiritual', icon: Church, description: 'Sacred journeys & temples' },
  { name: 'Heritage & Forts', icon: Castle, description: 'Royal history & architecture' },
  { name: 'Adventure', icon: Tent, description: 'Trekking, rafting & more' },
  { name: 'Backwaters & Islands', icon: Ship, description: 'Lagoons & tropical escapes' },
  { name: 'Honeymoon', icon: Heart, description: 'Romantic getaways for two' },
  { name: 'Offbeat & Hidden Gems', icon: Gem, description: 'Unexplored & unique trails' },
]

export default function CategoriesSection() {
  const { data } = useGetPackagesQuery()
  const packages = data?.data || []
  const getCount = (cat) => packages.filter((p) => p.category === cat).length

  return (
    <section className="relative overflow-hidden bg-cream-light py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute left-1/4 top-0 h-[200px] w-[200px] rounded-full bg-primary/[0.02] blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Browse by Type</p>
          <h2>Tour Categories</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted">Find the perfect trip that matches your style</p>
        </AnimatedSection>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-9">
          {categoryData.map((cat, i) => {
            const count = getCount(cat.name)
            return (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}>
                <Link to={`/packages?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col items-center rounded-xl border border-border bg-white p-4 text-center shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-card-hover hover:-translate-y-1">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-white shadow-subtle transition-all duration-300 group-hover:scale-110 group-hover:shadow-medium">
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-xs font-bold text-ink group-hover:text-primary leading-tight">{cat.name}</h3>
                  <p className="mb-2 text-[11px] text-muted leading-tight">{cat.description}</p>
                  <span className="rounded-lg bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">{count}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
