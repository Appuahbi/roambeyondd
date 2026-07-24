import { motion } from 'framer-motion'
import { Shield, CreditCard, Headphones, XCircle, Map, Lock } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const features = [
  { icon: Shield, title: 'Best Price Guarantee', description: 'Find a lower price? We\'ll match it and give you an extra 5% off.' },
  { icon: CreditCard, title: 'Verified Stays', description: 'Every hotel and homestay is personally vetted by our team.' },
  { icon: Headphones, title: '24/7 Support', description: 'Reach us anytime via call, WhatsApp, or chat — we never close.' },
  { icon: XCircle, title: 'Easy Cancellation', description: 'Free cancellation up to 15 days before travel. No hidden fees.' },
  { icon: Map, title: 'Local Expert Guides', description: 'Knowledgeable locals who know every hidden gem and shortcut.' },
  { icon: Lock, title: 'Secure Payments', description: 'SSL-encrypted payments. Your financial data is always safe.' },
]

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob-alt absolute -right-20 bottom-10 h-[200px] w-[200px] rounded-full bg-secondary/[0.03] blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Why Us</p>
          <h2>Why Book With Us</h2>
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-xl border border-border bg-gradient-to-br from-white to-cream-light/30 p-6 shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-card-hover hover:-translate-y-0.5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 shadow-subtle transition-all duration-300 group-hover:from-primary group-hover:to-primary-light group-hover:shadow-medium group-hover:scale-110">
                <feature.icon className="h-5 w-5 text-primary transition-colors duration-300 group-hover:text-white" />
              </div>
              <h3 className="mb-1 font-display text-base font-semibold text-ink">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
