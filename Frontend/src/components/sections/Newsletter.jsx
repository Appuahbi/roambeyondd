import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Check, Sparkles } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const handleSubmit = (e) => { e.preventDefault(); if (email) { setSubmitted(true); setEmail('') } }

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection variant="scaleUp">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-primary p-8 shadow-strong sm:p-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/[0.05] blur-[80px]" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary/[0.08] blur-[60px]" />
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />

            <div className="relative z-10 mx-auto max-w-xl text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 shadow-subtle">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>
              <h2 className="mb-3 text-white">Stay in the Loop</h2>
              <p className="mb-6 text-sm text-white/70">Get travel tips, exclusive deals, and new package announcements delivered to your inbox.</p>

              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-6 py-4 text-white shadow-subtle backdrop-blur-sm">
                  <Check className="h-5 w-5 text-secondary-light" />
                  <span className="text-sm font-medium">Thanks for subscribing!</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address"
                    className="flex-1 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-gold/50 focus:bg-white/15 focus:ring-2 focus:ring-gold/20" />
                  <motion.button type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-gold to-gold-light px-6 py-3 text-sm font-semibold text-ink shadow-medium transition-all hover:shadow-strong">
                    Subscribe <Send className="h-4 w-4" />
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
