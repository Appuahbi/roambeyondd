import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, Mail } from 'lucide-react'
import { useForgotPasswordMutation } from '../services/authService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await forgotPassword(email).unwrap()
      setSuccess(true)
    } catch (err) {
      setError(err?.data?.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-128px)] items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Compass className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-primary">RoamBeyond</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink">
            Forgot Password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-ink">
                Check Your Email
              </h3>
              <p className="text-sm text-muted">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </p>
              <Link to="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {error && <p className="text-sm text-error">{error}</p>}
              <Button type="submit" loading={isLoading} className="w-full" size="lg">
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
