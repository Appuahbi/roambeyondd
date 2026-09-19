import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, LogIn, Star, ShieldCheck, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import Seo from '../components/seo/Seo';
import { loginThunk } from '../store/authSlice';
import { LOGO_WORDMARK } from '../utils/branding';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  // Staff who are already signed in don't need the login page.
  if (user?.role === 'admin' || user?.role === 'agent') {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    const action = await dispatch(loginThunk(form));
    if (action.meta.requestStatus === 'fulfilled') {
      toast.success(t('auth.welcomeBack'));
      navigate('/admin', { replace: true });
    } else {
      toast.error(action.payload || t('auth.invalidCredentials'));
    }
  };

  return (
    <AuthShell
      title={t('auth.adminLoginTitle', 'Admin sign in')}
      subtitle={t('auth.adminLoginSubtitle', 'Staff only — guests can browse and enquire freely.')}
      sideTitle={t('auth.sideTitle')}
      sideText={t('auth.sideText')}
    >
      <Seo title={t('auth.loginTitle')} path="/admin/login" noindex />

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
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
          <label className="label">{t('auth.password')}</label>
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
              aria-label={t('auth.togglePassword')}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          <LogIn size={16} /> {t('auth.signIn')}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-500">
        {t('auth.notStaff', 'Looking to plan a trip?')}{' '}
        <Link to="/packages" className="font-semibold text-brand-700 hover:text-brand-800">
          {t('auth.browsePackages', 'Browse tours')}
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children, title, subtitle, sideTitle, sideText }) {
  const { t } = useTranslation();
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
              {t('auth.rating')}
            </span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {t('auth.destinations')}</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> {t('auth.verifiedStays')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}