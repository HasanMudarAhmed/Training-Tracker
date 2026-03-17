import { useQuery } from '@tanstack/react-query'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import DownloadIcon from '@mui/icons-material/Download'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useSnackbar } from 'notistack'

import AppLayout from '../../components/common/AppLayout'
import KpiCard from '../../components/dashboard/KpiCard'
import { getSummary, getDepartmentReport, getEmployeeReport, exportReport } from '../../api/reports.api'
import { downloadBlob } from '../../utils/formatters'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import SchoolIcon from '@mui/icons-material/School'
import ErrorIcon from '@mui/icons-material/Error'

export default function ReportsPage() {
  const { enqueueSnackbar } = useSnackbar()

  const { data: summary } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => getSummary().then((r) => r.data),
  })

  const { data: deptData = [] } = useQuery({
    queryKey: ['reports', 'by-department'],
    queryFn: () => getDepartmentReport().then((r) => r.data),
  })

  const { data: empData = [] } = useQuery({
    queryKey: ['reports', 'by-employee'],
    queryFn: () => getEmployeeReport().then((r) => r.data),
  })

  const handleExport = async () => {
    try {
      const res = await exportReport()
      downloadBlob(res.data, 'training_report.csv')
      enqueueSnackbar('Report downloaded.', { variant: 'success' })
    } catch {
      enqueueSnackbar('Export failed.', { variant: 'error' })
    }
  }

  return (
    <AppLayout title="Reports & Analytics">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Reports & Analytics</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>
          Export CSV
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} md={3}>
          <KpiCard title="Total Assignments" value={summary?.total_assignments ?? '—'} icon={<SchoolIcon />} color="primary" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Completed" value={summary?.completed ?? '—'} icon={<CheckCircleIcon />} color="success" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Overdue" value={summary?.overdue ?? '—'} icon={<WarningIcon />} color="error" />
        </Grid>
        <Grid item xs={6} md={3}>
          <KpiCard title="Completion Rate" value={`${summary?.completion_rate ?? 0}%`} icon={<ErrorIcon />} color="info" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Department bar chart */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Completion by Department</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="completion_rate" name="Rate %" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department table */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Department Summary</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Employees</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell>Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deptData.map((d) => (
                    <TableRow key={d.department} hover>
                      <TableCell>{d.department}</TableCell>
                      <TableCell align="center">{d.employee_count}</TableCell>
                      <TableCell align="center" sx={{ color: d.overdue > 0 ? 'error.main' : 'text.primary', fontWeight: d.overdue > 0 ? 700 : 400 }}>
                        {d.overdue}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={d.completion_rate}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            color={d.completion_rate >= 80 ? 'success' : d.completion_rate >= 50 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" fontWeight={600}>{d.completion_rate}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Employee table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Employee Progress</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">Completed</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell>Completion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empData.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>{e.name}</TableCell>
                      <TableCell>{e.department || '—'}</TableCell>
                      <TableCell align="center">{e.total_assignments}</TableCell>
                      <TableCell align="center">{e.completed}</TableCell>
                      <TableCell align="center" sx={{ color: e.overdue > 0 ? 'error.main' : 'text.primary', fontWeight: e.overdue > 0 ? 700 : 400 }}>
                        {e.overdue}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate" value={e.completion_rate}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            color={e.completion_rate >= 80 ? 'success' : 'warning'}
                          />
                          <Typography variant="caption" fontWeight={600}>{e.completion_rate}%</Typography>
                        </Box>
                      </TableCell>
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
