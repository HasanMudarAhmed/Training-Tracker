import { useState } from 'react'
import Box from '@mui/material/Box'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'

const DRAWER_WIDTH = 240

export default function AppLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box display="flex" minHeight="100vh" bgcolor="background.default">
      {/* Desktop sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <AppSidebar variant="permanent" open />
      </Box>

      {/* Mobile sidebar */}
      <AppSidebar
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <AppHeader onMenuClick={() => setMobileOpen(true)} title={title} />
        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
