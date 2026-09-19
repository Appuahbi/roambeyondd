import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Mail, Phone, FileText, Calendar, Users, Clock } from 'lucide-react';
import { enquiryApi } from '../api/endpoints';
import { useReveal } from '../hooks/useReveal';
import { formatDate, timeAgo } from '../utils/format';
import Button from '../components/ui/Button';
import Seo from '../components/seo/Seo';

export default function TrackEnquiry() {
  const { t } = useTranslation();
  const [ref, shown] = useReveal();
  const [form, setForm] = useState({ email: '', phone: '', enquiryNumber: '' });
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState(null);
  const [error, setError] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFound(null);
    setError(false);
    try {
      const params = {};
      if (form.email.trim()) params.email = form.email.trim();
      if (form.phone.trim()) params.phone = form.phone.replace(/\D/g, '');
      if (form.enquiryNumber.trim()) params.enquiryNumber = form.enquiryNumber.trim();
      if (!params.email && !params.phone) return;
      const res = await enquiryApi.lookup(params);
      setFound(res.data);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-cream-gradient min-h-screen">
      <Seo title={t('track.title')} path="/track-enquiry" />
      <div className="section py-10 sm:py-14">
        <div ref={ref} className={`mx-auto max-w-2xl ${shown ? 'animate-fade-up' : 'opacity-0'}`}>
          <p className="eyebrow">{t('track.eyebrow')}</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900">
            {t('track.title')}
          </h1>
          <p className="mt-2 text-ink-500">{t('track.subtitle')}</p>

          <form onSubmit={submit} className="card mt-6 p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field icon={Mail} type="email" placeholder={t('track.email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field icon={Phone} placeholder={t('track.phone')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            </div>
            <div className="mt-3">
              <Field icon={FileText} placeholder={t('track.enquiryNumberOpt')} value={form.enquiryNumber} onChange={(v) => setForm({ ...form, enquiryNumber: v })} />
            </div>
            <Button type="submit" loading={busy} disabled={!form.email.trim() && !form.phone.trim()} className="w-full mt-5">
              <Search size={16} /> {t('track.lookup')}
            </Button>
          </form>

          {error && (
            <div className="card mt-5 p-5 text-center">
              <p className="text-sm font-semibold text-rose-600">{t('track.notFound')}</p>
              <p className="mt-1 text-xs text-ink-500">{t('track.notFoundHint')}</p>
            </div>
          )}

          {found && <ResultCard data={found} />}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ data }) {
  const { t } = useTranslation();
  const pkg = data.tourPackage;
  return (
    <div className="card mt-5 p-6 sm:p-8 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">{t('track.enquiryLabel')}</p>
          <p className="mt-0.5 font-display text-xl font-semibold text-ink-900">{data.enquiryNumber}</p>
        </div>
        <span className="chip-brand">{data.leadStatus}</span>
      </div>

      {pkg && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-cream-200 p-4">
          {pkg.images?.[0]?.url && (
            <img src={pkg.images[0].url} alt="" className="h-14 w-20 rounded-xl object-cover bg-cream-100 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 line-clamp-1">{pkg.title}</p>
            <p className="text-xs text-ink-500">{pkg.destination} · {pkg.duration}</p>
          </div>
        </div>
      )}

      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        <Stat icon={Calendar} label={t('track.travelDate')} value={formatDate(data.travelDate)} />
        <Stat icon={Users} label={t('track.travellers')} value={t('track.travellersValue', { adults: data.adults, children: data.children || 0 })} />
        <Stat icon={Clock} label={t('track.lastUpdated')} value={timeAgo(data.updatedAt || data.createdAt)} />
      </div>

      {data.notes && (
        <div className="mt-5 rounded-2xl border border-cream-200 bg-cream-50 p-4">
          <p className="text-xs font-semibold text-ink-500">{t('track.yourNotes')}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-ink-700">{data.notes}</p>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-cream-200 p-4">
      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500"><Icon size={13} /> {label}</p>
      <p className="mt-1 text-sm font-semibold text-ink-900">{value}</p>
    </div>
  );
}

function Field({ icon: Icon, type = 'text', onChange, ...rest }) {
  return (
    <div className="relative">
      <Icon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        type={type}
        className="input pl-10"
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      />
    </div>
  );
}