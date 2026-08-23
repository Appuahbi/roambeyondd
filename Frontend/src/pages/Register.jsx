import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Seo from '../components/seo/Seo';
import { registerThunk } from '../store/authSlice';
import { authApi } from '../api/endpoints';
import { AuthShell } from './Login';

const RESEND_SECONDS = 30;

export default function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.auth.loading);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState('');
  const [show, setShow] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef(null);

  const phoneValid = /^[6-9]\d{9}$/.test(form.phone);

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

  const sendOtp = async () => {
    if (!phoneValid) return toast.error(t('auth.validPhone'));
    setSendingOtp(true);
    try {
      await authApi.sendOtp({ phone: form.phone, purpose: 'register' });
      setOtpSent(true);
      setOtp('');
      startResendTimer();
      toast.success(t('auth.otpSent', { phone: form.phone }));
    } catch (err) {
      toast.error(err.message || t('auth.otpNotSent'));
    } finally {
      setSendingOtp(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error(t('auth.validPhone'));
    if (form.password.length < 8) return toast.error(t('auth.passwordMin'));
    if (!otpSent) return toast.error(t('auth.otpRequired'));
    if (!/^\d{6}$/.test(otp)) return toast.error(t('auth.otpRequired'));
    const action = await dispatch(registerThunk({ ...form, otp }));
    if (action.meta.requestStatus === 'fulfilled') {
      toast.success(t('auth.accountCreated'));
      navigate('/', { replace: true });
    } else {
      toast.error(action.payload || t('auth.accountFailed'));
    }
  };

  return (
    <AuthShell
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      sideTitle={t('auth.registerSideTitle')}
      sideText={t('auth.registerSideText')}
    >
      <Seo title={t('auth.registerTitle')} path="/register" noindex />
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="label">{t('auth.fullName')}</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              required
              minLength={2}
              className="input pl-10"
              placeholder={t('auth.yourName')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
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
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value.replace(/\D/g, '') });
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
          <div className="rounded-2xl border border-brand-100 bg-brand-soft-gradient p-3.5 animate-fade-up">
            <p className="text-xs font-semibold text-brand-800">{t('auth.verifyPhone')}</p>
            <p className="text-xs text-ink-500 mb-2.5">{t('auth.verifyPhoneSubtitle', { phone: form.phone })}</p>
            <div className="relative">
              <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-600" />
              <input
                autoFocus
                required
                inputMode="numeric"
                maxLength={6}
                className="input pl-10 text-center tracking-[0.5em] font-semibold"
                placeholder="______"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
          </div>
        )}

        <div>
          <label className="label">{t('auth.password')}</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type={show ? 'text' : 'password'}
              required
              minLength={8}
              className="input pl-10 pr-10"
              placeholder={t('auth.passwordHint')}
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
        <p className="text-xs text-ink-500">
          {t('auth.agreeTerms')} <a className="text-brand-700 font-semibold" href="#">{t('footer.terms')}</a> {t('auth.and')} <a className="text-brand-700 font-semibold" href="#">{t('footer.privacy')}</a>.
        </p>
        <Button type="submit" loading={loading} className="w-full">
          <UserPlus size={16} /> {t('auth.createAccount')}
        </Button>
        <p className="text-center text-sm text-ink-500">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">{t('auth.signIn')}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
