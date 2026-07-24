import { motion, useReducedMotion } from 'framer-motion'
import Hero from '../components/sections/Hero'
import IndiaMap from '../components/sections/IndiaMap'
import CategoriesSection from '../components/sections/CategoriesSection'
import TrendingPackages from '../components/sections/TrendingPackages'
import StatsBar from '../components/sections/StatsBar'
import Testimonials from '../components/sections/Testimonials'
import WhyChooseUs from '../components/sections/WhyChooseUs'
import LatestBlogs from '../components/sections/LatestBlogs'
import CTASection from '../components/sections/CTASection'
import Newsletter from '../components/sections/Newsletter'

export default function HomePage() {
  const prefersReduced = useReducedMotion()
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: prefersReduced ? { duration: 0 } : { duration: 0.5 } }
  }

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
