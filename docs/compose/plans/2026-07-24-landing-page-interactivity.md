# Landing Page Interactivity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static landing page into a highly interactive experience with scroll animations, hover effects, drag gestures, and motion effects.

**Architecture:** Enhance existing components in-place using framer-motion (already installed). No new dependencies needed. Each section gets isolated improvements that compose together on the homepage.

**Tech Stack:** React, framer-motion, Tailwind CSS v4, existing component library

## Global Constraints

- All animations must respect `prefers-reduced-motion` media query
- No new npm dependencies — use framer-motion and existing packages only
- Performance: animations must not cause layout shift or jank
- Mobile: touch gestures must work on mobile, hover effects degrade gracefully
- Existing API calls (useGetPackagesQuery, useGetBlogsQuery) remain unchanged

---

## File Structure

| File | Purpose |
|------|---------|
| `src/components/sections/Hero.jsx` | Enhance: parallax blobs, scroll-linked fade |
| `src/components/sections/IndiaMap.jsx` | Enhance: lift+glow hover, live count tooltip |
| `src/components/sections/StatsBar.jsx` | Enhance: easing curve, number formatting |
| `src/components/sections/TrendingPackages.jsx` | Enhance: drag-to-scroll, wishlist animation |
| `src/components/sections/Testimonials.jsx` | Enhance: drag gestures, auto-pause |
| `src/components/ui/ScrollProgress.jsx` | Create: thin scroll progress bar |
| `src/components/ui/AnimatedSection.jsx` | Enhance: add `once` scroll-trigger support |

---

### Task 1: Scroll Progress Indicator

**Covers:** Hero + scroll experience — progress indicator

**Files:**
- Create: `src/components/ui/ScrollProgress.jsx`
- Modify: `src/components/layout/Layout.jsx`

**Interfaces:**
- Consumes: None (standalone component)
- Produces: `<ScrollProgress />` rendered at top of layout

- [ ] **Step 1: Create ScrollProgress component**

```jsx
import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-secondary to-gold"
      style={{ scaleX }}
    />
  )
}
```

- [ ] **Step 2: Add ScrollProgress to Layout**

In `src/components/layout/Layout.jsx`, import and render `<ScrollProgress />` after `<ScrollToTop />`:

```jsx
import ScrollProgress from '../ui/ScrollProgress'

// In the return:
<div className="flex min-h-screen flex-col">
  <ScrollToTop />
  <ScrollProgress />
  <Navbar />
  ...
</div>
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — expect no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ScrollProgress.jsx src/components/layout/Layout.jsx
git commit -m "feat: add scroll progress indicator bar"
```

---

### Task 2: Hero Parallax & Scroll-Linked Animations

**Covers:** Hero + scroll experience — parallax, scroll-triggered fade

**Files:**
- Modify: `src/components/sections/Hero.jsx`

**Interfaces:**
- Consumes: framer-motion `useScroll`, `useTransform`, `useSpring`
- Produces: Hero blobs move on scroll, content fades as user scrolls past

- [ ] **Step 1: Add scroll-linked parallax to Hero blobs**

Replace the blob container div with scroll-linked parallax:

```jsx
// At top of Hero component, add:
const { scrollY } = useScroll()
const blobY1 = useSpring(useTransform(scrollY, [0, 500], [0, -80]), { stiffness: 50, damping: 20 })
const blobY2 = useSpring(useTransform(scrollY, [0, 500], [0, -120]), { stiffness: 50, damping: 20 })
const blobY3 = useSpring(useTransform(scrollY, [0, 500], [0, -60]), { stiffness: 50, damping: 20 })
const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
const heroScale = useTransform(scrollY, [0, 400], [1, 0.97])
```

Replace the blob container:
```jsx
<div className="pointer-events-none absolute inset-0 overflow-hidden">
  <motion.div
    className="absolute h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[100px] animate-blob"
    style={{ left: `${mousePos.x * 0.6}%`, top: `${mousePos.y * 0.6}%`, transform: 'translate(-50%, -50%)', y: blobY1 }}
  />
  <motion.div
    className="absolute h-[400px] w-[400px] rounded-full bg-secondary/[0.05] blur-[80px] animate-blob-alt"
    style={{ right: `${100 - mousePos.x * 0.4}%`, bottom: `${100 - mousePos.y * 0.4}%`, transform: 'translate(50%, 50%)', y: blobY2 }}
  />
  <motion.div
    className="absolute h-[300px] w-[300px] rounded-full bg-gold/[0.03] blur-[60px] animate-blob"
    style={{ left: '40%', top: '30%', transform: 'translate(-50%, -50%)', y: blobY3 }}
  />
</div>
```

