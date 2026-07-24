import { useSelector } from 'react-redux'

export function useAuth() {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth)
  return { user, token, isAuthenticated, isAdmin: user?.role === 'admin' }
}
