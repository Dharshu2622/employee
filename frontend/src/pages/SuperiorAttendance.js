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
    CardContent,
    TextField,
    Chip
} from '@mui/material';
import { Save, CheckCircle, Groups, History, Info, HighlightOff } from '@mui/icons-material';
import api from '../api';

export default function SuperiorAttendance() {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showSnack, setShowSnack] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        // Don't show full loading spinner on date change, maybe just overlay?
        // But for simplicity, we can show generic loading or just keep old data until new arrives.
        // Let's keep loading=true to avoid state mismatch.
        setLoading(true);
        try {
            const [empResp, summResp, attResp] = await Promise.all([
                api.get('/admin/employees'),
                api.get(`/attendance/summary?date=${selectedDate}`),
                api.get(`/attendance/by-date?date=${selectedDate}`)
            ]);
            setEmployees(empResp.data);
            setSummary(summResp.data);

            // Initialize attendance state with defaults
            const newAttendance = {};

            // 1. Set default 'present' for all employees
            empResp.data.filter(e => e.role === 'employee').forEach(emp => {
                newAttendance[emp._id] = {
                    status: 'present',
                    remarks: ''
                };
            });

            // 2. Override with fetched attendance data
            attResp.data.forEach(record => {
                if (!record.employee) return;
                const empId = typeof record.employee === 'object' ? record.employee._id : record.employee;
                if (newAttendance[empId]) {
                    newAttendance[empId] = {
                        status: record.status,
                        remarks: record.remarks || ''
                    };
                }
            });

            setAttendance(newAttendance);
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
            const promises = Object.entries(attendance).map(([empId, data]) =>
                api.post('/attendance', {
                    employee: empId,
                    date: selectedDate,
                    status: data.status,
                    remarks: data.remarks
                })
            );

            await Promise.all(promises);
            setMessage('Attendance updated successfully');
            setShowSnack(true);
            fetchData(); // Refresh summary
        } catch (err) {
            console.error(err);
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
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4, gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a202c', mb: 1 }}>Attendance Registry</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Authorized daily marking for all departmental personnel.</Typography>
                    </Box>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            type="date"
                            label="Select Date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: 'white', borderRadius: '12px', '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={saveAttendance}
                            disabled={saving}
                            sx={{ borderRadius: '12px', px: 4, py: 1.5, background: '#1e293b', textTransform: 'none', fontWeight: 700 }}
                        >
                            {saving ? 'Processing...' : 'Finalize Registry'}
                        </Button>
                    </Stack>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#e0f2fe', color: '#0369a1' }}><Groups /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Total Employees</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{summary?.totalEmployees || 0}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#dcfce7', color: '#15803d' }}><CheckCircle /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Present</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{summary?.present || 0}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#fee2e2', color: '#b91c1c' }}><HighlightOff /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Absent</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{summary?.absent || 0}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#fef3c7', color: '#b45309' }}><History /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Half Day/Leave</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{(summary?.halfday || 0) + (summary?.leave || 0)}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#f1f5f9', color: '#475569' }}><Info /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Official Leave</Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>{summary?.official_leave || 0}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Employee Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Attendance Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Current Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {employees.filter(emp => emp.role === 'employee').map((emp) => (
                                <TableRow key={emp._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>{emp.email}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: '#334155' }}>{emp.department}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize', color: '#334155' }}>{emp.role}</TableCell>
                                    <TableCell>
                                        <Select
                                            size="small"
                                            value={attendance[emp._id]?.status || 'present'}
                                            onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                                            sx={{
                                                borderRadius: '10px',
                                                minWidth: 160,
                                                bgcolor: attendance[emp._id]?.status === 'present' ? '#f0fdf4' :
                                                    attendance[emp._id]?.status === 'absent' ? '#fef2f2' :
                                                        attendance[emp._id]?.status === 'halfday' ? '#fffbeb' : '#f8fafc',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                                                fontWeight: 600,
                                                color: attendance[emp._id]?.status === 'present' ? '#166534' :
                                                    attendance[emp._id]?.status === 'absent' ? '#991b1b' :
                                                        attendance[emp._id]?.status === 'halfday' ? '#92400e' : '#334155'
                                            }}
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
                                            <Chip label="Active" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 700, borderRadius: '8px' }} />
                                        ) : (
                                            <Chip label={emp.status} size="small" sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 700, borderRadius: '8px' }} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
            <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={message.includes('success') ? 'success' : 'error'} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
