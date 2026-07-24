import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, MapPin, Tag, DollarSign, Clock, ArrowUpDown } from 'lucide-react'
import Button from '../ui/Button'
import { CATEGORIES } from '../../utils/constants'

function extractDestinations(packages) {
  const dests = new Set()
  packages.forEach((p) => { if (p.destination) dests.add(p.destination) })
  return [...dests].sort()
}

export default function PackageFilters({ packages = [], onFilterChange, activeFilters = {} }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [filters, setFilters] = useState(activeFilters)

  const destinations = useMemo(() => extractDestinations(packages), [packages])

  const priceRange = useMemo(() => {
    if (!packages.length) return { min: 0, max: 100000 }
    const prices = packages.map((p) => p.discountPrice || p.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [packages])

  useEffect(() => {
    setFilters(activeFilters)
  }, [activeFilters])

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    if (!value || (Array.isArray(value) && !value.length)) delete next[key]
    setFilters(next)
    onFilterChange?.(next)
  }

  const clearAll = () => {
    setFilters({})
    onFilterChange?.({})
  }

  const activeCount = Object.keys(filters).filter((k) => k !== 'sort').length

  return (
    <>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDrawerOpen(true)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </Button>

        {/* Quick category pills */}
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
            className={`hidden shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:block ${
              filters.category === cat
                ? 'bg-primary text-white'
                : 'bg-white text-muted hover:bg-cream border border-border'
            }`}
          >
            {cat}
          </button>
        ))}

        {/* Sort */}
        <div className="ml-auto">
          <select
            value={filters.sort || 'newest'}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-ink outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Filter drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border p-5">
                <h3 className="font-display text-lg font-semibold text-ink">Filters</h3>
                <button onClick={() => setDrawerOpen(false)} className="text-muted hover:text-ink">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-5">
                {/* Destination */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <MapPin className="h-3 w-3" /> Destination
                  </label>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateFilter('destination', '')}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        !filters.destination ? 'bg-primary/10 font-medium text-primary' : 'text-ink-light hover:bg-cream'
                      }`}
                    >
                      All Destinations
                    </button>
                    {destinations.map((d) => (
                      <button
                        key={d}
                        onClick={() => updateFilter('destination', filters.destination === d ? '' : d)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          filters.destination === d ? 'bg-primary/10 font-medium text-primary' : 'text-ink-light hover:bg-cream'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <Tag className="h-3 w-3" /> Category
                  </label>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          filters.category === cat ? 'bg-primary/10 font-medium text-primary' : 'text-ink-light hover:bg-cream'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <DollarSign className="h-3 w-3" /> Max Price
                  </label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={500}
                    value={filters.maxPrice || priceRange.max}
                    onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted">
                    <span>₹{priceRange.min.toLocaleString()}</span>
                    <span className="font-medium text-ink">
                      ₹{(filters.maxPrice || priceRange.max).toLocaleString()}
                    </span>
                    <span>₹{priceRange.max.toLocaleString()}</span>
                  </div>
                </div>

                {/* Clear */}
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted transition-colors hover:border-error hover:text-error"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Helper: filter packages client-side
export function filterPackages(packages, filters = {}) {
  let result = [...packages]

  if (filters.category) {
    result = result.filter((p) => p.category === filters.category)
  }
  if (filters.destination) {
    result = result.filter((p) => p.destination === filters.destination)
  }
  if (filters.maxPrice) {
    result = result.filter((p) => (p.discountPrice || p.price) <= filters.maxPrice)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.destination?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q)
    )
  }

  // Sort
  const sort = filters.sort || 'newest'
  switch (sort) {
    case 'price-low':
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
      break
    case 'price-high':
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
      break
    case 'rating':
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return result
}
