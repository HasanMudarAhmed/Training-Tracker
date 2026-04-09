import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { createUser, getUsers } from '../../api/employees.api'

export default function AddEmployeeDialogManager({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, control, formState: { isSubmitting, errors } } = useForm()

  const { data: supervisorsData } = useQuery({
    queryKey: ['users', { role: 'supervisor' }],
    queryFn: () => getUsers({ role: 'supervisor' }).then((r) => r.data),
    enabled: open,
  })
  const supervisors = supervisorsData?.results || []

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, role: 'employee' }
      if (!payload.supervisor) delete payload.supervisor
      return createUser(payload)
    },
    onSuccess: () => {
      enqueueSnackbar('Employee created successfully.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['employees-minimal'] })
      reset()
      onClose()
    },
    onError: (err) => {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.supervisor?.[0] ||
        err.response?.data?.detail ||
        'Failed to create employee.'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Employee</DialogTitle>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
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
            <Grid item xs={12}>
              <Controller
                name="supervisor"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Assign to Supervisor (optional)"
                    fullWidth
                    helperText="Leave blank to add employee directly under department"
                  >
                    <MenuItem value="">None — directly under department</MenuItem>
                    {supervisors.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.full_name}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Job Title" fullWidth {...register('job_title')} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Phone" fullWidth {...register('phone')} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Password" type="password" fullWidth required {...register('password', { required: true })} error={!!errors.password} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Confirm Password" type="password" fullWidth required {...register('password_confirm', { required: true })} error={!!errors.password_confirm} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { reset(); onClose() }} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Creating...' : 'Create Employee'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
