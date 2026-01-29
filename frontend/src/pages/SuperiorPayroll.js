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
    Button,
    Stack,
    TextField,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { Download, Email, AccountBalanceWallet, Search, PlayArrow } from '@mui/icons-material';
import api from '../api';

export default function SuperiorPayroll() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [processing, setProcessing] = useState({});
    const [message, setMessage] = useState('');
    const [showSnack, setShowSnack] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const resp = await api.get('/admin/employees');
            setEmployees(resp.data);
        } catch (err) {
            console.error(err);
            setMessage('Failed to load employees');
            setShowSnack(true);
        } finally {
            setLoading(false);
        }
    };

    const processSalary = async (employeeId) => {
        setProcessing(prev => ({ ...prev, [employeeId]: true }));
        try {
            const resp = await api.post('/salary/generate', { employeeId, month });
            setMessage(`Salary processed for ${month}. ${resp.data.emailStatus}`);
            setShowSnack(true);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Processing failed');
            setShowSnack(true);
        } finally {
            setProcessing(prev => ({ ...prev, [employeeId]: false }));
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ background: '#f8fafc', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="xl">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#10b98115', color: '#10b981' }}><AccountBalanceWallet /></Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a202c' }}>Payroll Management</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Process employee salaries and distribute digital payslips.</Typography>
                    </Box>
                </Stack>

                <Card sx={{ borderRadius: '20px', mb: 4, border: '1px solid #e2e8f0' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>Select Processing Month</Typography>
                                <TextField
                                    fullWidth
                                    type="month"
                                    size="small"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>Search Employees</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Filter by name or department..."
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <Search sx={{ color: '#94a3b8', mr: 1 }} />
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Base Salary</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredEmployees.map((emp) => (
                                <TableRow key={emp._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{emp.name}</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>{emp.email}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{emp.department}</Typography>
                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{emp.position}</Typography>
                                    </TableCell>
                                    <TableCell>₹{emp.baseSalary?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Box sx={{ px: 1.5, py: 0.5, bgcolor: emp.status === 'active' ? '#dcfce7' : '#fee2e2', color: emp.status === 'active' ? '#15803d' : '#b91c1c', borderRadius: '20px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {emp.status.toUpperCase()}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<PlayArrow />}
                                            disabled={processing[emp._id] || emp.status !== 'active'}
                                            onClick={() => processSalary(emp._id)}
                                            sx={{
                                                borderRadius: '10px',
                                                textTransform: 'none',
                                                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                                boxShadow: 'none',
                                                '&:hover': { background: '#059669' }
                                            }}
                                        >
                                            {processing[emp._id] ? 'Processing...' : 'Process Salary'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            <Snackbar open={showSnack} autoHideDuration={5000} onClose={() => setShowSnack(false)}>
                <Alert severity={message.includes('success') ? 'success' : 'info'} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
