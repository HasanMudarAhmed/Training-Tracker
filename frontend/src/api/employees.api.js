import api from './axios'

export const getUsers = (params) => api.get('/api/auth/users/', { params })
export const getUser = (id) => api.get(`/api/auth/users/${id}/`)
export const createUser = (data) => api.post('/api/auth/users/', data)
export const updateUser = (id, data) => api.patch(`/api/auth/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/api/auth/users/${id}/`)
export const getUserTrainings = (id) => api.get(`/api/auth/users/${id}/trainings/`)
export const getUsersMinimal = () => api.get('/api/auth/users/minimal/')

export const getDepartments = (params) => api.get('/api/auth/departments/', { params })
export const getDepartment = (id) => api.get(`/api/auth/departments/${id}/`)
export const createDepartment = (data) => api.post('/api/auth/departments/', data)
export const updateDepartment = (id, data) => api.patch(`/api/auth/departments/${id}/`, data)
export const deleteDepartment = (id) => api.delete(`/api/auth/departments/${id}/`)
