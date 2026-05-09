import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5c4d7d' },
    secondary: { main: '#c76f4e' },
  },
  shape: { borderRadius: 10 },
})
