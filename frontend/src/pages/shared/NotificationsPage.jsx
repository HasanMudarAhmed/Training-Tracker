import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import CheckIcon from '@mui/icons-material/Check'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

import AppLayout from '../../components/common/AppLayout'
import EmptyState from '../../components/common/EmptyState'
import { getNotifications } from '../../api/notifications.api'
import { useMarkRead, useMarkAllRead } from '../../hooks/useNotifications'
import { fromNow } from '../../utils/dateUtils'

const TYPE_COLORS = {
  assignment: 'info',
  reminder: 'warning',
  overdue: 'error',
  expiry: 'warning',
  expired: 'default',
  completed: 'success',
}

export default function NotificationsPage() {
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications({ page_size: 50 }).then((r) => r.data),
  })

  const notifications = data?.results || []

  return (
    <AppLayout title="Notifications">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Notifications</Typography>
        {notifications.some((n) => !n.is_read) && (
          <Button
            startIcon={<DoneAllIcon />}
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      <Card>
        {notifications.length === 0 ? (
          <EmptyState message="No notifications" icon={<NotificationsNoneIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />} />
        ) : (
          <List disablePadding>
            {notifications.map((n, i) => (
              <Box key={n.id}>
                <ListItem
                  sx={{ bgcolor: n.is_read ? 'transparent' : 'action.hover', py: 2, px: 3 }}
                  secondaryAction={
                    !n.is_read && (
                      <IconButton size="small" onClick={() => markRead.mutate(n.id)} title="Mark as read">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Chip
                          label={n.notification_type.replace('_', ' ')}
                          size="small"
                          color={TYPE_COLORS[n.notification_type] || 'default'}
                        />
                        <Typography variant="subtitle2" fontWeight={n.is_read ? 400 : 700}>
                          {n.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">{n.message}</Typography>
                        <Typography variant="caption" color="text.disabled">{fromNow(n.sent_at)}</Typography>
                      </>
                    }
                  />
                </ListItem>
                {i < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>
    </AppLayout>
  )
}
