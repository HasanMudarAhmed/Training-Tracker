import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutAlt01, Users01, BookOpen01, ClipboardAttachment, BarChart02,
  Settings01, Bell01, LogOut01, UserCheck01, Building02,
  ChevronRight, GraduationHat01, List, UserEdit
} from '@untitled-ui/icons-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'
import { ROLE_LABELS } from '../../utils/statusUtils'

const adminLinks = [
  { label: 'Dashboard',       path: '/admin/dashboard',    icon: LayoutAlt01 },
  { label: 'Departments',     path: '/admin/departments',  icon: Building02 },
  { label: 'Employees',       path: '/admin/employees',    icon: Users01 },
  { label: 'Trainings',       path: '/admin/trainings',    icon: BookOpen01 },
  { label: 'Assign Training', path: '/admin/assign',       icon: ClipboardAttachment },
  { label: 'Reports',         path: '/admin/reports',      icon: BarChart02 },
  { label: 'Settings',        path: '/admin/settings',     icon: Settings01 },
]

const managerLinks = [
  { label: 'Dashboard',       path: '/manager/dashboard',   icon: LayoutAlt01 },
  { label: 'Supervisors',     path: '/manager/supervisors', icon: UserEdit },
  { label: 'My Department',   path: '/manager/team',        icon: Users01 },
  { label: 'Assign Training', path: '/manager/assign',      icon: ClipboardAttachment },
]

const supervisorLinks = [
  { label: 'Dashboard',       path: '/supervisor/dashboard',      icon: LayoutAlt01 },
  { label: 'My Team',         path: '/supervisor/team',           icon: UserCheck01 },
  { label: 'My Trainings',    path: '/supervisor/my-trainings',   icon: List },
  { label: 'Assign Training', path: '/supervisor/assign',         icon: ClipboardAttachment },
]

const employeeLinks = [
  { label: 'Dashboard',    path: '/employee/dashboard',    icon: LayoutAlt01 },
  { label: 'My Trainings', path: '/employee/my-trainings', icon: List },
]

const sharedLinks = [
  { label: 'Notifications', path: '/notifications', icon: Bell01 },
]

const ROLE_LINKS = { admin: adminLinks, manager: managerLinks, supervisor: supervisorLinks, employee: employeeLinks }

const roleColors = {
  admin:      'bg-red-100 text-red-700',
  manager:    'bg-purple-100 text-purple-700',
  supervisor: 'bg-blue-100 text-blue-700',
  employee:   'bg-green-100 text-green-700',
}

function NavItem({ label, path, icon: Icon }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon size={18} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function AppSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = ROLE_LINKS[user?.role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const content = (
    <div className="flex flex-col h-full bg-[#0F1728]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
          <GraduationHat01 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Training Tracker</p>
          <p className="text-white/50 text-xs">Enterprise LMS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map((link) => <NavItem key={link.path} {...link} />)}
        <div className="border-t border-white/10 my-3" />
        {sharedLinks.map((link) => <NavItem key={link.path} {...link} />)}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-600/30 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitials(user?.full_name || '')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[user?.role] || 'bg-gray-100 text-gray-700'}`}>
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/50 hover:text-white transition-colors p-1 rounded"
            title="Logout"
          >
            <LogOut01 size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 z-30">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <aside className="relative flex flex-col w-60 z-50">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
