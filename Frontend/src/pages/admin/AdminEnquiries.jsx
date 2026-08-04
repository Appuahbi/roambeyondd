import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit3, Trash2, Phone, Mail, Users as UsersIcon } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate, timeAgo } from '../../utils/format';

const LEAD_STATUSES = ['New', 'Contacted', 'Quotation Sent', 'Negotiating', 'Booked', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const STATUS_COLORS = {
  New: 'bg-rose-50 text-rose-700',
  Contacted: 'bg-amber-50 text-amber-700',
  'Quotation Sent': 'bg-blue-50 text-blue-700',
  Negotiating: 'bg-violet-50 text-violet-700',
  Booked: 'bg-emerald-50 text-emerald-700',
  Closed: 'bg-ink-100 text-ink-700',
};
const PRIORITY_COLORS = { High: 'bg-rose-50 text-rose-700', Medium: 'bg-amber-50 text-amber-700', Low: 'bg-emerald-50 text-emerald-700' };

export default function AdminEnquiries() {
  const [data, setData] = useState({ enquiries: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ leadStatus: 'New', priority: 'Medium', remarks: '' });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    adminApi.enquiries({
      page,
      search: search || undefined,
      leadStatus: status || undefined,
    })
      .then((r) => setData(r?.data || { enquiries: [], total: 0, page: 1, totalPages: 1 }))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRows(); }, [page, status]);
  useEffect(() => { setPage(1); }, [search]);

  const openEdit = (e) => {
    setEditing(e);
    setForm({
      leadStatus: e.leadStatus || 'New',
      priority: e.priority || 'Medium',
      remarks: e.remarks || '',
    });
  };

  const onSave = async () => {
    setBusy(true);
    try {
      await adminApi.updateEnquiry(editing._id, form);
      toast.success('Enquiry updated');
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
      await adminApi.deleteEnquiry(confirm._id);
      toast.success('Enquiry deleted');
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
        title="Enquiries"
        subtitle="Track every lead from first contact to booking."
        actions={
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        }
      />

      <div className="max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, phone, or email…" />
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table
          rows={data.enquiries}
          keyFn={(r) => r._id}
          empty="No enquiries match those filters."
          columns={[
            {
              key: 'customer', label: 'Customer',
              render: (r) => (
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 line-clamp-1">{r.customerName}</p>
                  <p className="text-xs text-ink-500 line-clamp-1">{r.enquiryNumber}</p>
                </div>
              )
            },
            {
              key: 'contact', label: 'Contact',
              render: (r) => (
                <div className="text-xs space-y-0.5">
                  <p className="flex items-center gap-1.5 text-ink-700"><Phone size={11} /> {r.customerPhone}</p>
                  {r.customerEmail && <p className="flex items-center gap-1.5 text-ink-500"><Mail size={11} /> {r.customerEmail}</p>}
                </div>
              )
            },
            { key: 'package', label: 'Package', render: (r) => <span className="line-clamp-1">{r.tourPackage?.title || '—'}</span> },
            {
              key: 'travel', label: 'Travel',
              render: (r) => (
                <div className="text-xs">
                  <p>{formatDate(r.travelDate)}</p>
                  <p className="text-ink-500 flex items-center gap-1"><UsersIcon size={11} /> {r.adults}+{r.children || 0}</p>
                </div>
              )
            },
            { key: 'status', label: 'Status', render: (r) => <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[r.leadStatus] || 'bg-cream-100 text-ink-700'}`}>{r.leadStatus}</span> },
            { key: 'priority', label: 'Priority', render: (r) => <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${PRIORITY_COLORS[r.priority] || ''}`}>{r.priority}</span> },
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

      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Update ${editing.enquiryNumber}` : 'Update enquiry'}
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
              <p className="font-semibold text-ink-900">{editing.customerName}</p>
              <p className="text-ink-500 text-xs">{editing.customerPhone} · {editing.customerEmail || 'no email'}</p>
              <p className="text-ink-500 text-xs mt-1">{editing.tourPackage?.title || 'Custom enquiry'} · Travel {formatDate(editing.travelDate)}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Lead status">
                <select className="input" value={form.leadStatus} onChange={(e) => setForm({ ...form, leadStatus: e.target.value })}>
                  {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea className="input min-h-[100px]" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Internal notes…" />
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
        title="Delete enquiry?"
        message={confirm ? `${confirm.customerName}'s enquiry (${confirm.enquiryNumber}) will be removed permanently.` : ''}
      />
    </div>
  );
}
