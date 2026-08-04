import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ArrowUpDown, Grid2x2, List } from 'lucide-react';
import clsx from 'clsx';
import { packageApi, categoryApi } from '../api/endpoints';
import PackageCard from '../components/sections/PackageCard';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low → high' },
  { value: 'price-desc', label: 'Price: high → low' },
];

const CATEGORIES_FALLBACK = ['Domestic Tours', 'Trekking Expeditions', 'Group Tours', 'Honeymoon Packages', 'Corporate Tours'];

export default function PackagesList() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], pagination: { total: 0, page: 1, totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState('grid');
  const [categories, setCategories] = useState(CATEGORIES_FALLBACK);

  useEffect(() => {
    categoryApi.list()
      .then((r) => {
        const cats = r?.data;
        if (Array.isArray(cats) && cats.length) {
          setCategories(cats.map((c) => c.name).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  const filters = useMemo(() => ({
    search: params.get('search') || '',
    category: params.get('category') || '',
    destination: params.get('destination') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page') || 1),
    limit: 9,
  }), [params]);

  useEffect(() => {
    setLoading(true);
    packageApi.list(filters)
      .then((r) => {
        const payload = r?.data || {};
        const items = payload.items || payload.packages || payload.data || [];
        setData({
          items,
          pagination: payload.pagination || { total: items.length, page: filters.page, totalPages: 1 },
        });
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== 'page') next.set('page', '1');
    setParams(next, { replace: true });
  };

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const setRange = (min, max) => {
    const next = new URLSearchParams(params);
    if (min) next.set('minPrice', min); else next.delete('minPrice');
    if (max) next.set('maxPrice', max); else next.delete('maxPrice');
    next.set('page', '1');
    setParams(next, { replace: true });
  };

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && !['sort', 'page', 'limit'].includes(k));

  return (
    <div className="bg-cream-gradient min-h-screen">
      <div className="section pt-10 sm:pt-14 pb-6 relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">All tours</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900">
              Find your next trip
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              {loading ? 'Loading…' : `${data.pagination.total || data.items.length} tours available`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex rounded-full bg-white border border-cream-200 p-1">
              <button onClick={() => setView('grid')} className={clsx('h-8 w-8 grid place-items-center rounded-full', view === 'grid' ? 'bg-brand-600 text-white' : 'text-ink-500')}><Grid2x2 size={14} /></button>
              <button onClick={() => setView('list')} className={clsx('h-8 w-8 grid place-items-center rounded-full', view === 'list' ? 'bg-brand-600 text-white' : 'text-ink-500')}><List size={14} /></button>
            </div>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="appearance-none input pr-8 pl-9"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ArrowUpDown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            </div>
            <button onClick={() => setDrawerOpen(true)} className="md:hidden btn-secondary"><SlidersHorizontal size={14} /> Filters</button>
          </div>
        </div>

        {/* Active chips */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map(([k, v]) => (
              <span key={k} className="chip-brand">
                {k}: {v}
                <button onClick={() => setParam(k, '')}><X size={12} /></button>
              </span>
            ))}
            <button onClick={clearAll} className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline">Clear all</button>
          </div>
        )}
      </div>

      <div className="section pb-16 grid lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block lg:col-span-3">
          <FilterPanel filters={filters} setParam={setParam} setRange={setRange} clearAll={clearAll} categories={categories} />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-ink-900/40" onClick={() => setDrawerOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white p-4 overflow-y-auto shadow-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-lg font-semibold">Filters</span>
                <button onClick={() => setDrawerOpen(false)} className="h-9 w-9 grid place-items-center rounded-full hover:bg-cream-100"><X size={18} /></button>
              </div>
          <FilterPanel filters={filters} setParam={setParam} setRange={setRange} clearAll={clearAll} categories={categories} />
              <Button onClick={() => setDrawerOpen(false)} className="w-full mt-4">Apply</Button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className={clsx('grid gap-5', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-2/3 mt-3" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <EmptyState onReset={clearAll} />
          ) : (
            <div className={clsx('grid gap-5', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
              {data.items.map((p) => (
                <PackageCard key={p._id} pkg={p} compact={view === 'list'} />
              ))}
            </div>
          )}

          {data.pagination.totalPages > 1 && (
            <Pagination
              page={data.pagination.page}
              total={data.pagination.totalPages}
              onChange={(p) => setParam('page', String(p))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DebouncedSearch({ value, onChange }) {
  const [local, setLocal] = useState(value);
  const timer = useRef(null);

  useEffect(() => setLocal(value), [value]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (v) => {
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 350);
  };

  return (
    <div className="relative">
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={local}
        onChange={(e) => commit(e.target.value)}
        placeholder="Keyword"
        className="input pl-9"
      />
    </div>
  );
}

function FilterPanel({ filters, setParam, setRange, clearAll, categories = CATEGORIES_FALLBACK }) {
  return (
    <div className="card p-5 sticky top-24 space-y-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink-900">Filters</p>
        <button onClick={clearAll} className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline">Reset</button>
      </div>

      <div>
        <label className="label">Search</label>
        <DebouncedSearch value={filters.search} onChange={(v) => setParam('search', v)} />
      </div>

      <div>
        <label className="label">Category</label>
        <div className="space-y-1.5">
          {categories.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === c}
                onChange={() => setParam('category', c)}
                className="accent-brand-600"
              />
              <span className="text-ink-700">{c}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Price range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setParam('minPrice', e.target.value)}
            placeholder="Min"
            className="input"
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setParam('maxPrice', e.target.value)}
            placeholder="Max"
            className="input"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { l: 'Under 10k', min: '', max: '10000' },
            { l: '10k – 25k', min: '10000', max: '25000' },
            { l: '25k – 50k', min: '25000', max: '50000' },
            { l: '50k+', min: '50000', max: '' },
          ].map((r) => (
            <button
              key={r.l}
              onClick={() => setRange(r.min, r.max)}
              className="chip hover:bg-brand-50"
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Destination</label>
        <input
          value={filters.destination}
          onChange={(e) => setParam('destination', e.target.value)}
          placeholder="e.g. Manali"
          className="input"
        />
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-cream-100 text-brand-700">
        <Search size={28} />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">No tours match your filters</h3>
      <p className="mt-1 text-sm text-ink-500">Try widening your search or clearing filters.</p>
      <button onClick={onReset} className="btn-primary mt-5">Reset filters</button>
    </div>
  );
}

function Pagination({ page, total, onChange }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1).slice(0, 7);
  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-10 w-10 grid place-items-center rounded-full border border-cream-200 hover:bg-cream-100 disabled:opacity-40"
      >‹</button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={clsx(
            'h-10 min-w-10 px-3 rounded-full text-sm font-semibold transition',
            p === page ? 'bg-brand-600 text-white' : 'hover:bg-cream-100 text-ink-700'
          )}
        >{p}</button>
      ))}
      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page === total}
        className="h-10 w-10 grid place-items-center rounded-full border border-cream-200 hover:bg-cream-100 disabled:opacity-40"
      >›</button>
    </div>
  );
}
