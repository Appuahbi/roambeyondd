import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check } from 'lucide-react';
import clsx from 'clsx';
import {
  fetchNotificationsThunk,
  readAllThunk,
  fetchUnreadCountThunk
} from '../store/notificationsSlice';
import { notificationApi } from '../api/endpoints';
import { timeAgo } from '../utils/format';
import Skeleton from '../components/ui/Skeleton';

export default function Notifications() {
  const dispatch = useDispatch();
  const { items, unread, loading } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
    dispatch(fetchUnreadCountThunk());
  }, [dispatch]);

  const markRead = async (id) => {
    try { await notificationApi.markRead(id); dispatch(fetchNotificationsThunk()); dispatch(fetchUnreadCountThunk()); } catch { /* ignore */ }
  };

  return (
    <div className="bg-cream-gradient min-h-screen">
      <div className="section py-6 sm:py-10">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow">Inbox</p>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-ink-900">Notifications</h1>
            <p className="mt-1.5 text-sm text-ink-500">{unread} unread</p>
          </div>
          {unread > 0 && (
            <button onClick={() => dispatch(readAllThunk())} className="btn-secondary whitespace-nowrap">
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="section pb-16">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <div className="card p-6 sm:p-10 text-center">
            <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-cream-100 text-brand-700">
              <Bell size={28} />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold">You’re all caught up</h2>
            <p className="mt-1 text-sm text-ink-500">We’ll let you know when something new comes in.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className={clsx(
                  'card p-4 sm:p-5 flex items-start gap-3 cursor-pointer transition',
                  !n.isRead && 'ring-1 ring-brand-200 bg-cream-50/50 hover:bg-cream-50'
                )}
              >
                <div className={clsx('h-9 w-9 grid place-items-center rounded-full shrink-0', n.isRead ? 'bg-cream-100 text-ink-500' : 'bg-brand-600 text-white')}>
                  <Bell size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink-900">{n.title}</p>
                  <p className="text-sm text-ink-700 mt-0.5">{n.message}</p>
                  <p className="text-xs text-ink-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
