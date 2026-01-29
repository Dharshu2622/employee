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
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Payments,
  AccountBalance,
  ReceiptLong,
  InfoOutlined,
  Calculate,
  HistoryEdu,
  CheckCircle,
  AccountBalanceWallet,
  Savings,
  PriceCheck,
  Inventory,
  Visibility
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

  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployeeData = async (id) => {
    if (!id) return;
    try {
      // Fetch loans for the specific employee
      const loanRes = await api.get(`/loans/employee/${id}`);
      setEmployeeLoans(loanRes.data || []);

      // Fetch current salary structure if it exists
      const salRes = await api.get(`/salary/structure/${id}`).catch(() => null);
      if (salRes && salRes.data) {
        setForm({
          baseSalary: salRes.data.baseSalary || 0,
          hra: salRes.data.allowances?.hra || 0,
          da: salRes.data.allowances?.da || 0,
          travel: salRes.data.allowances?.travel || 0,
          medical: salRes.data.allowances?.medical || 0,
          pf: salRes.data.deductions?.pf || 0,
          tax: salRes.data.deductions?.tax || 0,
          insurance: salRes.data.deductions?.insurance || 0
        });
      }
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
    if (isAdmin) return; // Prevent input changes for admin
    setForm(prev => ({ ...prev, [key]: Number(e.target.value || 0) }));
  };

  const gross = form.baseSalary + form.hra + form.da + form.travel + form.medical;
  const totalDeductions = form.pf + form.tax + form.insurance;
  const net = gross - totalDeductions;

  // Loan Summary Calculations
  const activeLoans = employeeLoans.filter(l => l.status === 'approved');
  const totalLoanAmount = activeLoans.reduce((sum, l) => sum + (l.amount || 0), 0);
  const deductedLoanAmount = activeLoans.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const remainingLoanBalance = totalLoanAmount - deductedLoanAmount;

  const handleSave = async () => {
    if (isAdmin) return;
    if (!selectedEmployee) {
      setMessage('Identification of personnel required');
      setShowSnack(true);
      return;
    }
    setSaving(true);
    try {
      await api.post('/salary/structure', {
        employeeId: selectedEmployee,
        baseSalary: form.baseSalary,
        allowances: { hra: form.hra, da: form.da, travel: form.travel, medical: form.medical },
        deductions: { pf: form.pf, tax: form.tax, insurance: form.insurance }
      });
      setMessage('✓ Financial structure successfully archived');
      setShowSnack(true);
    } catch (err) {
      setMessage('Archive error during processing');
      setShowSnack(true);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSalary = async () => {
    if (isAdmin) return;
    if (!selectedEmployeeForGen || !selectedMonth) {
      setMessage('Temporal and identity identifiers required');
      setShowSnack(true);
      return;
    }

    setGenerating(true);
    try {
      await api.post('/salary/generate', {
        employeeId: selectedEmployeeForGen,
        month: selectedMonth
      });
      setMessage(`✓ Disbursement finalized for cycle ${selectedMonth}`);
      setShowSnack(true);
      setOpenGenerateDialog(false);
      setSelectedEmployeeForGen('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Calculation engine failure');
      setShowSnack(true);
    } finally {
      setGenerating(false);
    }
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
              <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>{isAdmin ? 'AUDIT PROTOCOL | READ-ONLY LEDGER' : 'DISBURSEMENT MODULE | LEDGER MANAGEMENT'}</Typography>
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
            <Tab label={isAdmin ? "Audit Framework" : "Configured Structures"} icon={<Calculate sx={{ fontSize: 18 }} />} iconPosition="start" />
            {!isAdmin && <Tab label="Disbursement Engine" icon={<PriceCheck sx={{ fontSize: 18 }} />} iconPosition="start" />}
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

                    {isAdmin && (
                      <Box sx={{ p: 2, bgcolor: '#FFF5F5', borderRadius: '8px', border: '1px solid #FED7D7', mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#C53030', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InfoOutlined sx={{ fontSize: 14 }} /> ADMINISTRATIVE RESTRICTION
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#9B2C2C', display: 'block', mt: 0.5 }}>
                          You are currently in **Audit Mode**. Technical structures can only be modified by the **Superior Personnel** level.
                        </Typography>
                      </Box>
                    )}

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Base Operating Salary" type="number" value={form.baseSalary} onChange={handleChange('baseSalary')} disabled={isAdmin} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ color: '#3182CE', fontWeight: 800 }}>Total Calculated Gross: ₹{gross.toLocaleString()}</Typography>
                      </Grid>

                      <Grid item xs={12}><Divider><Chip label="ALLOWANCE ALLOCATION" size="small" sx={{ fontWeight: 900, fontSize: '0.65rem' }} /></Divider></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="HRA" type="number" value={form.hra} onChange={handleChange('hra')} disabled={isAdmin} /></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="DA" type="number" value={form.da} onChange={handleChange('da')} disabled={isAdmin} /></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="Travel" type="number" value={form.travel} onChange={handleChange('travel')} disabled={isAdmin} /></Grid>
                      <Grid item xs={12} sm={3}><TextField fullWidth label="Medical" type="number" value={form.medical} onChange={handleChange('medical')} disabled={isAdmin} /></Grid>

                      <Grid item xs={12}><Divider><Chip label="SYSTEM DEDUCTIONS" size="small" sx={{ fontWeight: 900, fontSize: '0.65rem' }} /></Divider></Grid>
                      <Grid item xs={12} sm={4}><TextField fullWidth label="PF Contribution" type="number" value={form.pf} onChange={handleChange('pf')} disabled={isAdmin} /></Grid>
                      <Grid item xs={12} sm={4}><TextField fullWidth label="Govt Tax" type="number" value={form.tax} onChange={handleChange('tax')} disabled={isAdmin} /></Grid>
                      <Grid item xs={12} sm={4}><TextField fullWidth label="Insurance" type="number" value={form.insurance} onChange={handleChange('insurance')} disabled={isAdmin} /></Grid>
                    </Grid>

                    {!isAdmin && (
                      <Button fullWidth variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: '#1A202C', py: 2, fontWeight: 800, borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}>
                        {saving ? <CircularProgress size={24} color="inherit" /> : 'Commit Financial Structure'}
                      </Button>
                    )}
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
                            <Typography variant="caption" sx={{ color: '#718096', fontWeight: 800 }}>Liability Absorption Trace</Typography>
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
              <Box sx={{ maxWidth: '640px', mx: 'auto', textAlign: 'center', py: 6 }}>
                <Inventory sx={{ fontSize: 72, color: '#E2E8F0', mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#1A202C', mb: 1.5, letterSpacing: -0.5 }}>Disbursement Control Engine</Typography>
                <Typography variant="body2" sx={{ color: '#718096', mb: 6, fontWeight: 500 }}>Initialize the monthly financial cycle and process high-integrity settlements across the authenticated workforce registry.</Typography>

                <Paper sx={{ p: 5, borderRadius: '16px', border: '1px solid #E2E8F0', textAlign: 'left', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <Stack spacing={4}>
                    <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
                      <InputLabel>Personnel Execution Mapping</InputLabel>
                      <Select value={selectedEmployeeForGen} label="Personnel Execution Mapping" onChange={(e) => setSelectedEmployeeForGen(e.target.value)}>
                        {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>))}
                      </Select>
                    </FormControl>

                    <TextField fullWidth label="Audit Cycle Identifier (Month)" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />

                    <Box sx={{ p: 2.5, bgcolor: '#ebf8ff', borderRadius: '10px', border: '1px solid #bee3f8' }}>
                      <Typography variant="caption" sx={{ color: '#2b6cb0', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase' }}>
                        <InfoOutlined sx={{ fontSize: 16 }} /> Processing Logic Trace
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#2c5282', display: 'block', mt: 1.5, lineHeight: 1.6, fontWeight: 500 }}>
                        Triggering this engine will aggregate verified attendance, calculate leave-adjusted deductions, and deduct prioritized EMI installments for the specified temporal cycle.
                      </Typography>
                    </Box>

                    <Button fullWidth variant="contained" onClick={() => setOpenGenerateDialog(true)} sx={{ bgcolor: '#1A202C', py: 2.5, fontWeight: 900, borderRadius: '10px', textTransform: 'none', fontSize: '1rem', '&:hover': { bgcolor: '#2D3748' } }}>
                      Initialize Full Disbursement Cycle
                    </Button>
                  </Stack>
                </Paper>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#1A202C', pt: 3 }}>Security & Integrity Confirm</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#4A5568', lineHeight: 1.6 }}>
            Confirming this action will finalize the financial disbursement for cycle **{selectedMonth}**. This will trigger immutable ledger entries for the specified personnel mapping.
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
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} variant="filled" sx={{ borderRadius: '6px', fontWeight: 700 }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
