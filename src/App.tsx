import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import EmailIcon from '@mui/icons-material/Email';
import LogoutIcon from '@mui/icons-material/Logout';
import { astrolabeTheme } from './theme/astrolabeTheme';
import { FormPage } from './pages/FormPage';
import { KanbanPage } from './pages/KanbanPage';
import { LoginPage } from './pages/LoginPage';
import { EmailConfigPage } from './pages/EmailConfigPage';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/form');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#0A2222' }} elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src="/logo-forgeit.png"
            alt="Forge IT"
            sx={{
              height: 40,
              width: 'auto',
            }}
          />
          Astrolabe
        </Typography>

        <Button
          color="inherit"
          startIcon={<AssignmentIcon />}
          onClick={() => navigate('/form')}
          sx={{
            mx: 1,
            borderBottom: location.pathname === '/form' ? 2 : 0,
            borderColor: 'secondary.main',
            borderRadius: 0,
          }}
        >
          Formulaire
        </Button>

        {isAuthenticated && (
          <Button
            color="inherit"
            startIcon={<ViewKanbanIcon />}
            onClick={() => navigate('/kanban')}
            sx={{
              mx: 1,
              borderBottom: location.pathname === '/kanban' ? 2 : 0,
              borderColor: 'secondary.main',
              borderRadius: 0,
            }}
          >
            Kanban
          </Button>
        )}

        {isAuthenticated && (
          <Button
            color="inherit"
            startIcon={<EmailIcon />}
            onClick={() => navigate('/admin/email-config')}
            sx={{
              mx: 1,
              borderBottom: location.pathname === '/admin/email-config' ? 2 : 0,
              borderColor: 'secondary.main',
              borderRadius: 0,
            }}
          >
            Email Config
          </Button>
        )}

        {isAuthenticated && (
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ml: 1 }}
          >
            Déconnexion
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

function AppContent() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/form" replace />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <KanbanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/email-config"
            element={
              <ProtectedRoute>
                <EmailConfigPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
    </Box>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={astrolabeTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
