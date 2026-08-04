import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  Clock, Users, MapPin, Check, X, ChevronDown, ChevronRight, ChevronLeft,
  Share2, Tag, Calendar, BadgePercent, Send, Eye, Star as StarIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { packageApi, reviewApi, adminApi } from '../api/endpoints';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import Heart from '../components/ui/Heart';
import Rating from '../components/ui/Rating';
import Skeleton from '../components/ui/Skeleton';
import ItineraryTimeline from '../components/sections/ItineraryTimeline';
import PackageEnquiryForm from '../components/sections/PackageEnquiryForm';
import PackageCard from '../components/sections/PackageCard';
import { formatINR, discountPercent, timeAgo } from '../utils/format';
import { galleryFor } from '../utils/images';
import { useReveal } from '../hooks/useReveal';
import toast from 'react-hot-toast';

export default function PackageDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get('preview') === 'true';
  const [pkg, setPkg] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('itinerary');
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ref, shown] = useReveal();

  useEffect(() => {
    setLoading(true);
    setPkg(null);
    setTab('itinerary');
    setLightbox(null);
    const fetchPkg = preview ? adminApi.packageBySlug(slug) : packageApi.bySlug(slug);
    fetchPkg
      .then((r) => {
        const p = r?.data?.package || r?.data;
        setPkg(p);
        return Promise.all([
          packageApi.list({ category: p?.category, limit: 4 }),
          p?._id ? (preview ? reviewApi.byPackageAdmin(slug) : reviewApi.byPackage(slug)).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);
      })
      .then(([rel, rev]) => {
        const list = rel?.data?.items || rel?.data?.data || rel?.data || [];
        const relItems = (Array.isArray(list) ? list : []).filter((x) => x.slug !== slug).slice(0, 3);
        setRelated(relItems);
        setReviews(rev?.data?.reviews || rev?.data?.items || rev?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug, preview]);

  if (loading) return <DetailSkeleton />;
  if (!pkg) {
    return (
      <div className="section py-20 text-center">
        <h1 className="font-display text-3xl">Tour not found</h1>
        <p className="text-ink-500 mt-2">It may have been removed or the link is incorrect.</p>
        <Link to="/packages" className="btn-primary mt-5 inline-flex">Browse tours</Link>
      </div>
    );
  }

  const off = discountPercent(pkg.price, pkg.discountPrice);
  const gallery = galleryFor(pkg);
  const sideImages = gallery.slice(1, 5);
  const extraCount = Math.max(0, gallery.length - 5);
  const displayPrice = off > 0 ? pkg.discountPrice : pkg.price;

  const scrollToEnquiry = () => {
    document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: pkg.title, url: window.location.href }); } catch { /* share aborted */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const tabs = [
    { key: 'itinerary', label: 'Itinerary', count: pkg.itinerary?.length || 0 },
    { key: 'inclusions', label: "What's included", count: pkg.included?.length || 0 },
    { key: 'gallery', label: 'Photos', count: gallery.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
    { key: 'faq', label: 'FAQs', count: pkg.faq?.length || 0 },
  ];

  return (
    <div>
      {/* Admin preview notice */}
      {preview && (
        <div className="bg-brand-700 text-white">
          <div className="section py-2.5 flex items-center gap-2 text-sm">
            <Eye size={15} />
            <span><strong>Admin preview.</strong> Hidden tours are only visible to you right now.</span>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-cream-gradient">
        <div className="section pt-6 pb-8">
          <nav className="breadcrumb">
            <Link to="/">Home</Link> <ChevronRight size={12} />
            <Link to="/packages">Tours</Link> <ChevronRight size={12} />
            <span className="text-ink-700 line-clamp-1">{pkg.title}</span>
          </nav>

          {/* Gallery */}
          <div className="mt-4 grid lg:grid-cols-12 gap-3">
            <div
              role="button"
              tabIndex={0}
              aria-label="View all photos"
              onClick={() => gallery.length > 1 && setLightbox(0)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && gallery.length > 1) {
                  e.preventDefault();
                  setLightbox(0);
                }
              }}
              className={clsx(
                'group relative rounded-3xl overflow-hidden shadow-soft bg-cream-100 aspect-[16/10] text-left',
                gallery.length > 1 && 'cursor-zoom-in',
                sideImages.length ? 'lg:col-span-8' : 'lg:col-span-12'
              )}
            >
              <ImageWithFallback src={gallery[0]} item={pkg} alt={pkg.title} className="transition-transform duration-500 group-hover:scale-[1.02]" />
              <div className="absolute top-4 left-4 flex gap-2">
                {off > 0 && (
                  <span className="chip bg-rose-600 text-white !border-transparent">
                    <BadgePercent size={12} /> {off}% off
                  </span>
                )}
                <span className="chip bg-white/90 text-brand-800">{pkg.category}</span>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); share(); }} className="h-10 w-10 grid place-items-center rounded-full bg-white/90 backdrop-blur shadow-soft hover:scale-105 transition" aria-label="Share"><Share2 size={16} /></button>
                <span onClick={(e) => e.stopPropagation()}><Heart packageId={pkg._id} size={18} /></span>
              </div>
              {gallery.length > 1 && (
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-ink-900/70 text-white text-xs font-semibold px-3 py-1.5 backdrop-blur">
                  <StarIcon size={12} className="fill-cream-500 text-cream-500" /> View all {gallery.length} photos
                </span>
              )}
            </div>

            {sideImages.length > 0 && (
              <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                {sideImages.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i + 1)}
                    className="relative rounded-2xl overflow-hidden bg-cream-100 aspect-[4/3] cursor-zoom-in group"
                  >
                    <ImageWithFallback src={url} item={pkg} alt="" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                    {i === sideImages.length - 1 && extraCount > 0 && (
                      <span className="absolute inset-0 grid place-items-center bg-ink-900/55 text-white text-sm font-bold">
                        +{extraCount} more
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + meta + price */}
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
                <span className="inline-flex items-center gap-1"><MapPin size={12} /> {pkg.destination}</span>
                <span className="text-ink-300">•</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {pkg.duration}</span>
                <span className="text-ink-300">•</span>
                <span className="inline-flex items-center gap-1"><Users size={12} /> Up to {pkg.maxGroupSize || 20}</span>
              </div>
              <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold text-ink-900 leading-tight">
                {pkg.title}
              </h1>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-soft">
                  <Rating value={pkg.rating} size={15} />
                </span>
                <span className="text-sm text-ink-500">({pkg.reviewsCount || reviews.length || 0} reviews)</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs uppercase tracking-widest text-ink-400 font-semibold">From</p>
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-4xl font-bold text-brand-700">{formatINR(displayPrice)}</span>
                {off > 0 && <span className="text-base text-ink-400 line-through">{formatINR(pkg.price)}</span>}
              </div>
              <p className="text-xs text-ink-500 mt-0.5">per person · incl. taxes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky tabs */}
      <div className="sticky top-[67px] z-30 bg-white/90 backdrop-blur border-b border-cream-200">
        <div className="section flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'shrink-0 px-4 py-3 text-sm font-semibold capitalize border-b-2 transition inline-flex items-center gap-1.5',
                tab === t.key ? 'border-brand-600 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-900'
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={clsx(
                  'text-[10px] font-bold rounded-full px-1.5 py-0.5',
                  tab === t.key ? 'bg-brand-100 text-brand-700' : 'bg-cream-100 text-ink-500'
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={clsx('section py-10 pb-28 lg:pb-10 grid lg:grid-cols-12 gap-8', shown ? '' : 'opacity-0')} ref={ref}>
        <div className="lg:col-span-8 space-y-10 animate-fade-up">
          {/* Overview */}
          <section>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-brand-700"><StarIcon size={18} /></span>
              <h2 className="font-display text-2xl font-semibold text-ink-900">Overview</h2>
            </div>
            <p className="mt-4 text-ink-700 leading-relaxed whitespace-pre-line">{pkg.description}</p>
            {pkg.highlights?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {pkg.highlights.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1.5 rounded-full bg-cream-50 border border-cream-200 px-3.5 py-1.5 text-sm text-ink-700">
                    <Check size={14} className="text-brand-600" strokeWidth={3} /> {h}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Tab content */}
          {tab === 'itinerary' && (
            <section>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Clock size={18} /></span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">Day-by-day itinerary</h2>
                  <p className="text-sm text-ink-500">{pkg.itinerary?.length || 0} days · flexible pacing</p>
                </div>
              </div>
              <div className="mt-5">
                <ItineraryTimeline days={pkg.itinerary || []} included={pkg.included || []} />
              </div>
            </section>
          )}

          {tab === 'inclusions' && (
            <section>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><Check size={18} strokeWidth={3} /></span>
                <h2 className="font-display text-2xl font-semibold text-ink-900">What’s included</h2>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {pkg.included?.map((x) => (
                  <div key={x} className="flex items-center gap-2.5 text-sm text-ink-700 card p-3.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={13} strokeWidth={3} /></span>
                    {x}
                  </div>
                ))}
              </div>
              {pkg.excluded?.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mt-8">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 text-rose-600"><X size={18} /></span>
                    <h2 className="font-display text-2xl font-semibold text-ink-900">Not included</h2>
                  </div>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3">
                    {pkg.excluded.map((x) => (
                      <div key={x} className="flex items-center gap-2.5 text-sm text-ink-700 card p-3.5">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-500"><X size={13} /></span>
                        {x}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {tab === 'gallery' && (
            <section>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-brand-700"><StarIcon size={18} /></span>
                <h2 className="font-display text-2xl font-semibold text-ink-900">Gallery</h2>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {gallery.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(i)} className="cursor-zoom-in rounded-2xl overflow-hidden aspect-[4/3] group">
                    <ImageWithFallback src={url} item={pkg} alt="" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {tab === 'reviews' && (
            <ReviewsTab slug={slug} reviews={reviews} />
          )}

          {tab === 'faq' && (
            <section>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-100 text-brand-700"><ChevronDown size={18} /></span>
                <h2 className="font-display text-2xl font-semibold text-ink-900">Frequently asked questions</h2>
              </div>
              <div className="mt-5 space-y-2">
                {pkg.faq?.length ? (
                  pkg.faq.map((f, i) => <FaqItem key={i} q={f.question} a={f.answer} />)
                ) : <p className="text-ink-500">No FAQs yet.</p>}
              </div>
            </section>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream-100 text-brand-700"><MapPin size={18} /></span>
                <h2 className="font-display text-2xl font-semibold text-ink-900">You may also like</h2>
              </div>
              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((p) => <PackageCard key={p._id} pkg={p} />)}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="card p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-brand-700">{formatINR(displayPrice)}</span>
                {off > 0 && <span className="text-sm text-ink-400 line-through">{formatINR(pkg.price)}</span>}
              </div>
              <p className="text-xs text-ink-500 mt-0.5">per person · incl. taxes</p>
              {off > 0 && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1">
                  <BadgePercent size={12} /> Save {formatINR(pkg.price - pkg.discountPrice)} ({off}%)
                </p>
              )}
              <div className="my-5 h-px bg-cream-200" />
              <ul className="space-y-3 text-sm text-ink-700">
                <li className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-brand-700"><MapPin size={15} /></span> {pkg.destination}</li>
                <li className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-brand-700"><Clock size={15} /></span> {pkg.duration}</li>
                <li className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-brand-700"><Users size={15} /></span> Up to {pkg.maxGroupSize || 20} travellers</li>
                <li className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-brand-700"><Tag size={15} /></span> {pkg.category}</li>
              </ul>
              <Button onClick={scrollToEnquiry} className="w-full mt-6">
                <Calendar size={15} /> Plan this trip
              </Button>
              <p className="mt-2 text-center text-[11px] text-ink-400">Free cancellation · Best-price guarantee</p>
            </div>

            <div id="enquiry">
              <PackageEnquiryForm pkg={pkg} />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-cream-200 bg-white/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-3 shadow-soft">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-ink-400 font-semibold">From</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-brand-700">{formatINR(displayPrice)}</span>
            {off > 0 && <span className="text-xs text-ink-400 line-through">{formatINR(pkg.price)}</span>}
          </div>
          <p className="text-[10px] text-ink-400">per person · incl. taxes</p>
        </div>
        <Button onClick={scrollToEnquiry} className="shrink-0">
          <Send size={15} /> Plan this trip
        </Button>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <Lightbox
          images={gallery}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between p-4 text-left">
        <span className="font-semibold text-ink-900">{q}</span>
        <ChevronDown className={clsx('transition shrink-0', open && 'rotate-180')} size={18} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-ink-700 border-t border-cream-100 pt-3">{a}</div>}
    </div>
  );
}

function ReviewsTab({ reviews }) {
  const [list, setList] = useState(reviews);
  useEffect(() => setList(reviews), [reviews]);
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream-100 text-brand-700"><StarIcon size={18} /></span>
        <h2 className="font-display text-2xl font-semibold text-ink-900">Reviews</h2>
      </div>
      <div className="card mt-5 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <p className="font-display text-4xl font-semibold text-ink-900">{avg.toFixed(1)}</p>
          <Rating value={avg} />
          <p className="text-xs text-ink-500 mt-1">{list.length} verified reviews</p>
        </div>
        <p className="text-sm text-ink-500 sm:ml-auto">Reviews are public and moderated. We don’t edit them.</p>
      </div>
      <div className="mt-5 space-y-3">
        {list.length === 0 && <p className="text-sm text-ink-500">No reviews yet — be the first to share your experience!</p>}
        {list.map((r) => (
          <div key={r._id} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-600 text-white grid place-items-center font-bold">
                {r.user?.name?.[0]?.toUpperCase() || 'T'}
              </div>
              <div>
                <p className="font-semibold text-ink-900">{r.user?.name || 'Traveller'}</p>
                <p className="text-xs text-ink-500">{timeAgo(r.createdAt)}</p>
              </div>
              <div className="ml-auto"><Rating value={r.rating} /></div>
            </div>
            <h4 className="mt-3 font-semibold text-ink-900">{r.title}</h4>
            <p className="mt-1 text-sm text-ink-700">{r.comment}</p>
            {r.adminReply && (
              <div className="mt-3 rounded-xl bg-cream-50 border border-cream-200 p-3 text-sm text-ink-700">
                <p className="text-xs font-semibold text-brand-700 mb-1">Reply from Roam Beyond</p>
                {r.adminReply}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Lightbox({ images, index, onClose, onNavigate }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(Math.max(0, index - 1));
      if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, index + 1));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, images.length, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-[60] bg-ink-900/95 flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm font-medium">{index + 1} / {images.length}</span>
        <button onClick={onClose} className="h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition" aria-label="Close">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center px-2">
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(Math.max(0, index - 1)); }}
          disabled={index === 0}
          className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-30"
          aria-label="Previous"
        >
          <ChevronLeft size={22} />
        </button>
        <img src={images[index]} alt="" className="max-h-full max-w-full object-contain rounded-xl px-2" onClick={(e) => e.stopPropagation()} />
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(Math.min(images.length - 1, index + 1)); }}
          disabled={index === images.length - 1}
          className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 transition disabled:opacity-30"
          aria-label="Next"
        >
          <ChevronRight size={22} />
        </button>
      </div>
      <div className="flex justify-center gap-2 p-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
        {images.map((url, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={clsx(
              'h-14 w-20 shrink-0 rounded-lg overflow-hidden ring-2 transition',
              i === index ? 'ring-brand-500' : 'ring-transparent opacity-70 hover:opacity-100'
            )}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="section py-8">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="aspect-[16/10] w-full rounded-3xl mt-4" />
      <Skeleton className="h-8 w-1/2 mt-6" />
      <Skeleton className="h-4 w-1/3 mt-3" />
      <div className="grid lg:grid-cols-12 gap-8 mt-10">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
