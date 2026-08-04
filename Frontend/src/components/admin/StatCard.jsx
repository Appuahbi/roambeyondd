import clsx from 'clsx';

/*
|--------------------------------------------------------------------------
| Admin Stat Card
|--------------------------------------------------------------------------
| Tile used on the dashboard overview. Pairs a number with a label
| and an optional icon and accent color.
|--------------------------------------------------------------------------
*/
export default function StatCard({ label, value, icon: Icon, accent = 'brand', sub }) {
  const accents = {
    brand: 'bg-brand-100 text-brand-800',
    cream: 'bg-cream-100 text-brand-800',
    success: 'bg-emerald-100 text-emerald-800',
    danger: 'bg-rose-100 text-rose-700',
  };
  return (
    <div className="card p-5 flex items-start gap-4">
      {Icon && (
        <div className={clsx('h-11 w-11 grid place-items-center rounded-xl shrink-0', accents[accent] || accents.brand)}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-ink-500">{sub}</p>}
      </div>
    </div>
  );
}
