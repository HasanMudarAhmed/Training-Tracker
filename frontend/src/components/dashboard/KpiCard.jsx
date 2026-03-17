import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Skeleton from '@mui/material/Skeleton'

export default function KpiCard({ title, value, subtitle, icon, color = 'primary', loading }) {
  const colorMap = {
    primary: '#1E3A5F',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={48} />
          <Skeleton variant="text" width="80%" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={700} color="text.primary" lineHeight={1}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${colorMap[color]}20`, width: 52, height: 52 }}>
            <Box color={colorMap[color]}>{icon}</Box>
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}
