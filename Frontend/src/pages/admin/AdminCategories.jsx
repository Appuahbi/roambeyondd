import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const EMPTY = { name: '', type: 'package', description: '', sortOrder: 0, isActive: true };

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    adminApi.categories({ type: type || undefined })
      .then((r) => setRows(r?.data?.categories || []))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchRows, [type]);

  const onSave = async (e) => {
    e?.preventDefault?.();
    setBusy(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      if (editing) {
        await adminApi.updateCategory(editing._id, payload);
        toast.success('Category updated');
      } else {
        await adminApi.createCategory(payload);
        toast.success('Category created');
      }
      setEditing(null);
      setForm(EMPTY);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      await adminApi.deleteCategory(confirm._id);
      toast.success('Category deleted');
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
        title="Categories"
        subtitle="Organise packages and blog posts into clean groups."
        actions={
          <>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input !w-auto">
              <option value="">All types</option>
              <option value="package">Packages</option>
              <option value="blog">Blog</option>
            </select>
            <Button onClick={() => { setEditing({}); setForm(EMPTY); }}>
              <Plus size={16} /> New
            </Button>
          </>
        }
      />

      {loading ? (
        <Skeleton className="h-48" />
      ) : (
        <Table
          rows={rows}
          keyFn={(r) => r._id}
          empty="No categories yet."
          columns={[
            { key: 'name', label: 'Name', render: (r) => <span className="font-semibold text-ink-900">{r.name}</span> },
            { key: 'type', label: 'Type', render: (r) => <Badge variant="cream">{r.type}</Badge> },
            { key: 'sortOrder', label: 'Order' },
            { key: 'isActive', label: 'Status', render: (r) => r.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Hidden</Badge> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex gap-1">
                  <button onClick={() => { setEditing(r); setForm({ ...EMPTY, ...r }); }} className="h-8 w-8 grid place-items-center rounded-full hover:bg-cream-100 text-ink-700" aria-label="Edit">
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
        onClose={() => { setEditing(null); setForm(EMPTY); }}
        title={editing?._id ? 'Edit category' : 'New category'}
        footer={
          <>
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="btn-ghost">Cancel</button>
            <Button onClick={onSave} loading={busy}>{editing?._id ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={onSave} className="space-y-4">
          <Field label="Name" required>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Type" required>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="package">Package</option>
              <option value="blog">Blog</option>
            </select>
          </Field>
          <Field label="Description">
            <textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Sort order" hint="Lower numbers appear first.">
              <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </Field>
            <Field label="Visibility">
              <select className="input" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Hidden</option>
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
        title="Delete category?"
        message={confirm ? `"${confirm.name}" will be removed permanently.` : ''}
        confirmVariant="danger"
      />
    </div>
  );
}
