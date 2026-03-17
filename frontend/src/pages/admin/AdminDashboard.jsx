import { useQuery } from '@tanstack/react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Skeleton from '@mui/material/Skeleton'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

import AppLayout from '../../components/common/AppLayout'
import KpiCard from '../../components/dashboard/KpiCard'
import StatusBadge from '../../components/common/StatusBadge'
import { getSummary, getDepartmentReport, getOverdueReport } from '../../api/reports.api'
import { formatDate, daysUntil } from '../../utils/dateUtils'

const PIE_COLORS = { completed: '#27AE60', assigned: '#3498DB', in_progress: '#F39C12', overdue: '#E74C3C', expired: '#95A5A6' }

export default function AdminDashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => getSummary().then((r) => r.data),
  })

  const { data: deptData = [], isLoading: loadingDept } = useQuery({
    queryKey: ['reports', 'by-department'],
    queryFn: () => getDepartmentReport().then((r) => r.data),
  })

  const { data: overdueData = [], isLoading: loadingOverdue } = useQuery({
    queryKey: ['reports', 'overdue'],
    queryFn: () => getOverdueReport().then((r) => r.data),
  })

  const pieData = summary ? [
    { name: 'Completed', value: summary.completed, key: 'completed' },
    { name: 'Assigned', value: summary.assigned, key: 'assigned' },
    { name: 'In Progress', value: summary.in_progress, key: 'in_progress' },
    { name: 'Overdue', value: summary.overdue, key: 'overdue' },
    { name: 'Expired', value: summary.expired, key: 'expired' },
  ].filter((d) => d.value > 0) : []

  return (
    <AppLayout title="Admin Dashboard">
      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Assignments"
            value={summary?.total_assignments ?? '—'}
            icon={<SchoolIcon />}
            color="primary"
            loading={loadingSummary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Completion Rate"
            value={`${summary?.completion_rate ?? 0}%`}
            icon={<CheckCircleIcon />}
            color="success"
            loading={loadingSummary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Overdue"
            value={summary?.overdue ?? '—'}
            subtitle="Require immediate action"
            icon={<WarningIcon />}
            color="error"
            loading={loadingSummary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Expiring Soon"
            value={summary?.expiring_soon ?? '—'}
            subtitle="Within 30 days"
            icon={<PeopleIcon />}
            color="warning"
            loading={loadingSummary}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Bar chart: Completion by Department */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Completion by Department
              </Typography>
              {loadingDept ? (
                <Skeleton variant="rectangular" height={280} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="completed" name="Completed" fill="#27AE60" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="overdue" name="Overdue" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pie chart: Status distribution */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Status Distribution
              </Typography>
              {loadingSummary ? (
                <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                      {pieData.map((entry) => (
                        <Cell key={entry.key} fill={PIE_COLORS[entry.key] || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Overdue table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Overdue Trainings
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Training</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingOverdue ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}><Skeleton /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : overdueData.slice(0, 10).map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.employee}</TableCell>
                      <TableCell>{row.department || '—'}</TableCell>
                      <TableCell>{row.training}</TableCell>
                      <TableCell>{formatDate(row.due_date)}</TableCell>
                      <TableCell sx={{ color: 'error.main', fontWeight: 600 }}>
                        {row.days_overdue} days
                      </TableCell>
                      <TableCell><StatusBadge status="overdue" /></TableCell>
                    </TableRow>
                  ))}
                  {!loadingOverdue && overdueData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No overdue trainings
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
