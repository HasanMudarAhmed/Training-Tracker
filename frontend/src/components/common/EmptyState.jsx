import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InboxIcon from '@mui/icons-material/Inbox'

export default function EmptyState({ message = 'No data found', icon }) {
  return (
    <Box
      display="flex" flexDirection="column" alignItems="center"
      justifyContent="center" py={8} color="text.secondary"
    >
      {icon || <InboxIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />}
      <Typography variant="body1" color="text.secondary">{message}</Typography>
    </Box>
  )
}