- [ ] **Step 2: Add scroll-linked fade to hero content**

Wrap the hero content in a motion div:
```jsx
<motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* existing hero content */}
</motion.div>
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — expect no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.jsx
git commit -m "feat: add parallax and scroll-linked fade to hero section"
```

---

### Task 3: IndiaMap Hover Effects & Live Counts

**Covers:** IndiaMap + StatsBar — lift+glow hover, live count tooltip

**Files:**
- Modify: `src/components/sections/IndiaMap.jsx`

**Interfaces:**
- Consumes: `useGetPackagesQuery` (existing)
- Produces: Enhanced region cards with lift, glow, and package count tooltip

- [ ] **Step 1: Enhance region card hover effects**

Replace the Link element in the region map with enhanced hover state:

```jsx
<Link to={`/packages?destination=${encodeURIComponent(region.name)}`}
  className={`group relative block overflow-hidden rounded-xl border-2 p-5 text-center transition-all duration-300 ${
    isHovered
      ? 'border-primary shadow-[0_8px_30px_rgba(47,82,51,0.15)] -translate-y-2 bg-white'
      : 'border-border shadow-subtle hover:border-primary/30 hover:shadow-medium hover:-translate-y-0.5'
  }`}>
  <div className={`absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-[0.06]' : ''}`} />
  <div className="relative">
    <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br transition-all duration-300 ${
      isHovered ? 'from-primary to-primary-light scale-110 shadow-medium' : 'from-primary to-primary-light'
    }`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <h3 className={`mb-1 text-sm font-bold transition-colors ${isHovered ? 'text-primary' : 'text-ink'}`}>{region.name}</h3>
    <p className="mb-2 text-xs text-muted">{region.states}</p>
    <span className="inline-block rounded-lg bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary">{count} packages</span>
  </div>
</Link>
```

- [ ] **Step 2: Enhance the destination preview tooltip**

Make the preview panel appear with a smooth spring animation:

```jsx
{hoveredRegion && (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className="mt-4 hidden sm:block"
  >
    {/* existing tooltip content */}
  </motion.div>
)}
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — expect no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/IndiaMap.jsx
git commit -m "feat: enhance IndiaMap region cards with lift+glow hover and animated tooltip"
```

---

### Task 4: StatsBar Easing & Number Formatting

**Covers:** IndiaMap + StatsBar — smooth easing, number formatting

**Files:**
- Modify: `src/components/sections/StatsBar.jsx`

**Interfaces:**
- Consumes: None
- Produces: Smooth counter animation with commas and easing

- [ ] **Step 1: Improve AnimatedCounter with easing and formatting**

Replace the `AnimatedCounter` component:

```jsx
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let startTime = null
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
      else setCount(target)
    }
    requestAnimationFrame(animate)
  }, [isInView, target, duration])

  const formatted = typeof target === 'number' && target >= 1000
    ? count.toLocaleString('en-IN')
    : count

  return <span ref={ref}>{formatted}{suffix}</span>
}
```

- [ ] **Step 2: Verify build**

Run: `npx vite build` — expect no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/StatsBar.jsx
git commit -m "feat: improve StatsBar counter with ease-out cubic and Indian number formatting"
```

---

### Task 5: TrendingPackages Drag-to-Scroll & Wishlist

**Covers:** TrendingPackages — drag-to-scroll, wishlist animation

**Files:**
- Modify: `src/components/sections/TrendingPackages.jsx`

**Interfaces:**
- Consumes: `useGetPackagesQuery` (existing)
- Produces: Drag-to-scroll carousel, animated wishlist hearts

- [ ] **Step 1: Add drag-to-scroll with framer-motion**

Replace the scroll container with a motion div that supports drag:

```jsx
// At top of component, add:
const [isDragging, setIsDragging] = useState(false)

