import clsx from 'clsx';

/*
|--------------------------------------------------------------------------
| Admin Form Field
|--------------------------------------------------------------------------
| Label + control wrapper. Supports input / textarea / select / native.
|--------------------------------------------------------------------------
*/
export default function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}) {
  return (
    <label className={clsx('block', className)}>
      {label && (
        <span className="label">
          {label}
          {required && <span className="text-rose-600 ml-0.5">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
