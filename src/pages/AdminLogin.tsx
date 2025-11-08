import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AdminLogin: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('admin_token', response.access_token);
      localStorage.setItem('admin_user', credentials.username);
      navigate('/adddmin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: isMobile ? 2 : 3
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={isMobile ? 1 : 3}
            sx={{
              padding: isMobile ? 3 : 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: isMobile ? '100%' : 400
            }}
          >
            <Box
              sx={{
                width: isMobile ? 50 : 60,
                height: isMobile ? 50 : 60,
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Lock sx={{ color: 'white', fontSize: isMobile ? 24 : 28 }} />
            </Box>
            
            <Typography 
              component="h1" 
              variant={isMobile ? "h5" : "h4"} 
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              Admin Login
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3, textAlign: 'center', px: isMobile ? 1 : 0 }}
            >
              Access the Akshayam Wellness Admin Panel
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus={!isMobile} // Don't auto-focus on mobile to prevent keyboard popup
                value={credentials.username}
                onChange={handleChange}
                disabled={loading}
                size={isMobile ? "medium" : "medium"}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
                size={isMobile ? "medium" : "medium"}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size={isMobile ? "large" : "large"}
                sx={{ 
                  py: isMobile ? 1.8 : 1.5,
                  fontSize: isMobile ? '1rem' : '0.875rem',
                  fontWeight: 'bold'
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={isMobile ? 20 : 24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Mobile-friendly back button */}
            {isMobile && (
              <Button
                variant="text"
                onClick={() => navigate('/')}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                ← Back to Website
              </Button>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminLogin;
