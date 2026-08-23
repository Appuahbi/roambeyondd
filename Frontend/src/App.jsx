import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';

import Skeleton from './components/ui/Skeleton';

import { fetchMeThunk } from './store/authSlice';

const lazyPage = (loader) => {
  const Page = lazy(loader);
  return function LazyPage(props) {
    return (
      <Suspense
        fallback={
          <div className="grid gap-4 p-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        }
      >
        <Page {...props} />
      </Suspense>
    );
  };
};

const lazyAdmin = (loader) => {
  const Page = lazy(loader);
  return function AdminPage(props) {
    return (
      <Suspense fallback={<AdminLoader />}>
        <Page {...props} />
      </Suspense>
    );
  };
};

function AdminLoader() {
  return (
    <div className="grid gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}

const CinematicHome = lazyPage(() => import('./pages/CinematicHome'));
const PackagesList = lazyPage(() => import('./pages/PackagesList'));
const PackageDetail = lazyPage(() => import('./pages/PackageDetail'));
const Destinations = lazyPage(() => import('./pages/Destinations'));
const BlogsList = lazyPage(() => import('./pages/BlogsList'));
const BlogDetail = lazyPage(() => import('./pages/BlogDetail'));
const Contact = lazyPage(() => import('./pages/Contact'));
const SearchResults = lazyPage(() => import('./pages/SearchResults'));
const Login = lazyPage(() => import('./pages/Login'));
const Register = lazyPage(() => import('./pages/Register'));
const ForgotPassword = lazyPage(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyPage(() => import('./pages/ResetPassword'));
const Dashboard = lazyPage(() => import('./pages/Dashboard'));
const Wishlist = lazyPage(() => import('./pages/Wishlist'));
const Notifications = lazyPage(() => import('./pages/Notifications'));
const NotFound = lazyPage(() => import('./pages/NotFound'));

const AdminOverview = lazyAdmin(() => import('./pages/admin/AdminOverview'));
const AdminPackages = lazyAdmin(() => import('./pages/admin/AdminPackages'));
const AdminBlogs = lazyAdmin(() => import('./pages/admin/AdminBlogs'));
const AdminCategories = lazyAdmin(() => import('./pages/admin/AdminCategories'));
const AdminUsers = lazyAdmin(() => import('./pages/admin/AdminUsers'));
const AdminEnquiries = lazyAdmin(() => import('./pages/admin/AdminEnquiries'));
const AdminTripRequests = lazyAdmin(() => import('./pages/admin/AdminTripRequests'));
const AdminContact = lazyAdmin(() => import('./pages/admin/AdminContact'));
const AdminReviews = lazyAdmin(() => import('./pages/admin/AdminReviews'));
const AdminNewsletter = lazyAdmin(() => import('./pages/admin/AdminNewsletter'));
const AdminNotifications = lazyAdmin(() => import('./pages/admin/AdminNotifications'));
const AdminSiteContent = lazyAdmin(() => import('./pages/admin/AdminSiteContent'));

export default function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((s) => s.auth.initialized);

  useEffect(() => {
    // Restore the session (httpOnly cookie) on first load. For anonymous
    // users this resolves quickly to a 401 and leaves them signed out.
    if (!initialized) {
      dispatch(fetchMeThunk());
    }
  }, [initialized, dispatch]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CinematicHome />} />
        <Route path="cinematic" element={<CinematicHome />} />
        <Route path="packages" element={<PackagesList />} />
        <Route path="packages/:slug" element={<PackageDetail />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="blogs" element={<BlogsList />} />
        <Route path="blogs/:slug" element={<BlogDetail />} />
        <Route path="contact" element={<Contact />} />
        <Route path="search" element={<SearchResults />} />

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />

        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin panel — uses its own layout (no public navbar/footer) */}
      <Route
        path="/admin"
        element={
          <AdminRoute roles={['admin', 'agent']}>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route
          index
          element={
            <RoleRedirect
              roles={{ agent: '/admin/enquiries' }}
              fallback={<AdminOverview />}
            />
          }
        />
        <Route path="packages" element={<AdminRoute roles={['admin']}><AdminPackages /></AdminRoute>} />
        <Route path="blogs" element={<AdminRoute roles={['admin']}><AdminBlogs /></AdminRoute>} />
        <Route path="categories" element={<AdminRoute roles={['admin']}><AdminCategories /></AdminRoute>} />
        <Route path="users" element={<AdminRoute roles={['admin']}><AdminUsers /></AdminRoute>} />
        <Route path="enquiries" element={<AdminRoute roles={['admin', 'agent']}><AdminEnquiries /></AdminRoute>} />
        <Route path="trip-requests" element={<AdminRoute roles={['admin']}><AdminTripRequests /></AdminRoute>} />
        <Route path="contact" element={<AdminRoute roles={['admin', 'agent']}><AdminContact /></AdminRoute>} />
        <Route path="reviews" element={<AdminRoute roles={['admin']}><AdminReviews /></AdminRoute>} />
        <Route path="newsletter" element={<AdminRoute roles={['admin']}><AdminNewsletter /></AdminRoute>} />
        <Route path="notifications" element={<AdminRoute roles={['admin']}><AdminNotifications /></AdminRoute>} />
        <Route path="site-content" element={<AdminRoute roles={['admin']}><AdminSiteContent /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

function RoleRedirect({ roles, fallback }) {
  const user = useSelector((s) => s.auth.user);
  const target = roles[user?.role];
  return target ? <Navigate to={target} replace /> : fallback;
}
