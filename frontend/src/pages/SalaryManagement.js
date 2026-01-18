import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, IconButton, Paper, Typography, Grid, TextField, Button, Card, CardContent, Snackbar, Alert as MuiAlert, FormControl, InputLabel, Select, MenuItem, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function SalaryManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [form, setForm] = useState({ baseSalary: 0, hra: 0, da: 0, travel: 0, medical: 0, pf: 0, tax: 0, insurance: 0 });
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [selectedEmployeeForGen, setSelectedEmployeeForGen] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
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

  const handleChange = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: Number(e.target.value || 0) }));
  };

  const gross = form.baseSalary + form.hra + form.da + form.travel + form.medical;
  const totalDeductions = form.pf + form.tax + form.insurance;
  const net = gross - totalDeductions;

  const handleSave = async () => {
    if (!selectedEmployee) {
      setMessage('Please select an employee');
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
      setMessage('✓ Salary structure saved successfully');
      setShowSnack(true);
    } catch (err) {
      setMessage('Failed to save');
      setShowSnack(true);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSalary = async () => {
    if (!selectedEmployeeForGen || !selectedMonth) {
      setMessage('⚠️ Please select employee and month');
      setShowSnack(true);
      return;
    }
    
    setGenerating(true);
    try {
      const res = await api.post('/salary/generate', {
        employeeId: selectedEmployeeForGen,
        month: selectedMonth
      });
      const emp = employees.find(e => e._id === selectedEmployeeForGen);
      setMessage(`✓ Salary generated for ${emp?.name}\nGross: ₹${res.data.grossSalary.toLocaleString()}\nNet: ₹${res.data.netSalary.toLocaleString()}`);
      setShowSnack(true);
      setOpenGenerateDialog(false);
      setSelectedEmployeeForGen('');
      setSelectedMonth(new Date().toISOString().slice(0, 7));
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to generate salary');
      setShowSnack(true);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e0c3fc 100%)', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ '&:hover': { background: 'rgba(255,255,255,0.2)' } }}><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>💰 Salary Management</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper sx={{ p: 4, borderRadius: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.9) 100%)', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '2px solid #e0e0ff', mb: 3 }}>
            <Tab label="💼 Set Salary Structure" sx={{ fontWeight: '700' }} />
            <Tab label="📊 Generate Monthly Salary" sx={{ fontWeight: '700' }} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: '800', color: '#333', fontSize: '1.3rem' }}>💼 Set Salary Structure</Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>👤 Select Employee</InputLabel>
                  <Select value={selectedEmployee} label="👤 Select Employee" onChange={(e) => setSelectedEmployee(e.target.value)} sx={{ borderRadius: '12px' }}>
                    <MenuItem value="">-- Select Employee --</MenuItem>
                    {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name} — {emp.email}</MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="💵 Base Salary" type="number" value={form.baseSalary} onChange={handleChange('baseSalary')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>

              <Grid item xs={12} md={3}><TextField fullWidth label="🏘️ HRA" type="number" value={form.hra} onChange={handleChange('hra')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="📊 DA" type="number" value={form.da} onChange={handleChange('da')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="✈️ Travel" type="number" value={form.travel} onChange={handleChange('travel')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
              <Grid item xs={12} md={3}><TextField fullWidth label="🏥 Medical" type="number" value={form.medical} onChange={handleChange('medical')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>

              <Grid item xs={12} md={4}><TextField fullWidth label="🏦 PF" type="number" value={form.pf} onChange={handleChange('pf')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="💸 Tax" type="number" value={form.tax} onChange={handleChange('tax')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>
              <Grid item xs={12} md={4}><TextField fullWidth label="🛡️ Insurance" type="number" value={form.insurance} onChange={handleChange('insurance')} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} /></Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'linear-gradient(135deg, #22c55e10 0%, #16a34a10 100%)', border: '2px solid #22c55e', borderRadius: '15px' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: '700', color: '#666' }}>📈 Gross Earnings</Typography>
                    <Typography variant="h5" sx={{ color: '#22c55e', fontWeight: '900', fontSize: '2rem' }}>₹{gross.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ background: 'linear-gradient(135deg, #ef444410 0%, #dc262610 100%)', border: '2px solid #ef4444', borderRadius: '15px' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: '700', color: '#666' }}>📉 Total Deductions</Typography>
                    <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: '900', fontSize: '2rem' }}>₹{totalDeductions.toLocaleString()}</Typography>
                    <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: '700', color: '#667eea' }}>💰 Net: ₹{net.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Button fullWidth variant="contained" onClick={handleSave} disabled={saving} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', py: 2, fontWeight: '800', borderRadius: '12px', fontSize: '1.1rem', textTransform: 'none' }}>
                  {saving ? '⏳ Saving Structure...' : '💾 Save Salary Structure'}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 4, fontWeight: '800', color: '#333', fontSize: '1.3rem' }}>📊 Generate Monthly Salary</Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>👤 Select Employee</InputLabel>
                  <Select value={selectedEmployeeForGen} label="👤 Select Employee" onChange={(e) => setSelectedEmployeeForGen(e.target.value)} sx={{ borderRadius: '12px' }}>
                    <MenuItem value="">-- Select Employee --</MenuItem>
                    {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name} — {emp.email}</MenuItem>))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="📅 Month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)', border: '2px solid #667eea', borderRadius: '15px', p: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: '600', mb: 2 }}>
                    ℹ️ <strong>How it works:</strong> The system will automatically calculate salary based on:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555', ml: 2, mb: 1 }}>• Employee attendance and leaves for the selected month</Typography>
                  <Typography variant="body2" sx={{ color: '#555', ml: 2, mb: 1 }}>• Salary structure configured for the employee</Typography>
                  <Typography variant="body2" sx={{ color: '#555', ml: 2 }}>• Approved loans and pending EMI deductions</Typography>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Button fullWidth variant="contained" onClick={() => setOpenGenerateDialog(true)} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', py: 2, fontWeight: '800', borderRadius: '12px', fontSize: '1.1rem', textTransform: 'none' }}>
                  ✓ Generate Salary
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Container>

      <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '800' }}>
          ⚠️ Confirm Generation
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Generate salary for <strong>{employees.find(e => e._id === selectedEmployeeForGen)?.name}</strong> for month <strong>{selectedMonth}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', fontSize: '0.9rem' }}>This will calculate salary based on attendance records and existing salary structure.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={() => setOpenGenerateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateSalary} disabled={generating} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: '700' }}>
            {generating ? '⏳ Generating...' : '✓ Proceed'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} sx={{ borderRadius: '12px', fontWeight: '600' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
