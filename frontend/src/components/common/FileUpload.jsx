import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

export default function FileUpload({ onFileSelect, accept, label = 'Drop certificate here or click to upload' }) {
  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) onFileSelect(accepted[0])
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: accept || { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        borderRadius: 2,
        p: 4,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'primary.50' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
      {acceptedFiles.length > 0 ? (
        <Typography variant="body2" color="success.main" fontWeight={500}>
          {acceptedFiles[0].name}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      )}
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        PDF, JPG, or PNG — max 10MB
      </Typography>
    </Box>
  )
}
