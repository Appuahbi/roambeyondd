import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, XCircle, Headphones } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/[0.05] blur-[80px]" />
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-gold/[0.06] blur-[60px]" />
        <div className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full bg-white/[0.03] blur-[40px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center">
          <h2 className="mb-4 text-white" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>Ready to Explore India?</h2>
          <p className="mx-auto mb-8 max-w-lg text-base text-white/70">
            Browse 200+ curated packages or tell us your dream trip — we'll craft it for you.
          </p>
          <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to="/packages" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-medium transition-all hover:shadow-strong hover:bg-cream">
                Browse Packages <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10 hover:shadow-medium">
                Plan My Trip
              </Link>
            </motion.div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            {[{ icon: Shield, text: 'Secure Booking' }, { icon: XCircle, text: 'Free Cancellation' }, { icon: Headphones, text: '24/7 Support' }].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5"><b.icon className="h-4 w-4 text-gold" />{b.text}</div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
