import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { fetchWishlistThunk } from '../store/wishlistSlice';
import PackageCard from '../components/sections/PackageCard';
import Skeleton from '../components/ui/Skeleton';
import Seo from '../components/seo/Seo';

export default function Wishlist() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchWishlistThunk());
  }, [dispatch]);

  return (
    <div className="bg-cream-gradient min-h-screen">
      <Seo title={t('wishlistPage.title')} path="/wishlist" noindex />
      <div className="section py-10">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="eyebrow">{t('wishlistPage.eyebrow')}</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900">{t('wishlistPage.title')}</h1>
            <p className="mt-1.5 text-sm text-ink-500">{t('wishlistPage.savedCount', { count: items.length })}</p>
          </div>
          <Link to="/packages" className="btn-primary">{t('wishlistPage.findMoreTrips')}</Link>
        </div>
      </div>

      <div className="section pb-16">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-2/3 mt-3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-cream-100 text-brand-700">
              <Heart size={28} />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold">{t('wishlistPage.emptyTitle')}</h2>
            <p className="mt-1 text-sm text-ink-500">{t('wishlistPage.emptyText')}</p>
            <Link to="/packages" className="btn-primary mt-5 inline-flex">{t('wishlistPage.browseTours')}</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((i) => (
              <PackageCard
                key={i._id}
                pkg={typeof i.tourPackage === 'object' ? i.tourPackage : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
