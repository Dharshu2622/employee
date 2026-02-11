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
    Alert as MuiAlert,
    Grid,
    Tooltip,
    Divider,
    Avatar,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    AccountBalanceWallet,
    Search,
    DoneAll,
    Mail,
    FileDownload,
    Inventory,
    InfoOutlined,
    CheckCircle,
    Visibility,
    PlayArrow,
    Calculate
} from '@mui/icons-material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function SuperiorPayroll() {
    const [employees, setEmployees] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [generating, setGenerating] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState('');
    const [showSnack, setShowSnack] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployeeForGen, setSelectedEmployeeForGen] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Background sync
        return () => clearInterval(interval);
    }, [month]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empResp, salResp] = await Promise.all([
                api.get('/admin/employees'),
                api.get('/salary/all')
            ]);
            // Only show regular employees for superiors to manage
            const regularEmployees = (empResp.data || []).filter(emp => emp.role === 'employee');
            setEmployees(regularEmployees);
            setSalaries(salResp.data || []);
        } catch (err) {
            console.error(err);
            setMessage('Real-time synchronization failure');
            setShowSnack(true);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (id = null) => {
        const targetId = id || selectedEmployeeForGen;
        if (!targetId) return;

        if (!window.confirm('Process or Update financial disbursement for this personnel mapping?')) return;

        setProcessingId(targetId);
        setGenerating(true);
        try {
            const res = await api.post('/salary/generate', { employeeId: targetId, month });
            setMessage(`✓ Finalized: ${res.data.salary?.employeeName || 'Ledger entry created'}`);
            setShowSnack(true);
            fetchData();
            if (!id) setSelectedEmployeeForGen('');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Generation Engine Error');
            setShowSnack(true);
        } finally {
            setProcessingId(null);
            setGenerating(false);
        }
    };

    const handleBatchProcess = async () => {
        if (!window.confirm(`Authorize full workforce disbursement for ${month}?`)) return;
        setGenerating(true);
        try {
            const res = await api.post('/salary/generate-all', { month });
            setMessage(`✓ Batch processing complete: ${res.data.successCount} finalized`);
            setShowSnack(true);
            fetchData();
        } catch (err) {
            setMessage('Administrative batch failure');
            setShowSnack(true);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (employeeId) => {
        try {
            const payslips = await api.get(`/payslips/employee/${employeeId}`);
            const currentPayslip = payslips.data.find(p => p.month === month);
            if (!currentPayslip) {
                setMessage('No payslip archetyped for this cycle');
                setShowSnack(true);
                return;
            }

            // Fetch as blob to handle authorization correctly
            const response = await api.get(`/payslips/${currentPayslip._id}/download`, {
                responseType: 'blob'
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);

            setMessage('✓ Payslip archetyped and decrypted for viewing');
            setShowSnack(true);
        } catch (err) {
            setMessage('Retrieval error during download');
            setShowSnack(true);
        }
    };

    const handleEmail = async (employeeId) => {
        try {
            const emp = employees.find(e => e._id === employeeId);
            const payslips = await api.get(`/payslips/employee/${employeeId}`);
            const currentPayslip = payslips.data.find(p => p.month === month);

            if (!currentPayslip) {
                setMessage('Process salary before attempting transmission');
                setShowSnack(true);
                return;
            }

            try {
                await api.post(`/payslips/${currentPayslip._id}/send-email`);
                setMessage('✓ Digital transmission successful');
                setShowSnack(true);
            } catch (err) {
                // Fallback to mailto link if backend SMTP fails
                if (emp && emp.email) {
                    const portalUrl = `${window.location.origin}/employee/payslips`;
                    const subject = `Notification: Payslip for ${month} is Available`;
                    const body = `Hello ${emp.name},\n\nYour payslip for the month of ${month} has been finalized and is now available in the employee portal.\n\nPlease log in to view and download your payslip: ${portalUrl}\n\nSecurity Note: You will be required to authenticate with your credentials to access the document.\n\nBest regards,\nPayroll Department`;
                    const mailto = `mailto:${emp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    window.location.href = mailto;
                    setMessage('SMTP failed, opening local mail client');
                    setShowSnack(true);
                } else {
                    throw new Error('SMTP failed and no employee email found for fallback');
                }
            }
        } catch (err) {
            console.error('Email error:', err);
            setMessage(err.message || 'SMTP transmission failure');
            setShowSnack(true);
        }
    };

    const getSalaryStatus = (empId) => {
        return salaries.find(s => {
            if (!s.employee) return false;
            const id = typeof s.employee === 'object' ? s.employee._id : s.employee;
            return id === empId && s.month === month;
        });
    };

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* HEADER */}
            <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
                <Container maxWidth="xl">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1, bgcolor: '#0F172A', borderRadius: '8px', color: 'white' }}>
                            <AccountBalanceWallet sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Payroll Management</Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>WORKFORCE DISBURSEMENT | REAL-TIME LEDGER</Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
                <Grid container spacing={4}>
                    {/* LEFT: GENERATION CONTROLS */}
                    <Grid item xs={12} lg={4}>
                        <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'sticky', top: 20 }}>
                            <Stack spacing={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Inventory sx={{ fontSize: 48, color: '#0F172A', mb: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#1A202C' }}>Generation Engine</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>Initialize fiscal cycles & batch settlements.</Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    label="Active Cycle"
                                    type="month"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                />

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={generating && !processingId ? <CircularProgress size={18} color="inherit" /> : <DoneAll />}
                                    onClick={handleBatchProcess}
                                    disabled={generating}
                                    sx={{ py: 1.5, fontWeight: 800, borderRadius: '12px', textTransform: 'none', borderStyle: 'dashed', borderWidth: 2, borderColor: '#0F172A', color: '#0F172A', '&:hover': { borderWidth: 2, bgcolor: 'rgba(15,23,42,0.02)' } }}
                                >
                                    Authorize Batch Process
                                </Button>

                                <Divider><Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>OR SELECT INDIVIDUAL</Typography></Divider>

                                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                                    <InputLabel>Personnel Mapping</InputLabel>
                                    <Select value={selectedEmployeeForGen} label="Personnel Mapping" onChange={(e) => setSelectedEmployeeForGen(e.target.value)}>
                                        {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>))}
                                    </Select>
                                </FormControl>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => handleGenerate()}
                                    disabled={!selectedEmployeeForGen || generating}
                                    sx={{ bgcolor: '#0F172A', py: 2, fontWeight: 900, borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#1E293B' } }}
                                >
                                    {generating && processingId === selectedEmployeeForGen ? <CircularProgress size={24} color="inherit" /> : 'Finalize Specific Ledger'}
                                </Button>

                                <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                                    <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <InfoOutlined sx={{ fontSize: 14 }} /> INTEGRITY TRACE
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#0C4A6E', display: 'block', mt: 1, lineHeight: 1.5, fontWeight: 500 }}>
                                        Finalization aggregates attendance & loan EMIs. Once finalized, details are immediately visible to employees.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* RIGHT: REGISTRY TABLE */}
                    <Grid item xs={12} lg={8}>
                        <Paper sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: 'none' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'white' }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1A202C' }}>Workforce Ledger - {month}</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>SYNCHRONIZED WITH MEMBER DASHBOARDS</Typography>
                                </Box>
                                <TextField
                                    size="small"
                                    placeholder="Search personnel..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{ startAdornment: <Search sx={{ color: '#94A3B8', mr: 1, fontSize: 18 }} /> }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC', width: '240px' } }}
                                />
                            </Box>

                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem' }}>Personnel</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem' }}>Operating Base</TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem' }}>Status</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem' }}>Controls</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredEmployees.map((emp) => {
                                            const salary = getSalaryStatus(emp._id);
                                            return (
                                                <TableRow key={emp._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.9rem', bgcolor: '#F1F5F9', color: '#1E293B', fontWeight: 700 }}>{emp.name[0]}</Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B' }}>{emp.name}</Typography>
                                                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{emp.department}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>₹{emp.baseSalary?.toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {salary ? (
                                                            <Chip label="FINALIZED" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 900, fontSize: '0.6rem' }} />
                                                        ) : (
                                                            <Chip label="PENDING" size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 900, fontSize: '0.6rem' }} />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {salary ? (
                                                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                                                <Tooltip title="Download PDF Ledger">
                                                                    <IconButton size="small" onClick={() => handleDownload(emp._id)} sx={{ color: '#2C5282' }}><FileDownload sx={{ fontSize: 18 }} /></IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Transmit via Enterprise Mail">
                                                                    <IconButton size="small" onClick={() => handleEmail(emp._id)} sx={{ color: '#10B981' }}><Mail sx={{ fontSize: 18 }} /></IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Re-calculate & Update Ledger">
                                                                    <IconButton size="small" onClick={() => handleGenerate(emp._id)} sx={{ color: '#F6AD55' }}><Calculate sx={{ fontSize: 18 }} /></IconButton>
                                                                </Tooltip>
                                                                <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />
                                                            </Stack>
                                                        ) : (
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                onClick={() => handleGenerate(emp._id)}
                                                                disabled={generating}
                                                                sx={{ bgcolor: '#0F172A', fontWeight: 800, textTransform: 'none', borderRadius: '6px', px: 2, '&:hover': { bgcolor: '#1E293B' } }}
                                                            >
                                                                {generating && processingId === emp._id ? <CircularProgress size={14} color="inherit" /> : 'Finalize'}
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {employees.length === 0 && !loading && (
                                <Box sx={{ p: 6, textAlign: 'center' }}>
                                    <Inventory sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} />
                                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>No personnel records found.</Typography>
                                </Box>
                            )}
                            {loading && (
                                <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <MuiAlert severity={message.includes('success') || message.includes('successfully') || message.includes('complete') || message.includes('secured') ? 'success' : message.includes('local mail') ? 'info' : 'error'} variant="filled" sx={{ borderRadius: '4px' }}>
                    {message}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
}
