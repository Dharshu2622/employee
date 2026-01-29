import React, { useState, useEffect } from 'react';
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
    CircularProgress
} from '@mui/material';
import {
    Groups,
    CheckCircle,
    Cancel,
    History,
    TrendingUp,
    Assignment,
    AccountBalanceWallet,
    Settings,
    Notifications,
    Stars,
    PendingActions,
    VerifiedUser
} from '@mui/icons-material';
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
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const resp = await api.get('/attendance/summary/today');
            setSummary(resp.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                        <Avatar sx={{ width: 60, height: 60, border: '4px solid rgba(255,255,255,0.1)' }}>
                            <Stars />
                        </Avatar>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: -8 }}>
                <Grid container spacing={3}>
                    {/* Real-time Summary Stat Cards */}
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Total Employees"
                            value={summary?.totalEmployees || 0}
                            icon={<Groups />}
                            color="#3b82f6"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Present Today"
                            value={summary?.present || 0}
                            icon={<CheckCircle />}
                            color="#10b981"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Half Day / Leave"
                            value={(summary?.halfday || 0) + (summary?.leave || 0)}
                            icon={<History />}
                            color="#f59e0b"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <StatCard
                            title="Attendance Rate"
                            value={`${(((summary?.present || 0) / (summary?.totalEmployees || 1)) * 100).toFixed(1)}%`}
                            icon={<TrendingUp />}
                            gradient="linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)"
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

                    {/* Pending Alerts / Notifications */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ borderRadius: '24px', height: '100%' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>System Integrity Alerts</Typography>
                                    <IconButton><Notifications color="primary" /></IconButton>
                                </Stack>
                                <Divider sx={{ mb: 3 }} />
                                <Stack spacing={2}>
                                    <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, borderRadius: '12px', borderStyle: 'dashed' }}>
                                        <Box sx={{ p: 1, height: 'fit-content', borderRadius: '8px', background: '#fee2e2', color: '#ef4444' }}><Cancel /></Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Salary Audit Pending</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>Month: January 2026. 12 employees require processing.</Typography>
                                        </Box>
                                    </Paper>
                                    <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 2, borderRadius: '12px', borderStyle: 'dashed' }}>
                                        <Box sx={{ p: 1, height: 'fit-content', borderRadius: '8px', background: '#dcfce7', color: '#22c55e' }}><CheckCircle /></Box>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Attendance Finalized</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>Daily records for Yesterday have been verified and sealed.</Typography>
                                        </Box>
                                    </Paper>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Card sx={{ borderRadius: '24px', height: '100%', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: 'white' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Resource Statistics</Typography>
                                <Typography variant="body2" sx={{ mb: 4, opacity: 0.8 }}>Departmental efficiency and financial health metrics.</Typography>

                                <Stack spacing={3}>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700 }}>Budget Utilization</Typography>
                                            <Typography variant="caption">74%</Typography>
                                        </Stack>
                                        <Box sx={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
                                            <Box sx={{ width: '74%', height: '100%', background: 'white', borderRadius: 3 }} />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700 }}>Team Productivity</Typography>
                                            <Typography variant="caption">92%</Typography>
                                        </Stack>
                                        <Box sx={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
                                            <Box sx={{ width: '92%', height: '100%', background: 'white', borderRadius: 3 }} />
                                        </Box>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
