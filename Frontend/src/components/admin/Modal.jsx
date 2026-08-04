import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

/*
|--------------------------------------------------------------------------
| Admin Modal
|--------------------------------------------------------------------------
| Centered dialog used for create / edit forms. Closes on backdrop click
| and on Escape. Matches the card/cream look of the rest of the app.
|--------------------------------------------------------------------------
*/
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-lift border border-cream-200 animate-[fade-up_0.2s_ease-out]',
          sizes[size] || sizes.md
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-cream-100">
          <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-cream-100 text-ink-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-cream-100 bg-cream-50/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
