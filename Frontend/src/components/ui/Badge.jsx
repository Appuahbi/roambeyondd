const colorMap = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  gold: 'bg-gold/15 text-amber-800',
  muted: 'bg-cream text-muted',
  success: 'bg-success/10 text-success',
  error: 'bg-error/10 text-error',
}

export default function Badge({ children, color = 'primary', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  )
}
