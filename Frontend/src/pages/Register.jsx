import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Eye, EyeOff, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import { registerThunk } from '../store/authSlice';
import { AuthShell } from './Login';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.auth.loading);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [show, setShow] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Enter a valid 10-digit Indian number');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    const action = await dispatch(registerThunk(form));
    if (action.meta.requestStatus === 'fulfilled') {
      toast.success('Account created!');
      navigate('/', { replace: true });
    } else {
      toast.error(action.payload || 'Could not create account');
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save trips, request itineraries, and check out faster"
      sideTitle="India is calling."
      sideText="Join thousands of travellers who plan, dream and explore with Roam Beyond."
    >
      <form onSubmit={submit} className="space-y-3.5">
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              required
              minLength={2}
              className="input pl-10"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>
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
          <label className="label">Phone</label>
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
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type={show ? 'text' : 'password'}
              required
              minLength={8}
              className="input pl-10 pr-10"
              placeholder="At least 8 characters, 1 uppercase, 1 number"
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
        <p className="text-xs text-ink-500">
          By signing up, you agree to our <a className="text-brand-700 font-semibold" href="#">Terms</a> and <a className="text-brand-700 font-semibold" href="#">Privacy</a>.
        </p>
        <Button type="submit" loading={loading} className="w-full">
          <UserPlus size={16} /> Create account
        </Button>
        <p className="text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
