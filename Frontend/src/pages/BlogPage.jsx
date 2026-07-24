import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useGetBlogsQuery } from '../services/blogsService'
import { BLOG_CATEGORIES } from '../utils/constants'
import BlogCard from '../components/sections/BlogCard'
import Pagination from '../components/ui/Pagination'
import AnimatedSection from '../components/ui/AnimatedSection'
import { SkeletonList } from '../components/ui/Skeleton'
import ErrorMessage from '../components/ui/ErrorMessage'
import EmptyState from '../components/ui/EmptyState'

const POSTS_PER_PAGE = 6

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || ''
  const activeSearch = searchParams.get('search') || ''
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState(activeSearch)

  const queryParams = useMemo(() => {
    const params = { limit: 50 }
    if (activeCategory) params.category = activeCategory
    if (activeSearch) params.search = activeSearch
    return params
  }, [activeCategory, activeSearch])

  const { data, isLoading, isError, error } = useGetBlogsQuery(queryParams)

  const allBlogs = data?.data?.blogs || data?.data || []
  const totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE)
  const paginatedBlogs = allBlogs.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

  const handleCategoryChange = (cat) => {
    setPage(1)
    if (cat === activeCategory) {
      searchParams.delete('category')
    } else {
      searchParams.set('category', cat)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    if (searchInput.trim()) {
      searchParams.set('search', searchInput.trim())
    } else {
      searchParams.delete('search')
    }
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <div className="bg-cream">
      {/* Header */}
      <div className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AnimatedSection>
            <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
              Travel Blog
            </h1>
            <p className="mt-2 text-muted">
              Stories, guides, and tips from our travel experts
            </p>
          </AnimatedSection>

          {/* Search */}
          <AnimatedSection delay={0.1}>
            <form onSubmit={handleSearch} className="mt-6 max-w-md">
              <div className="flex items-center rounded-xl border border-border bg-cream transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="ml-3 h-4 w-4 text-muted" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted-light"
                />
                <button type="submit" className="mr-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-dark">
                  Search
                </button>
              </div>
            </form>
          </AnimatedSection>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Category filter */}
        <AnimatedSection className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !activeCategory
                  ? 'bg-primary text-white'
                  : 'bg-white text-muted border border-border hover:bg-cream'
              }`}
            >
              All
            </button>
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-white text-muted border border-border hover:bg-cream'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Active filters */}
        {(activeCategory || activeSearch) && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted">
            <span>Active filters:</span>
            {activeCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {activeCategory}
                <button onClick={() => handleCategoryChange(activeCategory)} className="ml-0.5 hover:text-primary-dark">×</button>
              </span>
            )}
            {activeSearch && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                "{activeSearch}"
                <button onClick={() => { setSearchInput(''); searchParams.delete('search'); setSearchParams(searchParams, { replace: true }) }} className="ml-0.5 hover:text-primary-dark">×</button>
              </span>
            )}
          </div>
        )}

        {isLoading && <SkeletonList count={6} />}

        {isError && <ErrorMessage message={error?.data?.message || 'Failed to load blogs'} />}

        {!isLoading && paginatedBlogs.length === 0 && (
          <EmptyState
            title="No blog posts found"
            description={activeSearch ? `No results for "${activeSearch}". Try different keywords.` : 'Check back soon for travel stories and tips.'}
          />
        )}

        {paginatedBlogs.length > 0 && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedBlogs.map((blog, i) => (
                <motion.div
                  key={blog._id || blog.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <BlogCard blog={blog} />
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
