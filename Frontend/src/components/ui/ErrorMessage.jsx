import { AlertCircle } from 'lucide-react'

export default function ErrorMessage({ message = 'Something went wrong', className = '' }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border border-error/20 bg-error-light p-4 ${className}`}>
      <AlertCircle className="h-5 w-5 shrink-0 text-error" />
      <p className="text-sm text-error">{message}</p>
    </div>
  )
}
