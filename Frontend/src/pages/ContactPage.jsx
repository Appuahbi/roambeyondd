import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useSubmitContactMutation } from '../services/contactService'
import Button from '../components/ui/Button'
import FAQAccordion from '../components/ui/FAQAccordion'
import AnimatedSection from '../components/ui/AnimatedSection'

const faqItems = [
  { question: 'How do I book a tour?', answer: 'Browse our packages, click "Enquire Now" on any package, fill in your travel dates and group size, and our team will contact you within 24 hours with a detailed itinerary and quote.' },
  { question: 'Can I customize a trip?', answer: 'Absolutely! We specialize in tailor-made itineraries. Let us know your preferences for destinations, activities, pace, and budget, and we\'ll create a package just for you.' },
  { question: 'What payment methods do you accept?', answer: 'We accept bank transfers, UPI, and major credit/debit cards. A 30% advance confirms your booking, with the balance due 15 days before travel.' },
  { question: 'Do you offer group discounts?', answer: 'Yes! We offer special rates for groups of 8 or more. Contact us with your group size and preferred dates for a custom quote.' },
  { question: 'What is your cancellation policy?', answer: 'Cancellations made 30+ days before travel receive a full refund minus processing fees. 15-29 days: 50% refund. Less than 15 days: no refund. We recommend travel insurance for unexpected changes.' },
  { question: 'Are your tours suitable for families?', answer: 'Many of our packages are family-friendly with age-appropriate activities. Look for the "Family Friendly" tag on packages or contact us for personalized recommendations.' },
]

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const prefillPackage = searchParams.get('package') || ''
  const [submitContact, { isLoading }] = useSubmitContactMutation()
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: prefillPackage ? `Enquiry about: ${prefillPackage}` : '', message: '', source: 'Website',
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await submitContact(form).unwrap()
      setSuccess(true)
      toast.success('Message sent! We\'ll get back to you soon.')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send message')
    }
  }

  return (
    <div className="bg-cream">
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AnimatedSection>
            <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">Contact Us</h1>
            <p className="mt-2 text-muted">Have a question? We'd love to hear from you.</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatedSection>
              <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
                <h2 className="mb-6 font-display text-xl font-semibold text-ink">Send Us a Message</h2>

                {success ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                      <MessageCircle className="h-7 w-7 text-success" />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-semibold text-ink">Message Sent!</h3>
                    <p className="mb-4 text-sm text-muted">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button onClick={() => { setSuccess(false); setForm({ name: '', email: '', phone: '', subject: '', message: '', source: 'Website' }) }} className="text-sm font-medium text-primary hover:underline">
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
                        <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Your full name"
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                        <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com"
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
                        <input type="tel" name="phone" required value={form.phone} onChange={handleChange} placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">How did you find us?</label>
                        <select name="source" value={form.source} onChange={handleChange}
                          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20">
                          {['Website', 'WhatsApp', 'Phone', 'Email', 'Instagram', 'Facebook'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Subject</label>
                      <input type="text" name="subject" required value={form.subject} onChange={handleChange} placeholder="What is this about?"
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink">Message</label>
                      <textarea name="message" rows={4} required value={form.message} onChange={handleChange} placeholder="Tell us more..."
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <Button type="submit" loading={isLoading} size="lg" className="w-full">Send Message</Button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-5">
            <AnimatedSection delay={0.1}>
              <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-ink">Get in Touch</h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, label: 'Address', value: 'Delhi, India' },
                    { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                    { icon: Mail, label: 'Email', value: 'hello@roambeyond.com' },
                    { icon: Clock, label: 'Hours', value: 'Mon–Sat, 9 AM – 7 PM' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted">{item.label}</p>
                        <p className="text-sm text-ink">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <FAQAccordion items={faqItems} title="Frequently Asked Questions" />
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  )
}
