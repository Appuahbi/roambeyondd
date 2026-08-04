import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Star, MessageSquare, Trash2, Save } from 'lucide-react';
import { adminApi, reviewApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Field from '../../components/admin/Field';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Skeleton from '../../components/ui/Skeleton';
import { timeAgo } from '../../utils/format';

const STATUSES = ['pending', 'approved', 'rejected'];
const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
};

export default function AdminReviews() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    adminApi.reviews({ status: status || undefined })
      .then((r) => setRows(r?.data?.reviews || []))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchRows, [status]);

  const setReviewStatus = async (r, next) => {
    setBusyId(r._id);
    try {
      await adminApi.updateReview(r._id, { status: next });
      toast.success(`Review ${next}`);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const openReply = (r) => {
    setDetail(r);
    setReplyText(r.adminReply || '');
  };

  const saveReply = async () => {
    if (!detail) return;
    setReplyBusy(true);
    try {
      await adminApi.updateReview(detail._id, { status: detail.status === 'pending' ? 'approved' : detail.status, adminReply: replyText });
      toast.success('Reply saved');
      setDetail(null);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setReplyBusy(false);
    }
  };

  const deleteReview = async () => {
    if (!confirm) return;
    setBusyId(confirm._id);
    try {
      await reviewApi.delete(confirm._id);
      toast.success('Review deleted');
      setConfirm(null);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        subtitle="Approve, reply to, and manage customer reviews."
        actions={
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
            <option value="">All reviews</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        }
      />

      {loading ? (
        <Skeleton className="h-48" />
      ) : (
        <Table
          rows={rows}
          keyFn={(r) => r._id}
          empty="No reviews match those filters."
          columns={[
            {
              key: 'user', label: 'Author',
              render: (r) => (
                <div>
                  <p className="font-semibold text-ink-900 line-clamp-1">{r.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-ink-500 line-clamp-1">{r.user?.email}</p>
                </div>
              )
            },
            {
              key: 'package', label: 'Package',
              render: (r) => <span className="text-sm text-ink-700 line-clamp-1">{r.tourPackage?.title || '—'}</span>
            },
            {
              key: 'rating', label: 'Rating',
              render: (r) => (
                <div className="inline-flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? 'fill-amber-400' : 'text-ink-300'} />
                  ))}
                </div>
              )
            },
            {
              key: 'comment', label: 'Comment',
              render: (r) => (
                <div className="max-w-xs">
                  <p className="text-sm font-semibold text-ink-900 line-clamp-1">{r.title}</p>
                  <p className="text-xs text-ink-500 line-clamp-2">{r.comment}</p>
                </div>
              )
            },
            { key: 'status', label: 'Status', render: (r) => <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span> },
            { key: 'when', label: 'When', render: (r) => <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex gap-1">
                  <button
                    onClick={() => openReply(r)}
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-brand-50 text-brand-700"
                    aria-label="Reply"
                    title="Reply"
                  >
                    <MessageSquare size={14} />
                  </button>
                  <button
                    onClick={() => setReviewStatus(r, 'approved')}
                    disabled={busyId === r._id || r.status === 'approved'}
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-emerald-50 text-emerald-700 disabled:opacity-30"
                    aria-label="Approve"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setReviewStatus(r, 'rejected')}
                    disabled={busyId === r._id || r.status === 'rejected'}
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-rose-50 text-rose-600 disabled:opacity-30"
                    aria-label="Reject"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={() => setConfirm(r)}
                    className="h-8 w-8 grid place-items-center rounded-full hover:bg-rose-50 text-rose-600"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            },
          ]}
        />
      )}

      {/* Reply/Detail Modal */}
      <Modal
        open={!!detail}
        onClose={() => { setDetail(null); }}
        title={detail ? `Review by ${detail.user?.name || 'Anonymous'}` : 'Review detail'}
        size="md"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="btn-ghost">Close</button>
            <Button onClick={saveReply} loading={replyBusy}><Save size={14} /> Save reply</Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-cream-50 p-4 text-sm">
              <p className="font-semibold text-ink-900">{detail.title}</p>
              <p className="text-sm text-ink-700 mt-1">{detail.comment}</p>
              <div className="mt-2 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < detail.rating ? 'fill-amber-400' : 'text-ink-300'} />
                ))}
              </div>
              <p className="text-xs text-ink-500 mt-2">Package: {detail.tourPackage?.title || '—'}</p>
            </div>
            {detail.adminReply && (
              <div className="rounded-2xl bg-brand-50 p-4 text-sm">
                <p className="font-semibold text-brand-800">Existing reply</p>
                <p className="text-ink-700 mt-1">{detail.adminReply}</p>
              </div>
            )}
            <Field label="Admin reply">
              <textarea
                className="input min-h-[100px]"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply to this review…"
                maxLength={500}
              />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={deleteReview}
        busy={busyId === confirm?._id}
        confirmVariant="danger"
        title="Delete review?"
        message={confirm ? `The review by "${confirm.user?.name || 'Anonymous'}" will be removed permanently.` : ''}
      />
    </div>
  );
}
