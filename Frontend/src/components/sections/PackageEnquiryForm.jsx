import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Calendar, Users, MessageSquare, User, Phone, Mail, Send, FileSearch } from 'lucide-react';
import { enquiryApi, tripRequestApi } from '../../api/endpoints';
import { useReveal } from '../../hooks/useReveal';
import Button from '../ui/Button';

export default function PackageEnquiryForm({ pkg, mode = 'enquiry' }) {
  const { t } = useTranslation();
  const [ref, shown] = useReveal();
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    travelDate: '', adults: 2, children: 0, notes: ''
  });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const normalizePhone = (raw) => {
    const digits = (raw || '').replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.travelDate) return toast.error(t('enquiry.pickDate'));
    setBusy(true);
    try {
      if (mode === 'trip') {
        await tripRequestApi.create({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: normalizePhone(form.phone),
          destination: pkg?.destination || 'Custom',
          startDate: form.travelDate,
          endDate: form.travelDate,
          groupSize: Number(form.adults) + Number(form.children || 0),
          adults: Number(form.adults),
          children: Number(form.children || 0),
          specialRequests: form.notes,
        });
        toast.success(t('enquiry.tripSent'));
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
        toast.success(t('enquiry.submitted'));
      }
      setForm({ name: '', email: '', phone: '', travelDate: '', adults: 2, children: 0, notes: '' });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || t('enquiry.couldNotSubmit'));
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
        {mode === 'trip' ? t('enquiry.customTripTitle') : t('enquiry.sendEnquiry')}
      </p>
      <h3 className="mt-1 font-display text-2xl font-semibold text-ink-900">
        {mode === 'trip' ? t('enquiry.craftTrip') : t('enquiry.planThisTrip')}
      </h3>
      <p className="mt-1 text-sm text-ink-500">
        {t('enquiry.respond24h')}
      </p>
      <p className="mt-1 text-xs font-semibold text-brand-700">
        {t('enquiry.guestNote')}
      </p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <Field icon={User} placeholder={t('enquiry.fullName')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
        <Field icon={Mail} type="email" placeholder={t('enquiry.email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
        <Field icon={Phone} placeholder={t('enquiry.phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
        <Field icon={Calendar} type="date" value={form.travelDate} onChange={(v) => setForm({ ...form, travelDate: v })} required />
        <Field icon={Users} type="number" min={1} value={form.adults} onChange={(v) => setForm({ ...form, adults: v })} label={t('enquiry.adults')} />
        <Field icon={Users} type="number" min={0} value={form.children} onChange={(v) => setForm({ ...form, children: v })} label={t('enquiry.children')} />
      </div>

      <div className="mt-3">
        <label className="label">{t('enquiry.notes')}</label>
        <div className="relative">
          <MessageSquare size={16} className="absolute left-3.5 top-3 text-ink-400" />
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder={t('enquiry.notesPlaceholder')}
            className="input pl-10 py-3"
          />
        </div>
      </div>

      {submitted && (
        <Link to="/track-enquiry" className="btn-secondary w-full mt-4 text-center text-sm">
          <FileSearch size={16} /> {t('enquiry.trackLink')}
        </Link>
      )}

      <Button type="submit" loading={busy} className="w-full mt-4">
        <Send size={16} /> {mode === 'trip' ? t('enquiry.sendTripRequest') : t('enquiry.sendEnquiry')}
      </Button>
      <p className="mt-2 text-center text-xs text-ink-500">
        {t('enquiry.agree')} <a href="#" className="text-brand-700 font-semibold">{t('footer.privacy')}</a>.
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