import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, LogIn, Star, ShieldCheck, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import { loginThunk } from '../store/authSlice';
import { LOGO_WORDMARK } from '../utils/branding';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const from = location.state?.from || '/';

  const submit = async (e) => {
    e.preventDefault();
    const action = await dispatch(loginThunk(form));
    if (action.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(action.payload || 'Invalid credentials');
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage trips, wishlist and enquiries"
      sideTitle="Plan less. Travel more."
      sideText="Save your favourites, request custom itineraries, and pick up where you left off."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="email"
              required
              className="input pl-10"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type={show ? 'text' : 'password'}
              required
              className="input pl-10 pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label="Toggle password visibility"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          <LogIn size={16} /> Sign in
        </Button>
        <p className="text-center text-sm text-ink-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function AuthShell({ children, title, subtitle, sideTitle, sideText }) {
  return (
    <div className="min-h-[calc(100vh-67px)] grid lg:grid-cols-2 bg-cream-gradient">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <img
            src={LOGO_WORDMARK}
            alt="Roam Beyond"
            className="h-12 w-auto object-contain brightness-0"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden bg-brand-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_45%)]" />
        <div className="absolute inset-0 bg-grid-soft opacity-40" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cream-200/20 blur-3xl" />
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="relative h-full flex flex-col justify-end p-12 text-cream-50">
          <p className="font-display text-4xl font-semibold leading-tight max-w-md">{sideTitle}</p>
          <p className="mt-3 max-w-md text-cream-100/90">{sideText}</p>
          <div className="mt-8 flex gap-2">
            <span className="h-2 w-12 rounded-full bg-cream-100" />
            <span className="h-2 w-6 rounded-full bg-cream-100/40" />
            <span className="h-2 w-3 rounded-full bg-cream-100/40" />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-cream-100">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="fill-cream-300 text-cream-300" />
                ))}
              </span>
              4.9/5 rating
            </span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> 45+ destinations</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Verified stays</span>
          </div>
        </div>
      </div>
    </div>
  );
}