// Replace the scroll container:
<motion.div
  ref={scrollRef}
  className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:px-6 lg:px-8"
  style={{ scrollSnapType: 'x mandatory', cursor: isDragging ? 'grabbing' : 'grab' }}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.1}
  onDragStart={() => setIsDragging(true)}
  onDragEnd={(_, info) => {
    setIsDragging(false)
    scrollRef.current?.scrollBy({ left: -info.offset.x, behavior: 'auto' })
  }}
>
```

- [ ] **Step 2: Enhance wishlist heart animation**

Replace the heart button with a more dramatic animation:

```jsx
<motion.button
  onClick={(e) => toggleWishlist(pkg._id, e)}
  whileTap={{ scale: 0.7 }}
  animate={wishlist[pkg._id] ? { scale: [1, 1.4, 1] } : {}}
  transition={{ duration: 0.3 }}
  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-subtle backdrop-blur-sm transition-all hover:bg-white hover:shadow-medium"
>
  <Heart className={`h-4 w-4 transition-all duration-300 ${wishlist[pkg._id] ? 'fill-error text-error' : 'text-muted'}`} />
</motion.button>
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — expect no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/TrendingPackages.jsx
git commit -m "feat: add drag-to-scroll and animated wishlist hearts to trending packages"
```

---

### Task 6: Testimonials Drag Gestures & Auto-Pause

**Covers:** Testimonials — swipe gestures, auto-pause on hover

**Files:**
- Modify: `src/components/sections/Testimonials.jsx`

**Interfaces:**
- Consumes: None
- Produces: Draggable testimonial carousel, auto-pause on hover

- [ ] **Step 1: Add drag gesture support to carousel**

Wrap the testimonial card in a motion.div with drag:

```jsx
// Add state:
const [isPaused, setIsPaused] = useState(false)

// Replace the testimonial card container:
<motion.div
  key={current}
  custom={direction}
  variants={variants}
  initial="enter"
  animate="center"
  exit="exit"
  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={(_, info) => {
    if (info.offset.x < -50) next()
    else if (info.offset.x > 50) prev()
  }}
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
  className="cursor-grab active:cursor-grabbing"
>
  {/* existing testimonial content */}
</motion.div>
```

- [ ] **Step 2: Make auto-advance respect pause state**

Replace the useEffect for auto-advance:

```jsx
useEffect(() => {
  if (isPaused) return
  const t = setInterval(next, 6000)
  return () => clearInterval(t)
}, [next, isPaused])
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — expect no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Testimonials.jsx
git commit -m "feat: add drag gestures and auto-pause to testimonials carousel"
```

---

### Task 7: Section Reveal Animations

**Covers:** Hero + scroll experience — section reveal animations

**Files:**
- Modify: `src/components/ui/AnimatedSection.jsx`
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: framer-motion `useInView`
- Produces: Each homepage section fades/slides in on scroll

- [ ] **Step 1: Verify AnimatedSection already works with scroll**

AnimatedSection already uses `useInView` with `once: true` and `margin: '-80px'`. It's already functional — sections using it already animate on scroll.

- [ ] **Step 2: Add staggered reveal to HomePage sections**

In `src/pages/HomePage.jsx`, wrap sections with motion for staggered reveal:

```jsx
import { motion } from 'framer-motion'

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
}

export default function HomePage() {
  return (
    <div>
      <Hero />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <IndiaMap />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <CategoriesSection />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <TrendingPackages />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <StatsBar />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <Testimonials />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <WhyChooseUs />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <LatestBlogs />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <Newsletter />
      </motion.div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={sectionVariants}>
        <CTASection />
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx vite build` — expect no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.jsx
git commit -m "feat: add section reveal animations to homepage"
```

---

### Task 8: Final Build Verification

**Covers:** All sections — final verification

**Files:** None (verification only)

- [ ] **Step 1: Full production build**

Run: `npx vite build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Dev server smoke test**

Run: `npx vite` and open http://localhost:3000
Verify:
- Scroll progress bar appears at top
- Hero blobs parallax on scroll
- Hero content fades as you scroll
- IndiaMap cards lift+glow on hover
- StatsBar counters animate with easing
- TrendingPackages supports drag-to-scroll
- Wishlist hearts animate
- Testimonials support drag gestures
- Auto-advance pauses on hover

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete landing page interactivity upgrade"
```
