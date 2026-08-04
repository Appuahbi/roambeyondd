import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Send, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { timeAgo } from '../../utils/format';

const TYPES = ['system', 'enquiry_update', 'review_update', 'trip_request_update'];
const TYPE_COLORS = {
  system: 'bg-cream-100 text-brand-800',
  enquiry_update: 'bg-blue-50 text-blue-700',
  review_update: 'bg-violet-50 text-violet-700',
  trip_request_update: 'bg-amber-50 text-amber-700',
};

const EMPTY = { title: '', message: '', type: 'system', audience: 'all' };

export default function AdminNotifications() {
  const [data, setData] = useState({ notifications: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    adminApi.notifications({ page })
      .then((r) => setData(r?.data || { notifications: [], total: 0, page: 1, totalPages: 1 }))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRows(); }, [page]);

  const send = async (e) => {
    e?.preventDefault?.();
    setBusy(true);
    try {
      const res = await adminApi.broadcastNotification(form);
      toast.success(res?.message || 'Notification sent');
      setComposeOpen(false);
      setForm(EMPTY);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Send failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await adminApi.deleteNotification(confirm._id);
      toast.success('Deleted');
      setConfirm(null);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Send a broadcast to all users, or browse the system log."
        actions={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus size={16} /> New broadcast
          </Button>
        }
      />

      {loading ? (
        <Skeleton className="h-48" />
      ) : (
        <Table
          rows={data.notifications}
          keyFn={(r) => r._id}
          empty="No notifications yet."
          columns={[
            {
              key: 'user', label: 'Recipient',
              render: (r) => (
                <div>
                  <p className="font-semibold text-ink-900 line-clamp-1">{r.user?.name || '—'}</p>
                  <p className="text-xs text-ink-500 line-clamp-1">{r.user?.email}</p>
                </div>
              )
            },
            {
              key: 'content', label: 'Message',
              render: (r) => (
                <div className="max-w-xs">
                  <p className="font-semibold text-ink-900 line-clamp-1">{r.title}</p>
                  <p className="text-xs text-ink-500 line-clamp-2">{r.message}</p>
                </div>
              )
            },
            { key: 'type', label: 'Type', render: (r) => <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${TYPE_COLORS[r.type] || ''}`}>{r.type}</span> },
            { key: 'read', label: 'Read', render: (r) => r.isRead ? <Badge>Read</Badge> : <Badge variant="success">Unread</Badge> },
            { key: 'when', label: 'When', render: (r) => <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <button onClick={() => setConfirm(r)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-rose-50 text-rose-600" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              )
            },
          ]}
        />
      )}

      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Broadcast a notification"
        size="md"
        footer={
          <>
            <button onClick={() => setComposeOpen(false)} className="btn-ghost">Cancel</button>
            <Button onClick={send} loading={busy}><Send size={14} /> Send</Button>
          </>
        }
      >
        <form onSubmit={send} className="space-y-4">
          <Field label="Title" required>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} />
          </Field>
          <Field label="Message" required>
            <textarea className="input min-h-[120px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={500} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Type">
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Audience">
              <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">All users</option>
                <option value="users">Users only</option>
                <option value="admins">Admins only</option>
              </select>
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        busy={busy}
        confirmVariant="danger"
        title="Delete notification?"
        message={confirm ? `"${confirm.title}" will be removed permanently.` : ''}
      />
    </div>
  );
}
