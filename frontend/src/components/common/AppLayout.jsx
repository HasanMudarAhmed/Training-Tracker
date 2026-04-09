import { useState } from 'react'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'

export default function AppLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-60">
        <AppHeader onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
