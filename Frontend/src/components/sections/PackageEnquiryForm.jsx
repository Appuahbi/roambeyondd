import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Calendar, Users, MessageSquare, User, Phone, Mail, Send } from 'lucide-react';
import { enquiryApi, tripRequestApi } from '../../api/endpoints';
import { useReveal } from '../../hooks/useReveal';
import Button from '../ui/Button';

export default function PackageEnquiryForm({ pkg, mode = 'enquiry' }) {
  const user = useSelector((s) => s.auth.user);
  const [ref, shown] = useReveal();
  const [form, setForm] = useState(() => ({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    travelDate: '', adults: 2, children: 0, notes: ''
  }));
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || ''
      }));
    }
  }, [user]);

  const normalizePhone = (raw) => {
    const digits = (raw || '').replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!form.travelDate) return toast.error('Pick a travel date');
    setBusy(true);
    try {
      if (mode === 'trip') {
        await tripRequestApi.create({
          destination: pkg?.destination || 'Custom',
          startDate: form.travelDate,
          endDate: form.travelDate,
          groupSize: Number(form.adults) + Number(form.children || 0),
          adults: Number(form.adults),
          children: Number(form.children || 0),
          specialRequests: form.notes,
        });
        toast.success('Trip request sent! Our team will reach out within 24 hours.');
      } else {
        await enquiryApi.create({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: normalizePhone(form.phone),
          tourPackage: pkg._id,
          travelDate: form.travelDate,
          adults: Number(form.adults),
          children: Number(form.children || 0),
          notes: form.notes,
        });
        toast.success('Enquiry submitted! Reference number sent to your email.');
      }
      setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', travelDate: '', adults: 2, children: 0, notes: '' });
    } catch (err) {
      toast.error(err.message || 'Could not submit');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      ref={ref}
      onSubmit={submit}
      className={`card p-6 sm:p-7 ${shown ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
        {mode === 'trip' ? 'Custom trip request' : 'Send enquiry'}
      </p>
      <h3 className="mt-1 font-display text-2xl font-semibold text-ink-900">
        {mode === 'trip' ? 'Let us craft this trip for you' : 'Plan this trip'}
      </h3>
      <p className="mt-1 text-sm text-ink-500">
        We’ll respond within 24 hours. No payment required to enquire.
      </p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Field icon={User} placeholder="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field icon={Mail} type="email" placeholder="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field icon={Phone} placeholder="Phone (+91)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field icon={Calendar} type="date" value={form.travelDate} onChange={(v) => setForm({ ...form, travelDate: v })} required />
        <Field icon={Users} type="number" min={1} value={form.adults} onChange={(v) => setForm({ ...form, adults: v })} label="Adults" />
        <Field icon={Users} type="number" min={0} value={form.children} onChange={(v) => setForm({ ...form, children: v })} label="Children" />
      </div>

      <div className="mt-3">
        <label className="label">Notes (optional)</label>
        <div className="relative">
          <MessageSquare size={16} className="absolute left-3.5 top-3 text-ink-400" />
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Hotel preference, food requirements, special occasions…"
            className="input pl-10 py-3"
          />
        </div>
      </div>

      <Button type="submit" loading={busy} className="w-full mt-4">
        <Send size={16} /> {mode === 'trip' ? 'Send trip request' : 'Send enquiry'}
      </Button>
      <p className="mt-2 text-center text-xs text-ink-500">
        By submitting, you agree to our <a href="#" className="text-brand-700 font-semibold">Privacy Policy</a>.
      </p>
    </form>
  );
}

function Field({ icon: Icon, label, type = 'text', onChange, ...rest }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type={type}
          className="input pl-10"
          onChange={(e) => onChange?.(e.target.value)}
          {...rest}
        />
      </div>
    </div>
  );
}
