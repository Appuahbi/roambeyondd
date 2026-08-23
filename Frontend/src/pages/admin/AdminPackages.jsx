import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, Star, MapPin, Image as ImageIcon, X, GripVertical, Upload } from 'lucide-react';
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
import { formatINR } from '../../utils/format';

const EMPTY = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  destination: 'Delhi',
  duration: '5 Days / 4 Nights',
  price: 0,
  discountPrice: 0,
  maxGroupSize: 20,
  featured: false,
  isActive: true,
  highlights: [],
  included: [],
  excluded: [],
  itinerary: [],
  faq: [],
  images: [],
};

function ItineraryBuilder({ items, onChange }) {
  const update = (i, field, value) => {
    const next = items.slice();
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const add = () => onChange([...items, { day: items.length + 1, title: '', description: '' }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const moveUp = (i) => {
    if (i === 0) return;
    const next = items.slice();
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  };
  const moveDown = (i) => {
    if (i === items.length - 1) return;
    const next = items.slice();
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
  };
  return (
    <Field label="Itinerary">
      <div className="space-y-3">
        {(items || []).map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex flex-col gap-1 shrink-0 mt-1">
              <button type="button" onClick={() => moveUp(i)} className="text-ink-400 hover:text-ink-700" aria-label="Move up"><GripVertical size={14} /></button>
              <button type="button" onClick={() => moveDown(i)} className="text-ink-400 hover:text-ink-700" aria-label="Move down"><GripVertical size={14} className="rotate-180" /></button>
            </div>
            <input type="number" min={1} placeholder="Day" className="input w-20 shrink-0" value={item.day} onChange={(e) => update(i, 'day', Number(e.target.value))} />
            <div className="flex-1 min-w-0">
              <input className="input" placeholder="Title" value={item.title} onChange={(e) => update(i, 'title', e.target.value)} />
              <textarea className="input min-h-[60px] mt-1" placeholder="Description" value={item.description} onChange={(e) => update(i, 'description', e.target.value)} />
            </div>
            <button type="button" onClick={() => remove(i)} className="mt-2 text-rose-500 hover:text-rose-700" aria-label="Remove day"><X size={14} /></button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-sm font-semibold text-brand-700">+ Add day</button>
      </div>
    </Field>
  );
}

function FAQBuilder({ items, onChange }) {
  const update = (i, field, value) => {
    const next = items.slice();
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const add = () => onChange([...items, { question: '', answer: '' }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <Field label="FAQ">
      <div className="space-y-3">
        {(items || []).map((item, i) => (
          <div key={i} className="space-y-2 p-3 rounded-xl border border-cream-200">
            <input className="input" placeholder="Question" value={item.question} onChange={(e) => update(i, 'question', e.target.value)} />
            <textarea className="input min-h-[60px]" placeholder="Answer" value={item.answer} onChange={(e) => update(i, 'answer', e.target.value)} />
            <button type="button" onClick={() => remove(i)} className="text-rose-500 hover:text-rose-700 text-xs font-semibold">Remove</button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-sm font-semibold text-brand-700">+ Add FAQ</button>
      </div>
    </Field>
  );
}

function ImageGallery({ items, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const add = () => onChange([...items, { url: '', publicId: '' }]);
  const update = (i, field, value) => {
    const next = items.slice();
    next[i] = { ...next[i], [field]: value };
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  const uploadFiles = async (files) => {
    const list = Array.from(files || []).filter(Boolean);
    if (list.length === 0) return;
    setUploading(true);
    try {
      const added = [];
      for (const file of list) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await adminApi.uploadPackageImage(fd);
        if (res?.data?.url) added.push({ url: res.data.url, publicId: res.data.publicId || '' });
      }
      onChange([...items, ...added]);
      if (added.length === 0) toast.error('No images were uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Field label="Images" hint="Upload photos, or paste an existing URL + public ID for a Cloudinary-hosted image.">
      <div className="space-y-3">
        {(items || []).map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            {item.url ? (
              <img src={item.url} alt="" className="h-10 w-14 rounded-lg object-cover bg-cream-100 shrink-0" />
            ) : (
              <div className="h-10 w-14 rounded-lg bg-cream-100 grid place-items-center text-ink-400 shrink-0">
                <ImageIcon size={14} />
              </div>
            )}
            <input className="input flex-1" placeholder="Image URL" value={item.url} onChange={(e) => update(i, 'url', e.target.value)} />
            <input className="input flex-1" placeholder="Cloudinary public ID" value={item.publicId} onChange={(e) => update(i, 'publicId', e.target.value)} />
            <button type="button" onClick={() => remove(i)} className="text-rose-500 hover:text-rose-700" aria-label="Remove image"><X size={14} /></button>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : <><Upload size={14} /> Upload images</>}
          </button>
          <button type="button" onClick={add} className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1">
            <ImageIcon size={14} /> Add by URL
          </button>
        </div>
      </div>
    </Field>
  );
}

function ListField({ label, items, onChange, placeholder }) {
  const setAt = (i, v) => {
    const next = items.slice();
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...(items || []), '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <Field label={label}>
      <div className="space-y-2">
        {(items || []).map((v, i) => (
          <div key={i} className="flex gap-2">
            <input className="input flex-1" value={v} placeholder={placeholder} onChange={(e) => setAt(i, e.target.value)} />
            <button type="button" onClick={() => remove(i)} className="btn-ghost !text-rose-600">Remove</button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-sm font-semibold text-brand-700">+ Add item</button>
      </div>
    </Field>
  );
}

export default function AdminPackages() {
  const [data, setData] = useState({ packages: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const formRef = useRef(null);

  const toNumber = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v));

  const fetchRows = () => {
    setLoading(true);
    adminApi.packages({ page, search: search || undefined, category: category || undefined, includeInactive: 'true' })
      .then((r) => {
        const payload = r?.data || {};
        setData({
          packages: payload.data || [],
          total: payload.pagination?.total || 0,
          page: payload.pagination?.page || 1,
          totalPages: payload.pagination?.totalPages || 1,
        });
      })
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    categoryApi.list()
      .then((r) => setCategories(r?.data || []))
      .catch(() => setCategories([]));
  };

  useEffect(() => { fetchRows(); }, [page, category, search]);
  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...EMPTY,
      ...p,
      highlights: p.highlights || [],
      included: p.included || [],
      excluded: p.excluded || [],
      itinerary: p.itinerary || [],
      faq: p.faq || [],
      images: p.images || [],
    });
  };

  const onSave = async (e) => {
    e?.preventDefault?.();
    setBusy(true);
    try {
      const payload = {
        ...form,
        price: toNumber(form.price),
        discountPrice: toNumber(form.discountPrice),
        maxGroupSize: toNumber(form.maxGroupSize),
        itinerary: (form.itinerary || []).filter((d) => d.title && d.description),
        faq: (form.faq || []).filter((f) => f.question && f.answer),
        images: (form.images || []).filter((img) => img.url && img.publicId),
      };
      if (editing?._id) {
        await adminApi.updatePackage(editing._id, payload);
        toast.success('Package updated');
      } else {
        await adminApi.createPackage(payload);
        toast.success('Package created');
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
      await adminApi.deletePackage(confirm._id);
      toast.success('Package deleted');
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
        title="Packages"
        subtitle="Create, edit and retire tour packages."
        actions={
          <>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input !w-auto">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <Button onClick={() => { setEditing({}); setForm(EMPTY); }}>
              <Plus size={16} /> New
            </Button>
          </>
        }
      />

      <div className="max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by title, destination…" />
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <Table
          rows={data.packages}
          keyFn={(r) => r._id}
          empty="No packages match those filters."
          columns={[
            {
              key: 'title', label: 'Title',
              render: (r) => (
                <div className="flex items-center gap-3 min-w-0">
                  {r.images?.[0]?.url ? (
                    <img src={r.images[0].url} alt="" className="h-10 w-14 rounded-lg object-cover bg-cream-100 shrink-0" />
                  ) : (
                    <div className="h-10 w-14 rounded-lg bg-cream-100 grid place-items-center shrink-0">
                      <MapPin size={14} className="text-brand-700" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 line-clamp-1">{r.title}</p>
                    <p className="text-xs text-ink-500 line-clamp-1">{r.destination} · {r.duration}</p>
                  </div>
                </div>
              )
            },
            { key: 'category', label: 'Category', render: (r) => <Badge variant="cream">{r.category}</Badge> },
            {
              key: 'price', label: 'Price',
              render: (r) => (
                <div className="text-sm">
                  <p className="font-semibold text-ink-900">{formatINR(r.price)}</p>
                  {r.discountPrice > 0 && <p className="text-xs text-emerald-700">− {formatINR(r.discountPrice)}</p>}
                </div>
              )
            },
            { key: 'featured', label: 'Featured', render: (r) => r.featured ? <Star size={14} className="fill-amber-400 text-amber-500" /> : <span className="text-ink-400 text-xs">—</span> },
            { key: 'active', label: 'Status', render: (r) => r.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Hidden</Badge> },
            {
              key: 'actions', label: '', className: 'text-right', cellClassName: 'text-right',
              render: (r) => (
                <div className="inline-flex gap-1">
                  <Link to={`/packages/${r.slug}?preview=true`} target="_blank" className="h-8 px-2 grid place-items-center rounded-full text-xs font-semibold text-brand-700 hover:bg-brand-50">View</Link>
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
        onClose={() => { setEditing(null); setForm(EMPTY); }}
        title={editing?._id ? 'Edit package' : 'New package'}
        size="xl"
        footer={
          <>
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="btn-ghost">Cancel</button>
            <Button onClick={() => formRef.current?.requestSubmit()} loading={busy}>{editing?._id ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <form ref={formRef} onSubmit={onSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title" required>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} maxLength={100} />
            </Field>
            <Field label="Category" required>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Short description" required hint="Shown on the package card. 20–200 chars.">
            <textarea className="input min-h-[70px]" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} required minLength={20} maxLength={200} />
          </Field>
          <Field label="Full description" required>
            <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={50} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Destination" required>
              <input className="input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
            </Field>
            <Field label="Duration" required hint='e.g. "5 Days / 4 Nights"'>
              <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
            </Field>
            <Field label="Max group size">
              <input type="number" min={1} className="input" value={form.maxGroupSize} onChange={(e) => setForm({ ...form, maxGroupSize: e.target.value })} />
            </Field>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Price (₹)" required>
              <input type="number" min={1} className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </Field>
            <Field label="Discount (₹)">
              <input type="number" min={0} className="input" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
            </Field>
            <div className="flex flex-col gap-2 pt-6">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700">
                <input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
          </div>
          <ListField label="Highlights" items={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} placeholder="e.g. Sunrise at Taj Mahal" />
          <ListField label="What's included" items={form.included} onChange={(v) => setForm({ ...form, included: v })} placeholder="e.g. 4 nights accommodation" />
          <ListField label="What's excluded" items={form.excluded} onChange={(v) => setForm({ ...form, excluded: v })} placeholder="e.g. Airfare" />
          <ItineraryBuilder items={form.itinerary} onChange={(v) => setForm({ ...form, itinerary: v })} />
          <FAQBuilder items={form.faq} onChange={(v) => setForm({ ...form, faq: v })} />
          <ImageGallery items={form.images} onChange={(v) => setForm({ ...form, images: v })} />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        busy={busy}
        confirmVariant="danger"
        title="Delete package?"
        message={confirm ? `"${confirm.title}" will be removed permanently.` : ''}
       />
    </div>
  );
}
