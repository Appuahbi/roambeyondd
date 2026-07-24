import { motion } from 'framer-motion'
import { Shield, Map, Heart, Award, Users, Compass, Target, Eye } from 'lucide-react'
import AnimatedSection from '../components/ui/AnimatedSection'

const values = [
  { icon: Shield, title: 'Safety First', description: 'Every trip is backed by comprehensive safety protocols, verified partners, and 24/7 emergency support.' },
  { icon: Map, title: 'Local Expertise', description: 'Our guides are locals who know every hidden gem, secret trail, and authentic eatery.' },
  { icon: Heart, title: 'Personal Touch', description: 'We treat every traveler as a guest, not a booking number. Your preferences shape every itinerary.' },
  { icon: Award, title: 'Quality Assured', description: 'Handpicked accommodations, vetted transport, and curated experiences — no compromises.' },
]

const team = [
  { name: 'Rajesh Kumar', role: 'Founder & CEO', description: '15+ years in the Indian travel industry. Passionate about sustainable tourism.' },
  { name: 'Priya Sharma', role: 'Head of Operations', description: 'Ensures every trip runs like clockwork. Detail-oriented and traveler-focused.' },
  { name: 'Amit Patel', role: 'Lead Tour Guide', description: 'Certified mountain guide with expertise in Himalayan expeditions.' },
]

export default function AboutPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AnimatedSection className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gold">About RoamBeyond</p>
            <h1 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              We Make Travel<br />Simple & Beautiful
            </h1>
            <p className="text-base text-white/70 sm:text-lg">
              Founded in 2020, RoamBeyond has helped thousands of travelers discover the incredible
              diversity of India. We believe travel should be effortless, enriching, and accessible to everyone.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        {/* Mission & Vision */}
        <div className="mb-16 grid gap-8 sm:grid-cols-2">
          <AnimatedSection>
            <div className="rounded-2xl border border-border bg-white p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold text-ink">Our Mission</h3>
              <p className="text-sm leading-relaxed text-muted">
                To make India's incredible destinations accessible to every traveler through
                thoughtfully designed experiences, transparent pricing, and unwavering commitment
                to quality and safety.
              </p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <div className="rounded-2xl border border-border bg-white p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <Eye className="h-6 w-6 text-gold" />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold text-ink">Our Vision</h3>
              <p className="text-sm leading-relaxed text-muted">
                To become India's most trusted travel partner — known for authentic experiences,
                responsible tourism, and creating journeys that stay in your heart forever.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Values */}
        <AnimatedSection className="mb-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-ink sm:text-3xl">What We Stand For</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <val.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="mb-1 font-display text-base font-semibold text-ink">{val.title}</h4>
                <p className="text-xs leading-relaxed text-muted">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection className="mb-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { num: '10,000+', label: 'Happy Travelers' },
              { num: '50+', label: 'Destinations' },
              { num: '200+', label: 'Tour Packages' },
              { num: '4.8/5', label: 'Average Rating' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 text-center"
              >
                <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.num}</p>
                <p className="text-xs text-muted sm:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Team */}
        <AnimatedSection>
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-ink sm:text-3xl">Meet Our Team</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-white p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
                  {member.name.charAt(0)}
                </div>
                <h4 className="font-display text-base font-semibold text-ink">{member.name}</h4>
                <p className="mb-2 text-xs font-medium text-primary">{member.role}</p>
                <p className="text-xs text-muted">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
