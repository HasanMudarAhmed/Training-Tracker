import { createTheme } from '@mui/material/styles'

// Matches Untitled UI design tokens defined in tailwind.config.js
const theme = createTheme({
  palette: {
    primary:    { main: '#155EEF', light: '#528BFF', dark: '#004EEB', contrastText: '#fff' },
    secondary:  { main: '#344054', light: '#475467', dark: '#1D2939', contrastText: '#fff' },
    success:    { main: '#12B76A', light: '#6CE9A6', dark: '#027A48', contrastText: '#fff' },
    warning:    { main: '#F79009', light: '#FEC84B', dark: '#B54708', contrastText: '#fff' },
    error:      { main: '#F04438', light: '#FDA29B', dark: '#B42318', contrastText: '#fff' },
    info:       { main: '#2970FF', light: '#84ADFF', dark: '#004EEB', contrastText: '#fff' },
    background: { default: '#F9FAFB', paper: '#FFFFFF' },
    text:       { primary: '#101828', secondary: '#667085' },
    divider:    '#EAECF0',
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '0.9375rem' },
    body2: { fontSize: '0.875rem' },
  },
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    '0px 1px 2px rgba(16,24,40,0.05)',
    '0px 1px 3px rgba(16,24,40,0.1), 0px 1px 2px rgba(16,24,40,0.06)',
    '0px 4px 8px -2px rgba(16,24,40,0.1), 0px 2px 4px -2px rgba(16,24,40,0.06)',
    '0px 6px 12px -2px rgba(16,24,40,0.08)',
    '0px 8px 16px -4px rgba(16,24,40,0.1)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: '0px 1px 2px rgba(16,24,40,0.05)',
          '&:hover': { boxShadow: '0px 1px 3px rgba(16,24,40,0.1)' },
        },
        outlined: {
          borderColor: '#D0D5DD',
          color: '#344054',
          '&:hover': { backgroundColor: '#F9FAFB', borderColor: '#D0D5DD' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(16,24,40,0.1), 0px 1px 2px rgba(16,24,40,0.06)',
          border: '1px solid #EAECF0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: '0.75rem', borderRadius: 6 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          color: '#667085',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: '#F9FAFB',
          borderBottom: '1px solid #EAECF0',
          padding: '12px 24px',
        },
        body: {
          fontSize: '0.875rem',
          color: '#344054',
          borderBottom: '1px solid #F2F4F7',
          padding: '16px 24px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#F9FAFB' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.875rem',
            backgroundColor: '#fff',
            '& fieldset': { borderColor: '#D0D5DD' },
            '&:hover fieldset': { borderColor: '#98A2B3' },
            '&.Mui-focused fieldset': { borderColor: '#155EEF', borderWidth: 2 },
          },
          '& .MuiInputLabel-root': { fontSize: '0.875rem', color: '#667085' },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: '0.875rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12, boxShadow: '0px 20px 24px -4px rgba(16,24,40,0.08)' },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: '1rem', fontWeight: 600, color: '#101828', padding: '20px 24px 8px' },
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: '8px 24px' } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '16px 24px' } },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, backgroundColor: '#EAECF0' },
        bar: { borderRadius: 4 },
      },
    },
    MuiSkeleton: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontSize: '0.75rem', fontWeight: 600 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#101828',
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 10px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: '0.875rem' },
      },
    },
    MuiPagination: {
      styleOverrides: { root: { '& .MuiPaginationItem-root': { borderRadius: 8 } } },
    },
  },
})

export default theme
