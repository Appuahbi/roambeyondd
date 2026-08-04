import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, MessageSquare, Map as MapIcon, Star, Mail, Bell, Tag, Package, BookOpen,
  ClipboardList, PhoneCall, Clock,
} from 'lucide-react';
import { adminApi } from '../../api/endpoints';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import Skeleton from '../../components/ui/Skeleton';
import { timeAgo } from '../../utils/format';

const ActivityTrendChart = lazy(() => import('../../components/admin/charts/ActivityTrendChart'));
const LeadSourceDonut = lazy(() => import('../../components/admin/charts/LeadSourceDonut'));
const TopDestinationsChart = lazy(() => import('../../components/admin/charts/TopDestinationsChart'));
const RatingDistributionChart = lazy(() => import('../../components/admin/charts/RatingDistributionChart'));

const LEAD_STATUS_COLORS = {
  New: 'bg-rose-50 text-rose-700',
  Contacted: 'bg-amber-50 text-amber-700',
  'Quotation Sent': 'bg-blue-50 text-blue-700',
  Negotiating: 'bg-violet-50 text-violet-700',
  Booked: 'bg-emerald-50 text-emerald-700',
  Closed: 'bg-ink-100 text-ink-700',
};

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    adminApi.dashboard()
      .then((r) => alive && setData(r?.data || r))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        subtitle="A quick read of what's happening across Roam Beyond right now."
      />

      {loading || !data ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total enquiries" value={data.summary.totalEnquiries} icon={FileText} accent="brand" />
            <StatCard label="Today" value={data.summary.todayEnquiries} icon={Bell} accent="cream" sub="Enquiries received today" />
            <StatCard label="High priority" value={data.summary.highPriority} icon={Star} accent="danger" />
            <StatCard label="Booked" value={data.summary.booked} icon={Tag} accent="success" />
            <StatCard label="New leads" value={data.summary.newLeads} icon={Mail} accent="brand" />
            <StatCard label="Contacted" value={data.summary.contacted} icon={MessageSquare} accent="cream" />
            <StatCard label="Quotation sent" value={data.summary.quotationSent} icon={MapIcon} accent="brand" />
            <StatCard label="Negotiating" value={data.summary.negotiating} icon={Users} accent="cream" />
          </div>

          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-500">Platform</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Active packages" value={data.summary.packages} icon={Package} accent="brand" />
              <StatCard label="Published blogs" value={data.summary.blogs} icon={BookOpen} accent="cream" />
              <StatCard label="Subscribers" value={data.summary.subscribers} icon={Mail} accent="brand" />
              <StatCard label="Users" value={data.summary.users} icon={Users} accent="cream" />
              <StatCard label="Trip requests" value={data.summary.tripRequests} icon={ClipboardList} accent="brand" />
              <StatCard label="Contact requests" value={data.summary.contactRequests} icon={PhoneCall} accent="cream" />
              <StatCard label="Reviews approved" value={data.summary.reviewsApproved} icon={Star} accent="success" />
              <StatCard label="Reviews pending" value={data.summary.reviewsPending} icon={Clock} accent="danger" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-900">Activity</h2>
                <p className="text-xs text-ink-500">Enquiries, trip &amp; contact requests per month</p>
              </div>
              <div className="mt-5">
                <Suspense fallback={<Skeleton className="h-72" />}>
                  <ActivityTrendChart data={data.activityTrend} />
                </Suspense>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold text-ink-900">Lead sources</h2>
              <p className="text-xs text-ink-500">Where enquiries come from.</p>
              <div className="mt-4">
                <Suspense fallback={<Skeleton className="h-52" />}>
                  <LeadSourceDonut data={data.leadSourceStats} />
                </Suspense>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold text-ink-900">Top destinations</h2>
              <p className="text-xs text-ink-500">Most-enquired destinations.</p>
              <div className="mt-4">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <TopDestinationsChart data={data.topDestinations} />
                </Suspense>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold text-ink-900">Review analytics</h2>
              <p className="text-xs text-ink-500">Approved reviews by star rating.</p>
              <div className="mt-4 flex gap-3">
                <MiniTile label="Approved" value={data.summary.reviewsApproved} tone="text-emerald-700" />
                <MiniTile label="Pending" value={data.summary.reviewsPending} tone="text-amber-700" />
              </div>
              <div className="mt-4">
                <Suspense fallback={<Skeleton className="h-56" />}>
                  <RatingDistributionChart data={data.ratingDistribution} />
                </Suspense>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink-900">Recent enquiries</h2>
                <Link to="/admin/enquiries" className="text-sm font-semibold text-brand-700">View all</Link>
              </div>
              <ul className="mt-4 divide-y divide-cream-100">
                {data.recentEnquiries?.length ? data.recentEnquiries.map((e) => (
                  <li key={e._id} className="py-3 flex items-center gap-3">
                    <div className="h-10 w-10 grid place-items-center rounded-full bg-brand-100 text-brand-800 font-bold shrink-0">
                      {e.customerName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-900 line-clamp-1">{e.customerName}</p>
                      <p className="text-xs text-ink-500 line-clamp-1">
                        {e.enquiryNumber} · {e.tourPackage?.title || 'Custom'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${LEAD_STATUS_COLORS[e.leadStatus] || 'bg-cream-100 text-ink-700'}`}>
                        {e.leadStatus}
                      </span>
                      <p className="text-[10px] text-ink-500 mt-1">{timeAgo(e.createdAt)}</p>
                    </div>
                  </li>
                )) : (
                  <li className="py-6 text-sm text-ink-500 text-center">No enquiries yet.</li>
                )}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="font-display text-lg font-semibold text-ink-900">Top categories</h2>
              <ul className="mt-4 space-y-2">
                {data.categoryStats?.length ? data.categoryStats.slice(0, 6).map((c) => (
                  <li key={c._id} className="flex items-center justify-between text-sm">
                    <span className="text-ink-700 truncate">{c._id || 'Uncategorised'}</span>
                    <span className="font-semibold text-brand-700">{c.total}</span>
                  </li>
                )) : (
                  <li className="text-sm text-ink-500">No data yet.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickLink to="/admin/packages" icon={Package} label="Manage packages" />
            <QuickLink to="/admin/blogs" icon={BookOpen} label="Manage blogs" />
            <QuickLink to="/admin/categories" icon={Tag} label="Manage categories" />
            <QuickLink to="/admin/users" icon={Users} label="Manage users" />
          </div>
        </>
      )}
    </div>
  );
}

function MiniTile({ label, value, tone }) {
  return (
    <div className="flex-1 rounded-xl bg-cream-50 px-4 py-3">
      <p className="font-display text-xl font-semibold text-ink-900">{value}</p>
      <p className={`text-xs font-semibold ${tone}`}>{label}</p>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="card p-4 flex items-center gap-3 hover:border-brand-200 transition group">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-brand-100 text-brand-800 group-hover:bg-brand-200">
        <Icon size={18} />
      </div>
      <p className="font-semibold text-ink-900">{label}</p>
    </Link>
  );
}
