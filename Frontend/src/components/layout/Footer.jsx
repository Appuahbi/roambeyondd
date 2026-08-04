import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Send, Globe, Heart } from 'lucide-react';
import { newsletterApi, siteContentApi } from '../../api/endpoints';
import { LOGO_WORDMARK } from '../../utils/branding';

export default function Footer() {
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
      toast.success('Subscribed — check your inbox!');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Could not subscribe');
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
              Curated journeys across India — from Himalayan trails to Goa sunsets.
              Hand-picked stays, trusted local guides, transparent pricing.
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
            <h4 className="text-sm font-semibold text-cream-100">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-cream-200/80">
              <li><Link to="/packages" className="hover:text-white transition-colors">All Tours</Link></li>
              <li><Link to="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition-colors">Travel Blogs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-cream-100">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-cream-200/80">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create account</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">My dashboard</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold text-cream-100">Travel inspiration, monthly</h4>
            <p className="mt-2 text-sm text-cream-200/80">
              Get hand-picked trip ideas, off-season deals and local stories.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 rounded-full border border-brand-700 bg-brand-800/50 px-4 py-2.5 text-sm placeholder:text-cream-200/40 focus:border-cream-300 focus:ring-2 focus:ring-cream-300/30 outline-none transition"
              />
              <button
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-5 py-2.5 text-sm font-semibold text-brand-800 hover:bg-cream-200 hover:-translate-y-px transition disabled:opacity-60 shadow-soft"
              >
                <Send size={14} /> {busy ? '…' : 'Join'}
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
            © {new Date().getFullYear()} Roam Beyond. Crafted with <Heart size={11} className="text-cream-300 fill-cream-300" /> in India.
          </p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1"><Globe size={12} /> IN · EN</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
