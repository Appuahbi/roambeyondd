import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-128px)] items-center justify-center bg-cream px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-2 font-display text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-3 font-display text-2xl font-bold text-ink">
          Page Not Found
        </h2>
        <p className="mb-6 text-sm text-muted">
          Looks like this page has wandered off the beaten path.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  )
}
