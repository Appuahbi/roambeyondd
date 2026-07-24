import { useState } from 'react'
import { useSubmitContactMutation } from '../../services/contactService'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function ContactForm() {
  const [submitContact, { isLoading }] = useSubmitContactMutation()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    source: 'Website',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await submitContact(form).unwrap()
      setSuccess(true)
    } catch (err) {
      setError(err?.data?.message || 'Failed to send message. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-success/20 bg-success/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 font-display text-xl font-semibold text-ink">
          Message Sent!
        </h3>
        <p className="text-sm text-muted">
          Thank you for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            setForm({ name: '', email: '', phone: '', subject: '', message: '', source: 'Website' })
          }}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Your full name"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          name="phone"
          type="tel"
          required
          value={form.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
        />
        <div className="w-full">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            How did you find us?
          </label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {['Website', 'WhatsApp', 'Phone', 'Email', 'Instagram', 'Facebook'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Subject"
        name="subject"
        required
        value={form.subject}
        onChange={handleChange}
        placeholder="What is this about?"
      />

      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          name="message"
          rows={4}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us more..."
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <Button type="submit" loading={isLoading} size="lg" className="w-full">
        Send Message
      </Button>
    </form>
  )
}
