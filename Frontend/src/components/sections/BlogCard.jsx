import { Link } from 'react-router-dom'
import { Calendar, Eye, User } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { formatDate, truncate } from '../../utils/helpers'

export default function BlogCard({ blog }) {
  return (
    <Link to={`/blog/${blog.slug}`}>
      <Card hover className="group overflow-hidden">
        <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10">
          {blog.featuredImage?.url ? (
            <img
              src={blog.featuredImage.url}
              alt={blog.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary/30">
              <span className="font-display text-4xl">B</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Badge color="secondary">{blog.category}</Badge>
          </div>
          <h3 className="mb-2 font-display text-lg font-semibold text-ink transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
          <p className="mb-3 text-sm text-muted">
            {truncate(blog.excerpt || blog.content, 120)}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {blog.author?.name || 'Admin'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {blog.views || 0}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
