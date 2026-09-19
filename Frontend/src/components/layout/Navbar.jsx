import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Search, FileSearch } from 'lucide-react';
import clsx from 'clsx';
import { LOGO_WORDMARK } from '../../utils/branding';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_LINKS = [
    { to: '/', label: t('nav.home') },
    { to: '/packages', label: t('nav.tours') },
    { to: '/destinations', label: t('nav.destinations') },
    { to: '/blogs', label: t('nav.blogs') },
    { to: '/contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/packages?search=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  };

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-brand-800/95 backdrop-blur-xl shadow-soft border-b border-brand-700/60'
            : 'bg-brand-800/90 backdrop-blur-xl border-b border-transparent'
        )}
      >
        {/* Brand accent bar */}
        <div className="h-[3px] w-full bg-brand-gradient" aria-hidden="true" />

        {/* Top row: logo + nav + actions */}
        <div className="section relative flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="group shrink-0" aria-label="Roam Beyond home">
            <img
              src={LOGO_WORDMARK}
              alt="Roam Beyond"
              className="h-11 w-auto object-contain brightness-0 invert transition-transform group-hover:scale-105"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          {/* Desktop nav (centered) */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 border border-white/15 p-1 shadow-card">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white text-brand-800 shadow-soft'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t('nav.search')}
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <Search size={18} />
            </button>

            <LanguageSwitcher className="hidden sm:inline-flex text-white hover:bg-white/10 hover:text-white" />

            <Link
              to="/track-enquiry"
              aria-label={t('track.title')}
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <FileSearch size={18} />
            </Link>

            <Link to="/contact" className="btn-primary h-10 px-4">{t('nav.enquire')}</Link>

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 text-white"
              aria-label={t('nav.openMenu')}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Inline search bar */}
        <div
          className={clsx(
            'overflow-hidden transition-all duration-300 border-t border-cream-100 bg-cream-50/60',
            searchOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <form onSubmit={submitSearch} className="section py-3 flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                autoFocus={searchOpen}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="input pl-11"
              />
            </div>
            <button type="submit" className="btn-primary">{t('nav.searchBtn')}</button>
          </form>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-float flex flex-col overflow-hidden rounded-l-[2.5rem] animate-[slide-in-right_0.35s_ease-out]">
            {/* Curved brand header band */}
            <div className="relative bg-brand-gradient px-4 pt-4 pb-4 text-white">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2" aria-label="Roam Beyond home">
                  <img
                    src={LOGO_WORDMARK}
                    alt="Roam Beyond"
                    className="h-9 w-auto object-contain brightness-0 invert"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-white/90 hover:bg-white/15 transition-colors"
                  aria-label={t('nav.closeMenu')}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2">
              <div className="space-y-px">
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'text-ink-700 hover:bg-cream-100'
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}

                <div className="my-2 border-t border-cream-100" />
                <Link to="/track-enquiry" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-cream-100 transition-colors">
                  <FileSearch size={16} /> {t('track.title')}
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <div className="px-3 pt-3 pb-3 border-t border-cream-100">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-ink-400">{t('nav.language')}</span>
                <LanguageSwitcher className="border border-cream-200 bg-white" />
              </div>
              <Link to="/contact" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center text-sm">
                {t('nav.enquire')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}