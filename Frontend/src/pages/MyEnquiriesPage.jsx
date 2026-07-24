import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Eye, ArrowRight } from 'lucide-react'
import { useGetMyEnquiriesQuery } from '../services/enquiriesService'
import { useAuth } from '../hooks/useAuth'
import AnimatedSection from '../components/ui/AnimatedSection'
import { SkeletonList } from '../components/ui/Skeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import { formatDate } from '../utils/helpers'

const statusColors = {
  New: 'primary', Contacted: 'secondary', 'Quotation Sent': 'gold',
  Negotiating: 'gold', Booked: 'success', Closed: 'muted',
}

const statusSteps = ['New', 'Contacted', 'Quotation Sent', 'Negotiating', 'Booked']

export default function MyEnquiriesPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useGetMyEnquiriesQuery(undefined, { skip: !isAuthenticated })

  if (!isAuthenticated) { navigate('/login'); return null }

  return (
    <div className="bg-cream">
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <AnimatedSection>
            <h1 className="font-display text-3xl font-bold text-ink">My Enquiries</h1>
            <p className="mt-2 text-muted">Track the status of your tour enquiries</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {isLoading && <SkeletonList count={3} className="!grid-cols-1" />}
        {isError && <ErrorMessage message={error?.data?.message || 'Failed to load enquiries'} />}
        {!isLoading && data?.data?.length === 0 && (
          <EmptyState icon={Compass} title="No enquiries yet" description="Browse our packages and submit an enquiry to get started." />
        )}

        {data?.data && data.data.length > 0 && (
          <div className="space-y-4">
            {data.data.map((enq, i) => (
              <motion.div
                key={enq._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/my-enquiries/${enq._id}`}
                  className="group block rounded-2xl border border-border bg-white p-5 transition-all hover:shadow-lg hover:border-primary/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted">{enq.enquiryNumber}</span>
                        <Badge color={statusColors[enq.leadStatus] || 'muted'}>{enq.leadStatus}</Badge>
                      </div>
                      <h3 className="mb-1 text-base font-semibold text-ink transition-colors group-hover:text-primary">
                        {enq.tourPackage?.title || 'Tour Package'}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs text-muted">
                        <span>Travel: {formatDate(enq.travelDate)}</span>
                        <span>{enq.adults} adults{enq.children > 0 ? `, ${enq.children} children` : ''}</span>
                        <span>Enquired: {formatDate(enq.createdAt)}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex gap-1">
                          {statusSteps.map((step, j) => {
                            const currentIdx = statusSteps.indexOf(enq.leadStatus)
                            const isCompleted = j <= currentIdx
                            return (
                              <div key={step} className="flex-1">
                                <div className={`h-1 rounded-full transition-colors ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
