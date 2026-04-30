import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

// Maps DB role → URL path prefix
const roleDashboard = {
  customer: '/customer',
  provider: '/caterer',
  admin: '/owner',
}

/**
 * Protects routes by role.
 * - No token → /login
 * - User not loaded yet → loading spinner
 * - Wrong role → redirect to own dashboard
 */
function ProtectedRoute({ role }) {
  const { user, token } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
      </div>
    )
  }

  // Map DB role to expected route role
  const userRouteRole = { provider: 'caterer', admin: 'owner', customer: 'customer' }[user.role] || user.role

  if (role && userRouteRole !== role) {
    return <Navigate to={roleDashboard[user.role] || '/'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
