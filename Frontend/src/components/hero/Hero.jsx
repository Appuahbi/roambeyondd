import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search, ArrowRight, Star, ShieldCheck, Compass, MapPin, ChevronDown, Calendar,
} from 'lucide-react';
import {
  motion, MotionConfig, useInView, useMotionValue, useSpring, useTransform, animate,
} from 'framer-motion';
import { packageApi } from '../../api/endpoints';
import { imageFor, optimizedImage } from '../../utils/images';
import { formatINR } from '../../utils/format';

const SPRING = { type: 'spring', stiffness: 140, damping: 20 };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: SPRING },
};

const FALLBACK = [
  { slug: 'kashmir', title: 'The Frozen Valley', destination: 'Kashmir · Winter', price: 14999, discountPrice: 11999 },
  { slug: 'goa', title: 'Goa Getaway', destination: 'Goa · Beaches', price: 8999, discountPrice: 7499 },
  { slug: 'rajasthan', title: 'Rajasthan Royal', destination: 'Rajasthan · Heritage', price: 18999, discountPrice: 15999 },
  { slug: 'ladakh', title: 'Ladakh Expedition', destination: 'Ladakh · High Passes', price: 21999, discountPrice: 18999 },
  { slug: 'manali', title: 'Manali Escapes', destination: 'Manali · Mountains', price: 12999, discountPrice: 10999 },
];

const normalize = (p) => {
  const dest = [p.destination, p.category].filter(Boolean).join(' · ');
  return {
    slug: p.slug,
    title: p.title,
    destination: dest || p.destination || 'India',
    price: p.price || 0,
    discountPrice: p.discountPrice || 0,
    image: imageFor(p),
  };
};

const FALLBACK_ITEMS = FALLBACK.map((c) => normalize({ ...c, _id: c.slug }));

function CountUp({ to, decimals = 0, suffix = '' }) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('hi') ? 'hi-IN' : 'en-IN';
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  const text = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString(locale);
  return (
    <span ref={ref}>
      {text}
      {suffix}
    </span>
  );
}

/**
 * AnimatedHero — cream canvas, interactive destination picker.
 * Auto-rotating deck of featured tours, spring reflow, count-up stats,
 * mouse parallax, floating stat cards. Reduced-motion safe.
 */
