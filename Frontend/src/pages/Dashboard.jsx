import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
import Seo from '../components/seo/Seo';

const TABS = [
  { id: 'profile', icon: User },
  { id: 'wishlist', icon: Heart },
  { id: 'enquiries', icon: FileText },
  { id: 'trips', icon: MapPin },
  { id: 'notifications', icon: Bell },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'profile';
  const setTab = (nextTab) => {
    const next = new URLSearchParams(params);
    next.set('tab', nextTab);
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
      <Seo title={t('dashboard.welcomeTitle')} path="/dashboard" noindex />
      <div className="section py-6 sm:py-10">
        {/* Header card */}
        <div className="card p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-brand-600 text-white grid place-items-center text-xl sm:text-2xl font-display font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="eyebrow">
              {t('dashboard.hello', { name: user?.name?.split(' ')[0] || t('dashboard.there') })}
            </p>
            <h1 className="mt-2 font-display text-lg sm:text-xl lg:text-2xl font-semibold text-ink-900 truncate">{t('dashboard.welcomeTitle')}</h1>
            <p className="text-xs sm:text-sm text-ink-500 truncate">{user?.email}</p>
          </div>
          <Link to="/packages" className="btn-primary shrink-0 w-full sm:w-auto text-center text-sm">{t('dashboard.findTrips')}</Link>
        </div>

        {/* Mobile sliding tab bar */}
        <MobileTabBar tab={tab} setTab={setTab} />

        {/* Desktop layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 mt-6">
          <aside className="lg:col-span-3">
            <nav className="card p-2 sticky top-20 flex flex-col gap-1">
              {TABS.map((tItem) => {
                const Icon = tItem.icon;
                return (
                  <button
                    key={tItem.id}
                    onClick={() => setTab(tItem.id)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left',
                      tab === tItem.id ? 'bg-brand-50 text-brand-800' : 'text-ink-700 hover:bg-cream-100'
                    )}
                  >
                    <Icon size={16} /> {t(`dashboard.tab.${tItem.id}`)}
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 mt-2 text-left"
              >
                <LogOut size={16} /> {t('dashboard.signOut')}
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
  const { t } = useTranslation();
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
          {TABS.map((tItem) => {
            const Icon = tItem.icon;
            const isActive = tab === tItem.id;
            return (
              <button
                key={tItem.id}
                ref={(el) => { btnRefs.current[tItem.id] = el; }}
                onClick={() => setTab(tItem.id)}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-semibold transition-colors relative z-10',
                  isActive ? 'text-brand-800' : 'text-ink-500'
                )}
              >
                <Icon size={18} />
                <span className="truncate w-full text-center leading-tight">{t(`dashboard.tab.${tItem.id}`)}</span>
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
  const { t } = useTranslation();
  return (
    <>
      {tab === 'profile' && <ProfileTab />}
      {tab === 'wishlist' && <WishlistTab />}
      {tab === 'enquiries' && <EnquiriesTab />}
      {tab === 'trips' && <TripsTab />}
      {tab === 'notifications' && (
        <div className="card p-4 sm:p-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-ink-900">{t('dashboard.notificationsTitle')}</h2>
          <p className="text-sm text-ink-500 mt-1">{t('dashboard.notificationsSub')}</p>
          <Link to="/notifications" className="btn-primary mt-4 inline-flex text-sm">{t('dashboard.openNotifications')}</Link>
        </div>
      )}
    </>
  );
}

function ProfileTab() {
  const { t } = useTranslation();
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
      toast.success(t('dashboard.profileUpdated'));
      setEditing(false);
      dispatch(fetchMeThunk());
    } catch (err) {
      toast.error(err.message || t('dashboard.profileUpdateFailed'));
    } finally { setBusy(false); }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.next.length < 8) return toast.error(t('dashboard.passwordMinShort'));
    setBusy(true);
    try {
      await authApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
      toast.success(t('dashboard.passwordUpdated'));
      setPwd({ current: '', next: '' });
    } catch (err) {
      toast.error(err.message || t('dashboard.passwordUpdateFailed'));
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-ink-900">{t('dashboard.profileTitle')}</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-xs sm:text-sm"><Edit3 size={14} /> {t('dashboard.edit')}</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-ghost text-xs sm:text-sm"><X size={14} /> {t('dashboard.cancel')}</button>
              <Button onClick={save} loading={busy} className="text-xs sm:text-sm"><Save size={14} /> {t('dashboard.save')}</Button>
            </div>
          )}
        </div>
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          <FieldRow icon={User} label={t('dashboard.name')} value={editing ? form.name : user?.name} editable={editing} onChange={(v) => setForm({ ...form, name: v })} />
          <FieldRow icon={Mail} label={t('dashboard.email')} value={user?.email} readOnly />
          <FieldRow icon={Phone} label={t('dashboard.phone')} value={editing ? form.phone : user?.phone} editable={editing} onChange={(v) => setForm({ ...form, phone: v })} />
          <FieldRow icon={User} label={t('dashboard.role')} value={user?.role} readOnly />
        </div>
      </div>

      <form onSubmit={changePwd} className="card p-4 sm:p-6">
        <h2 className="font-display text-lg sm:text-xl font-semibold text-ink-900">{t('dashboard.changePassword')}</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <input type="password" placeholder={t('dashboard.currentPassword')} value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} className="input" required />
          <input type="password" placeholder={t('dashboard.newPassword')} value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} className="input" required />
        </div>
        <Button type="submit" loading={busy} className="mt-4">{t('dashboard.updatePassword')}</Button>
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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.wishlist);
  useEffect(() => { dispatch(fetchWishlistThunk()); }, [dispatch]);
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink-900">{t('dashboard.wishlistTitle')}</h2>
        <Link to="/wishlist" className="text-sm font-semibold text-brand-700">{t('dashboard.openWishlist')}</Link>
      </div>
      {loading ? <Skeleton className="h-20 w-full mt-4" /> : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">{t('dashboard.wishlistEmpty')}</p>
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
                  <Link to={`/packages/${p.slug}`} className="text-xs font-semibold text-brand-700">{t('dashboard.view')}</Link>
                ) : (
                  <span className="text-xs text-ink-400">{t('dashboard.unavailable')}</span>
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
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    enquiryApi.mine().then((r) => setItems(r?.data || [])).finally(() => setLoading(false));
  }, []);
  return (
    <div className="card p-6">
      <h2 className="font-display text-xl font-semibold text-ink-900">{t('dashboard.enquiriesTitle')}</h2>
      {loading ? <Skeleton className="h-20 w-full mt-4" /> : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">{t('dashboard.enquiriesEmpty')}</p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((e) => (
            <div key={e._id} className="rounded-2xl border border-cream-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink-900">{e.enquiryNumber}</p>
                <span className="chip-brand">{e.leadStatus}</span>
              </div>
              <p className="text-sm text-ink-500 mt-1">{t('dashboard.travelLine', { date: formatDate(e.travelDate), adults: e.adults, children: e.children || 0 })}</p>
              <p className="text-xs text-ink-500 mt-1">{timeAgo(e.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TripsTab() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    tripRequestApi.mine().then((r) => setItems(r?.data || [])).finally(() => setLoading(false));
  }, []);
  return (
    <div className="card p-6">
      <h2 className="font-display text-xl font-semibold text-ink-900">{t('dashboard.tripsTitle')}</h2>
      {loading ? <Skeleton className="h-20 w-full mt-4" /> : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">{t('dashboard.tripsEmpty')} <Link to="/contact?type=custom" className="text-brand-700 font-semibold">{t('dashboard.sendNew')} →</Link></p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((tItem) => (
            <div key={tItem._id} className="rounded-2xl border border-cream-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink-900">{tItem.destination}</p>
                <span className="chip-brand">{tItem.status}</span>
              </div>
              <p className="text-sm text-ink-500 mt-1">
                {formatDate(tItem.startDate)} → {formatDate(tItem.endDate)} · {t('dashboard.travellers', { count: tItem.groupSize })}
              </p>
              {tItem.proposedItinerary && (
                <details className="mt-2 text-sm text-ink-700">
                  <summary className="cursor-pointer font-semibold text-brand-700">{t('dashboard.viewItinerary')}</summary>
                  <p className="mt-2 whitespace-pre-line">{tItem.proposedItinerary}</p>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
