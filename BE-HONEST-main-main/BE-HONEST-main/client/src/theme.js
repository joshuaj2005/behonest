import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFC107', // Amber for bee theme
      light: '#FFD54F',
      dark: '#FFA000',
    },
    secondary: {
      main: '#212121', // Dark grey
      light: '#484848',
      dark: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
});

export default theme; 