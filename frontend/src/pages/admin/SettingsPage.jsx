import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSnackbar } from 'notistack'
import AppLayout from '../../components/common/AppLayout'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/employees.api'

function DeptDialog({ open, onClose, dept }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: dept || {} })

  const mutation = useMutation({
    mutationFn: (data) => dept ? updateDepartment(dept.id, data) : createDepartment(data),
    onSuccess: () => {
      enqueueSnackbar(dept ? 'Department updated.' : 'Department created.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['departments'] })
      onClose()
    },
    onError: () => enqueueSnackbar('Failed to save.', { variant: 'error' }),
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{dept ? 'Edit Department' : 'New Department'}</DialogTitle>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <DialogContent>
          <TextField label="Name" fullWidth required {...register('name', { required: true })} sx={{ mb: 2 }} />
          <TextField label="Description" fullWidth multiline rows={2} {...register('description')} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default function SettingsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const [deptDialog, setDeptDialog] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [deleteDept, setDeleteDept] = useState(null)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then((r) => r.data.results || r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteDepartment(deleteDept.id),
    onSuccess: () => {
      enqueueSnackbar('Department deleted.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['departments'] })
      setDeleteDept(null)
    },
    onError: () => enqueueSnackbar('Failed to delete.', { variant: 'error' }),
  })

  return (
    <AppLayout title="Settings">
      <Typography variant="h5" fontWeight={700} mb={3}>Admin Settings</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>Departments</Typography>
                <Button
                  variant="contained" size="small" startIcon={<AddIcon />}
                  onClick={() => { setEditingDept(null); setDeptDialog(true) }}
                >
                  Add
                </Button>
              </Box>
              <List dense>
                {departments.map((d) => (
                  <ListItem key={d.id} divider>
                    <ListItemText
                      primary={d.name}
                      secondary={`${d.member_count} member(s)${d.description ? ' · ' + d.description : ''}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => { setEditingDept(d); setDeptDialog(true) }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteDept(d)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {departments.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No departments yet." />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DeptDialog
        open={deptDialog}
        onClose={() => { setDeptDialog(false); setEditingDept(null) }}
        dept={editingDept}
      />
      <ConfirmDialog
        open={!!deleteDept}
        title="Delete Department"
        message={`Delete department "${deleteDept?.name}"?`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setDeleteDept(null)}
      />
    </AppLayout>
  )
}
