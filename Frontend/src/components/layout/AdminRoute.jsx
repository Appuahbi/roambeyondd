import ProtectedRoute from './ProtectedRoute';

/*
|--------------------------------------------------------------------------
| AdminRoute
|--------------------------------------------------------------------------
| Thin alias around ProtectedRoute with adminOnly=true. Reads better
| at the call site (App.jsx) than `adminOnly` prop.
|--------------------------------------------------------------------------
*/
export default function AdminRoute({ children }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
}
