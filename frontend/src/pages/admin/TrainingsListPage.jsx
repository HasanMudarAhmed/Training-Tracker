import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useSnackbar } from 'notistack'
import { useForm, Controller } from 'react-hook-form'


import AppLayout from '../../components/common/AppLayout'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import { getTrainings, createTraining, updateTraining, deleteTraining } from '../../api/trainings.api'
import { CATEGORY_LABELS, PREDEFINED_TRAININGS } from '../../utils/statusUtils'

function TrainingFormDialog({ open, onClose, training }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const isEdit = !!training
  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm({ defaultValues: training || {} })

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateTraining(training.id, data) : createTraining(data),
    onSuccess: () => {
      enqueueSnackbar(isEdit ? 'Training updated.' : 'Training created.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['trainings'] })
      onClose()
    },
    onError: () => enqueueSnackbar('Failed to save training.', { variant: 'error' }),
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Training' : 'New Training'}</DialogTitle>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Autocomplete
                    freeSolo
                    options={PREDEFINED_TRAININGS}
                    value={value || ''}
                    onInputChange={(_, newValue) => onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Title"
                        required
                        error={!!error}
                        helperText={error ? 'Title is required' : ''}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={3} {...register('description')} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Category" fullWidth defaultValue="other" {...register('category')}>
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Duration (hours)" type="number" fullWidth {...register('duration_hours')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default function TrainingsListPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [page, setPage] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['trainings', { search, category: catFilter, page: page + 1 }],
    queryFn: () => getTrainings({ search, category: catFilter || undefined, page: page + 1 }).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTraining(deleteTarget.id),
    onSuccess: () => {
      enqueueSnackbar('Training deleted.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['trainings'] })
      setDeleteTarget(null)
    },
    onError: (err) => enqueueSnackbar(err.response?.data?.detail || 'Cannot delete.', { variant: 'error' }),
  })

  const trainings = data?.results || []

  return (
    <AppLayout title="Training Catalog">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Training Catalog</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true) }}>
          New Training
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
            <TextField select label="Category" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} sx={{ minWidth: 160 }}>
              <MenuItem value="">All Categories</MenuItem>
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Recurring</TableCell>
              <TableCell align="center">Assignments</TableCell>
              <TableCell align="center">Completion %</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : trainings.length === 0 ? (
              <TableRow><TableCell colSpan={6}><EmptyState message="No trainings found" /></TableCell></TableRow>
            ) : trainings.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{t.title}</Typography>
                  {t.description && <Typography variant="caption" color="text.secondary">{t.description.slice(0, 60)}{t.description.length > 60 ? '…' : ''}</Typography>}
                </TableCell>
                <TableCell><Chip label={CATEGORY_LABELS[t.category] || t.category} size="small" /></TableCell>
                <TableCell align="center">
                  {t.is_recurring ? <Chip label={`Every ${t.recurrence_months}mo`} size="small" color="info" /> : '—'}
                </TableCell>
                <TableCell align="center">{t.assignment_count}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: t.completion_rate >= 80 ? 'success.main' : 'warning.main' }}>
                  {t.completion_rate}%
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => navigate(`/admin/trainings/${t.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditing(t); setFormOpen(true) }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(t)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div" count={data?.count || 0} page={page} rowsPerPage={20}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[20]}
        />
      </Card>

      <TrainingFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        training={editing}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Training"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
