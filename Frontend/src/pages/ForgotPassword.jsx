import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, Phone, ShieldCheck, Lock, CheckCircle2, MessageSquareText, KeyRound } from 'lucide-react';
import Button from '../components/ui/Button';
import Seo from '../components/seo/Seo';
import { authApi } from '../api/endpoints';
import { AuthShell } from './Login';

const RESEND_SECONDS = 30;

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState('send');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const timerRef = useRef(null);

  const phoneValid = /^[6-9]\d{9}$/.test(phone);

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
    setStep('send');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setResendIn(0);
    clearInterval(timerRef.current);
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.forgotPassword({ email });
      setStep('done');
      toast.success(t('auth.resetSent'));
    } catch (err) {
      toast.error(err.message || t('auth.resetFailed'));
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    if (!phoneValid) return toast.error(t('auth.validPhone'));
    setBusy(true);
    try {
      await authApi.sendOtp({ phone, purpose: 'reset' });
      setStep('otp');
      setOtp('');
      startResendTimer();
      toast.success(t('auth.smsCodeSent', { phone }));
    } catch (err) {
      toast.error(err.message || t('auth.otpNotSent'));
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) return toast.error(t('auth.otpRequired'));
    setBusy(true);
    try {
      const res = await authApi.verifyOtp({ phone, otp, purpose: 'reset' });
      setResetToken(res.data.token);
      setStep('password');
    } catch (err) {
      toast.error(err.message || t('auth.otpInvalid'));
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error(t('auth.passwordMin'));
    setBusy(true);
    try {
      await authApi.resetPassword({ token: resetToken, newPassword });
      setStep('done');
      toast.success(t('auth.passwordUpdated'));
    } catch (err) {
      toast.error(err.message || t('auth.passwordUpdateFailed'));
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    done: t('auth.checkInbox'),
  };

  return (
    <AuthShell
      title={titles[step] || (method === 'sms' ? (step === 'password' ? t('auth.enterNewPassword') : t('auth.forgotTitle')) : t('auth.forgotTitle'))}
      subtitle={
        step === 'done'
          ? method === 'sms'
            ? t('auth.passwordUpdatedMsg')
            : t('auth.sentTo', { email })
          : method === 'sms'
            ? step === 'password'
              ? t('auth.codeVerified')
              : t('auth.smsResetSubtitle')
            : t('auth.forgotSubtitle')
      }
      sideTitle={t('auth.forgotSideTitle')}
      sideText={t('auth.forgotSideText')}
    >
      <Seo title={t('auth.forgotTitle')} path="/forgot-password" noindex />

      {step === 'done' ? (
        <div className="space-y-4 text-center">
          <div className="grid place-items-center h-16 w-16 mx-auto rounded-full bg-cream-100 text-brand-700">
            {method === 'sms' ? <CheckCircle2 size={28} /> : <Mail size={28} />}
          </div>
          <Link to="/login" className="btn-secondary inline-flex">
            <ArrowLeft size={14} /> {t('auth.backToSignIn')}
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-cream-100/80 p-1">
            {[
              { id: 'email', label: t('auth.resetViaEmail'), icon: Mail },
              { id: 'sms', label: t('auth.resetViaSms'), icon: MessageSquareText },
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

          {method === 'email' ? (
            <form onSubmit={submitEmail} className="space-y-4">
              <div>
                <label className="label">{t('auth.email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    required
                    className="input pl-10"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" loading={busy} className="w-full">
                <Send size={16} /> {t('auth.sendResetLink')}
              </Button>
            </form>
          ) : step === 'send' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
              className="space-y-4"
            >
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
                    className="input pl-16"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <Button type="submit" loading={busy} className="w-full">
                <Send size={16} /> {t('auth.sendOtp')}
              </Button>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="label">{t('auth.otpPlaceholder')}</label>
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
                <div className="mt-2 text-right">
                  {resendIn > 0 ? (
                    <span className="text-xs text-ink-400">{t('auth.resendIn', { seconds: resendIn })}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                    >
                      {t('auth.resendOtp')}
                    </button>
                  )}
                </div>
              </div>
              <Button type="submit" loading={busy} className="w-full">
                <ShieldCheck size={16} /> {t('auth.verifyPhone')}
              </Button>
            </form>
          ) : (
            <form onSubmit={submitPassword} className="space-y-4">
              <div>
                <label className="label">{t('auth.newPassword')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    autoFocus
                    type="password"
                    required
                    minLength={8}
                    className="input pl-10"
                    placeholder={t('auth.passwordHint')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-500">{t('auth.passwordMinShort')}</p>
              </div>
              <Button type="submit" loading={busy} className="w-full">
                <KeyRound size={16} /> {t('auth.updatePassword')}
              </Button>
            </form>
          )}
        </>
      )}

      <Link to="/login" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-ink-700 hover:text-brand-700">
        <ArrowLeft size={14} /> {t('auth.backToSignIn')}
      </Link>
    </AuthShell>
  );
}
