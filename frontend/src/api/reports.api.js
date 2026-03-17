import api from './axios'

export const getSummary = () => api.get('/api/reports/summary/')
export const getDepartmentReport = () => api.get('/api/reports/by-department/')
export const getEmployeeReport = () => api.get('/api/reports/by-employee/')
export const getOverdueReport = () => api.get('/api/reports/overdue/')
export const getExpiringReport = (days = 30) => api.get('/api/reports/expiring/', { params: { days } })
export const exportReport = () => {
  return api.get('/api/reports/export/', { responseType: 'blob' })
}
export const getAuditLog = (params) => api.get('/api/audit/', { params })
