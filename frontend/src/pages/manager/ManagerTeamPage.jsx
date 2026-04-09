import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'

import AppLayout from '../../components/common/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import AddEmployeeDialogManager from './AddEmployeeDialogManager'
import AssignTrainingDialog from '../../components/common/AssignTrainingDialog'
import { getUsers } from '../../api/employees.api'
import { getInitials } from '../../utils/formatters'
import { ROLE_LABELS } from '../../utils/statusUtils'

export default function ManagerTeamPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [supervisorFilter, setSupervisorFilter] = useState(searchParams.get('supervisor') || '')
  const [page, setPage] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignEmployee, setAssignEmployee] = useState(null)

  const openAssign = (employee) => {
    setAssignEmployee(employee)
    setAssignOpen(true)
  }

  const { data: supervisorsData } = useQuery({
    queryKey: ['users', { role: 'supervisor' }],
    queryFn: () => getUsers({ role: 'supervisor' }).then((r) => r.data),
  })
  const supervisors = supervisorsData?.results || []

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, supervisor: supervisorFilter, page: page + 1 }],
    queryFn: () => getUsers({
      search: search || undefined,
      supervisor: supervisorFilter || undefined,
      page: page + 1,
    }).then((r) => r.data),
  })

  const employees = data?.results || []

  return (
    <AppLayout title="My Department">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Department — All Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Employee
        </Button>
      </Box>

      <Card sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Search employees..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
          />
          <TextField
            select label="Supervisor" value={supervisorFilter}
            onChange={(e) => { setSupervisorFilter(e.target.value); setPage(0) }}
            size="small" sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Supervisors</MenuItem>
            {supervisors.map((s) => <MenuItem key={s.id} value={s.id}>{s.full_name}</MenuItem>)}
          </TextField>
        </Box>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Supervisor</TableCell>
              <TableCell align="center">Active Trainings</TableCell>
              <TableCell align="center">Completion %</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow><TableCell colSpan={6}><EmptyState message="No members found in your department" /></TableCell></TableRow>
            ) : employees.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: e.role === 'supervisor' ? 'primary.main' : 'secondary.main' }}>
                      {getInitials(e.full_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{e.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{e.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ROLE_LABELS[e.role] || e.role}
                    size="small"
                    color={e.role === 'supervisor' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{e.supervisor_name || '—'}</TableCell>
                <TableCell align="center">{e.active_training_count}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: e.completion_rate >= 80 ? 'success.main' : 'warning.main' }}>
                  {e.completion_rate}%
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Profile">
                    <IconButton size="small" onClick={() => navigate(`/manager/team/${e.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Assign Training">
                    <IconButton size="small" onClick={() => openAssign(e)}>
                      <AssignmentIcon fontSize="small" />
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

      <AddEmployeeDialogManager open={addOpen} onClose={() => setAddOpen(false)} />
      <AssignTrainingDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        preEmployee={assignEmployee}
      />
    </AppLayout>
  )
}
