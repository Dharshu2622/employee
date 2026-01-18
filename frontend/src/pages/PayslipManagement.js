import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, IconButton, Paper, Typography, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Snackbar, Alert as MuiAlert, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ArrowBack, Download, Email, Add } from '@mui/icons-material';
import api from '../api';
import { useSelector } from 'react-redux';

export default function PayslipManagement() {
  const [payslips, setPayslips] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ employeeId: '', month: new Date().toISOString().slice(0, 7) });
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
    fetchPayslips();
    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [user]);

  const fetchPayslips = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/payslips/all' : `/payslips/employee/${user?.id}`;
      const res = await api.get(endpoint);
      setPayslips(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePayslip = async () => {
    if (!formData.employeeId) {
      setMessage('Please select employee and month');
      setShowSnack(true);
      return;
    }
    setLoading(true);
    try {
      await api.post('/payslips/generate', { employeeId: formData.employeeId, month: formData.month });
      setMessage('✓ Payslip generated successfully');
      fetchPayslips();
      setOpenDialog(false);
      setFormData({ employeeId: '', month: new Date().toISOString().slice(0, 7) });
      setShowSnack(true);
    } catch (err) {
      setMessage('Failed to generate payslip');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/payslips/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setMessage('Failed to download payslip');
      setShowSnack(true);
    }
  };

  const handleSendEmail = async (id) => {
    try {
      await api.post(`/payslips/${id}/send-email`, {});
      setMessage('✓ Payslip sent via email');
      fetchPayslips();
      setShowSnack(true);
    } catch (err) {
      setMessage('Failed to send email via server');
      setShowSnack(true);
    }
  };

  // Open user's mail client with prefilled recipient, subject and body (includes download link)
  const handleOpenMailClient = (payslip) => {
    const email = payslip?.employee?.email;
    if (!email) {
      setMessage('Employee email not available');
      setShowSnack(true);
      return;
    }

    const downloadUrl = `${api.defaults.baseURL}/payslips/${payslip._id}/download`;
    const subject = `Payslip for ${payslip.month}`;
    const body = `Hello ${payslip.employee?.name || ''},\n\nPlease download your payslip here: ${downloadUrl}\n\nRegards,\nHR Team`;
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Open default mail client; cannot attach file via mailto, so include download link
    window.location.href = mailto;
  };

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e0c3fc 100%)', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ '&:hover': { background: 'rgba(255,255,255,0.2)' } }}><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>📄 Payslip Management</Typography>
          {isAdmin && <Button color="inherit" startIcon={<Add />} onClick={() => setOpenDialog(true)} sx={{ fontWeight: '700', textTransform: 'none', fontSize: '1rem' }}>➕ Generate Payslip</Button>}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
          <Table>
            <TableHead sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>👤 Employee</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>📅 Month</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>⚙️ Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payslips.map((payslip) => (
                <TableRow key={payslip._id} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' }, transition: 'all 0.3s ease' }}>
                  <TableCell sx={{ fontWeight: '600' }}>{payslip.employee?.name || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{payslip.month}</TableCell>
                  <TableCell><Chip label={payslip.emailSent ? '✓ Sent' : 'Pending'} sx={{ background: payslip.emailSent ? '#22c55e' : '#eab308', color: 'white', fontWeight: '700' }} /></TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Download />} onClick={() => handleDownload(payslip._id)} sx={{ color: '#667eea', fontWeight: '600', '&:hover': { background: 'rgba(102, 126, 234, 0.1)' } }}>📥 Download</Button>
                    {isAdmin && <Button size="small" startIcon={<Email />} onClick={() => handleOpenMailClient(payslip)} sx={{ color: '#f59e0b', fontWeight: '600', '&:hover': { background: 'rgba(245, 158, 11, 0.1)' } }}>✉️ Email</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>📄 Generate Payslip</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>👤 Select Employee</InputLabel>
            <Select value={formData.employeeId} label="👤 Select Employee" onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} sx={{ borderRadius: '12px' }}>
              <MenuItem value="">-- Select Employee --</MenuItem>
              {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField fullWidth label="📅 Month" type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: '600' }}>Cancel</Button>
          <Button variant="contained" onClick={handleGeneratePayslip} disabled={loading} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: '700' }}>{loading ? '⏳ Generating...' : '✅ Generate'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} sx={{ borderRadius: '12px', fontWeight: '600' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
