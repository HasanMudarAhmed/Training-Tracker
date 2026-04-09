import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ApartmentIcon from '@mui/icons-material/Apartment'
import { useSnackbar } from 'notistack'

import AppLayout from '../../components/common/AppLayout'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/employees.api'

function DepartmentFormDialog({ open, onClose, department }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const isEdit = !!department
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    defaultValues: department || {},
  })

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateDepartment(department.id, data) : createDepartment(data),
    onSuccess: () => {
      enqueueSnackbar(isEdit ? 'Department updated.' : 'Department created.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['departments'] })
      reset()
      onClose()
    },
    onError: (err) => {
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to save department.'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Department' : 'New Department'}</DialogTitle>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Department Name" fullWidth required
                {...register('name', { required: true })}
                error={!!errors.name}
                helperText={errors.name ? 'Name is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description" fullWidth multiline rows={3}
                {...register('description')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { reset(); onClose() }} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default function DepartmentsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then((r) => r.data.results || r.data),
  })

  const departments = data || []

  const deleteMutation = useMutation({
    mutationFn: () => deleteDepartment(deleteTarget.id),
    onSuccess: () => {
      enqueueSnackbar('Department deleted.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['departments'] })
      setDeleteTarget(null)
    },
    onError: (err) => enqueueSnackbar(err.response?.data?.detail || 'Cannot delete department.', { variant: 'error' }),
  })

  return (
    <AppLayout title="Departments">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <ApartmentIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>Departments</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true) }}>
          New Department
        </Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Department</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Managers</TableCell>
              <TableCell align="center">Members</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : departments.length === 0 ? (
              <TableRow><TableCell colSpan={5}><EmptyState message="No departments yet. Create one to get started." /></TableCell></TableRow>
            ) : departments.map((dept) => (
              <TableRow key={dept.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{dept.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {dept.description || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {dept.managers && dept.managers.length > 0
                    ? dept.managers.map((m) => (
                        <Chip key={m.id} label={m.full_name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))
                    : <Typography variant="caption" color="text.secondary">No managers assigned</Typography>
                  }
                </TableCell>
                <TableCell align="center">
                  <Chip label={dept.member_count} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => { setEditing(dept); setFormOpen(true) }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(dept)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <DepartmentFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        department={editing}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Department"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  )
}
