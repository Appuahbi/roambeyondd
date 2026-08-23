import ProtectedRoute from './ProtectedRoute';

/*
|--------------------------------------------------------------------------
| AdminRoute
|--------------------------------------------------------------------------
| Guards a route to admins by default. Pass `roles={['admin', 'agent']}`
| to open it up to agents (e.g. lead-management pages).
|--------------------------------------------------------------------------
*/
export default function AdminRoute({ children, roles = ['admin'] }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}
