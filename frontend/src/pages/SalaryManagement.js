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

export default function SalaryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeLoans, setEmployeeLoans] = useState([]);
  const [form, setForm] = useState({ baseSalary: 0, hra: 0, da: 0, travel: 0, medical: 0, pf: 0, tax: 0, insurance: 0 });
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
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchEmployees();
    fetchSalaries();
    const interval = setInterval(fetchSalaries, 30000); // Background sync
    return () => clearInterval(interval);
  }, [selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      // Only show superior employees as requested
      const superiorEmployees = (res.data || []).filter(emp => emp.role === 'superior');
      setEmployees(superiorEmployees);
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
      const monthStr = new Date().toISOString().slice(0, 7);
      const previewRes = await api.get(`/salary/preview?employeeId=${id}&month=${monthStr}`).catch(() => null);

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
        // We can also store the EMI and LOP if we want to show them in the UI
      } else {
        // Fallback to basic structure if preview fails (e.g. month-specific record issues)
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
        }
      }

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

      // Auto-calculate for superiors when base salary changes
      if (key === 'baseSalary') {
        const emp = employees.find(e => e._id === selectedEmployee);
        if (emp && (emp.role === 'superior' || emp.name.toLowerCase().includes('superior'))) {
          newForm.hra = Math.round(value * 0.20);
          newForm.da = Math.round(value * 0.10);
          newForm.travel = 1500;
          newForm.medical = 1250;
          newForm.pf = Math.round(value * 0.12);
          newForm.tax = Math.round(value * 0.05);
          newForm.insurance = 500;
        }
      }
      return newForm;
    });
  };

  const activeLoans = employeeLoans.filter(l => l.status === 'approved');
  const totalLoanAmount = activeLoans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const deductedLoanAmount = activeLoans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const remainingLoanBalance = totalLoanAmount - deductedLoanAmount;

  const currentMonthEMI = activeLoans.reduce((sum, loan) => {
    const remaining = loan.amount - (loan.paidAmount || 0);
    return sum + Math.min(loan.monthlyEMI || 0, remaining);
  }, 0);

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
      setMessage(`✓ ${res.data.message || 'Audit record successfully archived'}`);
      setShowSnack(true);
      fetchEmployees(); // Refresh registry to reflect updated base salary and data
      fetchSalaries(); // Refresh salaries to reflect synced updates
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Archive error during processing';
      setMessage(errorMsg);
      setShowSnack(true);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSalary = async () => {
    if (!selectedEmployeeForGen || !selectedMonth) {
      setMessage('Temporal and identity identifiers required');
      setShowSnack(true);
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/salary/generate', {
        employeeId: selectedEmployeeForGen,
        month: selectedMonth
      });
      setMessage(`✓ Disbursement finalized for ${res.data.salary?.employeeName || ' personnel'}`);
      setShowSnack(true);
      setOpenGenerateDialog(false);
      setSelectedEmployeeForGen('');
      fetchSalaries(); // Refresh registry
    } catch (err) {
      setMessage(err.response?.data?.message || 'Calculation engine failure');
      setShowSnack(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (employeeId) => {
    try {
      // Proactively re-calculate/finalize to ensure the download reflects the 'correct' committed salary
      // This matches the "update aaganum" requirement
      await api.post('/salary/generate', {
        employeeId: employeeId,
        month: selectedMonth
      }).catch(err => console.error('Silent sync failed:', err));

      const payslips = await api.get(`/payslips/employee/${employeeId}`);
      const currentPayslip = payslips.data.find(p => p.month === selectedMonth);
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
      fetchSalaries(); // Refresh the list to show "FINALIZED" if it wasn't
    } catch (err) {
      // Decode blob error if possible
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          let errorMsg = 'Retrieval error';
          try {
            const errorData = JSON.parse(reader.result);
            errorMsg = errorData.message || errorMsg;
          } catch (e) { }
          setMessage(errorMsg);
          setShowSnack(true);
        };
        reader.readAsText(err.response.data);
      } else {
        setMessage(err.response?.data?.message || 'Retrieval error during download');
        setShowSnack(true);
      }
    }
  };

  const handleEmail = async (employeeId) => {
    try {
      const emp = employees.find(e => e._id === employeeId);
      const payslips = await api.get(`/payslips/employee/${employeeId}`);
      const currentPayslip = payslips.data.find(p => p.month === selectedMonth);

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
          const subject = `Notification: Payslip for ${selectedMonth} is Available`;
          const body = `Hello ${emp.name},\n\nYour payslip for the month of ${selectedMonth} has been finalized and is now available in the employee portal.\n\nPlease log in to view and download your payslip: ${portalUrl}\n\nSecurity Note: You will be required to authenticate with your credentials to access the document.\n\nBest regards,\nPayroll Department`;
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
      return id === empId && s.month === selectedMonth;
    });
  };

  return (
    <Box sx={{ bgcolor: '#F7FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* HEADER */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', minHeight: '64px' }}>
        <Container maxWidth="xl">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <ArrowBack sx={{ fontSize: 20, color: '#1A202C' }} />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Financial Operations</Typography>
              <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>DISBURSEMENT MODULE | LEDGER MANAGEMENT</Typography>
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
                {/* CONFIGURATION / AUDIT FORM */}
                <Grid item xs={12} lg={8}>
                  <Stack spacing={4}>
                    <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Visibility sx={{ fontSize: 18 }} /> Personnel Ledger Lookup
                      </Typography>
                      <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white' } }}>
                        <InputLabel>Target Personnel</InputLabel>
                        <Select value={selectedEmployee} label="Target Personnel" onChange={handleEmployeeChange}>
                          {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name} | {emp.position}</MenuItem>))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* removed administrative restriction notice */}

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
                          label="Personnel EMI"
                          value={currentMonthEMI}
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

                {/* FINANCIAL SNAPSHOT */}
                <Grid item xs={12} lg={4}>
                  <Stack spacing={3}>
                    <Paper sx={{ p: 4, borderRadius: '16px', bgcolor: '#1A202C', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, letterSpacing: 1.5 }}>PROJECTED NET DISBURSEMENT</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, letterSpacing: -1 }}>₹{net.toLocaleString()}</Typography>
                        <Stack direction="row" spacing={3} sx={{ mt: 5 }}>
                          <Box>
                            <Typography variant="caption" sx={{ display: 'block', opacity: 0.5, fontWeight: 800 }}>TOTAL EARNING</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>₹{gross.toLocaleString()}</Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 2 }} />
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

                    {/* LOAN MONITOR */}
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
                {/* GENERATION CONTROLS */}
                <Grid item xs={12} lg={4}>
                  <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'sticky', top: 20 }}>
                    <Stack spacing={3}>
                      <Box sx={{ textAlign: 'center', mb: 1 }}>
                        <Inventory sx={{ fontSize: 48, color: '#1A202C', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#1A202C' }}>Generation Engine</Typography>
                        <Typography variant="caption" sx={{ color: '#718096', fontWeight: 500 }}>Initialize fiscal cycles & batch settlements.</Typography>
                      </Box>

                      <TextField
                        fullWidth
                        label="Active Cycle"
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={generating ? <CircularProgress size={18} /> : <DoneAll />}
                        onClick={async () => {
                          if (!window.confirm(`Process full workforce disbursement for ${selectedMonth}?`)) return;
                          setGenerating(true);
                          try {
                            await api.post('/salary/generate-all', { month: selectedMonth });
                            setMessage(`✓ Batch processing complete for ${selectedMonth}`);
                            setShowSnack(true);
                            fetchSalaries();
                          } catch (err) {
                            setMessage('Batch processing failure');
                            setShowSnack(true);
                          } finally {
                            setGenerating(false);
                          }
                        }}
                        sx={{ py: 1.5, fontWeight: 800, borderRadius: '10px', textTransform: 'none', borderStyle: 'dashed', borderWidth: 2 }}
                      >
                        Authorize Batch Process
                      </Button>

                      <Divider><Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 800 }}>OR SELECT INDIVIDUAL</Typography></Divider>

                      <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
                        <InputLabel>Personnel Mapping</InputLabel>
                        <Select value={selectedEmployeeForGen} label="Personnel Mapping" onChange={(e) => setSelectedEmployeeForGen(e.target.value)}>
                          {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>))}
                        </Select>
                      </FormControl>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => setOpenGenerateDialog(true)}
                        disabled={!selectedEmployeeForGen}
                        sx={{ bgcolor: '#1A202C', py: 2, fontWeight: 900, borderRadius: '10px', textTransform: 'none', '&:hover': { bgcolor: '#2D3748' } }}
                      >
                        Finalize Specific Ledger
                      </Button>

                      <Box sx={{ p: 2, bgcolor: '#ebf8ff', borderRadius: '10px', border: '1px solid #bee3f8' }}>
                        <Typography variant="caption" sx={{ color: '#2b6cb0', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InfoOutlined sx={{ fontSize: 14 }} /> INTEGRITY TRACE
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#2c5282', display: 'block', mt: 1, lineHeight: 1.5, fontWeight: 500 }}>
                          Finalization aggregates attendance & loan EMIs into immutable entries.
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* REGISTRY / HISTORY */}
                <Grid item xs={12} lg={8}>
                  <Paper sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: 'none' }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1A202C' }}>Payroll Registry - {selectedMonth}</Typography>
                        <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>MONITORING REAL-TIME DISBURSEMENT STATUS</Typography>
                      </Box>
                      <TextField
                        size="small"
                        placeholder="Search personnel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <Search sx={{ color: '#94a3b8', mr: 1, fontSize: 18 }} /> }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'white', width: '240px' } }}
                      />
                    </Box>

                    <TableContainer>
                      <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                            <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem' }}>Personnel</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem' }}>Gross/Net Salary</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem' }}>Cycle Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem' }}>Operational Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => {
                            const salary = getSalaryStatus(emp._id);
                            return (
                              <TableRow key={emp._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                  <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.9rem', bgcolor: '#E2E8F0', color: '#1A202C', fontWeight: 700 }}>{emp.name[0]}</Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A202C' }}>{emp.name}</Typography>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>{emp.department}</Typography>
                                        <Chip label="Superior" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 800, borderColor: '#3182CE', color: '#3182CE' }} />
                                      </Stack>
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2D3748' }}>
                                    ₹{(salary ? salary.gross : (emp.baseSalary + (form.baseSalary > 0 && emp._id === selectedEmployee ? (form.hra + form.da + form.travel + form.medical) : 0)))?.toLocaleString()}
                                  </Typography>
                                  {salary && (
                                    <Typography variant="caption" sx={{ color: '#3182CE', display: 'block', mt: 0.5, fontWeight: 900 }}>
                                      Net: ₹{salary.net.toLocaleString()}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {salary ? (
                                    <Chip label="FINALIZED" size="small" sx={{ bgcolor: '#C6F6D5', color: '#22543D', fontWeight: 900, fontSize: '0.6rem' }} />
                                  ) : (
                                    <Chip label="PENDING" size="small" sx={{ bgcolor: '#EDF2F7', color: '#4A5568', fontWeight: 900, fontSize: '0.6rem' }} />
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
                                        <IconButton size="small" onClick={() => {
                                          setSelectedEmployeeForGen(emp._id);
                                          setOpenGenerateDialog(true);
                                        }} sx={{ color: '#F6AD55' }}><Calculate sx={{ fontSize: 18 }} /></IconButton>
                                      </Tooltip>
                                      <CheckCircle sx={{ color: '#38A169', fontSize: 18 }} />
                                    </Stack>
                                  ) : (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => {
                                        setSelectedEmployeeForGen(emp._id);
                                        setOpenGenerateDialog(true);
                                      }}
                                      sx={{ bgcolor: '#1A202C', fontWeight: 800, textTransform: 'none', borderRadius: '6px', px: 2, '&:hover': { bgcolor: '#2D3748' } }}
                                    >
                                      Finalize Ledger
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {employees.length === 0 && (
                      <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Inventory sx={{ fontSize: 48, color: '#E2E8F0', mb: 2 }} />
                        <Typography variant="body2" sx={{ color: '#A0AEC0', fontWeight: 600 }}>No personnel records found in database.</Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#1A202C', pt: 3 }}>Security & Integrity Confirm</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#4A5568', lineHeight: 1.6 }}>
            Confirming this action will finalize or update the financial disbursement for cycle **{selectedMonth}**. This will refresh the ledger based on current attendance, loans, and salary structure.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 4, pt: 2 }}>
          <Button onClick={() => setOpenGenerateDialog(false)} sx={{ color: '#718096', fontWeight: 800, textTransform: 'none' }}>Abort Process</Button>
          <Button variant="contained" onClick={handleGenerateSalary} disabled={generating} sx={{ bgcolor: '#C53030', px: 4, fontWeight: 900, textTransform: 'none', borderRadius: '10px', '&:hover': { bgcolor: '#9B2C2C' } }}>
            {generating ? <CircularProgress size={20} color="inherit" /> : 'Finalize Ledger Record'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('success') || message.includes('successfully') || message.includes('complete') || message.includes('secured') ? 'success' : message.includes('local mail') ? 'info' : 'error'} variant="filled" sx={{ borderRadius: '4px' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
