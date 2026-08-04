import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi, categoryApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Table from '../../components/admin/Table';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import Modal from '../../components/admin/Modal';
import Field from '../../components/admin/Field';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { formatDate, timeAgo } from '../../utils/format';

const EMPTY = {
  title: '',
  content: '',
  excerpt: '',
  category: '',
  tags: [],
  status: 'draft',
  seo: { metaTitle: '', metaDescription: '', keywords: [] },
};

export default function AdminBlogs() {
  const [data, setData] = useState({ blogs: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRows = () => {
    setLoading(true);
    adminApi.blogs({
      page,
      search: search || undefined,
      status: status || undefined,
    })
      .then((r) => {
        const payload = r?.data || {};
        setData({
          blogs: payload.blogs || [],
          page: payload.pagination?.page || 1,
          totalPages: payload.pagination?.totalPages || 1,
          total: payload.pagination?.total || 0,
        });
      })
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    categoryApi.blogList()
      .then((r) => setCategories(r?.data || []))
      .catch(() => setCategories([]));
  };

  useEffect(() => { fetchRows(); }, [page, status, search]);
  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      ...EMPTY,
      ...b,
      tags: b.tags || [],
      seo: { ...EMPTY.seo, ...(b.seo || {}) },
    });
    setFile(null);
  };

  const onSave = async (e) => {
    e?.preventDefault?.();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'seo') {
          fd.append('seo', JSON.stringify(v));
        } else if (k === 'tags') {
          fd.append('tags', JSON.stringify(v));
        } else {
          fd.append(k, v);
        }
      });
      if (file) fd.append('featuredImage', file);

      if (editing?._id) {
        await adminApi.updateBlog(editing._id, fd);
        toast.success('Blog updated');
      } else {
        await adminApi.createBlog(fd);
        toast.success('Blog created');
      }
      setEditing(null);
      setForm(EMPTY);
      setFile(null);
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
      await adminApi.deleteBlog(confirm._id);
      toast.success('Blog deleted');
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
        title="Blogs"
        subtitle="Publish, edit, and archive blog posts."
        actions={
          <>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input !w-auto">
              <option value="">All statuses</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
            </select>
            <Button onClick={() => { setEditing({}); setForm(EMPTY); setFile(null); }}>
              <Plus size={16} /> New
            </Button>
          </>
        }
      />

      <div className="max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search blogs…" />
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table
          rows={data.blogs}
          keyFn={(r) => r._id}
          empty="No blogs match those filters."
          columns={[
            {
              key: 'title', label: 'Title',
              render: (r) => (
                <div className="flex items-center gap-3 min-w-0">
                  {r.featuredImage?.url ? (
                    <img src={r.featuredImage.url} alt="" className="h-10 w-14 rounded-lg object-cover bg-cream-100 shrink-0" />
                  ) : (
                    <div className="h-10 w-14 rounded-lg bg-cream-100 grid place-items-center text-[10px] text-ink-400 font-semibold shrink-0">IMG</div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 line-clamp-1">{r.title}</p>
                    <p className="text-xs text-ink-500 line-clamp-1">{r.category} · {timeAgo(r.createdAt)}</p>
                  </div>
                </div>
              )
            },
            { key: 'category', label: 'Category', render: (r) => <Badge variant="cream">{r.category}</Badge> },
            { key: 'status', label: 'Status', render: (r) => r.status === 'published' ? <Badge variant="success">Published</Badge> : <Badge>Draft</Badge> },
            { key: 'views', label: 'Views', render: (r) => <span className="text-sm text-ink-700">{r.views ?? 0}</span> },
            { key: 'when', label: 'Updated', render: (r) => <span className="text-xs text-ink-500">{formatDate(r.updatedAt || r.createdAt)}</span> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex gap-1">
                  <Link to={`/blogs/${r.slug}`} target="_blank" className="h-8 px-2 grid place-items-center rounded-full text-xs font-semibold text-brand-700 hover:bg-brand-50">View</Link>
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
        onClose={() => { setEditing(null); setForm(EMPTY); setFile(null); }}
        title={editing?._id ? 'Edit blog' : 'New blog'}
        size="xl"
        footer={
          <>
            <button onClick={() => { setEditing(null); setForm(EMPTY); setFile(null); }} className="btn-ghost">Cancel</button>
            <Button onClick={onSave} loading={busy}>{editing?._id ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title" required>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
            </Field>
            <Field label="Category" required>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Excerpt" hint="Optional. Up to 300 chars.">
            <textarea className="input min-h-[70px]" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} maxLength={300} />
          </Field>
          <Field label="Content" required>
            <textarea className="input min-h-[200px] font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Tags" hint="Comma-separated.">
              <input
                className="input"
                value={(form.tags || []).join(', ')}
                onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                placeholder="manali, snow, weekend"
              />
            </Field>
            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>
          <Field label="Featured image" hint="Optional. Replaces the current image.">
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
          </Field>
          <details className="rounded-2xl border border-cream-200 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-ink-700">SEO settings</summary>
            <div className="mt-3 space-y-3">
              <Field label="Meta title">
                <input className="input" value={form.seo.metaTitle} onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })} maxLength={60} />
              </Field>
              <Field label="Meta description">
                <textarea className="input min-h-[60px]" value={form.seo.metaDescription} onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })} maxLength={160} />
              </Field>
              <Field label="Keywords" hint="Comma-separated.">
                <input
                  className="input"
                  value={(form.seo.keywords || []).join(', ')}
                  onChange={(e) => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } })}
                />
              </Field>
            </div>
          </details>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        busy={busy}
        confirmVariant="danger"
        title="Delete blog?"
        message={confirm ? `"${confirm.title}" will be removed permanently.` : ''}
      />
    </div>
  );
}
