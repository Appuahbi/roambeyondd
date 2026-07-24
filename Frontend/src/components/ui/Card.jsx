export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-white shadow-card transition-all duration-300 ${
        hover ? 'hover:shadow-card-hover hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
