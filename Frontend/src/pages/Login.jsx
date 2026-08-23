import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, LogIn, Star, ShieldCheck, MapPin, Phone, MessageSquareText } from 'lucide-react';
import Button from '../components/ui/Button';
import Seo from '../components/seo/Seo';
import { loginThunk, phoneLoginThunk } from '../store/authSlice';
import { authApi } from '../api/endpoints';
import { LOGO_WORDMARK } from '../utils/branding';

const RESEND_SECONDS = 30;

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);
  const [method, setMethod] = useState('password');
  const [form, setForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ phone: '', otp: '' });
  const [show, setShow] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef(null);
  const from = location.state?.from || '/';

  const phoneValid = /^[6-9]\d{9}$/.test(otpForm.phone);

  const startResendTimer = () => {
    setResendIn(RESEND_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const switchMethod = (m) => {
    setMethod(m);
    setOtpSent(false);
    setResendIn(0);
    clearInterval(timerRef.current);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    const action = await dispatch(loginThunk(form));
    if (action.meta.requestStatus === 'fulfilled') {
      toast.success(t('auth.welcomeBack'));
      navigate(from, { replace: true });
    } else {
      toast.error(action.payload || t('auth.invalidCredentials'));
    }
  };

  const sendOtp = async () => {
    if (!phoneValid) return toast.error(t('auth.validPhone'));
    setSendingOtp(true);
    try {
      await authApi.sendOtp({ phone: otpForm.phone, purpose: 'login' });
      setOtpSent(true);
      setOtpForm((f) => ({ ...f, otp: '' }));
      startResendTimer();
      toast.success(t('auth.otpSent', { phone: otpForm.phone }));
    } catch (err) {
      toast.error(err.message || t('auth.otpNotSent'));
    } finally {
      setSendingOtp(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    if (!otpSent) return toast.error(t('auth.otpRequired'));
    if (!/^\d{6}$/.test(otpForm.otp)) return toast.error(t('auth.otpRequired'));
    const action = await dispatch(phoneLoginThunk({ phone: otpForm.phone, otp: otpForm.otp }));
    if (action.meta.requestStatus === 'fulfilled') {
      toast.success(t('auth.welcomeBack'));
      navigate(from, { replace: true });
    } else {
      toast.error(action.payload || t('auth.otpInvalid'));
    }
  };

  return (
    <AuthShell
      title={method === 'otp' ? t('auth.otpTitle') : t('auth.loginTitle')}
      subtitle={method === 'otp' ? t('auth.otpSubtitle') : t('auth.loginSubtitle')}
      sideTitle={t('auth.sideTitle')}
      sideText={t('auth.sideText')}
    >
      <Seo title={t('auth.loginTitle')} path="/login" noindex />

      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-cream-100/80 p-1">
        {[
          { id: 'password', label: t('auth.loginWithPassword'), icon: Lock },
          { id: 'otp', label: t('auth.loginWithOtp'), icon: MessageSquareText },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => switchMethod(m.id)}
            className={[
              'flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-all',
              method === m.id ? 'bg-brand-600 text-white shadow-soft' : 'text-ink-700 hover:text-brand-700',
            ].join(' ')}
          >
            <m.icon size={15} /> {m.label}
          </button>
        ))}
      </div>

      {method === 'password' ? (
        <form onSubmit={submitPassword} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="label">{t('auth.password')}</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                {t('auth.forgot')}
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
      ) : (
        <form onSubmit={submitOtp} className="space-y-4">
          <div>
            <label className="label">{t('auth.phone')}</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-ink-500">+91</span>
              <input
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                className="input pl-16 pr-28"
                placeholder="98765 43210"
                value={otpForm.phone}
                onChange={(e) => {
                  setOtpForm({ ...otpForm, phone: e.target.value.replace(/\D/g, '') });
                  setOtpSent(false);
                }}
              />
              <button
                type="button"
                onClick={sendOtp}
                disabled={sendingOtp || resendIn > 0}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed px-2.5 py-1.5 rounded-lg bg-brand-50"
              >
                {sendingOtp ? '…' : resendIn > 0 ? t('auth.resendIn', { seconds: resendIn }) : t('auth.sendOtp')}
              </button>
            </div>
          </div>
          {otpSent && (
            <div className="relative animate-fade-up">
              <label className="label">{t('auth.otpPlaceholder')}</label>
              <input
                autoFocus
                required
                inputMode="numeric"
                maxLength={6}
                className="input pl-10 text-center tracking-[0.5em] font-semibold"
                placeholder="______"
                value={otpForm.otp}
                onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              />
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full">
            <LogIn size={16} /> {t('auth.signIn')}
          </Button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-ink-500">
        {t('auth.newHere')}{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
          {t('auth.createAccount')}
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
