import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, User, Tag } from 'lucide-react'
import { useGetBlogBySlugQuery } from '../services/blogsService'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'
import Badge from '../components/ui/Badge'
import { formatDate } from '../utils/helpers'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { data, isLoading, isError, error } = useGetBlogBySlugQuery(slug)

  if (isLoading) return <LoadingSpinner className="py-24" />
  if (isError) return <div className="mx-auto max-w-7xl px-4 py-8"><ErrorMessage message={error?.data?.message || 'Blog post not found'} /></div>

  const blog = data?.data
  if (!blog) return null

  return (
    <div className="bg-cream">
      {/* Featured image */}
      <div className="aspect-[21/9] bg-gradient-to-br from-secondary/20 to-primary/10 sm:aspect-[3/1]">
        {blog.featuredImage?.url ? (
          <img
            src={blog.featuredImage.url}
            alt={blog.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-6xl text-primary/20">B</span>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/blog"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> All Blog Posts
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge color="secondary">{blog.category}</Badge>
          {blog.tags?.map((tag) => (
            <Badge key={tag} color="muted">
              <Tag className="mr-1 h-3 w-3" /> {tag}
            </Badge>
          ))}
        </div>

        <h1 className="mb-4 font-display text-3xl font-bold text-ink sm:text-4xl">
          {blog.title}
        </h1>

        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {blog.author?.name || 'Admin'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {blog.views || 0} views
          </span>
        </div>

        {/* Blog content */}
        <div
          className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-muted prose-a:text-primary prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  )
}
