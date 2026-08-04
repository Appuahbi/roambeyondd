import { Star } from 'lucide-react';
import clsx from 'clsx';

export default function Rating({ value = 0, size = 14, className, showValue = true }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className={clsx('inline-flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full;
          const isHalf = !filled && i === full && half;
          return (
            <Star
              key={i}
              size={size}
              className={clsx(
                'transition-colors',
                filled || isHalf
                  ? 'fill-cream-500 text-cream-500'
                  : 'text-cream-200'
              )}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-ink-700">{value?.toFixed?.(1) || '0.0'}</span>
      )}
    </div>
  );
}
