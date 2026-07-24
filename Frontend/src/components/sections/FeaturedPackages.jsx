import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useGetPackagesQuery } from '../../services/packagesService'
import PackageCard from './PackageCard'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'
import AnimatedSection from '../ui/AnimatedSection'

export default function FeaturedPackages() {
  const { data, isLoading, isError, error } = useGetPackagesQuery({ limit: 6 })

  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnimatedSection className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
              Handpicked for You
            </p>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              Popular Packages
            </h2>
            <p className="mt-2 text-muted">
              Handpicked tours for every kind of traveler
            </p>
          </div>
          <Link
            to="/packages"
            className="group hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </AnimatedSection>

        {isLoading && (
          <div className="py-12">
            {/* Shimmer skeleton */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white">
                  <div className="aspect-[16/10] animate-shimmer bg-cream" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-20 animate-shimmer rounded bg-cream" />
                    <div className="h-5 w-3/4 animate-shimmer rounded bg-cream" />
                    <div className="h-3 w-full animate-shimmer rounded bg-cream" />
                    <div className="h-6 w-24 animate-shimmer rounded bg-cream" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isError && (
          <ErrorMessage message={error?.data?.message || 'Failed to load packages'} />
        )}

        {data?.data && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((pkg, i) => (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
              >
                <PackageCard pkg={pkg} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/packages"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            View all packages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
