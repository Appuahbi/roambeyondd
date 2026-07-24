import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const testimonials = [
  { name: 'Priya Sharma', destination: 'Rajasthan', rating: 5, text: 'The Rajasthan heritage tour was absolutely magical. Our guide knew every hidden courtyard and secret chai stall. The palace stays were beyond our expectations.', initials: 'PS', color: 'from-amber-500 to-gold' },
  { name: 'Rahul Mehta', destination: 'Ladakh', rating: 5, text: 'Conquered Khardung La with RoamBeyond! The entire expedition was flawlessly organized — permits, camping gear, acclimatization schedule, everything handled.', initials: 'RM', color: 'from-primary to-primary-light' },
  { name: 'Sarah Johnson', destination: 'Kerala', rating: 5, text: 'Our Kerala backwater houseboat experience was pure magic. Waking up to misty lagoons, fresh toddy, and the sound of water — exactly what we needed.', initials: 'SJ', color: 'from-secondary to-secondary-light' },
  { name: 'Amit & Neha', destination: 'Manali', rating: 5, text: 'Perfect honeymoon trip! The snow-capped views, cozy cottage stays, and romantic dinner setup by the Beas river made it unforgettable.', initials: 'AN', color: 'from-rose-400 to-rose-300' },
  { name: 'Vikram Singh', destination: 'Andaman', rating: 5, text: 'Snorkeling at Havelock Island was a dream come true. The coral reefs, crystal-clear water, and pristine beaches — RoamBeyond made it all seamless.', initials: 'VS', color: 'from-cyan-500 to-cyan-400' },
]

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const next = useCallback(() => { setDirection(1); setCurrent((p) => (p + 1) % testimonials.length) }, [])
  const prev = useCallback(() => { setDirection(-1); setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length) }, [])
  useEffect(() => { if (isPaused) return; const t = setInterval(next, 6000); return () => clearInterval(t) }, [next, isPaused])

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
  }

  const t = testimonials[current]

  return (
    <section className="relative overflow-hidden bg-cream-light py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 top-10 h-[200px] w-[200px] rounded-full bg-primary/[0.02] blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
          <h2>What Our Travelers Say</h2>
        </AnimatedSection>

        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-white to-cream-light/30 p-8 shadow-strong backdrop-blur-sm sm:p-10">
            <Quote className="absolute right-6 top-6 h-16 w-16 text-primary/[0.04]" />
            <div className="relative min-h-[220px]">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div key={current} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2}
                  onDragEnd={(_, info) => { if (info.offset.x < -50) next(); else if (info.offset.x > 50) prev() }}
                  onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
                  className="cursor-grab active:cursor-grabbing">
                  <div className="mb-4 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < t.rating ? 'fill-gold text-gold' : 'fill-border text-border'}`} />
                    ))}
                  </div>
                  <p className="mb-6 text-lg leading-relaxed text-ink italic sm:text-xl">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-subtle`}>{t.initials}</div>
                    <div>
                      <p className="font-semibold text-ink">{t.name}</p>
                      <p className="text-xs text-muted">Visited <span className="font-medium text-primary">{t.destination}</span></p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                    className={`rounded-full transition-all duration-300 ${i === current ? 'h-2 w-6 bg-gradient-to-r from-primary to-secondary shadow-subtle' : 'h-2 w-2 bg-border hover:bg-muted'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted shadow-subtle transition-all hover:border-primary hover:text-primary hover:shadow-medium hover:-translate-y-0.5">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted shadow-subtle transition-all hover:border-primary hover:text-primary hover:shadow-medium hover:-translate-y-0.5">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
