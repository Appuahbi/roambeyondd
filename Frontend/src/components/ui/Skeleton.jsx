export function SkeletonCard({ className = '' }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-white ${className}`}>
      <div className="aspect-[16/10] animate-pulse bg-cream" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-20 animate-pulse rounded-full bg-cream" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-cream" />
        <div className="h-3 w-full animate-pulse rounded bg-cream" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-cream" />
        <div className="flex items-center gap-2 pt-2">
          <div className="h-6 w-24 animate-pulse rounded bg-cream" />
          <div className="h-4 w-16 animate-pulse rounded bg-cream" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3, className = '' }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-cream"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}
