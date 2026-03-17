import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1E3A5F', light: '#2E5299', dark: '#122440', contrastText: '#fff' },
    secondary: { main: '#2E86AB', light: '#5BA4C8', dark: '#1A5C7A', contrastText: '#fff' },
    success: { main: '#27AE60', light: '#52C785', dark: '#1A7A42' },
    warning: { main: '#F39C12', light: '#F7BF54', dark: '#B8780D' },
    error: { main: '#E74C3C', light: '#EF7C70', dark: '#B03A2E' },
    info: { main: '#3498DB', light: '#62B3E8', dark: '#2172A9' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#1A1A2E', secondary: '#6C757D' },
    divider: '#E8ECF0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '0.95rem' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.06)',
    '0px 2px 6px rgba(0,0,0,0.08)',
    '0px 4px 12px rgba(0,0,0,0.10)',
    '0px 6px 16px rgba(0,0,0,0.10)',
    '0px 8px 20px rgba(0,0,0,0.12)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        contained: { boxShadow: '0 2px 6px rgba(0,0,0,0.15)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #E8ECF0',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, backgroundColor: '#F5F7FA', color: '#1A1A2E' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: '#1E3A5F', color: '#fff' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#fff', color: '#1A1A2E', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(255,255,255,0.15)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
          },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
        },
      },
    },
  },
})

export default theme
