import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Eye, EyeOff, MapPin, ArrowRight } from 'lucide-react'
import { useLoginMutation } from '../services/authService'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import toast from 'react-hot-toast'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const result = await login(form).unwrap()
      dispatch(setCredentials({ user: result.data?.user || result.user, token: result.data?.token || result.token }))
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      setError(err?.data?.message || 'Invalid email or password')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — decorative */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary lg:flex lg:flex-col lg:justify-center lg:p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/20" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/10" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <Compass className="h-8 w-8 text-gold" />
            <span className="font-display text-2xl font-bold text-white">RoamBeyond</span>
          </Link>
          <h2 className="mb-4 font-display text-4xl font-bold text-white leading-tight">
            Welcome back to your next adventure
          </h2>
          <p className="mb-8 max-w-md text-base text-white/70">
            Log in to access your enquiries, manage your profile, and continue planning your perfect trip across India.
          </p>
          <div className="space-y-3">
            {['50+ curated destinations', 'Expert local guides', 'Secure booking process'].map((text) => (
              <div key={text} className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 text-gold" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-cream p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <Compass className="h-8 w-8 text-primary" />
              <span className="font-display text-2xl font-bold text-primary">RoamBeyond</span>
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-2 font-display text-3xl font-bold text-ink">
              Log in
            </h1>
            <p className="mb-8 text-muted">
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 pr-10 text-sm text-ink outline-none transition-all placeholder:text-muted-light focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" className="rounded border-border accent-primary" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-error-light p-3 text-sm text-error">
                  {error}
                </motion.p>
              )}

              <Button type="submit" loading={isLoading} className="w-full" size="lg">
                Log in
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Sign up free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
