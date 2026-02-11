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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Chip
} from '@mui/material';
import { PersonOutline, CalendarToday, CreditCard, ArticleOutlined, MoreVert, LogoutOutlined, CheckCircle, Cancel, History, Schedule } from '@mui/icons-material';
import api from '../api';
import { logout } from '../redux/authSlice';

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [todayStatus, setTodayStatus] = useState(null);
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
    const interval = setInterval(fetchUserData, 15000);
    return () => clearInterval(interval);
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

      const allAttendance = attRes.data || [];
      setAttendance(allAttendance.filter(a => a.status === 'present').length);

      // Find today's attendance status
      const todayString = new Date().toISOString().split('T')[0];
      const todayRecord = allAttendance.find(a => a.date.startsWith(todayString));
      setTodayStatus(todayRecord ? todayRecord.status : null);

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
        <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' } }}>
          <Grid container spacing={3}>
            {/* USER PROFILE CARD */}
            <Grid item xs={12} md={7} lg={8}>
              {user && (
                <Paper sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Avatar src={user.photo} sx={{ width: 72, height: 72, bgcolor: '#1A365D', fontSize: '2rem', fontWeight: 800, border: '4px solid #F7FAFC' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A202C', letterSpacing: -0.5, mb: 0.5 }}>
                        {user.name}
                      </Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Chip label={user.role} size="small" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', bgcolor: '#EDF2F7', color: '#2D3748', border: '1px solid #E2E8F0' }} />
                        <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                          {user.email}
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
                        <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                          {user.department} Dept
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    startIcon={<PersonOutline />}
                    onClick={() => setOpenProfile(true)}
                    sx={{
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      border: '2px solid #E2E8F0',
                      color: '#2D3748',
                      px: 3,
                      py: 1,
                      '&:hover': { bgcolor: '#F7FAFC', border: '2px solid #CBD5E0', transform: 'translateY(-1px)' }
                    }}
                  >
                    View Profile
                  </Button>
                </Paper>
              )}
            </Grid>

            {/* ATTENDANCE STATUS CARD */}
            <Grid item xs={12} md={5} lg={4}>
              <Paper sx={{
                p: 3,
                height: '100%',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1A365D 0%, #2D3748 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 10px 20px -5px rgba(26, 54, 93, 0.4)'
              }}>
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.5, fontWeight: 700 }}>
                    TODAY'S STATUS
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, textTransform: 'capitalize', letterSpacing: -0.5 }}>
                    {todayStatus ? (todayStatus === 'official_leave' ? 'Official Leave' : todayStatus) : 'Not Marked'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, fontWeight: 500 }}>
                    {todayStatus === 'present' ? 'You are active.' :
                      todayStatus === 'absent' ? 'Please report to superior.' :
                        todayStatus === 'leave' || todayStatus === 'official_leave' ? 'On Leave' :
                          'Pending Check-in'}
                  </Typography>
                </Box>
                <Box sx={{
                  width: 60, height: 60,
                  borderRadius: '16px',
                  bgcolor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {todayStatus === 'present' ? <CheckCircle sx={{ fontSize: 32, color: '#68D391' }} /> :
                    todayStatus === 'absent' ? <Cancel sx={{ fontSize: 32, color: '#FC8181' }} /> :
                      todayStatus === 'halfday' ? <History sx={{ fontSize: 32, color: '#F6E05E' }} /> :
                        <Schedule sx={{ fontSize: 32, color: '#90CDF4' }} />}
                </Box>
              </Paper>
            </Grid>

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

      {/* PROFILE DIALOG */}
      <Dialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ pt: 3, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>My Profile</Typography>
          <IconButton onClick={() => setOpenProfile(false)} size="small" sx={{ bgcolor: '#F7FAFC' }}>
            <Cancel sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 4 }}>
          {user && (
            <Stack spacing={4} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar src={user.photo} sx={{ width: 100, height: 100, bgcolor: '#1A365D', fontSize: '2.5rem', fontWeight: 700, mb: 2, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A202C' }}>{user.name}</Typography>
                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 600 }}>{user.position || 'Employee'}</Typography>
                <Chip label={user.status || 'Active'} size="small" sx={{ mt: 1, bgcolor: '#C6F6D5', color: '#22543D', fontWeight: 700, borderRadius: '8px' }} />
              </Box>

              <Paper variant="outlined" sx={{ p: 0, borderRadius: '16px', overflow: 'hidden' }}>
                {[
                  { label: 'Department', value: user.department },
                  { label: 'Email Address', value: user.email },
                  { label: 'Phone Number', value: user.phone || 'Not provided' },
                  { label: 'Gender', value: user.gender, capitalize: true },
                  { label: 'Date of Joining', value: user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : 'N/A' },
                  { label: 'Base Salary', value: `₹${user.baseSalary?.toLocaleString()}` }
                ].map((item, i) => (
                  <Box key={item.label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ p: 2, bgcolor: i % 2 === 0 ? 'white' : '#F8FAFC' }}>
                      <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ color: '#1A202C', fontWeight: 700, textTransform: item.capitalize ? 'capitalize' : 'none' }}>{item.value}</Typography>
                    </Stack>
                    {i < 5 && <Divider />}
                  </Box>
                ))}
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
          <Button onClick={() => setOpenProfile(false)} sx={{ color: '#718096', fontWeight: 700, textTransform: 'none' }}>
            Close Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
