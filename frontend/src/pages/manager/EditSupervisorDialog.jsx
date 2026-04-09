import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useSnackbar } from 'notistack'
import { updateUser } from '../../api/employees.api'

export default function EditSupervisorDialog({ open, onClose, supervisor }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (supervisor) reset({
      first_name: supervisor.first_name,
      last_name: supervisor.last_name,
      email: supervisor.email,
      job_title: supervisor.job_title || '',
      phone: supervisor.phone || '',
    })
  }, [supervisor, reset])

  const mutation = useMutation({
    mutationFn: (data) => updateUser(supervisor.id, data),
    onSuccess: () => {
      enqueueSnackbar('Supervisor updated.', { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
    onError: (err) => {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || 'Failed to update supervisor.'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Supervisor</DialogTitle>
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
            <Grid item xs={6}>
              <TextField label="Job Title" fullWidth {...register('job_title')} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Phone" fullWidth {...register('phone')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
