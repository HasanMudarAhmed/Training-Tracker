import api from './axios'

export const login = (credentials) => api.post('/api/auth/login/', credentials)
export const logout = () => api.post('/api/auth/logout/')
export const getMe = () => api.get('/api/auth/me/')
export const updateMe = (data) => api.patch('/api/auth/me/', data)
export const changePassword = (data) => api.put('/api/auth/change-password/', data)
export const requestPasswordReset = (email) => api.post('/api/auth/password-reset/', { email })
export const confirmPasswordReset = (data) => api.post('/api/auth/password-reset/confirm/', data)
