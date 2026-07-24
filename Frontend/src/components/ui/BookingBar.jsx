import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, MessageSquare, Send } from 'lucide-react'
import Button from './Button'
import { formatPrice } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { useCreateEnquiryMutation } from '../../services/enquiriesService'
import { useAuth } from '../../hooks/useAuth'

export default function BookingBar({ pkg }) {
  const { isAuthenticated } = useAuth()
  const [createEnquiry, { isLoading }] = useCreateEnquiryMutation()
  const [expanded, setExpanded] = useState(false)
  const [form, setForm] = useState({
    travelDate: '',
    adults: 2,
    children: 0,
    notes: '',
  })

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit an enquiry')
      return
    }
    if (!form.travelDate) {
      toast.error('Please select a travel date')
      return
    }
    try {
      await createEnquiry({
        tourPackage: pkg._id,
        travelDate: form.travelDate,
        adults: Number(form.adults),
        children: Number(form.children),
        notes: form.notes,
      }).unwrap()
      toast.success('Enquiry submitted! Our team will contact you soon.')
      setExpanded(false)
      setForm({ travelDate: '', adults: 2, children: 0, notes: '' })
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit enquiry')
    }
  }

  const price = pkg.discountPrice || pkg.price
  const totalEstimate = price * form.adults

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 shadow-2xl backdrop-blur-md">
      {/* Expanded form */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-b border-border"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Travel Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="date"
                    value={form.travelDate}
                    onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Adults</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="number"
                    min="1"
                    max={pkg.maxGroupSize}
                    value={form.adults}
                    onChange={(e) => setForm({ ...form, adults: e.target.value })}
                    className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Children</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="number"
                    min="0"
                    value={form.children}
                    onChange={(e) => setForm({ ...form, children: e.target.value })}
                    className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Notes (optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Special requests..."
                    className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="hidden sm:block">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">{formatPrice(price)}</span>
            <span className="text-sm text-muted">/person</span>
          </div>
          {expanded && (
            <p className="text-xs text-muted">
              Est. total: <span className="font-semibold text-ink">{formatPrice(totalEstimate)}</span> for {form.adults} adult{form.adults > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {expanded && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              Cancel
            </Button>
          )}
          <Button
            onClick={() => {
              if (expanded) {
                handleSubmit()
              } else {
                setExpanded(true)
              }
            }}
            loading={isLoading}
            size="md"
            className="gap-2"
          >
            {expanded ? (
              <>
                <Send className="h-4 w-4" /> Send Enquiry
              </>
            ) : (
              'Enquire Now'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
