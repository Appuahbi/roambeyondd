import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Compass, CheckCircle } from 'lucide-react'
import { useResetPasswordMutation } from '../services/authService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await resetPassword({ token, password }).unwrap()
      navigate('/login')
    } catch (err) {
      setError(err?.data?.message || 'Failed to reset password')
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-128px)] items-center justify-center bg-cream px-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-ink">Invalid Reset Link</h2>
          <p className="mt-2 text-sm text-muted">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    )
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
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter your new password below
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, upper + lower + number"
            />
            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={isLoading} className="w-full" size="lg">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
