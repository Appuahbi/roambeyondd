import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, RefreshCw, Send, Mail, UserPlus } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate, timeAgo } from '../../utils/format';

export default function AdminNewsletter() {
  const [data, setData] = useState({ subscribers: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toggleId, setToggleId] = useState(null);
  const [compose, setCompose] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  const fetchRows = () => {
    setLoading(true);
    adminApi.subscribers({ page, search: search || undefined })
      .then((r) => setData(r?.data || { subscribers: [], total: 0, page: 1, totalPages: 1 }))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRows(); }, [page, search]);
  useEffect(() => { setPage(1); }, [search]);

  const onDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await adminApi.deleteSubscriber(confirm._id);
      toast.success('Subscriber removed');
      setConfirm(null);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (sub) => {
    setToggleId(sub._id);
    try {
      await adminApi.toggleSubscriber(sub._id);
      toast.success(sub.isSubscribed ? 'Subscriber deactivated' : 'Subscriber re-activated');
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Toggle failed');
    } finally {
      setToggleId(null);
    }
  };

  const onSend = async () => {
    if (!compose.subject.trim() || !compose.body.trim()) {
      return toast.error('Subject and body are required');
    }
    setSending(true);
    try {
      const res = await adminApi.sendNewsletter({ subject: compose.subject.trim(), body: compose.body.trim() });
      const { sent, failed } = res?.data || {};
      if (failed > 0 && sent === 0) {
        toast.error(res?.message || 'All emails failed to send');
      } else if (failed > 0) {
        toast.success(`${sent} sent, ${failed} failed`);
      } else {
        toast.success(res?.message || 'Newsletter sent');
      }
      setCompose({ subject: '', body: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const onAddSubscriber = async () => {
    if (!addEmail.trim()) return toast.error('Enter an email address');
    setAddBusy(true);
    try {
      const res = await adminApi.createSubscriber(addEmail.trim());
      toast.success(res?.message || 'Subscriber added');
      setAddEmail('');
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Failed to add subscriber');
    } finally {
      setAddBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Newsletter" subtitle="Manage subscribers and send newsletters." />

      {/* Compose section */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-brand-700">
            <Mail size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Compose newsletter</h2>
            <p className="text-xs text-ink-500">
              Send to <span className="font-semibold text-brand-700">{data.total}</span> active subscriber{data.total !== 1 && 's'}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Subject"
            value={compose.subject}
            onChange={(e) => setCompose({ ...compose, subject: e.target.value })}
            className="input"
            maxLength={200}
          />
          <textarea
            placeholder="Write your newsletter content here..."
            value={compose.body}
            onChange={(e) => setCompose({ ...compose, body: e.target.value })}
            className="input min-h-[120px] resize-y"
            maxLength={10000}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-400">{compose.body.length}/10,000 characters</p>
            <Button onClick={onSend} loading={sending} disabled={sending || data.total === 0}>
              <Send size={14} /> Send to {data.total} subscriber{data.total !== 1 && 's'}
            </Button>
          </div>
        </div>
      </div>

      {/* Subscribers table */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-ink-700">Subscribers</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="new@example.com"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onAddSubscriber(); }}
              className="input !py-2 sm:!w-60"
            />
            <Button onClick={onAddSubscriber} loading={addBusy}>
              <UserPlus size={14} /> Add
            </Button>
          </div>
        </div>
        <div className="max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by email…" />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-48" />
      ) : (
        <Table
          rows={data.subscribers}
          keyFn={(r) => r._id}
          empty="No subscribers yet."
          columns={[
            { key: 'email', label: 'Email', render: (r) => <span className="font-semibold text-ink-900">{r.email}</span> },
            { key: 'isSubscribed', label: 'Status', render: (r) => r.isSubscribed ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Unsubscribed</Badge> },
            { key: 'subscribedAt', label: 'Subscribed', render: (r) => <span className="text-xs text-ink-500">{formatDate(r.subscribedAt || r.createdAt)}</span> },
            { key: 'createdAt', label: 'Joined', render: (r) => <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex gap-1">
                  <button
                    onClick={() => onToggle(r)}
                    disabled={toggleId === r._id}
                    className={`h-8 w-8 grid place-items-center rounded-full transition ${r.isSubscribed ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                    aria-label={r.isSubscribed ? 'Deactivate' : 'Activate'}
                    title={r.isSubscribed ? 'Deactivate' : 'Activate'}
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button onClick={() => setConfirm(r)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-rose-50 text-rose-600" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            },
          ]}
        />
      )}

      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        busy={busy}
        confirmVariant="danger"
        title="Remove subscriber?"
        message={confirm ? `${confirm.email} will stop receiving updates.` : ''}
      />
    </div>
  );
}
