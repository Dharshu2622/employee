import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Snackbar,
    Alert as MuiAlert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    IconButton,
    Divider,
    CircularProgress,
    Tooltip,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    ArrowBack,
    Calculate,
    CheckCircle,
    Inventory,
    Mail,
    FileDownload,
    Search,
    Visibility,
    PriceCheck,
    AccountBalanceWallet,
    InfoOutlined,
    DoneAll
} from '@mui/icons-material';
import api from '../api';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>}
        </div>
    );
}

export default function SuperiorPayroll() {
    const [tabValue, setTabValue] = useState(0);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [employeeLoans, setEmployeeLoans] = useState([]);
    const [form, setForm] = useState({ baseSalary: 0, hra: 0, da: 0, travel: 0, medical: 0, pf: 0, tax: 0, insurance: 0, loanEMI: 0 });
    const [message, setMessage] = useState('');
    const [showSnack, setShowSnack] = useState(false);
    const [saving, setSaving] = useState(false);
    const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
    const [selectedEmployeeForGen, setSelectedEmployeeForGen] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [generating, setGenerating] = useState(false);
    const [salaries, setSalaries] = useState([]);
    const [loadingSalaries, setLoadingSalaries] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        fetchEmployees();
        fetchSalaries();
        const interval = setInterval(fetchSalaries, 30000); // Background sync
        return () => clearInterval(interval);
    }, [selectedMonth]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/admin/employees');
            // Only show regular employees for superiors
            const regularEmployees = (res.data || []).filter(emp => emp.role === 'employee');
            setEmployees(regularEmployees);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSalaries = async () => {
        setLoadingSalaries(true);
        try {
            const res = await api.get('/salary/all');
            setSalaries(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSalaries(false);
        }
    };

    const fetchEmployeeData = async (id) => {
        if (!id) return;
        try {
            // 1. Fetch current month salary preview for high-integrity projection
            const previewRes = await api.get(`/salary/preview?employeeId=${id}&month=${selectedMonth}`).catch(() => null);

            if (previewRes && previewRes.data) {
                const data = previewRes.data;
                const b = data.base || 0;
                setForm({
                    baseSalary: b,
                    hra: data.allowances?.hra || (b > 0 ? Math.round(b * 0.20) : 0),
                    da: data.allowances?.da || (b > 0 ? Math.round(b * 0.10) : 0),
                    travel: data.allowances?.travel || (b > 0 ? 1500 : 0),
                    medical: data.allowances?.medical || (b > 0 ? 1250 : 0),
                    pf: data.deductions?.pf || (b > 0 ? Math.round(b * 0.12) : 0),
                    tax: data.deductions?.tax || (b > 0 ? Math.round(b * 0.05) : 0),
                    insurance: data.deductions?.insurance || (b > 0 ? 500 : 0),
                    loanEMI: data.deductions?.loanEMI || 0
                });
            } else {
                // Fallback to basic structure if preview fails
                const salRes = await api.get(`/salary/structure/${id}`).catch(() => null);
                if (salRes && salRes.data) {
                    const b = salRes.data.baseSalary || 0;
                    setForm({
                        baseSalary: b,
                        hra: salRes.data.allowances?.hra || (b > 0 ? Math.round(b * 0.20) : 0),
                        da: salRes.data.allowances?.da || (b > 0 ? Math.round(b * 0.10) : 0),
                        travel: salRes.data.allowances?.travel || (b > 0 ? 1500 : 0),
                        medical: salRes.data.allowances?.medical || (b > 0 ? 1250 : 0),
                        pf: salRes.data.deductions?.pf || (b > 0 ? Math.round(b * 0.12) : 0),
                        tax: salRes.data.deductions?.tax || (b > 0 ? Math.round(b * 0.05) : 0),
                        insurance: salRes.data.deductions?.insurance || (b > 0 ? 500 : 0),
                        loanEMI: 0
                    });
                } else {
                    setForm({ baseSalary: 0, hra: 0, da: 0, travel: 0, medical: 0, pf: 0, tax: 0, insurance: 0, loanEMI: 0 });
                }
            }

            // 2. Fetch loans for the specific employee UI monitor
            const loanRes = await api.get(`/loans/employee/${id}`);
            const loansArray = loanRes.data || [];
            const activeLoans = loansArray.filter(l => l.status === 'approved');
            const totalEMI = activeLoans.reduce((sum, loan) => {
                const remaining = (loan.amount || 0) - (loan.paidAmount || 0);
                return sum + Math.min(loan.monthlyEMI || 0, remaining);
            }, 0);
            setEmployeeLoans(loansArray);
            setForm(prev => ({ ...prev, loanEMI: totalEMI }));
        } catch (err) {
            console.error('Error fetching employee financials:', err);
        }
    };

    const handleEmployeeChange = (e) => {
        const id = e.target.value;
        setSelectedEmployee(id);
        fetchEmployeeData(id);
    };

    const handleChange = (key) => (e) => {
        const value = Number(e.target.value || 0);
        setForm(prev => {
            const newForm = { ...prev, [key]: value };
            if (key === 'baseSalary') {
                newForm.hra = Math.round(value * 0.20);
                newForm.da = Math.round(value * 0.10);
                newForm.travel = 1500;
                newForm.medical = 1250;
                newForm.pf = Math.round(value * 0.12);
                newForm.tax = Math.round(value * 0.05);
                newForm.insurance = 500;
            }
            return newForm;
        });
    };

    const activeLoans = employeeLoans.filter(l => l.status === 'approved');
    const totalLoanAmount = activeLoans.reduce((sum, l) => sum + (l.amount || 0), 0);
    const deductedLoanAmount = activeLoans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
    const remainingLoanBalance = totalLoanAmount - deductedLoanAmount;
    const currentMonthEMI = form.loanEMI;

    const gross = form.baseSalary + form.hra + form.da + form.travel + form.medical;
    const totalDeductions = form.pf + form.tax + form.insurance + currentMonthEMI;
    const net = gross - totalDeductions;

    const handleSave = async () => {
        if (!selectedEmployee) {
            setMessage('Identification of personnel required');
            setShowSnack(true);
            return;
        }
        setSaving(true);
        try {
            const res = await api.post('/salary/structure', {
                employeeId: selectedEmployee,
                baseSalary: form.baseSalary,
                allowances: { hra: form.hra, da: form.da, travel: form.travel, medical: form.medical },
                deductions: { pf: form.pf, tax: form.tax, insurance: form.insurance, loanEMI: form.loanEMI },
                month: selectedMonth
            });
            setMessage(`✓ ${res.data.message || 'Audit record archived'}`);
            setShowSnack(true);
            fetchEmployees();
            fetchSalaries();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Archive error');
            setShowSnack(true);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateSalary = async () => {
        if (!selectedEmployeeForGen || !selectedMonth) {
            setMessage('Targets required');
            setShowSnack(true);
            return;
        }
        setGenerating(true);
        try {
            const res = await api.post('/salary/generate', {
                employeeId: selectedEmployeeForGen,
                month: selectedMonth
            });
            setMessage(`✓ Finalized for ${res.data.salary?.employeeName || 'staff'}`);
            setShowSnack(true);
            setOpenGenerateDialog(false);
            setSelectedEmployeeForGen('');
            fetchSalaries();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Engine failure');
            setShowSnack(true);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async (employeeId) => {
        try {
            await api.post('/salary/generate', {
                employeeId: employeeId,
                month: selectedMonth
            }).catch(() => null);

            const payslips = await api.get(`/payslips/employee/${employeeId}`);
            const currentPayslip = payslips.data.find(p => p.month === selectedMonth);
            if (!currentPayslip) {
                setMessage('No payslip available');
                setShowSnack(true);
                return;
            }

            const response = await api.get(`/payslips/${currentPayslip._id}/download`, {
                responseType: 'blob'
            });

            const file = new Blob([response.data], { type: 'application/pdf' });
            window.open(URL.createObjectURL(file));

            setMessage('✓ Payslip decrypted for viewing');
            setShowSnack(true);
            fetchSalaries();
        } catch (err) {
            setMessage('Retrieval error');
            setShowSnack(true);
        }
    };

    const handleEmail = async (employeeId) => {
        try {
            const emp = employees.find(e => e._id === employeeId);
            const payslips = await api.get(`/payslips/employee/${employeeId}`);
            const currentPayslip = payslips.data.find(p => p.month === selectedMonth);

            if (!currentPayslip) {
                setMessage('Process salary first');
                setShowSnack(true);
                return;
            }

            try {
                await api.post(`/payslips/${currentPayslip._id}/send-email`);
                setMessage('✓ Transmission successful');
                setShowSnack(true);
            } catch (err) {
                if (emp?.email) {
                    const mailto = `mailto:${emp.email}?subject=Payslip Available&body=Your payslip for ${selectedMonth} is ready.`;
                    window.location.href = mailto;
                    setMessage('Opening mail client...');
                    setShowSnack(true);
                }
            }
        } catch (err) {
            setMessage('Transmission failure');
            setShowSnack(true);
        }
    };

    const getSalaryStatus = (empId) => {
        return salaries.find(s => {
            if (!s.employee) return false;
            const id = typeof s.employee === 'object' ? s.employee._id : s.employee;
            return id === empId && s.month === selectedMonth;
        });
    };

    return (
        <Box sx={{ bgcolor: '#F7FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', minHeight: '64px' }}>
                <Container maxWidth="xl">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                            <ArrowBack sx={{ fontSize: 20, color: '#1A202C' }} />
                        </IconButton>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Workforce Payroll</Typography>
                            <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>DISBURSEMENT REGISTRY | EMPLOYEE LEDGER</Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3, display: 'flex', flexDirection: 'column' }}>
                <Paper sx={{ mb: 2, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, v) => setTabValue(v)}
                        sx={{
                            px: 3, pt: 1, minHeight: '48px',
                            '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.9rem', color: '#718096', minHeight: '48px' },
                            '& .Mui-selected': { color: '#1A202C' },
                            '& .MuiTabs-indicator': { bgcolor: '#1A202C', height: 2 }
                        }}
                    >
                        <Tab label="Financial Structures" icon={<Calculate sx={{ fontSize: 18 }} />} iconPosition="start" />
                        <Tab label="Disbursement Engine" icon={<PriceCheck sx={{ fontSize: 18 }} />} iconPosition="start" />
                    </Tabs>

                    <Divider />

                    <Box sx={{ p: 4 }}>
                        <TabPanel value={tabValue} index={0}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} lg={8}>
                                    <Stack spacing={4}>
                                        <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Visibility sx={{ fontSize: 18 }} /> Employee Ledger Lookup
                                            </Typography>
                                            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}>
                                                <InputLabel>Target Employee</InputLabel>
                                                <Select value={selectedEmployee} label="Target Employee" onChange={handleEmployeeChange}>
                                                    {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name} | {emp.position}</MenuItem>))}
                                                </Select>
                                            </FormControl>
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <TextField fullWidth label="Base Operating Salary" type="number" value={form.baseSalary} onChange={handleChange('baseSalary')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                                            </Grid>
                                            <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" sx={{ color: '#3182CE', fontWeight: 800 }}>Total Calculated Gross: ₹{gross.toLocaleString()}</Typography>
                                            </Grid>

                                            <Grid item xs={12}><Divider><Chip label="ALLOWANCE ALLOCATION" size="small" sx={{ fontWeight: 900, fontSize: '0.65rem' }} /></Divider></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="HRA" type="number" value={form.hra} onChange={handleChange('hra')} /></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="DA" type="number" value={form.da} onChange={handleChange('da')} /></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="Travel" type="number" value={form.travel} onChange={handleChange('travel')} /></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="Medical" type="number" value={form.medical} onChange={handleChange('medical')} /></Grid>

                                            <Grid item xs={12}><Divider><Chip label="SYSTEM DEDUCTIONS" size="small" sx={{ fontWeight: 900, fontSize: '0.65rem' }} /></Divider></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="PF Contribution" type="number" value={form.pf} onChange={handleChange('pf')} /></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="Govt Tax" type="number" value={form.tax} onChange={handleChange('tax')} /></Grid>
                                            <Grid item xs={12} sm={3}><TextField fullWidth label="Insurance" type="number" value={form.insurance} onChange={handleChange('insurance')} /></Grid>
                                            <Grid item xs={12} sm={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Active Loan EMI"
                                                    value={form.loanEMI || currentMonthEMI}
                                                    InputProps={{ readOnly: true, startAdornment: '₹' }}
                                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC' } }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Button fullWidth variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: '#1A202C', py: 2, fontWeight: 800, borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}>
                                            {saving ? <CircularProgress size={24} color="inherit" /> : 'Commit Financial Structure'}
                                        </Button>
                                    </Stack>
                                </Grid>

                                <Grid item xs={12} lg={4}>
                                    <Stack spacing={3}>
                                        <Paper sx={{ p: 4, borderRadius: '16px', bgcolor: '#1A202C', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>PROJECTED NET DISBURSEMENT</Typography>
                                                <Typography variant="h3" sx={{ fontWeight: 900, mt: 1 }}>₹{net.toLocaleString()}</Typography>
                                                <Stack direction="row" spacing={3} sx={{ mt: 5 }}>
                                                    <Box>
                                                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.5 }}>TOTAL EARNING</Typography>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>₹{gross.toLocaleString()}</Typography>
                                                    </Box>
                                                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                                    <Box>
                                                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.5, fontWeight: 800 }}>RETAINED</Typography>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#FC8181' }}>₹{totalDeductions.toLocaleString()}</Typography>
                                                        {currentMonthEMI > 0 && (
                                                            <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, color: '#FC8181', fontSize: '10px' }}>
                                                                (Includes EMI: ₹{currentMonthEMI.toLocaleString()})
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Stack>
                                            </Box>
                                            <AccountBalanceWallet sx={{ position: 'absolute', right: -30, bottom: -30, fontSize: 160, opacity: 0.03, transform: 'rotate(-15deg)' }} />
                                        </Paper>

                                        <Box sx={{ p: 3, borderRadius: '16px', bgcolor: 'white', border: '1px solid #E2E8F0' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1A202C' }}>
                                                <span>Personnel Liability Audit</span>
                                                <Tooltip title="Real-time monitoring of outstanding liabilities.">
                                                    <IconButton size="small"><InfoOutlined sx={{ fontSize: 16, color: '#A0AEC0' }} /></IconButton>
                                                </Tooltip>
                                            </Typography>

                                            <Stack spacing={3}>
                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                                        <Typography variant="caption" sx={{ color: '#718096', fontWeight: 800 }}>Liability Absorption Trace ({activeLoans.length} Active Loans)</Typography>
                                                        <Typography variant="caption" sx={{ color: '#3182CE', fontWeight: 900 }}>{totalLoanAmount > 0 ? Math.round((deductedLoanAmount / totalLoanAmount) * 100) : 0}% REPAID</Typography>
                                                    </Stack>
                                                    <Box sx={{ width: '100%', height: 8, bgcolor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                                                        <Box sx={{ width: `${totalLoanAmount > 0 ? (deductedLoanAmount / totalLoanAmount) * 100 : 0}%`, height: '100%', bgcolor: '#3182CE', borderRadius: 4, transition: 'width 1s ease-in-out' }} />
                                                    </Box>
                                                </Box>

                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #EDF2F7' }}>
                                                            <Typography variant="caption" sx={{ color: '#718096', display: 'block', mb: 0.5, fontWeight: 700 }}>Total Borne</Typography>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#1A202C' }}>₹{totalLoanAmount.toLocaleString()}</Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Box sx={{ p: 2, bgcolor: '#FFF5F5', borderRadius: '12px', border: '1px solid #FED7D7' }}>
                                                            <Typography variant="caption" sx={{ color: '#E53E3E', display: 'block', mb: 0.5, fontWeight: 700 }}>Remaining</Typography>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#C53030' }}>₹{remainingLoanBalance.toLocaleString()}</Typography>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} lg={4}>
                                    <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', position: 'sticky', top: 20 }}>
                                        <Stack spacing={3}>
                                            <Box sx={{ textAlign: 'center', mb: 1 }}>
                                                <Inventory sx={{ fontSize: 48, color: '#1A202C', mb: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 900 }}>Generation Engine</Typography>
                                            </Box>
                                            <TextField fullWidth label="Active Cycle" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} InputLabelProps={{ shrink: true }} />
                                            <Button fullWidth variant="outlined" startIcon={<DoneAll />} onClick={async () => {
                                                if (!window.confirm(`Process full workforce disbursement for ${selectedMonth}?`)) return;
                                                setGenerating(true);
                                                try {
                                                    await api.post('/salary/generate-all', { month: selectedMonth });
                                                    setMessage('✓ Batch processing complete');
                                                    setShowSnack(true);
                                                    fetchSalaries();
                                                } catch (err) { setMessage('Batch failure'); setShowSnack(true); }
                                                finally { setGenerating(false); }
                                            }} sx={{ py: 1.5, fontWeight: 800, borderStyle: 'dashed' }}>Authorize Batch Process</Button>
                                            <Divider><Typography variant="caption" sx={{ color: '#A0AEC0' }}>OR SELECT INDIVIDUAL</Typography></Divider>
                                            <FormControl fullWidth><InputLabel>Mapping</InputLabel><Select value={selectedEmployeeForGen} label="Mapping" onChange={(e) => setSelectedEmployeeForGen(e.target.value)}>{employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>))}</Select></FormControl>
                                            <Button fullWidth variant="contained" onClick={() => setOpenGenerateDialog(true)} disabled={!selectedEmployeeForGen} sx={{ bgcolor: '#1A202C', py: 2, fontWeight: 900 }}>Finalize Specific Ledger</Button>
                                        </Stack>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} lg={8}>
                                    <Paper sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                        <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC' }}>
                                            <Box><Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Payroll Registry</Typography></Box>
                                            <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <Search sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} /> }} />
                                        </Box>
                                        <TableContainer>
                                            <Table>
                                                <TableHead><TableRow sx={{ bgcolor: '#F8FAFC' }}><TableCell sx={{ fontWeight: 800 }}>Staff</TableCell><TableCell sx={{ fontWeight: 800 }}>Gross/Net</TableCell><TableCell sx={{ fontWeight: 800 }}>Status</TableCell><TableCell align="right" sx={{ fontWeight: 800 }}>Control</TableCell></TableRow></TableHead>
                                                <TableBody>
                                                    {employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => {
                                                        const salary = getSalaryStatus(emp._id);
                                                        return (
                                                            <TableRow key={emp._id} hover>
                                                                <TableCell>
                                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#E2E8F0', color: '#1A202C' }}>{emp.name[0]}</Avatar>
                                                                        <Box><Typography variant="body2" sx={{ fontWeight: 800 }}>{emp.name}</Typography><Typography variant="caption" sx={{ color: '#718096' }}>{emp.department}</Typography></Box>
                                                                    </Stack>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>₹{(salary ? salary.gross : (emp.baseSalary + (form.baseSalary > 0 && emp._id === selectedEmployee ? (form.hra + form.da + form.travel + form.medical) : 0)))?.toLocaleString()}</Typography>
                                                                    {salary && (
                                                                        <Typography variant="caption" sx={{ color: '#3182CE', display: 'block', mt: 0.5, fontWeight: 900 }}>
                                                                            Net: ₹{salary.net.toLocaleString()}
                                                                        </Typography>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>{salary ? <Chip label="FINALIZED" size="small" sx={{ bgcolor: '#C6F6D5', color: '#22543D', fontWeight: 900, fontSize: '0.6rem' }} /> : <Chip label="PENDING" size="small" sx={{ bgcolor: '#EDF2F7', color: '#4A5568', fontWeight: 900, fontSize: '0.6rem' }} />}</TableCell>
                                                                <TableCell align="right">
                                                                    {salary ? (
                                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                                            <IconButton size="small" onClick={() => handleDownload(emp._id)} sx={{ color: '#2C5282' }}><FileDownload sx={{ fontSize: 18 }} /></IconButton>
                                                                            <IconButton size="small" onClick={() => handleEmail(emp._id)} sx={{ color: '#10B981' }}><Mail sx={{ fontSize: 18 }} /></IconButton>
                                                                            <CheckCircle sx={{ color: '#38A169', fontSize: 18, ml: 1 }} />
                                                                        </Stack>
                                                                    ) : (
                                                                        <Button size="small" variant="contained" onClick={() => { setSelectedEmployeeForGen(emp._id); setOpenGenerateDialog(true); }} sx={{ bgcolor: '#1A202C', fontWeight: 800 }}>Finalize</Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </Box>
                </Paper>
            </Container>

            <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 900 }}>Confirm Disbursement</DialogTitle>
                <DialogContent><Typography variant="body2">Authorize the financial cycle archive for **{selectedMonth}**?</Typography></DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}><Button onClick={() => setOpenGenerateDialog(false)}>Abort</Button><Button variant="contained" onClick={handleGenerateSalary} disabled={generating} sx={{ bgcolor: '#C53030' }}>Finalize Ledger</Button></DialogActions>
            </Dialog>

            <Snackbar open={showSnack} autoHideDuration={3000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <MuiAlert severity={message.includes('✓') || message.includes('complete') ? "success" : "error"} variant="filled">{message}</MuiAlert>
            </Snackbar>
        </Box>
    );
}
