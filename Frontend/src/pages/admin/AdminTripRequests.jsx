import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit3, Trash2, MapPin } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate, timeAgo } from '../../utils/format';

const STATUSES = ['New', 'In Review', 'Itinerary Sent', 'Confirmed', 'Closed'];
const STATUS_COLORS = {
  New: 'bg-amber-50 text-amber-700',
  'In Review': 'bg-blue-50 text-blue-700',
  'Itinerary Sent': 'bg-violet-50 text-violet-700',
  Confirmed: 'bg-emerald-50 text-emerald-700',
  Closed: 'bg-ink-100 text-ink-700',
};

export default function AdminTripRequests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: 'New', adminNotes: '', proposedItinerary: '' });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    adminApi.tripRequests()
      .then((r) => setRows(r?.data?.requests || []))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchRows, []);

  const openEdit = (t) => {
    setEditing(t);
    setForm({ status: t.status || 'New', adminNotes: t.adminNotes || '', proposedItinerary: t.proposedItinerary || '' });
  };

  const onSave = async () => {
    setBusy(true);
    try {
      await adminApi.updateTripRequest(editing._id, form);
      toast.success('Trip request updated');
      setEditing(null);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await adminApi.deleteTripRequest(confirm._id);
      toast.success('Trip request deleted');
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
      <PageHeader title="Trip requests" subtitle="Custom itineraries requested by travellers." />

      {loading ? (
        <Skeleton className="h-48" />
      ) : (
        <Table
          rows={rows}
          keyFn={(r) => r._id}
          empty="No custom trip requests yet."
          columns={[
            {
              key: 'customer', label: 'Customer',
              render: (r) => (
                <div>
                  <p className="font-semibold text-ink-900 line-clamp-1">{r.customerName || r.user?.name || '—'}</p>
                  <p className="text-xs text-ink-500 line-clamp-1">{r.customerPhone || r.user?.phone}</p>
                </div>
              )
            },
            {
              key: 'destination', label: 'Destination',
              render: (r) => (
                <div className="flex items-center gap-1.5 text-ink-700">
                  <MapPin size={12} className="text-brand-700" />
                  {r.destination}
                </div>
              )
            },
            {
              key: 'dates', label: 'Dates',
              render: (r) => (
                <div className="text-xs">
                  <p>{formatDate(r.startDate)} → {formatDate(r.endDate)}</p>
                  <p className="text-ink-500">{r.groupSize} travellers</p>
                </div>
              )
            },
            { key: 'status', label: 'Status', render: (r) => <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-cream-100 text-ink-700'}`}>{r.status}</span> },
            { key: 'when', label: 'When', render: (r) => <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex gap-1">
                  <button onClick={() => openEdit(r)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-cream-100 text-ink-700" aria-label="Edit">
                    <Edit3 size={14} />
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

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Trip to ${editing.destination}` : 'Update trip'}
        size="md"
        footer={
          <>
            <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
            <Button onClick={onSave} loading={busy}>Save</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-cream-50 p-4 text-sm">
              <p className="font-semibold text-ink-900">{editing.customerName || editing.user?.name}</p>
              <p className="text-ink-500 text-xs">{formatDate(editing.startDate)} → {formatDate(editing.endDate)} · {editing.groupSize} travellers</p>
              {editing.specialRequests && <p className="mt-2 text-ink-700 text-xs whitespace-pre-line">{editing.specialRequests}</p>}
            </div>
            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Proposed itinerary" hint="This will be sent to the customer.">
              <textarea className="input min-h-[140px]" value={form.proposedItinerary} onChange={(e) => setForm({ ...form, proposedItinerary: e.target.value })} />
            </Field>
            <Field label="Internal notes">
              <textarea className="input min-h-[80px]" value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} placeholder="Private notes for the team…" />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        busy={busy}
        confirmVariant="danger"
        title="Delete trip request?"
        message={confirm ? `The custom trip to ${confirm.destination} will be removed permanently.` : ''}
      />
    </div>
  );
}
