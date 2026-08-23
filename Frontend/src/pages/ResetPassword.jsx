import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Lock, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Seo from '../components/seo/Seo';
import { authApi } from '../api/endpoints';
import { AuthShell } from './Login';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error(t('auth.passwordMinShort'));
    setBusy(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setDone(true);
      toast.success(t('auth.passwordUpdated'));
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.message || t('auth.resetFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t('auth.setNewPassword')} subtitle={t('auth.setNewSubtitle')} sideTitle={t('auth.almostThere')}>
      <Seo title={t('auth.setNewPassword')} path="/reset-password" noindex />
      {done ? (
        <div className="text-center space-y-3">
          <CheckCircle2 className="mx-auto text-brand-600" size={42} />
          <p>{t('auth.passwordUpdatedMsg')}</p>
          <Link to="/login" className="btn-primary inline-flex">{t('auth.goToSignIn')}</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">{t('auth.newPassword')}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                required
                minLength={8}
                className="input pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" loading={busy} className="w-full">{t('auth.updatePassword')}</Button>
        </form>
      )}
    </AuthShell>
  );
}
