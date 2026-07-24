import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/15 ${
          error ? 'border-error focus:border-error focus:ring-error/15' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  )
})

export default Input
