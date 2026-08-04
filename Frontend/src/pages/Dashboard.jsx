import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  User, Heart, MapPin, Bell, LogOut, Edit3, Save, X, Phone, Mail, FileText
} from 'lucide-react';
import clsx from 'clsx';
import { authApi, enquiryApi, tripRequestApi } from '../api/endpoints';
import { logoutThunk, fetchMeThunk } from '../store/authSlice';
import { fetchWishlistThunk } from '../store/wishlistSlice';
import { formatDate, timeAgo } from '../utils/format';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'enquiries', label: 'Enquiries', icon: FileText },
  { id: 'trips', label: 'Trip requests', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Dashboard() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';
  const setTab = (t) => {
    const next = new URLSearchParams(params);
    next.set('tab', t);
    setParams(next, { replace: true });
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const onLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  return (
    <div className="bg-cream-gradient min-h-screen">
      <div className="section py-6 sm:py-10">
        {/* Header card */}
        <div className="card p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-brand-600 text-white grid place-items-center text-xl sm:text-2xl font-display font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="eyebrow">
              Hello, {user?.name?.split(' ')[0] || 'there'}
            </p>
            <h1 className="mt-2 font-display text-lg sm:text-xl lg:text-2xl font-semibold text-ink-900 truncate">Welcome to your dashboard</h1>
            <p className="text-xs sm:text-sm text-ink-500 truncate">{user?.email}</p>
          </div>
          <Link to="/packages" className="btn-primary shrink-0 w-full sm:w-auto text-center text-sm">Find trips</Link>
        </div>

        {/* Mobile sliding tab bar */}
        <MobileTabBar tab={tab} setTab={setTab} />

        {/* Desktop layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 mt-6">
          <aside className="lg:col-span-3">
            <nav className="card p-2 sticky top-20 flex flex-col gap-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left',
                      tab === t.id ? 'bg-brand-50 text-brand-800' : 'text-ink-700 hover:bg-cream-100'
                    )}
                  >
                    <Icon size={16} /> {t.label}
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 mt-2 text-left"
              >
                <LogOut size={16} /> Sign out
              </button>
            </nav>
          </aside>

          <main className="lg:col-span-9">
            <TabContent tab={tab} />
          </main>
        </div>

        {/* Mobile tab content */}
        <div className="lg:hidden mt-4">
          <TabContent tab={tab} />
        </div>
      </div>
    </div>
  );
}

function MobileTabBar({ tab, setTab }) {
  const barRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = btnRefs.current[tab];
    if (el && barRef.current) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [tab]);

  return (
    <div className="lg:hidden mt-4 sticky top-[67px] z-30">
      <div className="card px-1 py-1">
        <div ref={barRef} className="relative flex">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => { btnRefs.current[t.id] = el; }}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-semibold transition-colors relative z-10',
                  isActive ? 'text-brand-800' : 'text-ink-500'
                )}
              >
                <Icon size={18} />
                <span className="truncate w-full text-center leading-tight">{t.label}</span>
              </button>
            );
          })}
          {/* Sliding background */}
          <div
            className="absolute top-1 bottom-1 rounded-xl bg-brand-50 transition-all duration-300 ease-out z-0"
            style={{ left: indicator.left, width: indicator.width }}
          />
        </div>
      </div>
    </div>
  );
}

function TabContent({ tab }) {
  return (
    <>
      {tab === 'profile' && <ProfileTab />}
      {tab === 'wishlist' && <WishlistTab />}
      {tab === 'enquiries' && <EnquiriesTab />}
      {tab === 'trips' && <TripsTab />}
      {tab === 'notifications' && (
        <div className="card p-4 sm:p-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-ink-900">Notifications</h2>
          <p className="text-sm text-ink-500 mt-1">See your latest updates from Roam Beyond.</p>
          <Link to="/notifications" className="btn-primary mt-4 inline-flex text-sm">Open notifications</Link>
        </div>
      )}
    </>
  );
}

