import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import clsx from 'clsx';

export default function LanguageSwitcher({ className }) {
  const { i18n } = useTranslation();
  const isHi = i18n.language?.startsWith('hi');

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(isHi ? 'en' : 'hi')}
      aria-label={isHi ? 'Switch to English' : 'Switch to Hindi'}
      title={isHi ? 'English' : 'हिंदी'}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
        className || 'text-ink-700 hover:bg-cream-100 hover:text-brand-800'
      )}
    >
      <Globe size={15} />
      <span>{isHi ? 'हिंदी' : 'EN'}</span>
    </button>
  );
}
