import { useNavigate } from 'react-router-dom'
import { Menu01, Bell01 } from '@untitled-ui/icons-react'
import { useUnreadCount } from '../../hooks/useNotifications'

export default function AppHeader({ onMenuClick, title }) {
  const navigate = useNavigate()
  const { data: unreadCount = 0 } = useUnreadCount()

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between gap-4">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={onMenuClick}
        >
          <Menu01 size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right: notifications */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Bell01 size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
