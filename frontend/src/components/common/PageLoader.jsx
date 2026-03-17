import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export default function PageLoader() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
      <CircularProgress size={48} />
    </Box>
  )
}
