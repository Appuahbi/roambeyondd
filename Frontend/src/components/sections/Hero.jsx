import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { Search, Calendar, Users, ChevronDown, MapPin, Navigation } from 'lucide-react'

const slides = [
  { gradient: 'from-primary via-primary-light to-secondary', label: 'Ladakh', sub: 'High altitude lakes & passes' },
  { gradient: 'from-amber-700 via-amber-600 to-gold', label: 'Rajasthan', sub: 'Royal palaces & desert safaris' },
  { gradient: 'from-emerald-700 via-emerald-600 to-secondary', label: 'Kerala', sub: 'Backwaters & hill stations' },
  { gradient: 'from-cyan-700 via-cyan-600 to-secondary-light', label: 'Goa', sub: 'Beaches & vibrant nightlife' },
  { gradient: 'from-slate-600 via-slate-500 to-secondary', label: 'Manali', sub: 'Snow peaks & adventure sports' },
]

const quickTags = ['Manali', 'Goa', 'Kerala', 'Rajasthan', 'Ladakh', 'Andaman', 'Darjeeling', 'Shimla', 'Varanasi', 'Udaipur']

export default function Hero() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [destination, setDestination] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [dateFrom, setDateFrom] = useState('')
  const [showDestDropdown, setShowDestDropdown] = useState(false)

  const { scrollY } = useScroll()
  const blobY1 = useSpring(useTransform(scrollY, [0, 500], [0, -80]), { stiffness: 50, damping: 20 })
  const blobY2 = useSpring(useTransform(scrollY, [0, 500], [0, -120]), { stiffness: 50, damping: 20 })
  const blobY3 = useSpring(useTransform(scrollY, [0, 500], [0, -60]), { stiffness: 50, damping: 20 })
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.97])

  const destinations = ['Goa', 'Kerala', 'Manali', 'Rajasthan', 'Ladakh', 'Andaman', 'Darjeeling', 'Shimla', 'Varanasi', 'Udaipur', 'Jim Corbett', 'Rishikesh', 'Mussoorie', 'Ooty', 'Coorg', 'Munnar', 'Alleppey', 'Pondicherry', 'Hampi', 'Meghalaya']
  const filteredDests = destination ? destinations.filter((d) => d.toLowerCase().includes(destination.toLowerCase())) : destinations

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % slides.length), 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouse = (e) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
    const el = heroRef.current
    el?.addEventListener('mousemove', handleMouse)
    return () => el?.removeEventListener('mousemove', handleMouse)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (dateFrom) params.set('from', dateFrom)
    params.set('travelers', travelers)
    navigate(`/packages?${params.toString()}`)
  }

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-cream py-12 sm:py-16 lg:py-24">
      {/* Animated gradient blobs following mouse with scroll-linked parallax */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[100px] animate-blob transition-all duration-[2000ms] ease-out"
          style={{ left: `${mousePos.x * 0.6}%`, top: `${mousePos.y * 0.6}%`, transform: 'translate(-50%, -50%)', y: blobY1 }}
        />
        <motion.div
          className="absolute h-[400px] w-[400px] rounded-full bg-secondary/[0.05] blur-[80px] animate-blob-alt transition-all duration-[2500ms] ease-out"
          style={{ right: `${100 - mousePos.x * 0.4}%`, bottom: `${100 - mousePos.y * 0.4}%`, transform: 'translate(50%, 50%)', y: blobY2 }}
        />
        <motion.div
          className="absolute h-[300px] w-[300px] rounded-full bg-gold/[0.03] blur-[60px] animate-blob transition-all duration-[3000ms] ease-out"
          style={{ left: '40%', top: '30%', transform: 'translate(-50%, -50%)', y: blobY3 }}
        />
      </div>

      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5 lg:items-center">
          {/* Left: Content + Search */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary shadow-subtle">
                <Navigation className="h-3 w-3" /> Pan-India Tour Operator
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-5"
            >
              Every Corner of India,
              <br />
              <span className="text-primary">One Platform</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8 max-w-lg text-base text-muted"
            >
              10,000+ travelers. 50+ destinations. 200+ curated packages across every state.
              From Himalayan peaks to tropical beaches — find your perfect trip.
            </motion.p>

            {/* Search Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-6 rounded-2xl border border-border/60 bg-white/90 p-5 shadow-strong backdrop-blur-sm"
            >
              <form onSubmit={handleSearch}>
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="relative sm:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-muted">Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => { setDestination(e.target.value); setShowDestDropdown(true) }}
                        onFocus={() => setShowDestDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                        placeholder="Where do you want to go?"
                        className="w-full rounded-lg border border-border bg-cream/80 py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                    {showDestDropdown && filteredDests.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-white/95 shadow-strong backdrop-blur-md">
                        {filteredDests.slice(0, 8).map((d) => (
                          <button key={d} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setDestination(d); setShowDestDropdown(false) }}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink transition-colors hover:bg-primary/5">
                            <MapPin className="h-3 w-3 text-muted" /> {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted">Travel Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-lg border border-border bg-cream/80 py-2.5 pl-9 pr-2 text-sm text-ink outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted">Travelers</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <select value={travelers} onChange={(e) => setTravelers(Number(e.target.value))}
                        className="w-full appearance-none rounded-lg border border-border bg-cream/80 py-2.5 pl-9 pr-8 text-sm text-ink outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 15, 20].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    </div>
                  </div>
                </div>

                <motion.button type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full rounded-lg bg-gradient-to-br from-primary to-primary-light py-3 text-sm font-semibold text-white shadow-medium transition-all hover:shadow-strong">
                  Search Packages
                </motion.button>
              </form>
            </motion.div>

            {/* Quick tags */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-2">
              <span className="text-sm text-muted">Trending:</span>
              {quickTags.map((tag, i) => (
                <motion.div key={tag} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.03 }}>
                  <Link to={`/packages?destination=${encodeURIComponent(tag)}`}
                    className="rounded-lg border border-border bg-white/80 px-3 py-1 text-xs font-medium text-ink shadow-subtle transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-medium">
                    {tag}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Rotating Carousel */}
          <div className="hidden lg:col-span-2 lg:block">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-strong">
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }} className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient}`} />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <AnimatePresence mode="wait">
                  <motion.div key={`label-${currentSlide}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.2, duration: 0.4 }}>
                    <p className="mb-1 text-xs font-medium text-white/50">Currently Showing</p>
                    <h3 className="font-display text-2xl font-bold text-white">{slides[currentSlide].label}</h3>
                    <p className="text-sm text-white/70">{slides[currentSlide].sub}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="absolute bottom-6 right-6 flex gap-1.5">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)}
                    className={`rounded-full transition-all duration-300 ${i === currentSlide ? 'h-2 w-6 bg-white shadow-subtle' : 'h-2 w-2 bg-white/40 hover:bg-white/60'}`} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
