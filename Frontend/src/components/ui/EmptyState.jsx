import { PackageOpen } from 'lucide-react'

export default function EmptyState({ icon: Icon = PackageOpen, title = 'Nothing here yet', description = '', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cream">
        <Icon className="h-8 w-8 text-muted" />
      </div>
      <h3 className="mb-1 font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="text-sm text-muted">{description}</p>}
    </div>
  )
}
