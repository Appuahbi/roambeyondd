import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

/*
|--------------------------------------------------------------------------
| Admin Pagination
|--------------------------------------------------------------------------
| Light page-nav control. The parent owns the page state and refetches
| when it changes.
|--------------------------------------------------------------------------
*/
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const go = (p) => onChange(Math.min(totalPages, Math.max(1, p)));
  return (
    <div className="flex items-center justify-between gap-2 mt-4">
      <p className="text-xs text-ink-500">
        Page <span className="font-semibold text-ink-700">{page}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className={clsx(
            'h-9 w-9 grid place-items-center rounded-full border border-cream-200',
            page <= 1 ? 'text-ink-300 cursor-not-allowed' : 'text-ink-700 hover:bg-cream-100'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className={clsx(
            'h-9 w-9 grid place-items-center rounded-full border border-cream-200',
            page >= totalPages ? 'text-ink-300 cursor-not-allowed' : 'text-ink-700 hover:bg-cream-100'
          )}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
