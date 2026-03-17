import Chip from '@mui/material/Chip'
import { getStatusConfig } from '../../utils/statusUtils'

export default function StatusBadge({ status, size = 'small' }) {
  const { label, color } = getStatusConfig(status)
  return <Chip label={label} color={color} size={size} />
}
