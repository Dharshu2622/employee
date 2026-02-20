import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  IconButton,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  SpaceDashboardOutlined,
  PeopleOutlined,
  MaleOutlined,
  FemaleOutlined,
  CheckCircleOutline,
  HighlightOff,
  EventAvailableOutlined,
  HistoryOutlined,
  MonetizationOnOutlined,
  AssessmentOutlined,
  WorkOutline,
  SettingsOutlined,
  AccountBalanceOutlined,
  LogoutOutlined,
  SupervisorAccountOutlined
} from '@mui/icons-material';
import api from '../api';
import { logout } from '../redux/authSlice';

const NAV_ITEMS = [
  { label: 'Overview', icon: SpaceDashboardOutlined, path: '/admin/dashboard', category: 'MAIN' },
  { label: 'Employees', icon: PeopleOutlined, path: '/admin/employees', category: 'MAIN' },
  { label: 'Superiors', icon: SupervisorAccountOutlined, path: '/admin/superiors', category: 'MAIN' },
  { label: 'Payroll', icon: MonetizationOnOutlined, path: '/admin/salary', category: 'MAIN' },
  { label: 'Attendance', icon: AssessmentOutlined, path: '/admin/attendance', category: 'REPORTING' },
  { label: 'Leaves & Requests', icon: WorkOutline, path: '/admin/requests', category: 'REPORTING' },
  { label: 'Settings', icon: SettingsOutlined, path: '/admin/settings', category: 'SYSTEM' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: { total: 0, male: 0, female: 0, superior: 0 },
    attendance: { present: 0, absent: 0, leave: 0, halfDay: 0, official_leave: 0 },
    requests: { leaves: 0, loans: 0 }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchStats();
    const pollInterval = setInterval(fetchStats, 15000);
    return () => clearInterval(pollInterval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data) {
        setStats(res.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Core sync failure:', err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const Sidebar = () => (
    <Box sx={{
      width: 260,
      flexShrink: 0,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      bgcolor: 'white',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1200
    }}>
      <Box sx={{ p: 4, pb: 6 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{
            width: 40, height: 40,
            bgcolor: theme.palette.primary.main,
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
          }}>
            <AccountBalanceOutlined sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            SalaryPro
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2, overflowY: 'auto' }}>
        {['MAIN', 'REPORTING', 'SYSTEM'].map((cat) => (
          <Box key={cat} sx={{ mb: 4 }}>
            <Typography variant="caption" sx={{ px: 2, mb: 1.5, display: 'block', color: '#94A3B8', fontWeight: 700, letterSpacing: '1px' }}>
              {cat}
            </Typography>
            <List disablePadding>
              {NAV_ITEMS.filter(item => item.category === cat).map((item) => {
                const active = location.pathname === item.path;
                return (
                  <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: '10px', py: 1.25, px: 2,
                        bgcolor: active ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                        color: active ? theme.palette.primary.main : '#64748B',
                        '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.04)', color: theme.palette.primary.main }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                        <item.icon sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.875rem' }} />
                      {active && <Box sx={{ width: 4, height: 18, bgcolor: theme.palette.primary.main, borderRadius: 2, ml: 'auto' }} />}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid #F1F5F9' }}>
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, fontSize: '0.875rem', fontWeight: 700 }}>AD</Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', noWrap: true }}>Admin Portal</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>System Administrator</Typography>
            </Box>
            <IconButton size="small" onClick={handleLogout} sx={{ color: '#EF4444' }}>
              <LogoutOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  const SummaryCard = ({ title, count, icon: Icon, color, bgColor }) => (
    <Paper sx={{
      p: 3,
      height: '100%',
      borderRadius: '16px',
      bgcolor: 'white',
      border: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' }
    }}>
      <Box sx={{
        p: 2,
        borderRadius: '50%',
        bgcolor: bgColor,
        color: color,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>{count}</Typography>
      <Typography variant="body1" sx={{ color: '#64748B', fontWeight: 600 }}>{title}</Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={40} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {!isMobile && <Sidebar />}

      <Box sx={{ flexGrow: 1, ml: isMobile ? 0 : '260px', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          p: 3, px: 4,
          bgcolor: 'white',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1100
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>Dashboard Overview</Typography>
        </Box>

        <Container maxWidth="xl" sx={{ py: 4, pb: 8 }}>

          {/* Employee Summary Section */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#334155' }}>Employee Summary</Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Total Employees" count={stats.employees.total} icon={PeopleOutlined} color="#2563EB" bgColor="#EFF6FF" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Male Employees" count={stats.employees.male} icon={MaleOutlined} color="#0EA5E9" bgColor="#E0F2FE" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Female Employees" count={stats.employees.female} icon={FemaleOutlined} color="#EC4899" bgColor="#FCE7F3" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Superior Employees" count={stats.employees.superior} icon={SupervisorAccountOutlined} color="#7C3AED" bgColor="#EDE9FE" />
            </Grid>
          </Grid>

          {/* Attendance Summary Section */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#334155' }}>Today's Attendance Summary</Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Present" count={stats.attendance.present} icon={CheckCircleOutline} color="#16A34A" bgColor="#DCFCE7" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Absent" count={stats.attendance.absent} icon={HighlightOff} color="#DC2626" bgColor="#FEE2E2" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Half Day" count={stats.attendance.halfDay} icon={HistoryOutlined} color="#F59E0B" bgColor="#FEF3C7" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard title="Official Leave" count={(stats.attendance.official_leave || 0) + (stats.attendance.leave || 0)} icon={EventAvailableOutlined} color="#6366F1" bgColor="#E0E7FF" />
            </Grid>
          </Grid>

          {/* Requests Summary Section */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#334155' }}>Requests Summary</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SummaryCard title="Total Leave Requests" count={stats.requests.leaves} icon={WorkOutline} color="#8B5CF6" bgColor="#F3E8FF" />
            </Grid>
            <Grid item xs={12} md={6}>
              <SummaryCard title="Total Loan Requests" count={stats.requests.loans} icon={MonetizationOnOutlined} color="#F97316" bgColor="#FFEDD5" />
            </Grid>
          </Grid>

        </Container>
      </Box>
    </Box>
  );
}
