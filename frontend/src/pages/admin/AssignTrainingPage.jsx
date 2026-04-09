import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import AddIcon from '@mui/icons-material/Add'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'

import AppLayout from '../../components/common/AppLayout'
import CreateTrainingDialog from '../../components/common/CreateTrainingDialog'
import { getTrainings, bulkAssign } from '../../api/trainings.api'
import { getUsersMinimal } from '../../api/employees.api'
import { CATEGORY_LABELS } from '../../utils/statusUtils'

const STEPS = ['Select Trainings', 'Select Employees', 'Due Date & Notes', 'Review & Confirm']

export default function AssignTrainingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { enqueueSnackbar } = useSnackbar()
  const qc = useQueryClient()

  const [step, setStep] = useState(0)
  const [selectedTrainings, setSelectedTrainings] = useState([])
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [trainingSearch, setTrainingSearch] = useState('')
  const [dueDate, setDueDate] = useState(dayjs().add(30, 'day'))
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)

  const preEmployeeId = searchParams.get('employee')

  const { data: trainings = [] } = useQuery({
    queryKey: ['trainings-all'],
    queryFn: () => getTrainings({ page_size: 500 }).then((r) => r.data.results || r.data),
    staleTime: 0,
  })

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-minimal'],
    queryFn: () => getUsersMinimal().then((r) => r.data),
    staleTime: 0,
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
      qc.invalidateQueries({ queryKey: ['user-trainings'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
      enqueueSnackbar(`${res.data.created} assignment(s) created.`, { variant: 'success' })
    },
    onError: () => enqueueSnackbar('Failed to assign trainings.', { variant: 'error' }),
  })

  const toggleTraining = (t) =>
    setSelectedTrainings((prev) =>
      prev.find((x) => x.id === t.id) ? prev.filter((x) => x.id !== t.id) : [...prev, t]
    )

  const toggleEmployee = (e) =>
    setSelectedEmployees((prev) =>
      prev.find((x) => x.id === e.id) ? prev.filter((x) => x.id !== e.id) : [...prev, e]
    )

  const canNext = () => {
    if (step === 0) return selectedTrainings.length > 0
    if (step === 1) return selectedEmployees.length > 0
    if (step === 2) return !!dueDate
    return true
  }

  const filteredTrainings = trainings.filter((t) =>
    !trainingSearch ||
    t.title.toLowerCase().includes(trainingSearch.toLowerCase()) ||
    (CATEGORY_LABELS[t.category] || t.category).toLowerCase().includes(trainingSearch.toLowerCase())
  )

  if (result) {
    return (
      <AppLayout title="Assign Training">
        <Card sx={{ maxWidth: 560, mx: 'auto', mt: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h5" fontWeight={700} color="success.main" mb={2}>
              Assignment Complete!
            </Typography>
            <Typography variant="body1" mb={1}>{result.created} assignment(s) created successfully.</Typography>
            {result.skipped > 0 && (
              <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                {result.skipped} skipped (already active): {result.skipped_details.join(', ')}
              </Alert>
            )}
            <Box mt={4} display="flex" gap={2} justifyContent="center">
              <Button variant="outlined" onClick={() => { setResult(null); setStep(0); setSelectedTrainings([]); setSelectedEmployees([]) }}>
                Assign More
              </Button>
              <Button variant="contained" onClick={() => navigate(-1)}>Done</Button>
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
        {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      <Card>
        <CardContent sx={{ minHeight: 420 }}>

          {/* Step 0 — Select Trainings */}
          {step === 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Select Training(s)</Typography>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                  New Training
                </Button>
              </Box>
              <TextField
                placeholder="Search trainings..."
                size="small"
                fullWidth
                value={trainingSearch}
                onChange={(e) => setTrainingSearch(e.target.value)}
                sx={{ mb: 1.5 }}
              />
              <List dense sx={{ maxHeight: 340, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {filteredTrainings.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary={<Typography color="text.secondary" variant="body2" textAlign="center" py={2}>No trainings found. Click "New Training" to create one.</Typography>}
                    />
                  </ListItem>
                ) : filteredTrainings.map((t) => (
                  <ListItem key={t.id} disablePadding divider>
                    <ListItemButton onClick={() => toggleTraining(t)} dense>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox checked={!!selectedTrainings.find((x) => x.id === t.id)} size="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={500}>{t.title}</Typography>}
                        secondary={
                          <Box component="span" display="flex" gap={0.5} mt={0.25}>
                            <Chip label={CATEGORY_LABELS[t.category] || t.category} size="small" sx={{ height: 18, fontSize: 10 }} />
                            {t.is_recurring && <Chip label="Recurring" size="small" color="info" sx={{ height: 18, fontSize: 10 }} />}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {selectedTrainings.length > 0 && (
                <Box mt={1.5} display="flex" gap={0.5} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>Selected ({selectedTrainings.length}):</Typography>
                  {selectedTrainings.map((t) => <Chip key={t.id} label={t.title} size="small" color="primary" variant="outlined" onDelete={() => toggleTraining(t)} />)}
                </Box>
              )}
            </>
          )}

          {/* Step 1 — Select Employees */}
          {step === 1 && (
            <>
              <Typography variant="h6" mb={1.5}>Select Employee(s)</Typography>
              <List dense sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {employees.length === 0 ? (
                  <ListItem>
                    <ListItemText primary={<Typography color="text.secondary" variant="body2" textAlign="center" py={2}>No employees found in your scope.</Typography>} />
                  </ListItem>
                ) : employees.map((e) => (
                  <ListItem key={e.id} disablePadding divider>
                    <ListItemButton onClick={() => toggleEmployee(e)} dense>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox checked={!!selectedEmployees.find((x) => x.id === e.id)} size="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={500}>{e.full_name}</Typography>}
                        secondary={e.email}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {selectedEmployees.length > 0 && (
                <Box mt={1.5} display="flex" gap={0.5} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>Selected ({selectedEmployees.length}):</Typography>
                  {selectedEmployees.map((e) => <Chip key={e.id} label={e.full_name} size="small" variant="outlined" onDelete={() => toggleEmployee(e)} />)}
                </Box>
              )}
            </>
          )}

          {/* Step 2 — Due Date & Notes */}
          {step === 2 && (
            <Box display="flex" flexDirection="column" gap={3} maxWidth={420}>
              <Typography variant="h6">Due Date & Notes</Typography>
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
                multiline rows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any instructions or context for the employee..."
              />
            </Box>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <Box display="flex" flexDirection="column" gap={2.5}>
              <Typography variant="h6">Review Assignment</Typography>
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={600}>Trainings ({selectedTrainings.length})</Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                  {selectedTrainings.map((t) => <Chip key={t.id} label={t.title} size="small" color="primary" />)}
                </Box>
              </Box>
              <Divider />
              <Box>
                <Typography variant="overline" color="text.secondary" fontWeight={600}>Employees ({selectedEmployees.length})</Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                  {selectedEmployees.map((e) => <Chip key={e.id} label={e.full_name} size="small" />)}
                </Box>
              </Box>
              <Divider />
              <Typography variant="body2"><b>Due Date:</b> {dueDate?.format('MMMM D, YYYY')}</Typography>
              {notes && <Typography variant="body2"><b>Notes:</b> {notes}</Typography>}
              <Alert severity="info">
                Up to <b>{selectedTrainings.length * selectedEmployees.length}</b> assignment(s) will be created.
                Existing active assignments will be skipped.
              </Alert>
            </Box>
          )}
        </CardContent>

        <Divider />
        <Box display="flex" justifyContent="space-between" p={2}>
          <Button onClick={() => setStep((s) => s - 1)} disabled={step === 0} variant="outlined">Back</Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} variant="contained">Next</Button>
          ) : (
            <Button onClick={() => mutation.mutate()} variant="contained" color="success" disabled={mutation.isPending}>
              {mutation.isPending ? 'Assigning...' : 'Confirm & Assign'}
            </Button>
          )}
        </Box>
      </Card>

      <CreateTrainingDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newT) => setSelectedTrainings((prev) => [...prev, newT])}
      />
    </AppLayout>
  )
}
