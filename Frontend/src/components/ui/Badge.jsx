import clsx from 'clsx';

export default function Badge({ children, variant = 'brand', className, icon: Icon }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        {
          'bg-brand-100 text-brand-800': variant === 'brand',
          'bg-cream-100 text-brand-800': variant === 'cream',
          'bg-rose-50 text-rose-700': variant === 'danger',
          'bg-emerald-50 text-emerald-700': variant === 'success',
        },
        className
      )}
    >
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </span>
  );
}
