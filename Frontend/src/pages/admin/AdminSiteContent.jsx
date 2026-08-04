import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Save, List, CheckCircle, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import Field from '../../components/admin/Field';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import clsx from 'clsx';

const SECTIONS = ['why-us', 'footer', 'contact'];

export default function AdminSiteContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('why-us');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const jsonError = useMemo(() => {
    if (!draft.trim()) return null;
    try {
      JSON.parse(draft);
      return null;
    } catch {
      return 'Invalid JSON syntax';
    }
  }, [draft]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(draft);
      setDraft(JSON.stringify(parsed, null, 2));
      toast.success('JSON formatted');
    } catch {
      toast.error('Cannot format — fix syntax errors first');
    }
  };

  useEffect(() => {
    adminApi.siteContentAll()
      .then((r) => setData(r?.data || {}))
      .catch((e) => toast.error(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    setDraft(JSON.stringify(data[active] ?? {}, null, 2));
  }, [active, data]);

  const save = async () => {
    if (jsonError) {
      toast.error('Fix JSON errors before saving');
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(draft);
    } catch {
      toast.error('Invalid JSON. Fix the syntax and try again.');
      return;
    }
    setBusy(true);
    try {
      await adminApi.updateSiteContent(active, parsed);
      toast.success(`${active} content updated`);
      setData((prev) => ({ ...prev, [active]: parsed }));
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Site content" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site content"
        subtitle="Edit the why-us, contact and footer sections in JSON."
      />

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold capitalize',
              active === s ? 'bg-brand-600 text-white' : 'bg-cream-100 text-ink-700 hover:bg-cream-200'
            )}
          >
            {s}
          </button>
        ))}
      </div>

<div className="card p-5 space-y-4">
         <div className="flex items-center justify-between">
           <h2 className="font-display text-lg font-semibold text-ink-900 capitalize">{active}</h2>
           <div className="flex items-center gap-2">
             {jsonError ? (
               <span className="text-xs font-semibold text-rose-600 flex items-center gap-1"><AlertCircle size={14} /> {jsonError}</span>
             ) : draft.trim() ? (
               <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Valid JSON</span>
             ) : null}
             <Button onClick={formatJson} variant="ghost"><List size={14} /> Format</Button>
             <Button onClick={save} loading={busy} disabled={!!jsonError}><Save size={14} /> Save</Button>
           </div>
         </div>
         <Field label="Content" hint="Edit JSON carefully. Use Format to pretty-print.">
           <textarea
             value={draft}
             onChange={(e) => setDraft(e.target.value)}
             className={clsx('input font-mono text-xs min-h-[480px]', jsonError ? 'border-rose-300 focus:border-rose-500' : '')}
             spellCheck={false}
           />
         </Field>
       </div>
    </div>
  );
}
