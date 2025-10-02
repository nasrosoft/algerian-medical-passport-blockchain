import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WalletConnection from './components/WalletConnection';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import AccessControl from './pages/AccessControl';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

// Hooks
import { useWeb3 } from './hooks/useWeb3';

// Types
import { EntityType } from './types';

// Theme configuration
const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      secondary: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: mode === 'light' 
              ? '0 2px 8px rgba(0,0,0,0.1)' 
              : '0 2px 8px rgba(255,255,255,0.1)',
          },
        },
      },
    },
  });

const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userType, setUserType] = useState<EntityType | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const { isConnected, account, chainId, library, connect, disconnect, error } = useWeb3();

  const theme = getTheme(themeMode);

  // Toggle theme
  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Check user registration status and type
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isConnected || !account || !library) {
        setIsRegistered(false);
        setUserType(null);
        return;
      }

      try {
        // This would normally check the smart contract for user registration
        // For now, we'll simulate it based on local storage or mock data
        const storedUserType = localStorage.getItem(`userType_${account}`);
        const storedRegistration = localStorage.getItem(`isRegistered_${account}`);

        if (storedUserType && storedRegistration === 'true') {
          setUserType(parseInt(storedUserType) as EntityType);
          setIsRegistered(true);
        } else {
          setUserType(null);
          setIsRegistered(false);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsRegistered(false);
        setUserType(null);
      }
    };

    checkUserStatus();
  }, [isConnected, account, library]);

  // If wallet not connected, show connection screen
  if (!isConnected) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          <WalletConnection onConnect={connect} error={error} />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={themeMode}
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          {isRegistered && userType !== null && (
            <Sidebar
              open={sidebarOpen}
              userType={userType}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              transition: 'margin-left 0.2s',
              marginLeft: isRegistered && sidebarOpen ? '240px' : 0,
            }}
          >
            {/* Top Navigation */}
            <Navbar
              account={account}
              chainId={chainId}
              onDisconnect={disconnect}
              onToggleSidebar={toggleSidebar}
              onToggleTheme={toggleTheme}
              themeMode={themeMode}
              showSidebarToggle={isRegistered}
            />

            {/* Page Content */}
            <Box sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                {/* Registration Route - accessible to all connected wallets */}
                <Route path="/register" element={<Registration />} />

                {/* Protected Routes - only accessible to registered users */}
                {isRegistered && userType !== null ? (
                  <>
                    <Route 
                      path="/dashboard" 
                      element={<Dashboard userType={userType} />} 
                    />
                    <Route 
                      path="/medical-records" 
                      element={<MedicalRecords />} 
                    />
                    <Route 
                      path="/prescriptions" 
                      element={<Prescriptions />} 
                    />
                    <Route 
                      path="/access-control" 
                      element={<AccessControl />} 
                    />
                    <Route 
                      path="/profile" 
                      element={<Profile />} 
                    />
                    {userType === EntityType.Government && (
                      <Route 
                        path="/analytics" 
                        element={<Analytics />} 
                      />
                    )}
                    
                    {/* Default redirect for registered users */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </>
                ) : (
                  /* Unregistered users get redirected to registration */
                  <Route path="/*" element={<Navigate to="/register" replace />} />
                )}
              </Routes>
            </Box>
          </Box>
        </Box>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={themeMode}
        />
      </Router>
    </ThemeProvider>
  );
};

export default App;