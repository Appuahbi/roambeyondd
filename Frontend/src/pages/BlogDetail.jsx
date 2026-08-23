import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronRight, Share2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogApi, packageApi } from '../api/endpoints';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import Skeleton from '../components/ui/Skeleton';
import PackageCard from '../components/sections/PackageCard';
import Seo from '../components/seo/Seo';
import { SITE_URL } from '../utils/branding';
import { formatDate } from '../utils/format';
import { useReveal } from '../hooks/useReveal';

export default function BlogDetail() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, shown] = useReveal();

  useEffect(() => {
    setLoading(true);
    setBlog(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
    blogApi.bySlug(slug)
      .then((r) => {
        const b = r?.data?.blog || r?.data;
        setBlog(b);
        if (b?.category) {
          return packageApi.list({ limit: 3, category: b.category });
        }
        return null;
      })
      .then((pkgs) => {
        if (pkgs) setRelated(pkgs?.data?.items || pkgs?.data?.data || pkgs?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="section py-8">
      <Skeleton className="aspect-[16/8] w-full rounded-3xl" />
      <Skeleton className="h-10 w-2/3 mt-6" />
      <Skeleton className="h-4 w-1/3 mt-3" />
      <Skeleton className="h-64 w-full mt-6 rounded-2xl" />
    </div>
  );

  if (!blog) return (
    <div className="section py-20 text-center">
      <h1 className="font-display text-3xl">{t('blogs.notFoundTitle')}</h1>
      <Link to="/blogs" className="btn-primary mt-5 inline-flex">{t('blogs.backToBlogs')}</Link>
    </div>
  );

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: blog.title, url: window.location.href }); } catch { /* share aborted */ }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('package.linkCopied'));
    }
  };

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
    image: blog.image,
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'RoamBeyond Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RoamBeyond',
      url: SITE_URL.replace(/\/$/, ''),
    },
    mainEntityOfPage: `${SITE_URL.replace(/\/$/, '')}/blogs/${blog.slug}`,
  };

  return (
    <article ref={ref} className={shown ? 'animate-fade-up' : 'opacity-0'}>
      <Seo title={blog.title} description={blog.excerpt} path={`/blogs/${blog.slug}`} ogType="article" ogImage={blog.image} jsonLd={blogJsonLd} />
      <header className="bg-cream-gradient pt-10 pb-6">
        <div className="section">
          <nav className="breadcrumb">
            <Link to="/">{t('nav.home')}</Link> <ChevronRight size={12} />
            <Link to="/blogs">{t('nav.blogs')}</Link> <ChevronRight size={12} />
            <span className="text-ink-700 line-clamp-1">{blog.title}</span>
          </nav>
          <div className="mt-4 max-w-3xl">
            <span className="chip-brand">{blog.category}</span>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-ink-900 leading-tight">{blog.title}</h1>
            <p className="mt-3 text-ink-500 text-sm inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1"><Calendar size={12} /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
              {blog.author?.name && <span>{t('blogs.by', { name: blog.author.name })}</span>}
              <button onClick={share} className="inline-flex items-center gap-1 hover:text-brand-700"><Share2 size={12} /> {t('blogs.share')}</button>
            </p>
            {blog.excerpt && <p className="mt-4 text-lg text-ink-700">{blog.excerpt}</p>}
          </div>
        </div>
        <div className="section mt-6">
          <div className="rounded-3xl overflow-hidden shadow-soft aspect-[16/8]">
            <ImageWithFallback item={blog} kind="blog" alt={blog.title} className="h-full w-full" />
          </div>
        </div>
      </header>

      <div className="section py-10 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="prose max-w-none text-ink-700 leading-relaxed whitespace-pre-line">
            {blog.content}
          </div>
          {blog.tags?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-cream-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-500 inline-flex items-center gap-1 mb-2">
                <Tag size={12} /> {t('blogs.tags')}
              </p>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
              </div>
            </div>
          )}
        </div>
        <aside className="lg:col-span-4 space-y-4">
          {related.length > 0 && (
            <div className="card p-5">
              <p className="font-semibold text-ink-900">{t('blogs.relatedTours')}</p>
              <div className="mt-3 space-y-3">
                {related.map((p) => <PackageCard key={p._id} pkg={p} compact />)}
              </div>
            </div>
          )}
          <div className="card p-5 bg-brand-50 border-brand-200">
            <p className="font-display text-lg font-semibold text-ink-900">{t('blogs.planYourTrip')}</p>
            <p className="mt-1 text-sm text-ink-500">{t('cta.subtitle')}</p>
            <Link to="/contact?type=custom" className="btn-primary mt-3 w-full">{t('blogs.startPlanning')}</Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
