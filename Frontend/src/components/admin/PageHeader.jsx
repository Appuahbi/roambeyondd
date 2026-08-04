import clsx from 'clsx';

/*
|--------------------------------------------------------------------------
| Admin Page Header
|--------------------------------------------------------------------------
| Title + optional subtitle + right-aligned actions row. Reused on every
| admin page so the chrome stays consistent.
|--------------------------------------------------------------------------
*/
export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3', className)}>
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
