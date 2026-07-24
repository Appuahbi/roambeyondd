import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useGetBlogsQuery } from '../../services/blogsService'
import BlogCard from './BlogCard'
import AnimatedSection from '../ui/AnimatedSection'
import { SkeletonList } from '../ui/Skeleton'

export default function LatestBlogs() {
  const { data, isLoading } = useGetBlogsQuery({ limit: 3 })
  const blogs = data?.data?.blogs || data?.data || []

  if (!blogs.length && !isLoading) return null

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnimatedSection className="mb-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                From the Blog
              </p>
              <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
                Travel Stories & Tips
              </h2>
            </div>
            <Link
              to="/blog"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark sm:flex"
            >
              Read all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.slice(0, 3).map((blog, i) => (
              <motion.div
                key={blog._id || blog.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
