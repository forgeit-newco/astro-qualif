import { createTheme } from '@mui/material/styles';

export const astrolabeTheme = createTheme({
  palette: {
    primary: {
      main: '#29624D',
      light: '#59C295',
      dark: '#061A1A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#67E083',
      light: '#59C295',
      dark: '#29624D',
      contrastText: '#061A1A',
    },
    background: {
      default: '#F1F7F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#061A1A',
      secondary: '#29624D',
      disabled: '#9CA3AF',
    },
    success: {
      main: '#67E083',
      light: '#A3F0B0',
      dark: '#4CAF50',
    },
    info: {
      main: '#59C295',
      light: '#8AD4B5',
      dark: '#3D9A73',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    divider: 'rgba(6, 26, 26, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(41, 98, 77, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(6, 26, 26, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(6, 26, 26, 0.1)',
        },
      },
    },
  },
});

// Couleurs pour les statuts Kanban
export const statusColors: Record<string, string> = {
  Nouveau: '#29624D',
  Qualifie: '#59C295',
  'RDV Planifie': '#67E083',
  'En Discussion': '#F59E0B',
  Converti: '#67E083',
  Perdu: '#EF4444',
};
