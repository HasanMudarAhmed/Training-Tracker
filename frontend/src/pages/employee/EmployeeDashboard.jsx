import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import AppLayout from '../../components/common/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import { getAssignments } from '../../api/trainings.api'
import { formatDate, daysUntil } from '../../utils/dateUtils'
import { useAuth } from '../../context/AuthContext'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: () => getAssignments({ page_size: 100 }).then((r) => r.data),
  })

  const assignments = data?.results || []
  const total = assignments.length
  const completed = assignments.filter((a) => a.status === 'completed').length
  const overdue = assignments.filter((a) => a.status === 'overdue')
  const upcoming = assignments
    .filter((a) => ['assigned', 'in_progress'].includes(a.status))
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <AppLayout title="My Dashboard">
      <Typography variant="h5" fontWeight={700} mb={1}>Hello, {user?.first_name}!</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Here's your training status overview.</Typography>

      {overdue.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          You have <strong>{overdue.length}</strong> overdue training{overdue.length > 1 ? 's' : ''}.{' '}
          <Button size="small" color="inherit" onClick={() => navigate('/employee/my-trainings')}>
            View Now
          </Button>
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        {/* Progress ring */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', py: 3 }}>
            <CardContent>
              <Box position="relative" display="inline-flex" mb={2}>
                <CircularProgress variant="determinate" value={completionRate} size={100} thickness={5} color={completionRate >= 80 ? 'success' : 'warning'} />
                <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="h5" fontWeight={700}>{completionRate}%</Typography>
                </Box>
              </Box>
              <Typography variant="h6" fontWeight={600}>Overall Progress</Typography>
              <Typography variant="body2" color="text.secondary">
                {completed} of {total} completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick stats */}
        <Grid item xs={12} sm={8}>
          <Grid container spacing={2} height="100%">
            {[
              { label: 'Assigned', value: assignments.filter((a) => a.status === 'assigned').length, color: '#3498DB' },
              { label: 'In Progress', value: assignments.filter((a) => a.status === 'in_progress').length, color: '#F39C12' },
              { label: 'Completed', value: completed, color: '#27AE60' },
              { label: 'Overdue', value: overdue.length, color: '#E74C3C' },
            ].map(({ label, value, color }) => (
              <Grid item xs={6} key={label}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent sx={{ py: '12px !important' }}>
                    <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Upcoming trainings */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>Upcoming Trainings</Typography>
            <Button size="small" onClick={() => navigate('/employee/my-trainings')}>View All</Button>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Training</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Days Left</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcoming.map((a) => {
                const days = daysUntil(a.due_date)
                return (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.training_detail?.title}</TableCell>
                    <TableCell>{formatDate(a.due_date)}</TableCell>
                    <TableCell sx={{ color: days <= 3 ? 'error.main' : days <= 7 ? 'warning.main' : 'text.primary', fontWeight: days <= 7 ? 700 : 400 }}>
                      {days >= 0 ? `${days} day${days !== 1 ? 's' : ''}` : 'Overdue'}
                    </TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>
                )
              })}
              {upcoming.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'success.main', fontWeight: 600 }}>
                    All caught up! No pending trainings.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  )
}
