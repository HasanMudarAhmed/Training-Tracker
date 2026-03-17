import { useNavigate } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useUnreadCount } from '../../hooks/useNotifications'

export default function AppHeader({ onMenuClick, title }) {
  const navigate = useNavigate()
  const { data: unreadCount = 0 } = useUnreadCount()

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600} color="text.primary" flex={1}>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton color="inherit" onClick={() => navigate('/notifications')}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon sx={{ color: 'text.secondary' }} />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
