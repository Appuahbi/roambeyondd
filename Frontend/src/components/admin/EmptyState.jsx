import { Inbox } from 'lucide-react';

/*
|--------------------------------------------------------------------------
| Admin Empty State
|--------------------------------------------------------------------------
| Shown in list pages when there is no data, with optional CTA.
|--------------------------------------------------------------------------
*/
export default function EmptyState({ title = 'Nothing here yet', message, icon: Icon = Inbox, action }) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto h-12 w-12 grid place-items-center rounded-2xl bg-cream-100 text-brand-700">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{title}</h3>
      {message && <p className="mt-1 text-sm text-ink-500 max-w-md mx-auto">{message}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
