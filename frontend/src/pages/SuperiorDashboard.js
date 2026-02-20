import React, { useState, useEffect } from 'react';
import {
    PendingActions,
    VerifiedUser,
    HighlightOff,
    EventAvailableOutlined,
    PersonOutline,
    Groups,
    CheckCircle,
    History,
    Assignment,
    AccountBalanceWallet,
    Stars,
    Logout
} from '@mui/icons-material';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    IconButton,
    Stack,
    Button,
    useTheme,
    Avatar,
    Divider,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const StatCard = ({ title, value, icon, color, gradient }) => (
    <Card sx={{
        height: '100%',
        borderRadius: '20px',
        background: gradient || 'white',
        color: gradient ? 'white' : 'inherit'
    }}>
        <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    background: gradient ? 'rgba(255,255,255,0.2)' : `${color}15`,
                    color: gradient ? 'white' : color
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="body2" sx={{ opacity: gradient ? 0.8 : 0.6, fontWeight: 600 }}>{title}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

const QuickAction = ({ title, icon, onClick, color }) => (
    <Button
        fullWidth
        onClick={onClick}
        sx={{
            p: 3,
            borderRadius: '20px',
            border: '1px solid #eef2f6',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.05)',
                background: '#fff',
                borderColor: color
            }
        }}
    >
        <Box sx={{
            p: 1.5,
            borderRadius: '120px',
            background: `${color}15`,
            color: color
        }}>
            {icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a202c' }}>{title}</Typography>
    </Button>
);

export default function SuperiorDashboard() {
    const [summary, setSummary] = useState(null);
    const [user, setUser] = useState(null);
    const [openProfile, setOpenProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [summaryRes, userRes] = await Promise.all([
                api.get('/attendance/summary/today'),
                api.get('/auth/me')
            ]);
            setSummary(summaryRes.data);
            setUser(userRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (loading) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ background: '#f8fafc', minHeight: '100vh', pb: 10 }}>
            {/* Header section with gradient */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                pt: 8,
                pb: 12,
                borderRadius: '0 0 40px 40px'
            }}>
                <Container maxWidth="xl">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>Superior Hub</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.7 }}>Welcome back to your management dashboard.</Typography>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                variant="outlined"
                                startIcon={<PersonOutline />}
                                onClick={() => setOpenProfile(true)}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    textTransform: 'none',
                                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                View Profile
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Logout />}
                                onClick={handleLogout}
                                sx={{
                                    color: '#f87171',
                                    borderColor: 'rgba(248, 113, 113, 0.3)',
                                    textTransform: 'none',
                                    '&:hover': { borderColor: '#f87171', bgcolor: 'rgba(248, 113, 113, 0.1)' }
                                }}
                            >
                                Logout
                            </Button>
                            <Avatar src={user?.photo} sx={{ width: 60, height: 60, border: '4px solid rgba(255,255,255,0.1)', bgcolor: '#7C3AED', fontWeight: 700 }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : <Stars />}
                            </Avatar>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: -8 }}>
                <Grid container spacing={3}>
                    {/* Real-time Summary Stat Cards */}
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Total Employees"
                            value={summary?.totalEmployees || 0}
                            icon={<Groups />}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Present Today"
                            value={summary?.present || 0}
                            icon={<CheckCircle />}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Absent Today"
                            value={summary?.absent || 0}
                            icon={<HighlightOff />}
                            color="#EF4444"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <StatCard
                            title="Half Day Leave"
                            value={summary?.halfday || 0}
                            icon={<History />}
                            color="#F59E0B"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <StatCard
                            title="Official Leave"
                            value={(summary?.official_leave || 0) + (summary?.leave || 0)}
                            icon={<EventAvailableOutlined />}
                            color="#6366F1"
                        />
                    </Grid>

                    {/* Quick Actions */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, borderRadius: '24px', boxShadow: '0 10px 30px rgba(112, 144, 176, 0.08)' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4 }}>Operations Management</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <QuickAction
                                        title="Attendance Registry"
                                        icon={<Assignment />}
                                        color="#6366f1"
                                        onClick={() => navigate('/superior/attendance')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <QuickAction
                                        title="Leave Approvals"
                                        icon={<PendingActions />}
                                        color="#ec4899"
                                        onClick={() => navigate('/superior/leaves')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <QuickAction
                                        title="Loan Agreements"
                                        icon={<VerifiedUser />}
                                        color="#8b5cf6"
                                        onClick={() => navigate('/superior/loans')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <QuickAction
                                        title="Payroll Processing"
                                        icon={<AccountBalanceWallet />}
                                        color="#10b981"
                                        onClick={() => navigate('/superior/payroll')}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                </Grid>
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
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Superior Profile</Typography>
                    <IconButton onClick={() => setOpenProfile(false)} size="small" sx={{ bgcolor: '#F7FAFC' }}>
                        <HighlightOff sx={{ fontSize: 20 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 4 }}>
                    {user && (
                        <Stack spacing={4} sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <Avatar src={user.photo} sx={{ width: 100, height: 100, bgcolor: '#7C3AED', fontSize: '2.5rem', fontWeight: 700, mb: 2, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A202C' }}>{user.name}</Typography>
                                <Typography variant="body1" sx={{ color: '#718096', fontWeight: 600 }}>{user.position || 'Superior'}</Typography>
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