function ProfileTab() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [editing, setEditing] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '' });
  const [form, setForm] = useState({ name: '', phone: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const save = async () => {
    setBusy(true);
    try {
      await authApi.updateProfile({ name: form.name, phone: form.phone });
      toast.success('Profile updated');
      setEditing(false);
      dispatch(fetchMeThunk());
    } catch (err) {
      toast.error(err.message || 'Could not update profile');
    } finally { setBusy(false); }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.next.length < 8) return toast.error('Min 8 characters');
    setBusy(true);
    try {
      await authApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      toast.success('Password updated');
      setPwd({ current: '', next: '' });
    } catch (err) {
      toast.error(err.message || 'Could not update');
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-ink-900">Profile</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs sm:text-sm"><Edit3 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-ghost text-xs sm:text-sm"><X size={14} /> Cancel</button>
              <Button onClick={save} loading={busy} className="text-xs sm:text-sm"><Save size={14} /> Save</Button>
            </div>
          )}
        </div>
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <FieldRow icon={User} label="Name" value={editing ? form.name : user?.name} editable={editing} onChange={(v) => setForm({ ...form, name: v })} />
          <FieldRow icon={Mail} label="Email" value={user?.email} readOnly />
          <FieldRow icon={Phone} label="Phone" value={editing ? form.phone : user?.phone} editable={editing} onChange={(v) => setForm({ ...form, phone: v })} />
          <FieldRow icon={User} label="Role" value={user?.role} readOnly />
        </div>
      </div>

      <form onSubmit={changePwd} className="card p-4 sm:p-6">
        <h2 className="font-display text-lg sm:text-xl font-semibold text-ink-900">Change password</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <input type="password" placeholder="Current password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} className="input" required />
          <input type="password" placeholder="New password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} className="input" required />
        </div>
        <Button type="submit" loading={busy} className="mt-4">Update password</Button>
      </form>
    </div>
  );
}

function FieldRow({ icon: Icon, label, value, editable, onChange, readOnly }) {
  return (
    <div>
      <label className="label inline-flex items-center gap-1.5"><Icon size={12} /> {label}</label>
      {editable && !readOnly ? (
        <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="rounded-xl border border-cream-200 bg-cream-50 px-4 py-2.5 text-sm text-ink-700">{value || '—'}</div>
      )}
    </div>
  );
}

function WishlistTab() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.wishlist);
  useEffect(() => { dispatch(fetchWishlistThunk()); }, [dispatch]);
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink-900">Saved trips</h2>
        <Link to="/wishlist" className="text-sm font-semibold text-brand-700">Open wishlist</Link>
      </div>
      {loading ? <Skeleton className="h-20 w-full mt-4" /> : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">You haven’t saved any trips yet. Tap the heart on any tour to add it.</p>
      ) : (
        <ul className="mt-4 divide-y divide-cream-100">
          {items.slice(0, 5).map((i) => {
            const p = i.tourPackage;
            return (
              <li key={i._id} className="py-3 flex items-center gap-3">
                <img src={p?.images?.[0]?.url} alt="" className="h-12 w-16 rounded-lg object-cover bg-cream-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-900 line-clamp-1">{p?.title}</p>
                  <p className="text-xs text-ink-500">{p?.destination} · {p?.duration}</p>
                </div>
                {p?.slug ? (
                  <Link to={`/packages/${p.slug}`} className="text-xs font-semibold text-brand-700">View</Link>
                ) : (
                  <span className="text-xs text-ink-400">Unavailable</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EnquiriesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    enquiryApi.mine().then((r) => setItems(r?.data || [])).finally(() => setLoading(false));
  }, []);
  return (
    <div className="card p-6">
      <h2 className="font-display text-xl font-semibold text-ink-900">My enquiries</h2>
      {loading ? <Skeleton className="h-20 w-full mt-4" /> : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">No enquiries yet. Send one from any tour page.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((e) => (
            <div key={e._id} className="rounded-2xl border border-cream-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink-900">{e.enquiryNumber}</p>
                <span className="chip-brand">{e.leadStatus}</span>
              </div>
              <p className="text-sm text-ink-500 mt-1">Travel: {formatDate(e.travelDate)} · {e.adults} adults, {e.children || 0} children</p>
              <p className="text-xs text-ink-500 mt-1">{timeAgo(e.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TripsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    tripRequestApi.mine().then((r) => setItems(r?.data || [])).finally(() => setLoading(false));
  }, []);
  return (
    <div className="card p-6">
      <h2 className="font-display text-xl font-semibold text-ink-900">Custom trip requests</h2>
      {loading ? <Skeleton className="h-20 w-full mt-4" /> : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">No trip requests yet. <Link to="/contact?type=custom" className="text-brand-700 font-semibold">Send a new one →</Link></p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((t) => (
            <div key={t._id} className="rounded-2xl border border-cream-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink-900">{t.destination}</p>
                <span className="chip-brand">{t.status}</span>
              </div>
              <p className="text-sm text-ink-500 mt-1">
                {formatDate(t.startDate)} → {formatDate(t.endDate)} · {t.groupSize} travellers
              </p>
              {t.proposedItinerary && (
                <details className="mt-2 text-sm text-ink-700">
                  <summary className="cursor-pointer font-semibold text-brand-700">View proposed itinerary</summary>
                  <p className="mt-2 whitespace-pre-line">{t.proposedItinerary}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
