import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email } from '@mui/icons-material';
import api from '../api';
import { loginSuccess, setLoading, loginFailure } from '../redux/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin');
  const [loading, setLoadingState] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error');
  const [showSnack, setShowSnack] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setMessage('Please enter a valid email');
      setSeverity('error');
      setShowSnack(true);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setSeverity('error');
      setShowSnack(true);
      return;
    }

    setLoadingState(true);
    try {
      const response = await api.post('/auth/login', { email, password });

      dispatch(loginSuccess(response.data));
      setMessage('Login successful!');
      setSeverity('success');
      setShowSnack(true);

      const userRole = response.data.user?.role;
      setTimeout(() => {
        if (userRole === 'admin') navigate('/admin/dashboard');
        else if (userRole === 'superior') navigate('/superior/dashboard');
        else navigate('/employee/dashboard');
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
      setSeverity('error');
      setShowSnack(true);
    } finally {
      setLoadingState(false);
    }
  };

  const fillDemoCredentials = () => {
    if (role === 'admin') {
      setEmail('admin@company.com');
      setPassword('admin123');
    } else if (role === 'superior') {
      setEmail('superior@company.com');
      setPassword('superior123');
    } else {
      setEmail('john@company.com');
      setPassword('employee123');
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 50%, rgba(102,126,234,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper elevation={8} sx={{ 
          p: 5, 
          borderRadius: '25px', 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: '800', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              💼 Salary Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#999', fontWeight: 500 }}>
              Smart Employee Portal
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={role === 'admin' ? 'contained' : 'outlined'}
                onClick={() => setRole('admin')}
                sx={{ 
                  borderRadius: '12px', 
                  py: 1.5,
                  fontWeight: 'bold',
                  background: role === 'admin' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  border: role === 'admin' ? 'none' : '2px solid #667eea',
                  color: role === 'admin' ? 'white' : '#667eea',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: role === 'admin' ? '0 8px 16px rgba(102, 126, 234, 0.4)' : 'none',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                👨‍💼 Admin
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={role === 'superior' ? 'contained' : 'outlined'}
                onClick={() => setRole('superior')}
                sx={{ 
                  borderRadius: '12px', 
                  py: 1.5,
                  fontWeight: 'bold',
                  background: role === 'superior' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  border: role === 'superior' ? 'none' : '2px solid #667eea',
                  color: role === 'superior' ? 'white' : '#667eea',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: role === 'superior' ? '0 8px 16px rgba(102, 126, 234, 0.4)' : 'none',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                ⭐ Superior
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={role === 'employee' ? 'contained' : 'outlined'}
                onClick={() => setRole('employee')}
                sx={{ 
                  borderRadius: '12px', 
                  py: 1.5,
                  fontWeight: 'bold',
                  background: role === 'employee' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                  border: role === 'employee' ? 'none' : '2px solid #667eea',
                  color: role === 'employee' ? 'white' : '#667eea',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: role === 'employee' ? '0 8px 16px rgba(102, 126, 234, 0.4)' : 'none',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                👤 Employee
              </Button>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            placeholder="Enter your email"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Email sx={{ color: '#667eea' }} /></InputAdornment>
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: '#f8f9ff',
                transition: 'all 0.3s ease',
                '& fieldset': { borderColor: '#e0e0ff', borderWidth: '2px' },
                '&:hover fieldset': { borderColor: '#667eea', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)' },
                '&.Mui-focused fieldset': { borderColor: '#667eea', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            placeholder="Enter your password"
            InputProps={{
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#667eea' }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#667eea' }}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                background: '#f8f9ff',
                transition: 'all 0.3s ease',
                '& fieldset': { borderColor: '#e0e0ff', borderWidth: '2px' },
                '&:hover fieldset': { borderColor: '#667eea', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)' },
                '&.Mui-focused fieldset': { borderColor: '#667eea', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)' }
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{ 
              mt: 4, 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              py: 1.8, 
              fontWeight: '800',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.6)'
              },
              '&:disabled': {
                background: '#ccc'
              }
            }}
          >
            {loading ? '⏳ Logging in...' : '🚀 Login'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={fillDemoCredentials}
            sx={{ 
              mt: 2, 
              color: '#667eea',
              fontWeight: '600',
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(102, 126, 234, 0.05)'
              }
            }}
          >
            ⭐ Try Demo Credentials
          </Button>

          <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert severity={severity} sx={{ borderRadius: '10px' }}>{message}</Alert>
          </Snackbar>
        </Paper>
      </Container>
    </Box>
  );
}
