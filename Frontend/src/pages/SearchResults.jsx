import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchApi } from '../api/endpoints';
import PackageCard from '../components/sections/PackageCard';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import Skeleton from '../components/ui/Skeleton';
import { formatDate } from '../utils/format';

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ packages: [], blogs: [] });
  const [loading, setLoading] = useState(true);
  const q = params.get('q') || '';

  useEffect(() => {
    if (!q) { setData({ packages: [], blogs: [] }); setLoading(false); return; }
    setLoading(true);
    searchApi.search(q)
      .then((r) => setData(r?.data || { packages: [], blogs: [] }))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="bg-cream-gradient min-h-screen">
      <div className="section py-10">
        <p className="eyebrow">Search</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900">
          {q ? `Results for “${q}”` : 'Find your next trip'}
        </h1>
        <div className="mt-4 max-w-xl">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setParams({ q: e.target.value }, { replace: true })}
              className="input pl-11 h-12"
              placeholder="Search packages, destinations, blogs…"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="section pb-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3 mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Section title={`Tours (${data.packages?.length || 0})`}>
              {data.packages?.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.packages.map((p) => <PackageCard key={p._id} pkg={p} />)}
                </div>
              ) : <Empty label="No tours match your search." />}
            </Section>
            <Section title={`Blog posts (${data.blogs?.length || 0})`}>
              {data.blogs?.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.blogs.map((b) => (
                    <Link key={b._id} to={`/blogs/${b.slug}`} className="card card-hover overflow-hidden block">
                      <div className="aspect-[16/10] overflow-hidden">
                        <ImageWithFallback item={b} kind="blog" alt={b.title} />
                      </div>
                      <div className="p-5">
                        <span className="chip-brand">{b.category}</span>
                        <h3 className="mt-2 font-display text-lg font-semibold text-ink-900 line-clamp-2">{b.title}</h3>
                        <p className="mt-1 text-xs text-ink-500">{formatDate(b.publishedAt || b.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <Empty label="No blog posts match." />}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-12">
      <h2 className="font-display text-xl font-semibold text-ink-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}
function Empty({ label }) {
  return <p className="text-sm text-ink-500">{label}</p>;
}
