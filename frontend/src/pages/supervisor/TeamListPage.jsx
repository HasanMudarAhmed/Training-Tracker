import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AssignmentIcon from '@mui/icons-material/Assignment'

import AppLayout from '../../components/common/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import { getUsers } from '../../api/employees.api'
import { getInitials } from '../../utils/formatters'

export default function TeamListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', { search, role: 'employee' }],
    queryFn: () => getUsers({ search, role: 'employee' }).then((r) => r.data),
  })

  const users = data?.results || []

  return (
    <AppLayout title="My Team">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>My Team</Typography>
      </Box>

      <Box mb={2}>
        <TextField
          placeholder="Search team members..." fullWidth
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="center">Active Trainings</TableCell>
              <TableCell>Completion</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>{[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={5}><EmptyState message="No team members found" /></TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 12 }}>
                      {getInitials(u.full_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{u.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{u.department_name || '—'}</TableCell>
                <TableCell align="center">{u.active_training_count}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate" value={u.completion_rate}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      color={u.completion_rate >= 80 ? 'success' : 'warning'}
                    />
                    <Typography variant="caption" fontWeight={600}>{u.completion_rate}%</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Profile">
                    <IconButton size="small" onClick={() => navigate(`/supervisor/team/${u.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Assign Training">
                    <IconButton size="small" onClick={() => navigate(`/supervisor/assign?employee=${u.id}`)}>
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  )
}
