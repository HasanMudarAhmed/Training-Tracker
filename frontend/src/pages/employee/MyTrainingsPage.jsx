import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import UploadIcon from '@mui/icons-material/Upload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useSnackbar } from 'notistack'

import AppLayout from '../../components/common/AppLayout'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import FileUpload from '../../components/common/FileUpload'
import EmptyState from '../../components/common/EmptyState'
import { getAssignments, updateAssignment, uploadCertificate, getCertificateUrl } from '../../api/trainings.api'
import { formatDate, daysUntil } from '../../utils/dateUtils'
import { CATEGORY_LABELS } from '../../utils/statusUtils'

const TABS = [
  { label: 'All', status: undefined },
  { label: 'Pending', status: 'assigned' },
  { label: 'In Progress', status: 'in_progress' },
  { label: 'Completed', status: 'completed' },
  { label: 'Overdue', status: 'overdue' },
  { label: 'Expired', status: 'expired' },
]

function UpdateStatusDialog({ open, onClose, assignment }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const [status, setStatus] = useState(assignment?.status || '')
  const [completionDate, setCompletionDate] = useState(dayjs())

  const mutation = useMutation({
    mutationFn: () => updateAssignment(assignment.id, {
      status,
      completion_date: status === 'completed' ? completionDate.format('YYYY-MM-DD') : undefined,
    }),
    onSuccess: () => {
      enqueueSnackbar('Status updated.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['my-assignments'] })
      onClose()
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Update Training Status</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>{assignment?.training_detail?.title}</Typography>
        <TextField select label="Status" fullWidth value={status} onChange={(e) => setStatus(e.target.value)} sx={{ mb: 2 }}>
          <MenuItem value="assigned">Assigned</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>
        {status === 'completed' && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Completion Date"
              value={completionDate}
              onChange={setCompletionDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={() => mutation.mutate()} variant="contained" disabled={mutation.isPending}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function CertificateUploadDialog({ open, onClose, assignment }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const [file, setFile] = useState(null)

  const mutation = useMutation({
    mutationFn: () => uploadCertificate(assignment.id, file),
    onSuccess: () => {
      enqueueSnackbar('Certificate uploaded.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['my-assignments'] })
      onClose()
    },
    onError: (err) => enqueueSnackbar(err.response?.data?.certificate_file || 'Upload failed.', { variant: 'error' }),
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Certificate</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>{assignment?.training_detail?.title}</Typography>
        <FileUpload onFileSelect={setFile} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={() => mutation.mutate()} variant="contained" disabled={!file || mutation.isPending}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function MyTrainingsPage() {
  const [tab, setTab] = useState(0)
  const [statusDialog, setStatusDialog] = useState(null)
  const [uploadDialog, setUploadDialog] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const statusFilter = TABS[tab].status

  const { data, isLoading } = useQuery({
    queryKey: ['my-assignments', statusFilter, user?.id],
    queryFn: () => getAssignments({ status: statusFilter, employee: user?.id, page_size: 100 }).then((r) => r.data),
  })

  const assignments = data?.results || []

  return (
    <AppLayout title="My Trainings">
      <Typography variant="h5" fontWeight={700} mb={3}>My Trainings</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        {TABS.map((t, i) => <Tab key={i} label={t.label} />)}
      </Tabs>

      {isLoading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : assignments.length === 0 ? (
        <EmptyState message="No trainings in this category" />
      ) : (
        <Grid container spacing={2}>
          {assignments.map((a) => {
            const days = daysUntil(a.due_date)
            const isActionable = ['assigned', 'in_progress'].includes(a.status)
            return (
              <Grid item xs={12} sm={6} lg={4} key={a.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1, mr: 1 }}>
                        {a.training_detail?.title}
                      </Typography>
                      <StatusBadge status={a.status} />
                    </Box>
                    <Chip
                      label={CATEGORY_LABELS[a.training_detail?.category] || a.training_detail?.category}
                      size="small" sx={{ mb: 1.5 }}
                    />
                    <Box display="flex" flexDirection="column" gap={0.5} mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        <b>Due:</b> {formatDate(a.due_date)}
                        {isActionable && days !== null && (
                          <Chip
                            label={days >= 0 ? `${days}d left` : 'Overdue'}
                            size="small"
                            color={days <= 0 ? 'error' : days <= 7 ? 'warning' : 'default'}
                            sx={{ ml: 1, fontSize: 10 }}
                          />
                        )}
                      </Typography>
                      {a.completion_date && (
                        <Typography variant="body2" color="text.secondary">
                          <b>Completed:</b> {formatDate(a.completion_date)}
                        </Typography>
                      )}
                      {a.expiry_date && (
                        <Typography variant="body2" color="text.secondary">
                          <b>Expires:</b> {formatDate(a.expiry_date)}
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {isActionable && (
                        <Button size="small" variant="outlined" onClick={() => setStatusDialog(a)}>
                          Update Status
                        </Button>
                      )}
                      <Button
                        size="small" variant="outlined" startIcon={<UploadIcon />}
                        onClick={() => setUploadDialog(a)}
                      >
                        {a.certificate_file ? 'Replace Cert' : 'Upload Cert'}
                      </Button>
                      {a.certificate_file && (
                        <Button
                          size="small" variant="text" startIcon={<VisibilityIcon />}
                          href={getCertificateUrl(a.id)}
                          target="_blank"
                        >
                          View Cert
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {statusDialog && (
        <UpdateStatusDialog
          open={!!statusDialog} onClose={() => setStatusDialog(null)} assignment={statusDialog}
        />
      )}
      {uploadDialog && (
        <CertificateUploadDialog
          open={!!uploadDialog} onClose={() => setUploadDialog(null)} assignment={uploadDialog}
        />
      )}
    </AppLayout>
  )
}
