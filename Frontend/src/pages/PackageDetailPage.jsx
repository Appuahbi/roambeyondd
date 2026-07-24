import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock, Users, MapPin, Check, X, ArrowLeft, CalendarDays,
  Shield, Award, Heart
} from 'lucide-react'
import { useGetPackageBySlugQuery } from '../services/packagesService'
import ImageGallery from '../components/ui/ImageGallery'
import BookingBar from '../components/ui/BookingBar'
import FAQAccordion from '../components/ui/FAQAccordion'
import RelatedPackages from '../components/sections/RelatedPackages'
import StarRating from '../components/ui/StarRating'
import Badge from '../components/ui/Badge'
import AnimatedSection from '../components/ui/AnimatedSection'
import ItineraryTimeline from '../components/sections/ItineraryTimeline'
import { SkeletonText } from '../components/ui/Skeleton'
import { formatPrice } from '../utils/helpers'

export default function PackageDetailPage() {
  const { slug } = useParams()
  const { data, isLoading, isError } = useGetPackageBySlugQuery(slug)
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return (
      <div className="bg-cream">
        <div className="h-64 bg-cream" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <SkeletonText lines={2} />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-48 animate-pulse rounded-2xl bg-cream" />
              <div className="h-32 animate-pulse rounded-2xl bg-cream" />
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-cream" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">Package Not Found</h2>
        <p className="mt-2 text-muted">The package you're looking for doesn't exist or has been removed.</p>
        <Link to="/packages" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          ← Browse all packages
        </Link>
      </div>
    )
  }

  const pkg = data?.package || data?.data?.package || data?.data
  const relatedPackages = data?.relatedPackages || data?.data?.relatedPackages || []

  if (!pkg) return null

  const discount = pkg.discountPrice > 0
    ? Math.round(((pkg.price - pkg.discountPrice) / pkg.price) * 100)
    : 0

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'inclusions', label: 'Inclusions' },
    { id: 'faq', label: 'FAQ' },
  ]

  return (
    <div className="bg-cream pb-24">
      {/* Image gallery */}
      <div className="bg-white pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Link to="/packages" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> All Packages
          </Link>
          <ImageGallery images={pkg.images} title={pkg.title} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & meta */}
            <AnimatedSection>
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge color="secondary">{pkg.category}</Badge>
                  {pkg.featured && <Badge color="gold">Featured</Badge>}
                </div>
                <h1 className="mb-2 font-display text-3xl font-bold text-ink sm:text-4xl">
                  {pkg.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {pkg.destination}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {pkg.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Max {pkg.maxGroupSize}</span>
                  {pkg.rating > 0 && <StarRating rating={pkg.rating} count={pkg.reviewsCount} />}
                </div>

                {/* Trust badges */}
                <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4">
                  {[
                    { icon: Shield, text: 'Secure Booking' },
                    { icon: Award, text: 'Expert Guides' },
                    { icon: Heart, text: 'Best Price Guarantee' },
                  ].map((badge) => (
                    <div key={badge.text} className="flex items-center gap-1.5 text-xs text-muted">
                      <badge.icon className="h-3.5 w-3.5 text-primary" />
                      {badge.text}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Tabs */}
            <AnimatedSection>
              <div className="flex gap-1 overflow-x-auto border-b border-border bg-white px-2 scrollbar-none">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id ? 'text-primary' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>
            </AnimatedSection>

            {/* Tab content */}
            <AnimatedSection>
              <div className="rounded-2xl border border-border bg-white p-6">
                {activeTab === 'overview' && (
                  <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-muted">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                      {pkg.description || pkg.shortDescription}
                    </p>
                    {pkg.highlights?.length > 0 && (
                      <>
                        <h3 className="mt-6 font-display text-lg font-semibold text-ink">Highlights</h3>
                        <div className="not-prose grid gap-2 sm:grid-cols-2">
                          {pkg.highlights.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-muted">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                              {h}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'itinerary' && (
                  <ItineraryTimeline itinerary={pkg.itinerary || []} />
                )}

                {activeTab === 'inclusions' && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {pkg.included?.length > 0 && (
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                            <Check className="h-3.5 w-3.5 text-success" />
                          </div>
                          Included
                        </h3>
                        <ul className="space-y-2">
                          {pkg.included.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pkg.excluded?.length > 0 && (
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-error/10">
                            <X className="h-3.5 w-3.5 text-error" />
                          </div>
                          Not Included
                        </h3>
                        <ul className="space-y-2">
                          {pkg.excluded.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted">
                              <X className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <FAQAccordion items={pkg.faq || []} title="" />
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Price card */}
              <AnimatedSection>
                <div className="rounded-2xl border border-border bg-white p-6">
                  <div className="mb-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {formatPrice(pkg.discountPrice || pkg.price)}
                      </span>
                      {pkg.discountPrice > 0 && (
                        <span className="text-base text-muted line-through">
                          {formatPrice(pkg.price)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted">per person</span>
                  </div>
                  {discount > 0 && (
                    <span className="mb-4 inline-block rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                      Save {discount}%
                    </span>
                  )}

                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Duration</span>
                      <span className="font-medium text-ink">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Group Size</span>
                      <span className="font-medium text-ink">Up to {pkg.maxGroupSize}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Destination</span>
                      <span className="font-medium text-ink">{pkg.destination}</span>
                    </div>
                    {pkg.rating > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Rating</span>
                        <StarRating rating={pkg.rating} count={pkg.reviewsCount} size={14} />
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>

              {/* Quick enquiry */}
              <AnimatedSection delay={0.1}>
                <div className="rounded-2xl border border-border bg-white p-6">
                  <h3 className="mb-3 font-display text-lg font-semibold text-ink">Quick Enquiry</h3>
                  <p className="mb-4 text-sm text-muted">
                    Interested in this tour? Send us an enquiry and our team will get back to you within 24 hours.
                  </p>
                  <Link
                    to={`/contact?package=${encodeURIComponent(pkg.title)}`}
                    className="block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                  >
                    Send Enquiry
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Related packages */}
        {relatedPackages.length > 0 && (
          <div className="mt-12">
            <RelatedPackages packages={relatedPackages} currentSlug={pkg.slug} />
          </div>
        )}
      </div>

      {/* Sticky booking bar */}
      <BookingBar pkg={pkg} />
    </div>
  )
}