export default function Hero({ brand = 'ROAMBEYOND', tagline }) {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const [items, setItems] = useState(FALLBACK_ITEMS);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });
  const tX = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const tY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    let mounted = true;
    packageApi.list({ limit: 8, featured: 'true' })
      .then((r) => {
        const raw = r?.data?.items || r?.data?.packages || r?.data?.data || [];
        if (mounted && Array.isArray(raw) && raw.length) {
          const next = raw.slice(0, 6).map(normalize);
          setItems(next);
          setActive((a) => Math.min(a, next.length - 1));
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || items.length < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [paused, reducedMotion, items.length]);

  const activeItem = items[active];
  const deck = useMemo(
    () => items.map((_, i) => ({ index: i, pos: (i - active + items.length) % items.length })),
    [items, active]
  );

  const submit = (e) => {
    e.preventDefault();
    navigate(`/packages${q.trim() ? `?search=${encodeURIComponent(q.trim())}` : ''}`);
  };

  const posStyle = (pos) => {
    if (pos === 0) return { rotate: 0, y: 0, x: 0, scale: 1, opacity: 1, zIndex: 30 };
    const table = [
      { rotate: -3, y: 12, x: 10, scale: 0.9, opacity: 0.85 },
      { rotate: 3, y: 24, x: -14, scale: 0.82, opacity: 0.7 },
      { rotate: -5, y: 36, x: 18, scale: 0.75, opacity: 0.5 },
      { rotate: 5, y: 48, x: -20, scale: 0.7, opacity: 0.35 },
    ];
    const s = table[Math.min(pos - 1, table.length - 1)];
    return { ...s, zIndex: 30 - pos };
  };

  return (
    <MotionConfig reducedMotion="user">
      <section className="relative min-h-[92vh] overflow-hidden bg-cream-gradient flex items-center">
        {/* Soft grid + ambient blobs */}
        <div className="absolute inset-0 bg-grid-soft opacity-70 pointer-events-none" aria-hidden="true" />
        <motion.div
          aria-hidden="true"
          className="absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-200/40 blur-3xl pointer-events-none"
          animate={reducedMotion ? undefined : { x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 -left-24 h-[24rem] w-[24rem] rounded-full bg-cream-300/50 blur-3xl pointer-events-none"
          animate={reducedMotion ? undefined : { x: [0, 26, 0], y: [0, -18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="section relative w-full grid lg:grid-cols-12 gap-10 lg:gap-6 items-center py-16 lg:py-24">
          {/* Left — copy + actions */}
          <motion.div className="lg:col-span-7 max-w-2xl" variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="flex items-center gap-3">
              <motion.span
                className="h-px w-10 bg-gradient-to-r from-transparent to-brand-500"
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: 'left' }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brand-700">{brand}</p>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-brand-500" aria-hidden="true" />
            </motion.div>

            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] text-ink-900">
              {[t('hero.headline1'), t('hero.headline2'), t('hero.headline3')].map((w) => (
                <motion.span key={w} variants={item} className="inline-block mr-[0.28em]">
                  {w}
                </motion.span>
              ))}
              <motion.span variants={item} className="inline-block">
                <span className="relative inline-block italic text-brand-700">
                  {t('hero.ordinary')}
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden="true">
                    <motion.path
                      d="M2 8 C 80 2, 220 2, 298 6"
                      fill="none"
                      stroke="#ffd06b"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 1.1 }}
                    />
                  </svg>
                </span>
              </motion.span>
            </h1>

            <motion.p variants={item} className="mt-5 text-base sm:text-lg text-ink-500 leading-relaxed max-w-xl">
              {tagline || t('hero.subtitle')}
            </motion.p>

            {/* Search */}
            <motion.form variants={item} onSubmit={submit} className="mt-8 max-w-lg">
              <div className="flex items-center gap-1.5 rounded-full bg-white border border-cream-200 shadow-card p-1.5 pl-4 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
                <Search size={18} className="text-ink-400 shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-400"
                  aria-label={t('hero.searchAria')}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-600 hover:bg-brand-700 px-4 sm:px-5 h-10 text-sm font-semibold text-white transition-all hover:-translate-y-px shadow-soft"
                >
                  <span className="hidden sm:inline">{t('common.search')}</span>
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.form>

            {/* CTAs */}
            <motion.div variants={item} className="mt-5 flex flex-col sm:flex-row gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/packages" className="btn-primary">
                  <Compass size={16} /> {t('hero.exploreTours')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link to="/contact?type=custom" className="btn-secondary">
                  {t('hero.planCustomTrip')}
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {['P', 'A', 'N', 'R'].map((c, i) => (
                    <div
                      key={i}
                      className="grid h-9 w-9 place-items-center rounded-full ring-2 ring-cream-50 text-xs font-bold text-white bg-brand-600"
                      style={{ background: i % 2 ? '#67b678' : '#2f7c42' }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <div className="text-sm leading-tight">
                  <p className="font-semibold text-ink-900"><CountUp to={12000} suffix="+" /> {t('hero.travellers')}</p>
                  <p className="text-xs text-ink-500">{t('hero.travellersNote')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className="fill-cream-500 text-cream-500" />
                  ))}
                </div>
                <p className="text-sm text-ink-700">
                  <strong className="text-ink-900"><CountUp to={4.9} decimals={1} />/5</strong> {t('hero.fromReviews')}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-sm text-ink-700">
                <ShieldCheck size={15} className="text-brand-600" /> {t('hero.verifiedStays')}
              </div>
            </motion.div>
          </motion.div>

          {/* Right — interactive destination picker */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-5 relative hidden sm:block"
            onMouseMove={onMove}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => { setPaused(false); onLeave(); }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <motion.div style={{ x: tX, y: tY }} className="relative h-[420px] sm:h-[480px] lg:h-[540px]">
                {/* Deck */}
                {deck.map(({ index, pos }) => {
                  const c = items[index];
                  const s = posStyle(pos);
                  return (
                    <motion.button
                      key={c.slug}
                      type="button"
                      aria-label={pos === 0 ? t('hero.viewPackage', { title: c.title }) : t('hero.selectDestination', { destination: c.destination })}
                      aria-pressed={pos === 0}
                      onClick={() => (pos === 0 && c.slug ? navigate(`/packages/${c.slug}`) : setActive(index))}
                      animate={s}
                      transition={SPRING}
                      style={{ zIndex: s.zIndex }}
                      whileHover={pos === 0 ? { scale: 1.02 } : { scale: s.scale + 0.02, opacity: 1 }}
                      className="absolute inset-0 block rounded-[2rem] overflow-hidden border-4 border-white bg-brand-100 shadow-float text-left"
                    >
                      <img
                        src={optimizedImage(c.image, 1200)}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-cream-300">
                          <MapPin size={11} /> {c.destination}
                        </p>
                        <div className="mt-0.5 flex items-end justify-between gap-3">
                          <p className="font-display text-xl sm:text-2xl font-semibold leading-tight line-clamp-1">{c.title}</p>
                          {c.price > 0 && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-bold text-brand-800 shadow-soft">
                              <Calendar size={11} /> {t('common.from')} {formatINR(c.discountPrice || c.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}

                {/* Floating stat — top right */}
                <motion.div
                  className="absolute -top-5 -right-4 sm:-right-8 rounded-2xl bg-white shadow-float border border-cream-200 px-4 py-3"
                  animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white">
                      <Star size={14} className="fill-white" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-extrabold text-ink-900"><CountUp to={4.9} decimals={1} />/5</p>
                      <p className="text-[10px] text-ink-500 font-medium">{t('hero.travellerRating')}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Accent card — top left */}
                <motion.div
                  className="absolute -top-6 -left-4 sm:-left-10 rounded-2xl bg-brand-800 text-cream-100 shadow-float px-4 py-3 hidden sm:block"
                  animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="font-display text-xl font-semibold text-cream-200"><CountUp to={45} suffix="+" /></p>
                  <p className="text-[10px] uppercase tracking-widest text-cream-200/80">{t('hero.destinations')}</p>
                </motion.div>

                {/* Floating card — bottom left, reflects active destination */}
                <motion.div
                  key={activeItem.slug}
                  className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl bg-white shadow-float border border-cream-200 px-4 py-3 flex items-center gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={SPRING}
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={optimizedImage(activeItem.image, 400)}
                    alt=""
                    className="h-11 w-14 rounded-xl object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-ink-900 line-clamp-1">{activeItem.title}</p>
                    <p className="text-xs text-brand-700 font-semibold">
                      {t('common.from')} {formatINR(activeItem.discountPrice || activeItem.price)}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Dots — direct selection */}
              <div className="mt-10 flex items-center justify-center gap-2">
                {items.map((c, i) => (
                  <button
                    key={c.slug}
                    onClick={() => setActive(i)}
                    aria-label={t('hero.selectDestination', { destination: c.destination })}
                    aria-current={active === i ? 'true' : undefined}
                    className="relative h-3.5 w-3.5 rounded-full"
                  >
                    {active === i && (
                      <motion.span
                        layoutId="hero-dot"
                        className="absolute inset-0 rounded-full bg-brand-600"
                        transition={SPRING}
                      />
                    )}
                    {active !== i && <span className="absolute inset-0 rounded-full bg-cream-300 hover:bg-brand-300 transition-colors" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        {!reducedMotion && (
          <motion.div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 text-brand-700 pointer-events-none"
            aria-hidden="true"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={22} />
          </motion.div>
        )}

        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-cream-50 to-transparent pointer-events-none" aria-hidden="true" />
      </section>
    </MotionConfig>
  );
}
