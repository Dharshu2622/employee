import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Dashboard, People, AttachMoney, Assignment, MoreVert, ArrowBack, Logout } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDispatch } from 'react-redux';
import api from '../api';
import { logout } from '../redux/authSlice';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);
  const [loans, setLoans] = useState(0);
  const [leaves, setLeaves] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [empRes, salRes, loanRes, leaveRes] = await Promise.all([
        api.get('/admin/employees').catch(() => ({ data: [] })),
        api.get('/salary/all').catch(() => ({ data: [] })),
        api.get('/loans/all').catch(() => ({ data: [] })),
        api.get('/leaves/all').catch(() => ({ data: [] }))
      ]);

      setEmployees(empRes.data.length);
      const total = (salRes.data || []).reduce((sum, s) => sum + (s.net || 0), 0);
      setTotalSalary(total);
      setLoans((loanRes.data || []).length);
      setLeaves((leaveRes.data || []).filter(l => l.status === 'pending').length);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ 
      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`, 
      borderRadius: '18px', 
      border: `2.5px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 16px 40px ${color}40`,
        border: `2.5px solid ${color}`
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${color}05 0%, transparent 100%)`,
        pointerEvents: 'none'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.95rem', fontWeight: '600', color: '#666' }}>{title}</Typography>
            <Typography variant="h5" sx={{ fontWeight: '800', color, fontSize: '2rem' }}>{value}</Typography>
          </Box>
          <Box sx={{ fontSize: '50px', opacity: 0.8 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e0c3fc 100%)', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Toolbar>
          <Dashboard sx={{ mr: 2, fontSize: 32, animation: 'pulse 2s infinite' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>📊 Admin Dashboard</Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: '600' }}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Employees" value={employees} icon="👥" color="#667eea" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Monthly Salary" value={`₹${totalSalary.toLocaleString()}`} icon="💰" color="#22c55e" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Pending Loans" value={loans} icon="💳" color="#f59e0b" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Pending Leaves" value={leaves} icon="📅" color="#ef4444" />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.9) 100%)', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: '800', color: '#333' }}>📈 Salary Trend</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[{ month: 'Jan', salary: 50000 }, { month: 'Feb', salary: 52000 }, { month: 'Mar', salary: 51000 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0ff" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="salary" stroke="#667eea" strokeWidth={3} dot={{ fill: '#667eea', r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.9) 100%)', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)', backdropFilter: 'blur(10px)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: '800', color: '#333' }}>📊 Attendance Stats</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: 'Present', value: 95 }, { name: 'Absent', value: 3 }, { name: 'Leave', value: 2 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0ff" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" fill="#667eea" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '18px', 
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
              border: '2px solid #667eea30',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #667eea'
              } 
            }} onClick={() => navigate('/admin/employees')}>
              <Typography variant="body2" sx={{ color: '#667eea', fontWeight: '800', fontSize: '1rem' }}>👨‍💼 Manage Employees</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '18px', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #8b5cf610 0%, #7c3aed10 100%)',
              border: '2px solid #8b5cf630',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(139, 92, 246, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #8b5cf6'
              }
            }} onClick={() => navigate('/admin/requests')}>
              <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: '800', fontSize: '1rem' }}>📋 Manage Requests</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '18px', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #22c55e10 0%, #16a34a10 100%)',
              border: '2px solid #22c55e30',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(34, 197, 94, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #22c55e'
              }
            }} onClick={() => navigate('/admin/attendance')}>
              <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: '800', fontSize: '1rem' }}>📋 Attendance</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '18px', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #f59e0b10 0%, #d97706 10 100%)',
              border: '2px solid #f59e0b30',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(245, 158, 11, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #f59e0b'
              }
            }} onClick={() => navigate('/admin/salary')}>
              <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: '800', fontSize: '1rem' }}>💸 Salary</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              borderRadius: '18px', 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #ef444410 0%, #dc262610 100%)',
              border: '2px solid #ef444430',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 32px rgba(239, 68, 68, 0.3)',
                transform: 'translateY(-6px)',
                border: '2px solid #ef4444'
              }
            }} onClick={() => navigate('/admin/payslips')}>
              <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: '800', fontSize: '1rem' }}>📄 Payslips</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
