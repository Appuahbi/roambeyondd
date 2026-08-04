import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const { user, initialized } = useSelector((s) => s.auth);

  if (!initialized) {
    return (
      <div className="grid place-items-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
