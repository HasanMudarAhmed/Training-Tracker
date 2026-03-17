import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import AppLayout from '../../components/common/AppLayout'
import StatusBadge from '../../components/common/StatusBadge'
import { getTraining } from '../../api/trainings.api'
import { getAssignments } from '../../api/trainings.api'
import { formatDate } from '../../utils/dateUtils'
import { CATEGORY_LABELS } from '../../utils/statusUtils'

export default function TrainingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: training, isLoading } = useQuery({
    queryKey: ['training', id],
    queryFn: () => getTraining(id).then((r) => r.data),
  })

  const { data: assignmentsData } = useQuery({
    queryKey: ['assignments', { training: id }],
    queryFn: () => getAssignments({ training: id, page_size: 100 }).then((r) => r.data),
  })

  const assignments = assignmentsData?.results || []

  return (
    <AppLayout title="Training Detail">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/trainings')} sx={{ mb: 2 }}>
        Back to Trainings
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                </>
              ) : (
                <>
                  <Typography variant="h5" fontWeight={700} mb={1}>{training?.title}</Typography>
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip label={CATEGORY_LABELS[training?.category] || training?.category} size="small" color="primary" />
                    {training?.is_recurring && (
                      <Chip label={`Renews every ${training?.recurrence_months} months`} size="small" color="info" />
                    )}
                    <Chip label={training?.is_active ? 'Active' : 'Inactive'} size="small" color={training?.is_active ? 'success' : 'default'} />
                  </Box>
                  {training?.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>{training.description}</Typography>
                  )}
                  {training?.duration_hours && (
                    <Typography variant="body2"><b>Duration:</b> {training.duration_hours} hours</Typography>
                  )}
                  <Typography variant="body2"><b>Created by:</b> {training?.created_by_name || '—'}</Typography>
                  <Typography variant="body2"><b>Created:</b> {formatDate(training?.created_at)}</Typography>
                  <Box mt={3} display="flex" gap={2}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="primary">{training?.assignment_count}</Typography>
                      <Typography variant="caption" color="text.secondary">Total Assigned</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="success.main">{training?.completion_rate}%</Typography>
                      <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>All Assignments</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Assigned By</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.employee_detail?.full_name}</TableCell>
                      <TableCell>{a.assigned_by_name || '—'}</TableCell>
                      <TableCell>{formatDate(a.due_date)}</TableCell>
                      <TableCell>{a.completion_date ? formatDate(a.completion_date) : '—'}</TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                    </TableRow>
                  ))}
                  {assignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No assignments yet
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
