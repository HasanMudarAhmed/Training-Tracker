import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { requestPasswordReset } from '../../api/auth.api'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async ({ email }) => {
    setError('')
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default" p={2}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Reset Password</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your email and we'll send you a reset link.
          </Typography>

          {sent ? (
            <Alert severity="success">
              If that email exists, a reset link has been sent. Check your inbox.
            </Alert>
          ) : (
            <>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Box component="form" onSubmit={handleSubmit(onSubmit)} display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  {...register('email', { required: 'Email is required' })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </Box>
            </>
          )}

          <Box mt={3} textAlign="center">
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            >
              <ArrowBackIcon fontSize="small" /> Back to Login
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
