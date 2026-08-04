import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Menu, X, Search, User as UserIcon, Heart, LogOut,
  ChevronDown, Bell, LayoutDashboard, MapPin, ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';
import { logoutThunk } from '../../store/authSlice';
import { fetchUnreadCountThunk, addNotification } from '../../store/notificationsSlice';
import { fetchWishlistThunk } from '../../store/wishlistSlice';
import useSocket from '../../hooks/useSocket';
import { LOGO_WORDMARK } from '../../utils/branding';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/packages', label: 'Tours' },
  { to: '/destinations', label: 'Destinations' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((s) => s.auth.user);
  const unread = useSelector((s) => s.notifications.unread);
  const wishlistCount = useSelector((s) => s.wishlist.ids.length);
  const userMenuRef = useRef(null);

  useSocket((notification) => {
    dispatch(addNotification(notification));
    toast(notification.title, { icon: '🔔' });
  }, !!user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCountThunk());
      dispatch(fetchWishlistThunk());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

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
            ? 'bg-white/90 backdrop-blur-xl shadow-soft border-b border-cream-200/70'
            : 'bg-white/70 backdrop-blur-xl border-b border-transparent'
        )}
      >
        {/* Brand accent bar */}
        <div className="h-[3px] w-full bg-brand-gradient" aria-hidden="true" />

        <div className="section flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="group shrink-0" aria-label="Roam Beyond home">
            <img
              src={LOGO_WORDMARK}
              alt="Roam Beyond"
              className="h-11 w-auto object-contain brightness-0 transition-transform group-hover:scale-105"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white/70 border border-cream-200/60 p-1 shadow-card">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    isActive
                      ? 'bg-brand-600 text-white shadow-soft'
                      : 'text-ink-700 hover:bg-brand-50 hover:text-brand-800'
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
              aria-label="Search"
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-100 text-ink-700 transition-colors"
            >
              <Search size={18} />
            </button>

            {user && (
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-cream-100 text-ink-700 transition-colors"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-brand-600 text-white ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-cream-100 text-ink-700 transition-colors"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-cream-500 text-ink-900 ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative hidden lg:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 text-sm font-semibold text-ink-900 ring-1 ring-brand-100 transition-colors"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-600 text-white text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown size={14} className={clsx('transition-transform', userMenu && 'rotate-180')} />
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-cream-200 bg-white shadow-float p-1.5 animate-fade-up">
                    <div className="px-3 py-2 border-b border-cream-100">
                      <p className="text-sm font-semibold text-ink-900 line-clamp-1">{user?.name}</p>
                      <p className="text-xs text-ink-500 line-clamp-1">{user?.email}</p>
                    </div>
                    <Link to="/dashboard" className="menu-item"><LayoutDashboard size={16} /> Dashboard</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="menu-item text-brand-700 font-semibold">
                        <ShieldCheck size={16} /> Admin panel
                      </Link>
                    )}
                    <Link to="/wishlist" className="menu-item"><Heart size={16} /> Wishlist</Link>
                    <Link to="/dashboard?tab=trips" className="menu-item"><MapPin size={16} /> My Trips</Link>
                    <Link to="/dashboard?tab=profile" className="menu-item"><UserIcon size={16} /> Profile</Link>
                    <div className="my-1 border-t border-cream-100" />
                    <button
                      onClick={() => { dispatch(logoutThunk()); navigate('/'); }}
                      className="menu-item w-full text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Link to="/login" className="btn-ghost h-10 px-4">Sign in</Link>
                <Link to="/register" className="btn-primary h-10 px-4">Get started</Link>
              </div>
            )}

            <button
              onClick={() => setOpen(true)}
              className="lg:hidden ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-100 text-ink-900"
              aria-label="Open menu"
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
                placeholder="Search packages, destinations…"
                className="input pl-11"
              />
            </div>
            <button type="submit" className="btn-primary">Search</button>
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
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* User profile card (when logged in) */}
            {user && (
              <div className="mx-3 mt-3 p-3 rounded-2xl bg-brand-soft-gradient border border-brand-100/70 shadow-card">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white text-xs font-bold shrink-0 shadow-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900 line-clamp-1">{user?.name}</p>
                    <p className="text-xs text-ink-500 line-clamp-1">{user?.email}</p>
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="mt-2 flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg bg-white/80 border border-brand-200/50 text-xs font-semibold text-brand-700 hover:bg-white transition-colors"
                  >
                    <ShieldCheck size={13} /> Admin panel
                  </Link>
                )}
              </div>
            )}

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-3 pt-1 pb-2">
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

                {user && (
                  <>
                    <div className="my-2 border-t border-cream-100" />
                    <Link to="/notifications" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-cream-100 transition-colors">
                      <Bell size={16} /> Notifications
                      {unread > 0 && (
                        <span className="ml-auto grid place-items-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-cream-500 text-ink-900">
                          {unread}
                        </span>
                      )}
                    </Link>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-cream-100 transition-colors">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-cream-100 transition-colors">
                      <Heart size={16} /> Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto grid place-items-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-brand-600 text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/dashboard?tab=trips" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-cream-100 transition-colors">
                      <MapPin size={16} /> My Trips
                    </Link>
                    <Link to="/dashboard?tab=profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-cream-100 transition-colors">
                      <UserIcon size={16} /> Profile
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Footer */}
            {user ? (
              <div className="px-3 pb-3">
                <button
                  onClick={() => { dispatch(logoutThunk()); navigate('/'); }}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            ) : (
              <div className="p-3 border-t border-cream-100 flex gap-2">
                <Link to="/login" className="btn-secondary flex-1 text-center text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary flex-1 text-center text-sm">Get started</Link>
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}
