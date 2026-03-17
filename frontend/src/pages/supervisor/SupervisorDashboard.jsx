import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import AssignmentIcon from '@mui/icons-material/Assignment'

import AppLayout from '../../components/common/AppLayout'
import KpiCard from '../../components/dashboard/KpiCard'
import StatusBadge from '../../components/common/StatusBadge'
import { getSummary, getEmployeeReport } from '../../api/reports.api'
import { getAssignments } from '../../api/trainings.api'
import { formatDate } from '../../utils/dateUtils'
import { useAuth } from '../../context/AuthContext'

export default function SupervisorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => getSummary().then((r) => r.data),
  })

  const { data: empReport = [] } = useQuery({
    queryKey: ['reports', 'by-employee'],
    queryFn: () => getEmployeeReport().then((r) => r.data),
  })

  const { data: overdueData } = useQuery({
    queryKey: ['assignments', { status: 'overdue' }],
    queryFn: () => getAssignments({ status: 'overdue', page_size: 10 }).then((r) => r.data),
  })

  const overdue = overdueData?.results || []

  return (
    <AppLayout title="Supervisor Dashboard">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Welcome, {user?.first_name}</Typography>
          <Typography variant="body2" color="text.secondary">Your team's training overview</Typography>
        </Box>
        <Button variant="contained" startIcon={<AssignmentIcon />} onClick={() => navigate('/supervisor/assign')}>
          Assign Training
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={3}>
          <KpiCard title="Team Assignments" value={summary?.total_assignments ?? '—'} icon={<AssignmentIcon />} color="primary" loading={loadingSummary} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Completed" value={summary?.completed ?? '—'} icon={<CheckCircleIcon />} color="success" loading={loadingSummary} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Overdue" value={summary?.overdue ?? '—'} icon={<WarningIcon />} color="error" loading={loadingSummary} />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Team Members" value={empReport.length} icon={<PeopleIcon />} color="info" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Team progress */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Team Progress</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell>Completion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empReport.map((e) => (
                    <TableRow
                      key={e.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/supervisor/team/${e.id}`)}
                    >
                      <TableCell>{e.name}</TableCell>
                      <TableCell align="center">{e.total_assignments}</TableCell>
                      <TableCell align="center" sx={{ color: e.overdue > 0 ? 'error.main' : 'text.primary', fontWeight: e.overdue > 0 ? 700 : 400 }}>
                        {e.overdue}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate" value={e.completion_rate}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            color={e.completion_rate >= 80 ? 'success' : e.completion_rate >= 50 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" fontWeight={600}>{e.completion_rate}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {empReport.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No team members found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Overdue */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2} color="error.main">
                Overdue Trainings
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Training</TableCell>
                    <TableCell>Due</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdue.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.employee_detail?.full_name}</TableCell>
                      <TableCell>{a.training_detail?.title}</TableCell>
                      <TableCell sx={{ color: 'error.main' }}>{formatDate(a.due_date)}</TableCell>
                    </TableRow>
                  ))}
                  {overdue.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'success.main' }}>
                        No overdue trainings!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  )
}
