import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ShieldCheck, ShieldOff, Mail, Phone, Calendar, UserPlus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate } from '../../utils/format';
import { useSelector } from 'react-redux';

export default function AdminUsers() {
  const currentUser = useSelector((s) => s.auth.user);
  const [data, setData] = useState({ users: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    adminApi.users({ page, search: search || undefined, role: role || undefined })
      .then((r) => setData(r?.data || { users: [], total: 0, page: 1, totalPages: 1 }))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRows(); }, [page, role]);
  useEffect(() => { setPage(1); }, [search]);

  const toggleRole = async (u) => {
    const next = u.role === 'admin' ? 'user' : 'admin';
    if (next === 'user' && currentUser?._id === u._id) {
      toast.error('You cannot demote yourself');
      return;
    }
    setBusyId(u._id);
    try {
      await adminApi.updateUserRole(u._id, next);
      toast.success(`${u.name} is now ${next}`);
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  const onCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      return toast.error('All fields are required');
    }
    setBusy(true);
    try {
      await adminApi.createUser(form);
      toast.success('User created');
      setCreating(false);
      setForm({ name: '', email: '', phone: '', password: '', role: 'user' });
      fetchRows();
    } catch (err) {
      toast.error(err.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm) return;
    setBusyId(confirm._id);
    try {
      await adminApi.deleteUser(confirm._id);
      toast.success('User deleted');
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
        title="Users"
        subtitle="Everyone who has signed up. Promote or demote admins here."
        actions={
          <div className="flex items-center gap-2">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input !w-auto">
              <option value="">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <Button onClick={() => setCreating(true)}>
              <UserPlus size={14} /> Add user
            </Button>
          </div>
        }
      />

      <div className="max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table
          rows={data.users}
          keyFn={(r) => r._id}
          empty="No users match those filters."
          columns={[
{
               key: 'name', label: 'Name',
               render: (r) => (
                 <button
                   type="button"
                   onClick={() => adminApi.user(r._id).then((resp) => setDetail(resp?.data || r)).catch(() => setDetail(r))}
                   className="flex items-center gap-3 text-left hover:opacity-80 transition"
                 >
                   <div className="h-9 w-9 grid place-items-center rounded-full bg-brand-100 text-brand-800 font-bold">
                     {r.name?.[0]?.toUpperCase() || '?'}
                   </div>
                   <div className="min-w-0">
                     <p className="font-semibold text-ink-900 line-clamp-1">{r.name}</p>
                     <p className="text-xs text-ink-500 line-clamp-1">{r.email}</p>
                   </div>
                 </button>
               )
             },
            { key: 'phone', label: 'Phone' },
            { key: 'role', label: 'Role', render: (r) => r.role === 'admin' ? <Badge variant="success">Admin</Badge> : <Badge>User</Badge> },
            { key: 'createdAt', label: 'Joined', render: (r) => formatDate(r.createdAt) },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => toggleRole(r)}
                    disabled={busyId === r._id}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 px-3 py-1.5 rounded-full disabled:opacity-50"
                  >
                    {r.role === 'admin' ? <><ShieldOff size={12} /> Demote</> : <><ShieldCheck size={12} /> Promote</>}
                  </button>
                  {currentUser?._id !== r._id && (
                    <button
                      onClick={() => setConfirm(r)}
                      disabled={busyId === r._id}
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-rose-50 text-rose-600 disabled:opacity-50"
                      aria-label="Delete"
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            },
          ]}
        />
      )}

       <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />

       <Modal
         open={!!detail}
         onClose={() => setDetail(null)}
         title={detail ? detail.name : 'User details'}
         size="md"
         footer={
           <button onClick={() => setDetail(null)} className="btn-ghost">Close</button>
         }
       >
         {detail && (
           <div className="space-y-4">
             <div className="flex items-center gap-4">
               <div className="h-14 w-14 grid place-items-center rounded-full bg-brand-100 text-brand-800 font-bold text-xl">
                 {detail.name?.[0]?.toUpperCase() || '?'}
               </div>
               <div>
                 <p className="font-display text-lg font-semibold text-ink-900">{detail.name}</p>
                 <p className="text-sm text-ink-500 capitalize">{detail.role}</p>
               </div>
             </div>
             <div className="space-y-3 text-sm">
               <div className="flex items-center gap-3 text-ink-700"><Mail size={14} /> {detail.email}</div>
               {detail.phone && <div className="flex items-center gap-3 text-ink-700"><Phone size={14} /> {detail.phone}</div>}
               {detail.createdAt && <div className="flex items-center gap-3 text-ink-700"><Calendar size={14} /> Joined {formatDate(detail.createdAt)}</div>}
             </div>
           </div>
         )}
       </Modal>

       <Modal
         open={creating}
         onClose={() => setCreating(false)}
         title="Add user"
         size="md"
         footer={
           <>
             <button onClick={() => setCreating(false)} className="btn-ghost">Cancel</button>
             <Button onClick={onCreate} loading={busy}>Create user</Button>
           </>
         }
       >
         <div className="space-y-4">
           <Field label="Name">
             <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
           </Field>
           <Field label="Email">
             <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
           </Field>
           <Field label="Phone">
             <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" maxLength={10} />
           </Field>
           <Field label="Password" hint="Min 8 chars with uppercase, lowercase and a number.">
             <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
           </Field>
           <Field label="Role">
             <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
               <option value="user">User</option>
               <option value="admin">Admin</option>
             </select>
           </Field>
         </div>
       </Modal>

       <ConfirmDialog
         open={!!confirm}
         onClose={() => setConfirm(null)}
         onConfirm={onDelete}
         busy={busyId === confirm?._id}
         confirmVariant="danger"
         title="Delete user?"
         message={confirm ? `${confirm.name} (${confirm.email}) will lose access permanently.` : ''}
       />
     </div>
   );
}
