import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, BookOpen, Tags, Users, MessageSquare,
  Map as MapIcon, Star, Mail, Bell, FileText, LogOut, Menu, X, Home, ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';
import { logoutThunk } from '../../store/authSlice';
import { LOGO_WORDMARK } from '../../utils/branding';

/*
|--------------------------------------------------------------------------
| Admin Layout
|--------------------------------------------------------------------------
| Sidebar + topbar shell used by every /admin/* page. Mirrors the rest
| of the app (cream/brand palette, rounded cards) but in a denser,
| dashboard-style layout suitable for daily operations.
|--------------------------------------------------------------------------
*/

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true, roles: ['admin'] },
  { to: '/admin/packages', label: 'Packages', icon: Package, roles: ['admin'] },
  { to: '/admin/blogs', label: 'Blogs', icon: BookOpen, roles: ['admin'] },
  { to: '/admin/categories', label: 'Categories', icon: Tags, roles: ['admin'] },
  { to: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
  { to: '/admin/enquiries', label: 'Enquiries', icon: FileText, roles: ['admin', 'agent'] },
  { to: '/admin/trip-requests', label: 'Trip requests', icon: MapIcon, roles: ['admin'] },
  { to: '/admin/contact', label: 'Contact', icon: MessageSquare, roles: ['admin', 'agent'] },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, roles: ['admin'] },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail, roles: ['admin'] },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell, roles: ['admin'] },
  { to: '/admin/site-content', label: 'Site content', icon: ShieldCheck, roles: ['admin'] },
];

function Sidebar({ onNavigate, userRole = 'admin' }) {
  const visible = NAV.filter((item) => !item.roles || item.roles.includes(userRole));
  return (
    <aside className="h-full w-64 shrink-0 border-r border-cream-200 bg-white flex flex-col">
      <div className="px-5 py-5 border-b border-cream-100">
        <div className="flex items-center gap-2">
          <img
            src={LOGO_WORDMARK}
            alt="Roam Beyond"
            className="h-10 w-auto object-contain brightness-0"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="leading-tight">
            <p className="text-[10px] uppercase tracking-widest text-brand-700">Admin panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-ink-700 hover:bg-cream-100 hover:text-brand-700'
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-cream-100 space-y-1">
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-700 hover:bg-cream-100">
          <Home size={16} /> View site
        </NavLink>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    setOpen(false);
  }, []);

  const onLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar userRole={user?.role} />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setOpen(false)} userRole={user?.role} />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute top-4 right-4 h-9 w-9 grid place-items-center rounded-full bg-white shadow-soft"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-cream-200">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="lg:hidden h-10 w-10 grid place-items-center rounded-full hover:bg-cream-100"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="hidden sm:block">
                <p className="text-xs uppercase tracking-widest text-brand-700 font-semibold">Admin</p>
                <p className="text-sm text-ink-500 -mt-0.5">Manage your travel platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <div className="h-9 w-9 grid place-items-center rounded-full bg-brand-600 text-white font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="leading-tight">
                  <p className="font-semibold text-ink-900 line-clamp-1">{user?.name}</p>
                  <p className="text-xs text-ink-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-3 h-10 rounded-full text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
