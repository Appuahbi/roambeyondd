import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, MessageSquare, User, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Seo from '../components/seo/Seo';
import { contactApi, tripRequestApi, siteContentApi } from '../api/endpoints';
import { useReveal } from '../hooks/useReveal';

export default function Contact() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const isCustom = params.get('type') === 'custom';
  const [ref, shown] = useReveal();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: isCustom ? t('contact.customSubject') : '', message: '' });
  const [busy, setBusy] = useState(false);
  const user = useSelector((s) => s.auth.user);
  const [contactInfo, setContactInfo] = useState({ phone: '+91 99999 99999', email: 'hello@roambeyond.in', address: 'Connaught Place, New Delhi 110001', hours: 'Mon–Sat, 9am – 7pm IST' });

  useEffect(() => {
    siteContentApi.get('contact')
      .then((r) => {
        const d = r?.data;
        if (d) setContactInfo((prev) => ({ ...prev, ...d }));
      })
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isCustom) {
        if (user) {
          await tripRequestApi.create({
            destination: form.subject || t('contact.customSubject'),
            startDate: new Date(),
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            groupSize: 2,
            adults: 2,
            children: 0,
            specialRequests: form.message,
          });
        } else {
          await contactApi.create({ ...form, subject: form.subject || t('contact.customSubject') });
        }
      } else {
        await contactApi.create(form);
      }
      toast.success(t('contact.sent'));
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message || t('contact.couldNotSend'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-cream-gradient min-h-screen">
      <Seo title={isCustom ? t('contact.titleCustom') : t('contact.titleDefault')} description={isCustom ? t('contact.subCustom') : t('contact.subDefault')} path="/contact" />
      <div className="section py-12 text-center max-w-2xl mx-auto">
        <p className="eyebrow justify-center">{t('contact.eyebrow')}</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink-900">
          {isCustom ? t('contact.titleCustom') : t('contact.titleDefault')}
        </h1>
        <p className="mt-2.5 text-ink-500">
          {isCustom ? t('contact.subCustom') : t('contact.subDefault')}
        </p>
      </div>

      <div className="section pb-16 grid lg:grid-cols-12 gap-6" ref={ref}>
        <div className={`lg:col-span-7 ${shown ? 'animate-fade-up' : 'opacity-0'}`}>
          <form onSubmit={submit} className="card p-6 sm:p-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field icon={User} placeholder={t('contact.fullName')} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field icon={Mail} type="email" placeholder={t('contact.email')} value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field icon={Phone} placeholder={t('contact.phoneOptional')} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field icon={MessageSquare} placeholder={t('contact.subject')} value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} required={!isCustom} />
            </div>
            <div>
              <label className="label">{isCustom ? t('contact.tripMessage') : t('contact.message')}</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={isCustom ? t('contact.messagePlaceholderCustom') : t('contact.messagePlaceholderDefault')}
                required
                className="input"
              />
            </div>
            <Button type="submit" loading={busy} className="w-full">
              <Send size={16} /> {isCustom ? t('contact.sendTripRequest') : t('contact.sendMessage')}
            </Button>
          </form>
        </div>
        <div className={`lg:col-span-5 space-y-4 ${shown ? 'animate-fade-up' : 'opacity-0'}`}>
          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold text-ink-900">{t('contact.reachUs')}</h3>
            <ul className="mt-4 space-y-3 text-sm text-ink-700">
              {[[Phone, contactInfo.phone], [Mail, contactInfo.email], [MapPin, contactInfo.address], [Clock, contactInfo.hours]].map(([Icon, text], i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon size={15} />
                  </span>
                  <span className="text-ink-700">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 bg-brand-50 border-brand-200">
            <p className="font-display text-lg font-semibold text-ink-900">{t('contact.lookingForTour')}</p>
            <p className="mt-1 text-sm text-ink-500">{t('contact.skipForm')}</p>
            <a href="/packages" className="btn-primary mt-3 w-full">{t('contact.browseTours')}</a>
          </div>
        </div>
      </div>
    </div>
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
