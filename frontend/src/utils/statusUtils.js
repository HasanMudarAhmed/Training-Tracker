export const STATUS_CONFIG = {
  assigned: { label: 'Assigned', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  overdue: { label: 'Overdue', color: 'error' },
  expired: { label: 'Expired', color: 'default' },
}

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || { label: status, color: 'default' }

export const ROLE_LABELS = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  employee: 'Employee',
}

export const CATEGORY_LABELS = {
  safety: 'Safety',
  compliance: 'Compliance',
  technical: 'Technical',
  soft_skills: 'Soft Skills',
  hr: 'HR & Workplace',
  leadership: 'Leadership',
  other: 'Other',
}
