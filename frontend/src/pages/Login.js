import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Stack,
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  Email,
  Person,
  Stars,
  AdminPanelSettings,
  Shield,
  ReportProblemOutlined,
  CheckCircle,
  AccountTreeOutlined,
  VerifiedUser,
  Storage,
  Groups,
  Rule,
  Timeline,
  AccountBalanceWallet,
  AssignmentTurnedIn,
  RequestQuote
} from '@mui/icons-material';
import api from '../api';
import { loginSuccess } from '../redux/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin');
  const [loading, setLoadingState] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('error');
  const [showSnack, setShowSnack] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [openRecovery, setOpenRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const checkCapsLock = (e) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setMessage('Enterprise email required');
      setSeverity('error');
      setShowSnack(true);
      return;
    }

    if (password.length < 6) {
      setMessage('Invalid credentials format');
      setSeverity('error');
      setShowSnack(true);
      return;
    }

    setLoadingState(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(loginSuccess(response.data));
      setMessage('Authenticated successfully');
      setSeverity('success');
      setShowSnack(true);

      const userRole = response.data.user?.role;
      setTimeout(() => {
        if (userRole === 'admin') navigate('/admin/dashboard');
        else if (userRole === 'superior') navigate('/superior/dashboard');
        else navigate('/employee/dashboard');
      }, 800);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Authentication failed');
      setSeverity('error');
      setShowSnack(true);
    } finally {
      setLoadingState(false);
    }
  };

  const handleAccessRecovery = (e) => {
    e.preventDefault();
    setOpenRecovery(true);
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

  const roleConfigs = {
    admin: {
      title: 'Global Administration',
      subtitle: 'System core management and infrastructure control.',
      points: [
        { icon: <Storage sx={{ color: '#3182CE' }} />, title: 'Infrastucture Control', desc: 'Secure database management & scaling.' },
        { icon: <Shield sx={{ color: '#3182CE' }} />, title: 'Access Auditing', desc: 'Full traceability of system-wide actions.' },
        { icon: <Rule sx={{ color: '#3182CE' }} />, title: 'Security Protocols', desc: 'Military-grade encryption standards.' }
      ]
    },
    superior: {
      title: 'Management Operations',
      subtitle: 'Oversee departmental growth and team productivity.',
      points: [
        { icon: <Groups sx={{ color: '#3182CE' }} />, title: 'Team Oversight', desc: 'Manage assignments & performance.' },
        { icon: <AssignmentTurnedIn sx={{ color: '#3182CE' }} />, title: 'Reqest Approval', desc: 'Streamlined validation workflow.' },
        { icon: <Timeline sx={{ color: '#3182CE' }} />, title: 'Analytics Engine', desc: 'Visual representation of departmental stats.' }
      ]
    },
    employee: {
      title: 'Member Financial Hub',
      subtitle: 'Secure access to your personal financial records.',
      points: [
        { icon: <AccountBalanceWallet sx={{ color: '#3182CE' }} />, title: 'Earnings Ledger', desc: 'Transparent history of your compensation.' },
        { icon: <AccountTreeOutlined sx={{ color: '#3182CE' }} />, title: 'Attendance Record', desc: 'Personalized tracking of work hours.' },
        { icon: <RequestQuote sx={{ color: '#3182CE' }} />, title: 'Resource Access', desc: 'Apply for loans and other benefits.' }
      ]
    }
  };

  const currentConfig = roleConfigs[role];

  const RoleOption = ({ type, icon: Icon, label }) => (
    <Box
      onClick={() => setRole(type)}
      sx={{
        flex: 1,
        p: 1.5,
        cursor: 'pointer',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: role === type ? theme.palette.primary.main : '#E2E8F0',
        background: role === type ? '#F8FAFC' : 'white',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'center',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          background: '#F8FAFC',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Icon sx={{ color: role === type ? theme.palette.primary.main : '#94A3B8', fontSize: '1.2rem', mb: 0.5 }} />
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: role === type ? theme.palette.primary.main : '#64748B', fontSize: '0.65rem' }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      background: '#F7FAFC',
      overflow: 'hidden'
    }}>
      <Grid container sx={{ height: '100%' }}>
        {/* SIDE SECTION - DYNAMIC & ANIMATED */}
        {!isMobile && (
          <Grid item md={6} lg={7} sx={{
            background: '#1A202C',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 10,
            color: 'white',
            position: 'relative'
          }}>
            <Fade in={true} key={role} timeout={600}>
              <Stack spacing={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Shield sx={{ fontSize: 28, color: '#3182CE' }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5, color: '#CBD5E0' }}>
                    SalaryPro <span style={{ fontWeight: 400, color: '#718096' }}>Enterprise</span>
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -1, mb: 1.5 }}>
                    {currentConfig.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#A0AEC0', fontWeight: 300, maxWidth: '400px' }}>
                    {currentConfig.subtitle}
                  </Typography>
                </Box>

                <Stack spacing={2.5}>
                  {currentConfig.points.map((item, i) => (
                    <Grow in={true} key={`${role}-${i}`} timeout={(i + 1) * 300}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {item.icon}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#718096' }}>{item.desc}</Typography>
                        </Box>
                      </Box>
                    </Grow>
                  ))}
                </Stack>
              </Stack>
            </Fade>

            {/* Subtle Corporate Background Decoration */}
            <Box sx={{
              position: 'absolute', bottom: 40, right: 40, opacity: 0.1, pointerEvents: 'none'
            }}>
              <Box sx={{ width: 300, height: 300, border: '40px solid #cbd5e0', borderRadius: '50%', filter: 'blur(20px)' }} />
            </Box>
          </Grid>
        )}

        {/* LOGIN FORM SECTION */}
        <Grid item xs={12} md={6} lg={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, background: 'white' }}>
          <Stack spacing={5} sx={{ width: '100%', maxWidth: '360px' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A202C', letterSpacing: -1 }}>
                Authorize Access
              </Typography>
              <Typography variant="body2" sx={{ color: '#718096', mt: 1 }}>
                Please select your mode and sign in.
              </Typography>
            </Box>

            <Stack spacing={4}>
              <Box>
                <Typography variant="caption" sx={{ mb: 1.5, display: 'block', color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Interface Mode
                </Typography>
                <Stack direction="row" spacing={1}>
                  <RoleOption type="admin" icon={AdminPanelSettings} label="Admin" />
                  <RoleOption type="superior" icon={Stars} label="Superior" />
                  <RoleOption type="employee" icon={Person} label="Member" />
                </Stack>
              </Box>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Work Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email sx={{ color: '#A0AEC0', fontSize: 20 }} /></InputAdornment>
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                />

                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Credential Key"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={checkCapsLock}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#A0AEC0', fontSize: 20 }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                  />
                  {isCapsLockOn && (
                    <Typography variant="caption" sx={{ color: '#ED8936', fontWeight: 600, position: 'absolute', right: 0, mt: 0.5 }}>
                      Caps Lock Active
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <FormControlLabel
                    control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} size="small" />}
                    label={<Typography variant="caption" sx={{ color: '#4A5568', fontWeight: 500 }}>Remember Device</Typography>}
                  />
                  <Link
                    href="#"
                    onClick={handleAccessRecovery}
                    sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#3182CE', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Access Recovery
                  </Link>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleLogin}
                  disabled={loading}
                  sx={{
                    py: 1.8,
                    borderRadius: '6px',
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    background: '#1A202C',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': { background: '#2D3748', boxShadow: 'none', transform: 'translateY(-1px)' }
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Identity'}
                </Button>
              </Stack>

              <Box sx={{ pt: 2, textAlign: 'center' }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={fillDemoCredentials}
                  sx={{ color: '#CBD5E0', fontSize: '0.65rem', '&:hover': { background: 'transparent', color: '#718096' } }}
                >
                  Load Simulation Data
                </Button>
              </Box>
            </Stack>

            <Box sx={{ mt: 'auto', textAlign: 'center', pt: 4 }}>
              <Typography variant="caption" sx={{ color: '#E2E8F0', fontSize: '0.7rem' }}>
                © 2026 SalaryPro Ecosystem. All rights reserved.
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* ACCESS RECOVERY DIALOG */}
      <Dialog
        open={openRecovery}
        onClose={() => setOpenRecovery(false)}
        PaperProps={{ sx: { borderRadius: '12px', p: 1, maxWidth: '400px' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1A202C' }}>
          Access Recovery Portal
        </DialogTitle>
        <DialogContent>
          {recoveryStep === 1 ? (
            <Typography variant="body2" sx={{ color: '#4A5568', mb: 2 }}>
              For security reasons, salary management accounts require manual verification. Please contact your internal System Administrator or HR department to initiate a credential reset.
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: '#4A5568', mb: 2 }}>
              A request has been logged. Your department head will be notified for identity verification. Please await further instructions via your secure work email.
            </Typography>
          )}
          <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mb: 1 }}>System Reference:</Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#718096' }}>SEC-UUID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRecovery(false)} sx={{ color: '#718096', textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => recoveryStep === 1 ? setRecoveryStep(2) : setOpenRecovery(false)}
            sx={{ bgcolor: '#1A202C', textTransform: 'none', borderRadius: '6px', '&:hover': { bgcolor: '#2D3748' } }}
          >
            {recoveryStep === 1 ? 'Initiate Request' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={severity} variant="filled" sx={{ borderRadius: '4px', fontSize: '0.8rem' }}>{message}</Alert>
      </Snackbar>
    </Box>
  );
}
