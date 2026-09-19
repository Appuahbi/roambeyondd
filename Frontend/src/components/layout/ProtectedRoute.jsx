import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, adminOnly = false, roles }) {
  const { user, initialized } = useSelector((s) => s.auth);

  if (!initialized) {
    return (
      <div className="grid place-items-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
