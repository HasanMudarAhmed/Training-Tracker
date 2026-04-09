import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Eye, EyeOff, GraduationHat01 } from '@untitled-ui/icons-react'
import { login as apiLogin } from '../../api/auth.api'
import { useAuth } from '../../context/AuthContext'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const DASHBOARD_MAP = {
  admin:      '/admin/dashboard',
  manager:    '/manager/dashboard',
  supervisor: '/supervisor/dashboard',
  employee:   '/employee/dashboard',
}

const DEV_ACCOUNTS = [
  { label: 'Admin',      email: 'admin@company.com',      password: 'Admin@123',      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  { label: 'Manager',    email: 'manager@company.com',     password: 'Manager@123',    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { label: 'Supervisor', email: 'supervisor@company.com',  password: 'Supervisor@123', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Employee',   email: 'employee@company.com',    password: 'Employee@123',   color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [quickLoading, setQuickLoading] = useState(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

  const quickLogin = async (account) => {
    setError('')
    setQuickLoading(account.label)
    try {
      const { data } = await apiLogin({ email: account.email, password: account.password })
      login(data.user)
      navigate(DASHBOARD_MAP[data.user.role] || '/')
    } catch {
      setError(`Quick login failed for ${account.label}. Check the account exists.`)
    } finally {
      setQuickLoading(null)
    }
  }

  const onSubmit = async (values) => {
    setError('')
    try {
      const { data } = await apiLogin(values)
      login(data.user)
      navigate(DASHBOARD_MAP[data.user.role] || '/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <GraduationHat01 size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
              <p className="text-sm text-gray-500 mt-1">Training Tracker — Enterprise LMS</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="input-label">Email address</label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className={`input ${errors.email ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                  {...register('email')}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="input-label mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full btn-lg mt-2"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          {/* Quick login — dev only */}
          {import.meta.env.DEV && (
            <div className="border-t border-gray-100 px-8 py-5 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Quick Login — Dev Only</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEV_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.label}
                    disabled={!!quickLoading}
                    onClick={() => quickLogin(acc)}
                    className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${acc.color}`}
                  >
                    {quickLoading === acc.label ? '…' : acc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
