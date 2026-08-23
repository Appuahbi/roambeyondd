import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Send, Heart } from 'lucide-react';
import { newsletterApi, siteContentApi } from '../../api/endpoints';
import { LOGO_WORDMARK } from '../../utils/branding';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState({ phone: '+91 99999 99999', email: 'hello@roambeyond.in', address: 'Connaught Place, New Delhi' });

  useEffect(() => {
    siteContentApi.get('footer')
      .then((r) => {
        const d = r?.data;
        if (d) setContact((prev) => ({ ...prev, ...d }));
      })
      .catch(() => {});
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await newsletterApi.subscribe(email.trim());
      toast.success(t('footer.subscribed'));
      setEmail('');
    } catch (err) {
      toast.error(err.message || t('footer.subscribeError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <footer className="relative mt-24 bg-brand-900 text-cream-100 overflow-hidden">
      {/* Top accent line + soft glow */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-gradient" aria-hidden="true" />
      <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-brand-700/30 blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="section relative py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Roam Beyond home">
              <img
                src={LOGO_WORDMARK}
                alt="Roam Beyond"
                className="h-11 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="mt-4 text-sm text-cream-200/80 max-w-sm leading-relaxed">
              {t('footer.blurb')}
            </p>
            <div className="mt-5 flex gap-2">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-800/70 ring-1 ring-white/10 hover:bg-brand-700 hover:ring-cream-300/40 transition"
                  aria-label="social"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-cream-100">{t('footer.explore')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-cream-200/80">
              <li><Link to="/packages" className="hover:text-white transition-colors">{t('footer.allTours')}</Link></li>
              <li><Link to="/destinations" className="hover:text-white transition-colors">{t('footer.destinations')}</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition-colors">{t('footer.travelBlogs')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-cream-100">{t('footer.account')}</h4>
            <ul className="mt-3 space-y-2 text-sm text-cream-200/80">
              <li><Link to="/login" className="hover:text-white transition-colors">{t('footer.signIn')}</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">{t('footer.createAccount')}</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">{t('footer.myDashboard')}</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">{t('footer.wishlist')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold text-cream-100">{t('footer.newsletterTitle')}</h4>
            <p className="mt-2 text-sm text-cream-200/80">
              {t('footer.newsletterBlurb')}
            </p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder={t('footer.emailPlaceholder')}
                className="flex-1 rounded-full border border-brand-700 bg-brand-800/50 px-4 py-2.5 text-sm placeholder:text-cream-200/40 focus:border-cream-300 focus:ring-2 focus:ring-cream-300/30 outline-none transition"
              />
              <button
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-cream-200 hover:-translate-y-px transition disabled:opacity-60 shadow-soft"
              >
                <Send size={14} /> {busy ? '…' : t('footer.join')}
              </button>
            </form>

            <ul className="mt-5 space-y-1.5 text-sm text-cream-200/80">
              <li className="inline-flex items-center gap-2"><Phone size={14} className="text-cream-300" /> {contact.phone}</li><br />
              <li className="inline-flex items-center gap-2"><Mail size={14} className="text-cream-300" /> {contact.email}</li><br />
              <li className="inline-flex items-center gap-2"><MapPin size={14} className="text-cream-300" /> {contact.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-800/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-200/60">
          <p className="inline-flex items-center gap-1.5">
            © {new Date().getFullYear()} Roam Beyond. {t('footer.crafted')} <Heart size={11} className="text-cream-300 fill-cream-300" /> {t('footer.inIndia')}
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
            <LanguageSwitcher className="text-cream-200/80 hover:text-white hover:bg-brand-800" />
          </div>
        </div>
      </div>
    </footer>
  );
}
