import { NavLink, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'

import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import GroupIcon from '@mui/icons-material/Group'
import ListAltIcon from '@mui/icons-material/ListAlt'
import LogoutIcon from '@mui/icons-material/Logout'

import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'

const DRAWER_WIDTH = 240

const adminLinks = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'Employees', path: '/admin/employees', icon: <PeopleIcon /> },
  { label: 'Trainings', path: '/admin/trainings', icon: <SchoolIcon /> },
  { label: 'Assign Training', path: '/admin/assign', icon: <AssignmentIcon /> },
  { label: 'Reports', path: '/admin/reports', icon: <BarChartIcon /> },
  { label: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
]

const supervisorLinks = [
  { label: 'Dashboard', path: '/supervisor/dashboard', icon: <DashboardIcon /> },
  { label: 'My Team', path: '/supervisor/team', icon: <GroupIcon /> },
  { label: 'Assign Training', path: '/supervisor/assign', icon: <AssignmentIcon /> },
]

const employeeLinks = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: <DashboardIcon /> },
  { label: 'My Trainings', path: '/employee/my-trainings', icon: <ListAltIcon /> },
]

const sharedLinks = [
  { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
]

const ROLE_LINKS = { admin: adminLinks, supervisor: supervisorLinks, employee: employeeLinks }

function SidebarLink({ label, path, icon }) {
  return (
    <Tooltip title={label} placement="right">
      <ListItemButton
        component={NavLink}
        to={path}
        sx={{
          color: 'rgba(255,255,255,0.75)',
          '&.active': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)' },
          '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
        }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
      </ListItemButton>
    </Tooltip>
  )
}

export default function AppSidebar({ open, onClose, variant = 'permanent' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = ROLE_LINKS[user?.role] || []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const content = (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Logo */}
      <Box px={3} py={2.5} display="flex" alignItems="center" gap={1.5}>
        <SchoolIcon sx={{ color: '#fff', fontSize: 28 }} />
        <Typography variant="h6" color="#fff" fontWeight={700} fontSize={16}>
          Training Tracker
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1 }}>
        {links.map((link) => <SidebarLink key={link.path} {...link} />)}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', my: 1 }} />
        {sharedLinks.map((link) => <SidebarLink key={link.path} {...link} />)}
      </List>

      {/* User info + logout */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <Box px={2} py={2} display="flex" alignItems="center" gap={1.5}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36, fontSize: 13 }}>
          {getInitials(user?.full_name || '')}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography color="#fff" fontSize={13} fontWeight={600} noWrap>
            {user?.full_name}
          </Typography>
          <Typography color="rgba(255,255,255,0.6)" fontSize={11} noWrap>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Typography>
        </Box>
        <Tooltip title="Logout">
          <LogoutIcon
            sx={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', '&:hover': { color: '#fff' } }}
            onClick={handleLogout}
          />
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1E3A5F',
        },
      }}
    >
      {content}
    </Drawer>
  )
}
