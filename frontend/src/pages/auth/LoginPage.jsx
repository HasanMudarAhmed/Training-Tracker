import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SchoolIcon from '@mui/icons-material/School'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { login as apiLogin } from '../../api/auth.api'
import { useAuth } from '../../context/AuthContext'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const DASHBOARD_MAP = {
  admin: '/admin/dashboard',
  supervisor: '/supervisor/dashboard',
  employee: '/employee/dashboard',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

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
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="background.default"
      p={2}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box display="flex" alignItems="center" gap={1.5} mb={4} justifyContent="center">
            <Box
              sx={{
                bgcolor: 'primary.main', borderRadius: 2, p: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1}>
                Training Tracker
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Enterprise Learning Management
              </Typography>
            </Box>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>Sign in</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your credentials to access your account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="right">
              <Typography
                component={Link}
                to="/forgot-password"
                variant="body2"
                color="primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 1 }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
