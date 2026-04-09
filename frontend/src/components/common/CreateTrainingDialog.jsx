import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Autocomplete from '@mui/material/Autocomplete'

import { createTraining } from '../../api/trainings.api'
import { CATEGORY_LABELS, PREDEFINED_TRAININGS } from '../../utils/statusUtils'

export default function CreateTrainingDialog({ open, onClose, onCreated }) {
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { category: 'safety', duration_hours: '' }
  })

  const mutation = useMutation({
    mutationFn: (data) => createTraining(data),
    onSuccess: (res) => {
      enqueueSnackbar(`"${res.data.title}" created.`, { variant: 'success' })
      qc.invalidateQueries({ queryKey: ['trainings-all'] })
      qc.invalidateQueries({ queryKey: ['trainings'] })
      onCreated?.(res.data)
      reset()
      onClose()
    },
    onError: (err) => {
      const msg = err.response?.data?.title?.[0] || err.response?.data?.detail || 'Failed to create training.'
      enqueueSnackbar(msg, { variant: 'error' })
    },
  })

  const handleClose = () => { reset(); onClose() }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Training</DialogTitle>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Autocomplete
                    freeSolo
                    options={PREDEFINED_TRAININGS}
                    value={value || ''}
                    onInputChange={(_, v) => onChange(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Title"
                        required
                        error={!!error}
                        helperText={error?.message || 'Type a name or pick from the list'}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Category" fullWidth>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <MenuItem key={k} value={k}>{v}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Duration (hours)"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 0.5 }}
                {...register('duration_hours')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (optional)"
                fullWidth
                multiline
                rows={3}
                {...register('description')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Training'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
