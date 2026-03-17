import api from './axios'

export const getTrainings = (params) => api.get('/api/trainings/', { params })
export const getTraining = (id) => api.get(`/api/trainings/${id}/`)
export const createTraining = (data) => api.post('/api/trainings/', data)
export const updateTraining = (id, data) => api.patch(`/api/trainings/${id}/`, data)
export const deleteTraining = (id) => api.delete(`/api/trainings/${id}/`)

export const getAssignments = (params) => api.get('/api/assignments/', { params })
export const getAssignment = (id) => api.get(`/api/assignments/${id}/`)
export const createAssignment = (data) => api.post('/api/assignments/', data)
export const updateAssignment = (id, data) => api.patch(`/api/assignments/${id}/`, data)
export const deleteAssignment = (id) => api.delete(`/api/assignments/${id}/`)
export const bulkAssign = (data) => api.post('/api/assignments/bulk/', data)

export const uploadCertificate = (id, file) => {
  const formData = new FormData()
  formData.append('certificate_file', file)
  return api.post(`/api/assignments/${id}/upload-certificate/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const getCertificateUrl = (id) => `/api/assignments/${id}/certificate/`
