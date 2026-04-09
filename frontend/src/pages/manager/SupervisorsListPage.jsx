import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AssignmentIcon from '@mui/icons-material/Assignment'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSnackbar } from 'notistack'

import AppLayout from '../../components/common/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import AddSupervisorDialog from './AddSupervisorDialog'
import EditSupervisorDialog from './EditSupervisorDialog'
import { getUsers, deleteUser } from '../../api/employees.api'
import { getInitials } from '../../utils/formatters'

export default function SupervisorsListPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      enqueueSnackbar('Supervisor deactivated.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['users'] })
      setDeleteTarget(null)
    },
    onError: () => enqueueSnackbar('Failed to deactivate supervisor.', { variant: 'error' }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['users', { role: 'supervisor', search }],
    queryFn: () => getUsers({ role: 'supervisor', search: search || undefined }).then((r) => r.data),
  })

  const supervisors = data?.results || []

  return (
    <AppLayout title="Supervisors">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Supervisors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Supervisor
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          placeholder="Search supervisors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        />
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Supervisor</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell align="center">Active Trainings</TableCell>
              <TableCell align="center">Completion %</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : supervisors.length === 0 ? (
              <TableRow><TableCell colSpan={5}><EmptyState message="No supervisors found" /></TableCell></TableRow>
            ) : supervisors.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: 'primary.main' }}>
                      {getInitials(s.full_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{s.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{s.job_title || '—'}</TableCell>
                <TableCell align="center">{s.active_training_count}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: s.completion_rate >= 80 ? 'success.main' : 'warning.main' }}>
                  {s.completion_rate}%
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Team">
                    <IconButton size="small" onClick={() => navigate(`/manager/team?supervisor=${s.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Assign Training">
                    <IconButton size="small" onClick={() => navigate(`/manager/assign`)}>
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => setEditTarget(s)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Deactivate">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(s)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AddSupervisorDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <EditSupervisorDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        supervisor={editTarget}
      />

      {/* Deactivate confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Deactivate Supervisor</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate <strong>{deleteTarget?.full_name}</strong>?
            They will no longer be able to log in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(deleteTarget.id)}
          >
            {deleteMutation.isPending ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}
