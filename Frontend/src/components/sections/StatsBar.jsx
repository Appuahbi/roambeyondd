import { useRef, useEffect, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { Users, MapPin, Package, Star, Map } from 'lucide-react'

function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const prefersReduced = useReducedMotion()
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  useEffect(() => {
    if (!isInView) return
    if (prefersReduced) {
      setCount(target)
      return
    }
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * target >= target ? target : Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target, duration, prefersReduced])
  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>
}

const stats = [
  { icon: Users, label: 'Happy Travelers', value: 10000, suffix: '+' },
  { icon: MapPin, label: 'Destinations', value: 50, suffix: '+' },
  { icon: Package, label: 'Tour Packages', value: 200, suffix: '+' },
  { icon: Map, label: 'States Covered', value: 25, suffix: '' },
  { icon: Star, label: 'Avg Rating', value: 4.8, suffix: '/5' },
]

export default function StatsBar() {
  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-white via-white to-cream-light/50 p-8 shadow-medium backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 shadow-subtle">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary sm:text-3xl"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
