import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Edit3, Trash2, Phone, Mail } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { timeAgo } from '../../utils/format';

const STATUSES = ['New', 'Contacted', 'Resolved', 'Closed'];
const STATUS_COLORS = {
  New: 'bg-rose-50 text-rose-700',
  Contacted: 'bg-amber-50 text-amber-700',
  Resolved: 'bg-emerald-50 text-emerald-700',
  Closed: 'bg-ink-100 text-ink-700',
};

export default function AdminContact() {
  const currentUser = useSelector((s) => s.auth.user);
  const isAdmin = currentUser?.role === 'admin';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: 'New', remarks: '', assignedTo: '' });
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchRows = () => {
    setLoading(true);
    adminApi.contactRequests()
      .then((r) => setRows(r?.data?.contactRequests || []))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  const fetchAgents = () => {
    adminApi.users({ role: 'agent', limit: 100 })
      .then((r) => setAgents(r?.data?.users || []))
      .catch(() => setAgents([]));
  };

  useEffect(() => { fetchRows(); }, []);
  useEffect(() => { fetchAgents(); }, []);

  const openEdit = (c) => {
    setEditing(c);
    setForm({ status: c.status || 'New', remarks: c.remarks || '', assignedTo: c.assignedTo?._id || '' });
  };

  const onSave = async () => {
    setBusy(true);
    try {
      await adminApi.updateContactRequest(editing._id, form);
      toast.success('Updated');
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
      await adminApi.deleteContactRequest(confirm._id);
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
      <PageHeader title="Contact requests" subtitle="Inbound messages from the contact form." />

      {loading ? (
        <Skeleton className="h-48" />
      ) : (
        <Table
          rows={rows}
          keyFn={(r) => r._id}
          empty="No contact requests yet."
          columns={[
            {
              key: 'name', label: 'Name',
              render: (r) => (
                <div>
                  <p className="font-semibold text-ink-900 line-clamp-1">{r.name}</p>
                  <p className="text-xs text-ink-500 line-clamp-1">{r.subject || r.message?.slice(0, 60)}</p>
                </div>
              )
            },
            {
              key: 'contact', label: 'Contact',
              render: (r) => (
                <div className="text-xs space-y-0.5">
                  <p className="flex items-center gap-1.5 text-ink-700"><Mail size={11} /> {r.email}</p>
                  {r.phone && <p className="flex items-center gap-1.5 text-ink-500"><Phone size={11} /> {r.phone}</p>}
                </div>
              )
            },
            { key: 'status', label: 'Status', render: (r) => <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-cream-100 text-ink-700'}`}>{r.status}</span> },
            {
              key: 'assigned', label: 'Assigned',
              render: (r) => r.assignedTo
                ? <span className="text-xs font-semibold text-ink-700 line-clamp-1">{r.assignedTo.name}</span>
                : <span className="text-xs text-ink-400">Unassigned</span>
            },
            { key: 'when', label: 'When', render: (r) => <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex gap-1">
                  <button onClick={() => openEdit(r)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-cream-100 text-ink-700" aria-label="Edit">
                    <Edit3 size={14} />
                  </button>
                  {isAdmin && (
                    <button onClick={() => setConfirm(r)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-rose-50 text-rose-600" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            },
          ]}
        />
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `From ${editing.name}` : 'Update request'}
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
              <p className="text-ink-700 whitespace-pre-line">{editing.message}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Status">
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Assign to" hint="Agents only see the requests assigned to them.">
                <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">Unassigned</option>
                  {agents.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
                </select>
              </Field>
            </div>
              <Field label="Internal notes">
              <textarea className="input min-h-[100px]" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
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
        title="Delete request?"
        message={confirm ? `The message from "${confirm.name}" will be removed permanently.` : ''}
      />
    </div>
  );
}
