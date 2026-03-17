import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (date) => date ? dayjs(date).format('MMM D, YYYY') : '—'
export const formatDateTime = (date) => date ? dayjs(date).format('MMM D, YYYY h:mm A') : '—'
export const fromNow = (date) => date ? dayjs(date).fromNow() : '—'

export const daysUntil = (date) => {
  if (!date) return null
  return dayjs(date).diff(dayjs(), 'day')
}

export const isOverdue = (dueDate, status) => {
  if (!dueDate) return false
  if (status === 'completed' || status === 'expired') return false
  return dayjs(dueDate).isBefore(dayjs(), 'day')
}

export const isDueSoon = (dueDate, status, days = 7) => {
  if (!dueDate || status === 'completed' || status === 'expired' || status === 'overdue') return false
  const diff = daysUntil(dueDate)
  return diff !== null && diff >= 0 && diff <= days
}
