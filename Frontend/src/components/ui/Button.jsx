import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-gradient-to-br from-primary to-primary-light text-white shadow-subtle hover:shadow-medium',
  secondary:
    'bg-gradient-to-br from-secondary to-secondary-light text-white shadow-subtle hover:shadow-medium',
  outline:
    'border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white hover:shadow-medium',
  ghost:
    'text-primary hover:bg-primary/8',
  gold:
    'bg-gradient-to-br from-gold to-gold-light text-ink shadow-subtle hover:shadow-medium',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-sm rounded-lg',
  lg: 'px-8 py-3 text-base rounded-lg',
  full: 'px-6 py-3 text-sm rounded-lg w-full',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled || loading ? {} : { y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
}
