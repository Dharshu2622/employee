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
  IconButton
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

  const StatCard = ({ title, value, icon, onClick }) => (
    <Card onClick={onClick} sx={{ 
      borderRadius: '18px', 
      cursor: onClick ? 'pointer' : 'default', 
      background: 'linear-gradient(135deg, #667eea15 0%, #764ba210 100%)',
      border: '2.5px solid #667eea',
      transition: 'all 0.3s ease',
      '&:hover': { 
        boxShadow: onClick ? '0 16px 40px rgba(102, 126, 234, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
        transform: onClick ? 'translateY(-8px)' : 'none'
      } 
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom sx={{ fontWeight: '600', fontSize: '0.95rem' }}>{title}</Typography>
            <Typography variant="h5" sx={{ fontWeight: '800', color: '#667eea', fontSize: '1.8rem' }}>{value}</Typography>
          </Box>
          <Box sx={{ fontSize: '45px' }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e0c3fc 100%)', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Toolbar>
          <PersonOutline sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>👤 Employee Dashboard</Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: '600' }}>
              <LogoutOutlined sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {user && (
          <Paper sx={{ 
            p: 3.5, 
            mb: 4, 
            borderRadius: '18px', 
            background: 'linear-gradient(135deg, #667eea20 0%, #764ba215 100%)',
            border: '2px solid #667eea',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: '800', fontSize: '1.3rem' }}>Welcome, <strong sx={{ color: '#667eea' }}>{user.name}</strong>! 👋</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontSize: '0.95rem' }}>✉️ {user.email} • 🏢 {user.department}</Typography>
          </Paper>
        )}

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Attendance" value={`${attendance} days`} icon="📋" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Latest Salary" value={`₹${salary.toLocaleString()}`} icon="💰" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Approved Leaves" value={leaves} icon="📅" onClick={() => navigate('/employee/leaves')} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Active Loans" value={loans} icon="💳" onClick={() => navigate('/employee/loans')} />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3.5, 
              borderRadius: '18px', 
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
              border: '2px solid #667eea30',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #667eea'
              }, 
              textAlign: 'center' 
            }} onClick={() => navigate('/employee/leaves')}>
              <CalendarToday sx={{ fontSize: 45, color: '#667eea', mb: 1.5 }} />
              <Typography variant="body2" sx={{ fontWeight: '800', fontSize: '1rem', color: '#333' }}>📋 Request Leave</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3.5, 
              borderRadius: '18px', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #22c55e10 0%, #16a34a10 100%)',
              border: '2px solid #22c55e30',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(34, 197, 94, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #22c55e'
              },
              textAlign: 'center' 
            }} onClick={() => navigate('/employee/loans')}>
              <CreditCard sx={{ fontSize: 45, color: '#22c55e', mb: 1.5 }} />
              <Typography variant="body2" sx={{ fontWeight: '800', fontSize: '1rem', color: '#333' }}>💳 Apply Loan</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3.5, 
              borderRadius: '18px', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #f59e0b10 0%, #d97706 10 100%)',
              border: '2px solid #f59e0b30',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(245, 158, 11, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #f59e0b'
              },
              textAlign: 'center' 
            }} onClick={() => navigate('/employee/payslips')}>
              <ArticleOutlined sx={{ fontSize: 45, color: '#f59e0b', mb: 1.5 }} />
              <Typography variant="body2" sx={{ fontWeight: '800', fontSize: '1rem', color: '#333' }}>📄 View Payslips</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
