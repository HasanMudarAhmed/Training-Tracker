import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PrivateRoute from './PrivateRoute'
import PageLoader from '../components/common/PageLoader'

// Auth pages
import LoginPage from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import EmployeesListPage from '../pages/admin/EmployeesListPage'
import EmployeeDetailPage from '../pages/admin/EmployeeDetailPage'
import TrainingsListPage from '../pages/admin/TrainingsListPage'
import TrainingDetailPage from '../pages/admin/TrainingDetailPage'
import AssignTrainingPage from '../pages/admin/AssignTrainingPage'
import ReportsPage from '../pages/admin/ReportsPage'
import SettingsPage from '../pages/admin/SettingsPage'

// Supervisor pages
import SupervisorDashboard from '../pages/supervisor/SupervisorDashboard'
import TeamListPage from '../pages/supervisor/TeamListPage'

// Employee pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'
import MyTrainingsPage from '../pages/employee/MyTrainingsPage'

// Shared pages
import NotificationsPage from '../pages/shared/NotificationsPage'
import CertificatePage from '../pages/shared/CertificatePage'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  const map = { admin: '/admin/dashboard', supervisor: '/supervisor/dashboard', employee: '/employee/dashboard' }
  return <Navigate to={map[user.role] || '/login'} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin routes */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<EmployeesListPage />} />
        <Route path="/admin/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/admin/trainings" element={<TrainingsListPage />} />
        <Route path="/admin/trainings/:id" element={<TrainingDetailPage />} />
        <Route path="/admin/assign" element={<AssignTrainingPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
      </Route>

      {/* Supervisor routes */}
      <Route element={<PrivateRoute allowedRoles={['supervisor']} />}>
        <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor/team" element={<TeamListPage />} />
        <Route path="/supervisor/team/:id" element={<EmployeeDetailPage />} />
        <Route path="/supervisor/assign" element={<AssignTrainingPage />} />
      </Route>

      {/* Employee routes */}
      <Route element={<PrivateRoute allowedRoles={['employee']} />}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/my-trainings" element={<MyTrainingsPage />} />
      </Route>

      {/* Shared routes (all authenticated) */}
      <Route element={<PrivateRoute />}>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/certificates/:assignmentId" element={<CertificatePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
