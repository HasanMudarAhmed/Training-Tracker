import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as apiLogout } from '../api/auth.api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = (userData) => setUser(userData)

  const logout = async () => {
    try { await apiLogout() } catch {}
    setUser(null)
  }

  const refreshUser = () => loadUser()

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isSupervisor: user?.role === 'supervisor',
    isEmployee: user?.role === 'employee',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
