import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useSnackbar } from 'notistack'
import { createUser, updateUser, getDepartments, getUsers, getManagers } from '../../api/employees.api'

export default function UserFormDialog({ open, onClose, user }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const isEdit = !!user

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm()
  const selectedRole = watch('role', user?.role || 'employee')

  useEffect(() => {
    if (user) reset(user)
    else reset({ role: 'employee' })
  }, [user, reset])

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then((r) => r.data.results || r.data),
    enabled: open,
  })

  const { data: supervisors = [] } = useQuery({
    queryKey: ['users', { role: 'supervisor' }],
    queryFn: () => getUsers({ role: 'supervisor' }).then((r) => r.data.results || r.data),
    enabled: open,
  })

  const { data: managers = [] } = useQuery({
    queryKey: ['users', { role: 'manager' }],
    queryFn: () => getManagers().then((r) => r.data.results || r.data),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateUser(user.id, data) : createUser(data),
    onSuccess: () => {
      enqueueSnackbar(isEdit ? 'User updated.' : 'User created.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
    onError: (err) => {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Something went wrong.'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={6}>
              <TextField label="First Name" fullWidth required {...register('first_name', { required: true })} error={!!errors.first_name} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Last Name" fullWidth required {...register('last_name', { required: true })} error={!!errors.last_name} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" type="email" fullWidth required {...register('email', { required: true })} error={!!errors.email} />
            </Grid>
            {!isEdit && (
              <>
                <Grid item xs={6}>
                  <TextField label="Password" type="password" fullWidth required {...register('password', { required: true })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Confirm Password" type="password" fullWidth required {...register('password_confirm', { required: true })} />
                </Grid>
              </>
            )}
            <Grid item xs={6}>
              <TextField select label="Role" fullWidth defaultValue="employee" {...register('role')}>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="supervisor">Supervisor</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Job Title" fullWidth {...register('job_title')} />
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Department" fullWidth defaultValue="" {...register('department')}>
                <MenuItem value="">None</MenuItem>
                {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Phone" fullWidth {...register('phone')} />
            </Grid>
            {selectedRole === 'supervisor' && (
              <Grid item xs={12}>
                <TextField select label="Manager" fullWidth defaultValue="" {...register('manager')}>
                  <MenuItem value="">None</MenuItem>
                  {managers.map((m) => <MenuItem key={m.id} value={m.id}>{m.full_name}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            {selectedRole === 'employee' && (
              <Grid item xs={12}>
                <TextField select label="Supervisor" fullWidth defaultValue="" {...register('supervisor')}>
                  <MenuItem value="">None</MenuItem>
                  {supervisors.map((s) => <MenuItem key={s.id} value={s.id}>{s.full_name}</MenuItem>)}
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
