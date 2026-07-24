import { Search, Sliders, Plane } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Browse & Discover',
    description: 'Explore our curated collection of Delhi tour packages — from heritage walks to adventure treks.',
  },
  {
    num: '02',
    icon: Sliders,
    title: 'Customize Your Trip',
    description: 'Tell us your preferences. We\'ll tailor the itinerary, dates, and group size to fit your style.',
  },
  {
    num: '03',
    icon: Plane,
    title: 'Travel & Explore',
    description: 'Sit back and let our expert guides show you the real Delhi — the sights, sounds, and flavors.',
  },
]

export default function ExperienceSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-24">
      {/* Decorative background elements */}
      <div className="absolute left-0 top-0 h-full w-full">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary/5" />
        <div className="absolute -right-16 bottom-20 h-48 w-48 rounded-full bg-gold/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <AnimatedSection className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
            Simple & Easy
          </p>
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            How It Works
          </h2>
        </AnimatedSection>

        <div className="relative grid gap-8 sm:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="absolute left-[20%] right-[20%] top-12 hidden border-t-2 border-dashed border-primary/20 sm:block" />

          {steps.map((step, i) => (
            <AnimatedSection key={step.num} delay={i * 0.15} variant="fadeInUp">
              <div className="relative text-center">
                {/* Step number */}
                <div className="relative mx-auto mb-5">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/20 bg-white shadow-lg">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-xs font-bold text-ink shadow-md">
                    {step.num}
                  </div>
                </div>

                <h3 className="mb-2 font-display text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
