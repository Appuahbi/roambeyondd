import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Compass, CheckCircle, XCircle } from 'lucide-react'
import { useVerifyEmailQuery } from '../services/authService'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { data, isLoading, isError } = useVerifyEmailQuery(token, { skip: !token })

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-128px)] items-center justify-center bg-cream px-4">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-error" />
          <h2 className="font-display text-xl font-bold text-ink">Invalid Link</h2>
          <p className="mt-2 text-sm text-muted">This verification link is invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-128px)] items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <Compass className="h-8 w-8 text-primary" />
          <span className="font-display text-2xl font-bold text-primary">RoamBeyond</span>
        </Link>

        <div className="mt-8 rounded-2xl border border-border bg-white p-8">
          {isLoading && (
            <div className="py-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-3 text-sm text-muted">Verifying your email...</p>
            </div>
          )}

          {isError && (
            <>
              <XCircle className="mx-auto mb-4 h-12 w-12 text-error" />
              <h2 className="font-display text-xl font-bold text-ink">Verification Failed</h2>
              <p className="mt-2 text-sm text-muted">
                This link may have expired or already been used.
              </p>
            </>
          )}

          {data && !isLoading && (
            <>
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
              <h2 className="font-display text-xl font-bold text-ink">Email Verified!</h2>
              <p className="mt-2 text-sm text-muted">
                Your email has been verified successfully.
              </p>
            </>
          )}

          <Link
            to="/login"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
