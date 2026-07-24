import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Landmark, Mountain, Users, Heart, Building2, ArrowRight } from 'lucide-react'
import { useGetPackagesQuery } from '../services/packagesService'
import AnimatedSection from '../components/ui/AnimatedSection'

const categories = [
  { name: 'Domestic Tours', icon: Landmark, description: 'Discover the rich heritage and diverse culture of India. From ancient forts to modern cities.', highlights: ['Heritage sites', 'Cultural immersion', 'City tours', 'Food trails'], color: 'from-amber-500 to-orange-400' },
  { name: 'Trekking Expeditions', icon: Mountain, description: 'Challenge yourself with breathtaking treks through the Himalayas and beyond.', highlights: ['Himalayan trails', 'Camping', 'Summit treks', 'Nature walks'], color: 'from-emerald-500 to-green-400' },
  { name: 'Group Tours', icon: Users, description: 'Travel with friends, family, or like-minded adventurers. Shared experiences and lasting memories.', highlights: ['Family trips', 'Friends getaway', 'Social travel', 'Group discounts'], color: 'from-blue-500 to-cyan-400' },
  { name: 'Honeymoon Packages', icon: Heart, description: 'Begin your journey together with romantic getaways to India\'s most enchanting destinations.', highlights: ['Romantic stays', 'Private experiences', 'Scenic routes', 'Couples activities'], color: 'from-rose-500 to-pink-400' },
  { name: 'Corporate Tours', icon: Building2, description: 'Build stronger teams through travel. Team-building activities, conference venues, and luxury stays.', highlights: ['Team building', 'Conference venues', 'Luxury stays', 'Activity planning'], color: 'from-slate-500 to-gray-400' },
]

export default function CategoriesPage() {
  const { data, isLoading } = useGetPackagesQuery()
  const packages = data?.data || []
  const getCount = (cat) => packages.filter((p) => p.category === cat).length

  return (
    <div className="bg-cream">
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1>Tour Categories</h1>
            <p className="mt-2 text-muted">Browse our curated collection of tour types</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {categories.map((cat, i) => {
            const count = getCount(cat.name)
            return (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}>
                <Link to={`/packages?category=${encodeURIComponent(cat.name)}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-white transition-all hover:shadow-card-hover hover:border-primary/20">
                  <div className="flex flex-col sm:flex-row">
                    <div className={`flex items-center justify-center bg-gradient-to-br ${cat.color} p-8 sm:w-48`}>
                      <cat.icon className="h-10 w-10 text-white/80" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="mb-1 font-display text-xl font-bold text-ink group-hover:text-primary">{cat.name}</h2>
                          <p className="mb-3 text-sm text-muted max-w-xl">{cat.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {cat.highlights.map((h) => (
                              <span key={h} className="rounded-lg bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">{h}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <span className="text-sm font-semibold text-primary">{count} package{count !== 1 ? 's' : ''}</span>
                          <ArrowRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                      </div>
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
