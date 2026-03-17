import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Skeleton from '@mui/material/Skeleton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AppLayout from '../../components/common/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import { getUser, getUserTrainings } from '../../api/employees.api'
import { getInitials } from '../../utils/formatters'
import { formatDate } from '../../utils/dateUtils'
import { ROLE_LABELS } from '../../utils/statusUtils'
import { useAuth } from '../../context/AuthContext'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id).then((r) => r.data),
  })

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['user-trainings', id],
    queryFn: () => getUserTrainings(id).then((r) => r.data),
  })

  const backPath = isAdmin ? '/admin/employees' : '/supervisor/team'

  return (
    <AppLayout title="Employee Profile">
      <Box mb={2}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(backPath)}>
          Back to Employees
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              {loadingUser ? (
                <>
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                </>
              ) : (
                <>
                  <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 28 }}>
                    {getInitials(user?.full_name)}
                  </Avatar>
                  <Typography variant="h5" fontWeight={700}>{user?.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
                  <Chip label={ROLE_LABELS[user?.role]} color="primary" size="small" sx={{ mb: 2 }} />
                  <Box textAlign="left" mt={2} display="flex" flexDirection="column" gap={1}>
                    {user?.job_title && (
                      <Typography variant="body2"><b>Title:</b> {user.job_title}</Typography>
                    )}
                    {user?.department_name && (
                      <Typography variant="body2"><b>Department:</b> {user.department_name}</Typography>
                    )}
                    {user?.supervisor_name && (
                      <Typography variant="body2"><b>Supervisor:</b> {user.supervisor_name}</Typography>
                    )}
                    {user?.phone && (
                      <Typography variant="body2"><b>Phone:</b> {user.phone}</Typography>
                    )}
                    <Typography variant="body2">
                      <b>Completion Rate:</b>{' '}
                      <span style={{ color: user?.completion_rate >= 80 ? '#27AE60' : '#E74C3C', fontWeight: 700 }}>
                        {user?.completion_rate}%
                      </span>
                    </Typography>
                    <Chip
                      label={user?.is_active ? 'Active' : 'Inactive'}
                      color={user?.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Button
              variant="contained"
              fullWidth
              startIcon={<AssignmentIcon />}
              sx={{ mt: 2 }}
              onClick={() => navigate(`/admin/assign?employee=${id}`)}
            >
              Assign Training
            </Button>
          )}
        </Grid>

        {/* Training assignments */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Training History ({assignments.length})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Training</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingAssignments ? (
                    [...Array(4)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                      </TableRow>
                    ))
                  ) : assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No trainings assigned yet
                      </TableCell>
                    </TableRow>
                  ) : assignments.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.training_detail?.title}</TableCell>
                      <TableCell>{a.training_detail?.category}</TableCell>
                      <TableCell>{formatDate(a.due_date)}</TableCell>
                      <TableCell>{a.completion_date ? formatDate(a.completion_date) : '—'}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  )
}
