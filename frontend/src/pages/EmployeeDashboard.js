import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Stack
} from '@mui/material';
import { PersonOutline, CalendarToday, CreditCard, ArticleOutlined, MoreVert, LogoutOutlined } from '@mui/icons-material';
import api from '../api';
import { logout } from '../redux/authSlice';

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(0);
  const [salary, setSalary] = useState(0);
  const [leaves, setLeaves] = useState(0);
  const [loans, setLoans] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth.user);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userRes, attRes, salRes, leaveRes, loanRes] = await Promise.all([
        api.get('/auth/me').catch(() => ({ data: {} })),
        api.get(`/attendance/employee/${authUser?.id}`).catch(() => ({ data: [] })),
        api.get(`/salary/history/${authUser?.id}`).catch(() => ({ data: [] })),
        api.get(`/leaves/employee/${authUser?.id}`).catch(() => ({ data: [] })),
        api.get(`/loans/employee/${authUser?.id}`).catch(() => ({ data: [] }))
      ]);

      setUser(userRes.data);
      setAttendance((attRes.data || []).filter(a => a.status === 'present').length);
      setSalary((salRes.data || [])[0]?.net || 0);
      setLeaves((leaveRes.data || []).filter(l => l.status === 'approved').length);
      setLoans((loanRes.data || []).filter(l => l.status === 'approved').length);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const StatCard = ({ title, value, icon: Icon, onClick, color = '#1A365D' }) => (
    <Paper onClick={onClick} sx={{
      p: 2.5,
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      boxShadow: 'none',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      height: '110px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      '&:hover': onClick ? { transform: 'translateY(-2px)', borderColor: color, bgcolor: `${color}05` } : {}
    }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ p: 1, bgcolor: `${color}10`, borderRadius: '6px', display: 'flex' }}>
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#718096', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>{title}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A202C' }}>{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: '#F7FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* HEADER SECTION */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', minHeight: '64px' }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 0.75, bgcolor: '#1A202C', borderRadius: '6px' }}>
                <PersonOutline sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Employee Portal</Typography>
                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>Welcome back, manage your payroll and requests.</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <MoreVert sx={{ fontSize: 20 }} />
              </IconButton>
              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: '8px', mt: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' } }}>
                <MenuItem onClick={handleLogout} sx={{ color: '#E53E3E', fontWeight: 700, fontSize: '0.85rem' }}>
                  <LogoutOutlined sx={{ mr: 1, fontSize: 18 }} /> Logout
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
        {user && (
          <Paper sx={{ p: 2.5, borderRadius: '8px', border: '1px solid #E2E8F0', bgcolor: 'white', boxShadow: 'none' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>User: <span style={{ color: '#1A365D' }}>{user.name}</span></Typography>
            <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>{user.email} • {user.department} Department</Typography>
          </Paper>
        )}

        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Days" value={attendance} icon={CalendarToday} color="#3182CE" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Latest Net" value={`₹${salary.toLocaleString()}`} icon={CreditCard} color="#48BB78" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Approved Leaves" value={leaves} icon={CalendarToday} color="#ED8936" onClick={() => navigate('/employee/leaves')} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Active Loans" value={loans} icon={CreditCard} color="#9F7AEA" onClick={() => navigate('/employee/loans')} />
            </Grid>

            {/* QUICK ACTIONS */}
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ mb: 1, mt: 2, display: 'block', color: '#718096', fontWeight: 800 }}>QUICK ACTIONS</Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Request Leave', icon: CalendarToday, path: '/employee/leaves', desc: 'Manage your leave applications.', color: '#3182CE' },
                  { label: 'Apply for Loan', icon: CreditCard, path: '/employee/loans', desc: 'Submit and track loan requests.', color: '#2F855A' },
                  { label: 'My Payslips', icon: ArticleOutlined, path: '/employee/payslips', desc: 'Securely view and download payslips.', color: '#718096' }
                ].map((action, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Button
                      fullWidth
                      onClick={() => navigate(action.path)}
                      sx={{
                        p: 2.5,
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        color: action.color,
                        textTransform: 'none',
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#F8FAFC', borderColor: action.color }
                      }}
                    >
                      <Box sx={{ p: 1, bgcolor: `${action.color}10`, borderRadius: '6px', mr: 2, display: 'flex' }}>
                        <action.icon sx={{ color: action.color, fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1A202C' }}>{action.label}</Typography>
                        <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>{action.desc}</Typography>
                      </Box>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
