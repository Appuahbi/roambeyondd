import { useState } from 'react'
import { useCreateEnquiryMutation } from '../../services/enquiriesService'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function PackageEnquiryForm({ packageId, packageTitle, onClose }) {
  const { isAuthenticated } = useAuth()
  const [createEnquiry, { isLoading }] = useCreateEnquiryMutation()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    travelDate: '',
    adults: 1,
    children: 0,
    notes: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createEnquiry({
        tourPackage: packageId,
        travelDate: form.travelDate,
        adults: Number(form.adults),
        children: Number(form.children),
        notes: form.notes,
      }).unwrap()
      setSuccess(true)
    } catch (err) {
      setError(err?.data?.message || 'Failed to submit enquiry. Please try again.')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-border bg-cream p-6 text-center">
        <p className="mb-3 text-sm text-muted">
          Please log in to submit an enquiry for this package.
        </p>
        <a href="/login" className="text-sm font-medium text-primary hover:underline">
          Log in →
        </a>
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
        <p className="mb-1 text-sm font-semibold text-success">
          Enquiry submitted!
        </p>
        <p className="text-xs text-muted">
          Our team will contact you shortly regarding <strong>{packageTitle}</strong>.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Close
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-ink">
        Enquire About This Tour
      </h3>

      <Input
        label="Travel Date"
        type="date"
        required
        value={form.travelDate}
        onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Adults"
          type="number"
          min="1"
          required
          value={form.adults}
          onChange={(e) => setForm({ ...form, adults: e.target.value })}
        />
        <Input
          label="Children"
          type="number"
          min="0"
          value={form.children}
          onChange={(e) => setForm({ ...form, children: e.target.value })}
        />
      </div>

      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Special Requests
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Any special requirements or questions..."
        />
      </div>

      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      <Button type="submit" loading={isLoading} className="w-full">
        Submit Enquiry
      </Button>
    </form>
  )
}
