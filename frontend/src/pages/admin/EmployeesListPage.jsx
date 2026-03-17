import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { useSnackbar } from 'notistack'

import AppLayout from '../../components/common/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import { getUsers, getDepartments } from '../../api/employees.api'
import { getInitials } from '../../utils/formatters'
import { ROLE_LABELS } from '../../utils/statusUtils'
import UserFormDialog from './UserFormDialog'

export default function EmployeesListPage() {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [formOpen, setFormOpen] = useState(false)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', { search, role: roleFilter, department: deptFilter, page: page + 1 }],
    queryFn: () => getUsers({ search, role: roleFilter || undefined, department: deptFilter || undefined, page: page + 1, page_size: rowsPerPage }).then((r) => r.data),
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then((r) => r.data.results || r.data),
  })

  const users = usersData?.results || []
  const total = usersData?.count || 0

  return (
    <AppLayout title="Employees">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>All Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Add Employee
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              select label="Role" value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All Roles</MenuItem>
              {Object.entries(ROLE_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
            <TextField
              select label="Department" value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(0) }}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Supervisor</TableCell>
              <TableCell align="center">Completion %</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}><EmptyState message="No employees found" /></TableCell>
              </TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 13 }}>
                      {getInitials(u.full_name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{u.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={ROLE_LABELS[u.role]} size="small" color={u.role === 'admin' ? 'primary' : 'default'} />
                </TableCell>
                <TableCell>{u.department_name || '—'}</TableCell>
                <TableCell>{u.supervisor_name || '—'}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: u.completion_rate >= 80 ? 'success.main' : u.completion_rate >= 50 ? 'warning.main' : 'error.main' }}>
                  {u.completion_rate}%
                </TableCell>
                <TableCell align="center">{u.active_training_count}</TableCell>
                <TableCell align="center">
                  <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small" color={u.is_active ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Profile">
                    <IconButton size="small" onClick={() => navigate(`/admin/employees/${u.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Assign Training">
                    <IconButton size="small" onClick={() => navigate(`/admin/assign?employee=${u.id}`)}>
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>

      <UserFormDialog open={formOpen} onClose={() => setFormOpen(false)} />
    </AppLayout>
  )
}
