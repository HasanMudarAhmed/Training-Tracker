import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'

import AppLayout from '../../components/common/AppLayout'
import { getTrainings } from '../../api/trainings.api'
import { getUsersMinimal } from '../../api/employees.api'
import { bulkAssign } from '../../api/trainings.api'
import { CATEGORY_LABELS } from '../../utils/statusUtils'

const STEPS = ['Select Trainings', 'Select Employees', 'Set Due Date & Notes', 'Review & Confirm']

export default function AssignTrainingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { enqueueSnackbar } = useSnackbar()
  const [step, setStep] = useState(0)
  const [selectedTrainings, setSelectedTrainings] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [dueDate, setDueDate] = useState(dayjs().add(30, 'day'))
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState(null)

  // Pre-select employee from query param
  const preEmployeeId = searchParams.get('employee')

  const { data: trainings = [] } = useQuery({
    queryKey: ['trainings-all'],
    queryFn: () => getTrainings({ page_size: 100 }).then((r) => r.data.results || r.data),
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-minimal'],
    queryFn: () => getUsersMinimal().then((r) => r.data),
  })

  useEffect(() => {
    if (preEmployeeId && employees.length > 0) {
      const emp = employees.find((e) => e.id === preEmployeeId)
      if (emp) setSelectedEmployees([emp])
    }
  }, [preEmployeeId, employees])

  const mutation = useMutation({
    mutationFn: () => bulkAssign({
      training_ids: selectedTrainings.map((t) => t.id),
      employee_ids: selectedEmployees.map((e) => e.id),
      due_date: dueDate.format('YYYY-MM-DD'),
      notes,
    }),
    onSuccess: (res) => {
      setResult(res.data)
      enqueueSnackbar(`${res.data.created} assignment(s) created.`, { variant: 'success' })
    },
    onError: () => enqueueSnackbar('Failed to assign trainings.', { variant: 'error' }),
  })

  const toggleTraining = (t) => {
    setSelectedTrainings((prev) =>
      prev.find((x) => x.id === t.id) ? prev.filter((x) => x.id !== t.id) : [...prev, t]
    )
  }

  const toggleEmployee = (e) => {
    setSelectedEmployees((prev) =>
      prev.find((x) => x.id === e.id) ? prev.filter((x) => x.id !== e.id) : [...prev, e]
    )
  }

  const canNext = () => {
    if (step === 0) return selectedTrainings.length > 0
    if (step === 1) return selectedEmployees.length > 0
    if (step === 2) return !!dueDate
    return true
  }

  if (result) {
    return (
      <AppLayout title="Assign Training">
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h5" fontWeight={700} color="success.main" mb={2}>
              Assignment Complete!
            </Typography>
            <Typography variant="body1" mb={1}>{result.created} assignment(s) created successfully.</Typography>
            {result.skipped > 0 && (
              <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                {result.skipped} skipped (already have active assignments):{' '}
                {result.skipped_details.join(', ')}
              </Alert>
            )}
            <Box mt={4} display="flex" gap={2} justifyContent="center">
              <Button variant="outlined" onClick={() => { setResult(null); setStep(0); setSelectedTrainings([]); setSelectedEmployees([]) }}>
                Assign More
              </Button>
              <Button variant="contained" onClick={() => navigate(-1)}>
                Done
              </Button>
            </Box>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Assign Training">
      <Typography variant="h5" fontWeight={700} mb={3}>Assign Training</Typography>

      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ minHeight: 400 }}>
          {/* Step 0: Select Trainings */}
          {step === 0 && (
            <>
              <Typography variant="h6" mb={2}>Select Training(s)</Typography>
              <List dense>
                {trainings.map((t) => (
                  <ListItem key={t.id} disablePadding>
                    <ListItemButton onClick={() => toggleTraining(t)} dense>
                      <ListItemIcon>
                        <Checkbox checked={!!selectedTrainings.find((x) => x.id === t.id)} />
                      </ListItemIcon>
                      <ListItemText
                        primary={t.title}
                        secondary={`${CATEGORY_LABELS[t.category] || t.category}${t.is_recurring ? ' · Recurring' : ''}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {selectedTrainings.length > 0 && (
                <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                  {selectedTrainings.map((t) => <Chip key={t.id} label={t.title} onDelete={() => toggleTraining(t)} />)}
                </Box>
              )}
            </>
          )}

          {/* Step 1: Select Employees */}
          {step === 1 && (
            <>
              <Typography variant="h6" mb={2}>Select Employee(s)</Typography>
              <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                {employees.map((e) => (
                  <ListItem key={e.id} disablePadding>
                    <ListItemButton onClick={() => toggleEmployee(e)} dense>
                      <ListItemIcon>
                        <Checkbox checked={!!selectedEmployees.find((x) => x.id === e.id)} />
                      </ListItemIcon>
                      <ListItemText primary={e.full_name} secondary={e.email} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Step 2: Due date + notes */}
          {step === 2 && (
            <Box display="flex" flexDirection="column" gap={3} maxWidth={400}>
              <Typography variant="h6">Set Due Date & Notes</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  onChange={setDueDate}
                  minDate={dayjs()}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
              <TextField
                label="Notes (optional)"
                multiline rows={3}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <Box>
              <Typography variant="h6" mb={2}>Review Assignment</Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" mb={0.5}>
                    TRAININGS ({selectedTrainings.length})
                  </Typography>
                  {selectedTrainings.map((t) => <Chip key={t.id} label={t.title} sx={{ mr: 0.5, mb: 0.5 }} />)}
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.secondary" mb={0.5}>
                    EMPLOYEES ({selectedEmployees.length})
                  </Typography>
                  {selectedEmployees.map((e) => <Chip key={e.id} label={e.full_name} sx={{ mr: 0.5, mb: 0.5 }} />)}
                </Box>
                <Divider />
                <Typography variant="body2"><b>Due Date:</b> {dueDate?.format('MMMM D, YYYY')}</Typography>
                {notes && <Typography variant="body2"><b>Notes:</b> {notes}</Typography>}
                <Typography variant="body2" color="text.secondary">
                  This will create up to <b>{selectedTrainings.length * selectedEmployees.length}</b> assignment(s).
                  Duplicate active assignments will be skipped.
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>

        <Divider />
        <Box display="flex" justifyContent="space-between" p={2}>
          <Button onClick={() => setStep((s) => s - 1)} disabled={step === 0} variant="outlined">
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} variant="contained">
              Next
            </Button>
          ) : (
            <Button onClick={() => mutation.mutate()} variant="contained" color="success" disabled={mutation.isPending}>
              {mutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          )}
        </Box>
      </Card>
    </AppLayout>
  )
}
