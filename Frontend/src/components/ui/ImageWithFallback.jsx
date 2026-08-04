import { useState } from 'react';
import clsx from 'clsx';
import { ImageOff } from 'lucide-react';
import { imageFor, srcSetFor } from '../../utils/images';

export default function ImageWithFallback({ src, item, alt, className, kind = 'package' }) {
  const [errored, setErrored] = useState(false);
  const finalSrc = src || imageFor(item, kind);

  if (errored) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-cream-100 text-brand-700',
          className
        )}
      >
        <div className="text-center">
          <ImageOff className="mx-auto mb-2 opacity-60" size={28} />
          <span className="text-xs font-medium opacity-70">{alt || 'image'}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={finalSrc}
      srcSet={srcSetFor(finalSrc)}
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      alt={alt || ''}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={clsx('object-cover w-full h-full', className)}
    />
  );
}
