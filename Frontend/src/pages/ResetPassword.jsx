import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { authApi } from '../api/endpoints';
import { AuthShell } from './Login';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return toast.error('Min 8 characters');
    setBusy(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setDone(true);
      toast.success('Password updated');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose something strong" sideTitle="Almost there.">
      {done ? (
        <div className="text-center space-y-3">
          <CheckCircle2 className="mx-auto text-brand-600" size={42} />
          <p>Your password has been updated.</p>
          <Link to="/login" className="btn-primary inline-flex">Go to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">New password</label>
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
          <Button type="submit" loading={busy} className="w-full">Update password</Button>
        </form>
      )}
    </AuthShell>
  );
}
