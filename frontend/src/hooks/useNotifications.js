import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUnreadCount, markRead, markAllRead } from '../api/notifications.api'

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadCount().then((r) => r.data.count),
    refetchInterval: 60000, // Poll every minute
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
