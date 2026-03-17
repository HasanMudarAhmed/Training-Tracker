import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import DownloadIcon from '@mui/icons-material/Download'
import AppLayout from '../../components/common/AppLayout'
import { getCertificateUrl } from '../../api/trainings.api'

export default function CertificatePage() {
  const { assignmentId } = useParams()
  const url = getCertificateUrl(assignmentId)

  return (
    <AppLayout title="Certificate">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Certificate</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} href={url} download>
          Download
        </Button>
      </Box>
      <Box
        component="iframe"
        src={url}
        sx={{ width: '100%', height: '80vh', border: 0, borderRadius: 2, boxShadow: 2 }}
        title="Certificate"
      />
    </AppLayout>
  )
}
