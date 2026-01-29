import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    Button,
    Stack,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import { Save, CheckCircle, Groups, History, Info } from '@mui/icons-material';
import api from '../api';

export default function SuperiorAttendance() {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showSnack, setShowSnack] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [empResp, summResp] = await Promise.all([
                api.get('/admin/employees'),
                api.get('/attendance/summary/today')
            ]);
            setEmployees(empResp.data);
            setSummary(summResp.data);

            // Initialize attendance state with defaults
            const initialAttendance = {};
            empResp.data.forEach(emp => {
                initialAttendance[emp._id] = {
                    status: 'present',
                    remarks: ''
                };
            });
            setAttendance(initialAttendance);
        } catch (err) {
            console.error(err);
            setMessage('Failed to fetch data');
            setShowSnack(true);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (empId, status) => {
        setAttendance(prev => ({
            ...prev,
            [empId]: { ...prev[empId], status }
        }));
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const promises = Object.entries(attendance).map(([empId, data]) =>
                api.post('/attendance', {
                    employee: empId,
                    date: today,
                    status: data.status,
                    remarks: data.remarks
                }).catch(err => {
                    if (err.response?.status === 400) return null; // Already marked
                    throw err;
                })
            );

            await Promise.all(promises);
            setMessage('Attendance updated successfully');
            setShowSnack(true);
            fetchData(); // Refresh summary
        } catch (err) {
            setMessage('Some records could not be saved');
            setShowSnack(true);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ background: '#f8fafc', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="xl">
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a202c' }}>Attendance Registry</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Authorized daily marking for all departmental personnel.</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={saveAttendance}
                        disabled={saving}
                        sx={{ borderRadius: '12px', px: 4, py: 1.5, background: '#1e293b' }}
                    >
                        {saving ? 'Processing...' : 'Finalize Registry'}
                    </Button>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#e0f2fe', color: '#0369a1' }}><Groups /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Total Employees</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{summary?.totalEmployees || 0}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#dcfce7', color: '#15803d' }}><CheckCircle /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Present</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{summary?.present || 0}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#fef3c7', color: '#b45309' }}><History /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Half Day/Leave</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{(summary?.halfday || 0) + (summary?.leave || 0)}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#f1f5f9', color: '#475569' }}><Info /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Official Leave</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{summary?.official_leave || 0}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Attendance Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Current Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.filter(emp => emp.role === 'employee').map((emp) => (
                                <TableRow key={emp._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{emp.name}</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>{emp.email}</Typography>
                                    </TableCell>
                                    <TableCell>{emp.department}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{emp.role}</TableCell>
                                    <TableCell>
                                        <Select
                                            size="small"
                                            value={attendance[emp._id]?.status || 'present'}
                                            onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                                            sx={{ borderRadius: '8px', minWidth: 150 }}
                                        >
                                            <MenuItem value="present">Present</MenuItem>
                                            <MenuItem value="absent">Absent</MenuItem>
                                            <MenuItem value="halfday">Half Day</MenuItem>
                                            <MenuItem value="leave">Leave</MenuItem>
                                            <MenuItem value="official_leave">Official Leave</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        {emp.status === 'active' ? (
                                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#dcfce7', color: '#15803d', borderRadius: '20px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 700 }}>
                                                Active
                                            </Box>
                                        ) : (
                                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#fee2e2', color: '#b91c1c', borderRadius: '20px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 700 }}>
                                                {emp.status}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
            <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)}>
                <Alert severity={message.includes('success') ? 'success' : 'error'} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
