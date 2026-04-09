import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageLoader from '../components/common/PageLoader'

export default function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    const dashboards = {
      admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      supervisor: '/supervisor/dashboard',
      employee: '/employee/dashboard',
    }
    return <Navigate to={dashboards[user.role] || '/login'} replace />
  }

  return <Outlet />
}
