import { useDispatch, useSelector } from 'react-redux';
import { Heart as HeartIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { toggleWishlistThunk } from '../../store/wishlistSlice';

export default function Heart({ packageId, className, size = 18, withPing = true }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s) => s.auth.user);
  const liked = useSelector((s) => s.wishlist.ids.includes(packageId));

  const onClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error(t('wishlist.signInRequired'));
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    const action = await dispatch(toggleWishlistThunk(packageId));
    if (action.payload?.action === 'added') toast.success(t('wishlist.added'));
    else if (action.payload?.action === 'removed') toast.success(t('wishlist.removed'));
  };

  return (
    <button
      onClick={onClick}
      aria-label={liked ? t('wishlist.removeAria') : t('wishlist.addAria')}
      className={clsx(
        'group/heart relative inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur p-2 shadow-soft hover:scale-110 active:scale-95 transition',
        className
      )}
    >
      <HeartIcon
        size={size}
        className={clsx(
          'transition-colors',
          liked ? 'fill-rose-500 text-rose-500' : 'text-ink-500 group-hover/heart:text-rose-500'
        )}
        strokeWidth={2}
      />
      {withPing && liked && (
        <span className="absolute inset-0 rounded-full ring-2 ring-rose-300/60 animate-ping" />
      )}
    </button>
  );
}
