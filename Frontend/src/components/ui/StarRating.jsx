import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, count = 0, size = 16 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${
            i <= Math.round(rating)
              ? 'fill-gold text-gold'
              : 'fill-border text-border'
          }`}
          size={size}
        />
      ))}
      {count > 0 && (
        <span className="ml-1 text-xs text-muted">({count})</span>
      )}
    </div>
  )
}
