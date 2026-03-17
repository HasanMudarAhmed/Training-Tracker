import api from './axios'

export const getNotifications = (params) => api.get('/api/notifications/', { params })
export const markRead = (id) => api.patch(`/api/notifications/${id}/read/`)
export const markAllRead = () => api.patch('/api/notifications/mark-all-read/')
export const getUnreadCount = () => api.get('/api/notifications/unread-count/')
