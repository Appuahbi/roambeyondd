import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Waves, Mountain, Palmtree, Castle, Leaf, TreePine } from 'lucide-react'
import { useGetPackagesQuery } from '../services/packagesService'
import PackageFilters, { filterPackages } from '../components/sections/PackageFilters'
import PackageCard from '../components/sections/PackageCard'
import AnimatedSection from '../components/ui/AnimatedSection'
import { SkeletonList } from '../components/ui/Skeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import EmptyState from '../components/ui/EmptyState'

const DESTINATIONS = [
  { name: 'Goa', icon: Waves, gradient: 'from-cyan-500 to-blue-400' },
  { name: 'Kerala', icon: Palmtree, gradient: 'from-emerald-500 to-green-400' },
  { name: 'Manali', icon: Mountain, gradient: 'from-slate-500 to-blue-400' },
  { name: 'Rajasthan', icon: Castle, gradient: 'from-amber-500 to-orange-400' },
  { name: 'Ladakh', icon: Mountain, gradient: 'from-indigo-500 to-purple-400' },
  { name: 'Andaman', icon: Waves, gradient: 'from-teal-500 to-cyan-400' },
]

export default function PackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    destination: searchParams.get('destination') || '',
    sort: 'newest',
  })

  const { data, isLoading, isError, error } = useGetPackagesQuery()
  const filteredPackages = useMemo(() => {
    if (!data?.data) return []
    return filterPackages(data.data, filters)
  }, [data, filters])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    if (newFilters.category) searchParams.set('category', newFilters.category)
    else searchParams.delete('category')
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <div className="bg-cream">
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h1>Tour Packages</h1>
            <p className="mt-2 text-muted">Find the perfect tour for your next adventure</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Popular Destinations</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {DESTINATIONS.map((dest) => (
              <button key={dest.name}
                onClick={() => setFilters({ ...filters, destination: filters.destination === dest.name ? '' : dest.name })}
                className={`group flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  filters.destination === dest.name
                    ? 'bg-primary text-white shadow-medium'
                    : 'bg-white text-ink border border-border shadow-subtle hover:border-primary/30 hover:shadow-medium'
                }`}>
                <dest.icon className="h-4 w-4" />
                {dest.name}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <PackageFilters packages={data?.data || []} activeFilters={filters} onFilterChange={handleFilterChange} />

        <p className="mb-4 text-sm text-muted">
          {isLoading ? 'Loading...' : `Showing ${filteredPackages.length} package${filteredPackages.length !== 1 ? 's' : ''}`}
        </p>

        {isLoading && <SkeletonList count={6} />}
        {isError && <ErrorMessage message={error?.data?.message || 'Failed to load packages'} />}
        {!isLoading && filteredPackages.length === 0 && (
          <EmptyState title="No packages found" description="Try adjusting your filters or check back later for new tours." />
        )}

        {filteredPackages.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((pkg, i) => (
              <motion.div key={pkg._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}>
                <PackageCard pkg={pkg} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
