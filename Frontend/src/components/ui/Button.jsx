import clsx from 'clsx';

const SIZES = {
  sm: 'px-4 h-9 text-xs',
  md: 'px-5 h-11 text-sm',
  lg: 'px-7 h-12 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading,
  ...rest
}) {
  return (
    <button
      className={clsx(
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-ghost': variant === 'ghost',
          'btn-cream': variant === 'cream',
        },
        SIZES[size],
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
}
