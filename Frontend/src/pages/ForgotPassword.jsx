import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import { authApi } from '../api/endpoints';
import { AuthShell } from './Login';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Check your inbox for the reset link');
    } catch (err) {
      toast.error(err.message || 'Could not send reset link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Forgot your password?'}
      subtitle={
        sent
          ? `We sent a reset link to ${email}`
          : 'Enter your email and we’ll send you a secure reset link'
      }
      sideTitle="Don’t worry."
      sideText="It happens. We’ll get you back to planning in a minute."
    >
      {!sent ? (
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" loading={busy} className="w-full">
            <Send size={16} /> Send reset link
          </Button>
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-ink-700 hover:text-brand-700">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <div className="grid place-items-center h-16 w-16 mx-auto rounded-full bg-cream-100 text-brand-700">
            <Mail size={28} />
          </div>
          <Link to="/login" className="btn-secondary inline-flex">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
