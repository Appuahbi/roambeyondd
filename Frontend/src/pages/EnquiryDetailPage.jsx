import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, MessageSquare } from 'lucide-react'
import { useGetEnquiryByIdQuery } from '../services/enquiriesService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { formatDate } from '../utils/helpers'

const statusColors = {
  New: 'primary',
  Contacted: 'secondary',
  'Quotation Sent': 'gold',
  Negotiating: 'gold',
  Booked: 'success',
  Closed: 'muted',
}

export default function EnquiryDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useGetEnquiryByIdQuery(id, {
    skip: !isAuthenticated,
  })

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  if (isLoading) return <LoadingSpinner className="py-24" />
  if (isError) return <div className="mx-auto max-w-3xl px-4 py-8"><ErrorMessage message={error?.data?.message || 'Enquiry not found'} /></div>

  const enq = data?.data
  if (!enq) return null

  return (
    <div className="bg-cream">
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            to="/my-enquiries"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> My Enquiries
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-ink">
              Enquiry Details
            </h1>
            <Badge color={statusColors[enq.leadStatus] || 'muted'}>
              {enq.leadStatus}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-5">
        {/* Package info */}
        <Card className="p-6">
          <h3 className="mb-3 font-display text-lg font-semibold text-ink">
            {enq.tourPackage?.title || 'Tour Package'}
          </h3>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-xs font-medium uppercase text-muted">Enquiry Number</span>
              <p className="font-mono text-ink">{enq.enquiryNumber}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase text-muted">Travel Date</span>
              <p className="flex items-center gap-1 text-ink">
                <Calendar className="h-3.5 w-3.5" /> {formatDate(enq.travelDate)}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase text-muted">Travelers</span>
              <p className="flex items-center gap-1 text-ink">
                <Users className="h-3.5 w-3.5" /> {enq.adults} adults, {enq.children} children
              </p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase text-muted">Priority</span>
              <p className="text-ink">{enq.priority || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase text-muted">Enquired On</span>
              <p className="text-ink">{formatDate(enq.createdAt)}</p>
            </div>
            {enq.followUpDate && (
              <div>
                <span className="text-xs font-medium uppercase text-muted">Follow-up Date</span>
                <p className="text-ink">{formatDate(enq.followUpDate)}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Notes */}
        {enq.notes && (
          <Card className="p-6">
            <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <MessageSquare className="h-5 w-5 text-primary" />
              Your Notes
            </h3>
            <p className="text-sm text-muted">{enq.notes}</p>
          </Card>
        )}

        {/* Remarks from team */}
        {enq.remarks && (
          <Card className="p-6">
            <h3 className="mb-2 font-display text-lg font-semibold text-ink">
              Our Team Says
            </h3>
            <p className="text-sm text-muted">{enq.remarks}</p>
            {enq.lastContactedAt && (
              <p className="mt-2 text-xs text-muted">
                Last contacted: {formatDate(enq.lastContactedAt)}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
