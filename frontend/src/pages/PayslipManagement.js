import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert as MuiAlert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  CircularProgress,
  Avatar,
  Tooltip,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Email,
  Add,
  Badge,
  HistoryEdu,
  Print,
  VerifiedUser,
  Security,
  ContactMail,
  Receipt
} from '@mui/icons-material';
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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    const checkRole = () => {
      setIsAdmin(user?.role === 'admin' || user?.role === 'superior');
    };
    checkRole();
    fetchPayslips();
    if (user?.role === 'admin' || user?.role === 'superior') {
      fetchEmployees();
    }
  }, [user]);

  const fetchPayslips = async () => {
    try {
      setFetchLoading(true);
      const isManagerial = user?.role === 'admin' || user?.role === 'superior';
      const endpoint = isManagerial ? '/payslips/all' : `/payslips/employee/${user?.id}`;
      const res = await api.get(endpoint);
      setPayslips(res.data || []);
      setFetchLoading(false);
    } catch (err) {
      console.error('Audit fetch error:', err);
      setFetchLoading(false);
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
      setMessage('Temporal and identity targets required');
      setShowSnack(true);
      return;
    }
    setLoading(true);
    try {
      await api.post('/payslips/generate', { employeeId: formData.employeeId, month: formData.month });
      setMessage('✓ Disbursement record generated and archived');
      fetchPayslips();
      setOpenDialog(false);
      setFormData({ employeeId: '', month: new Date().toISOString().slice(0, 7) });
      setShowSnack(true);
    } catch (err) {
      setMessage('Generation engine failure');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/payslips/${id}/download`, { responseType: 'blob' });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
      setMessage('✓ Payslip archetyped and decrypted for viewing');
      setShowSnack(true);
    } catch (err) {
      setMessage('Credential download error');
      setShowSnack(true);
    }
  };

  const handleOpenMailClient = (payslip) => {
    const email = payslip?.employee?.email;
    if (!email) {
      setMessage('Identity contact not found');
      setShowSnack(true);
      return;
    }

    const downloadUrl = `${api.defaults.baseURL}/payslips/${payslip._id}/download`;
    const subject = `FORMAL NOTIFICATION: Financial Audit Cycle ${payslip.month}`;
    const body = `SECURE IDENTITY: ${payslip.employee?.name || ''}\n\nYour financial record for cycle ${payslip.month} has been finalized. Access the official audit document via the secure portal or download directly:\n\nARCHIVE LINK: ${downloadUrl}\n\n[ADMINISTRATIVE SECURITY PROTOCOL v4.0]`;
    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <Box sx={{ bgcolor: '#F7FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* HEADER */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', minHeight: '64px' }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <ArrowBack sx={{ fontSize: 20, color: '#1A202C' }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Audit Archives</Typography>
                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>FINANCIAL LEDGER | ENCRYPTION SECURE</Typography>
              </Box>
            </Stack>
            {isAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Receipt />}
                onClick={() => setOpenDialog(true)}
                sx={{ bgcolor: '#1A202C', fontWeight: 700, textTransform: 'none', px: 2, borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}
              >
                Initialize Audit Record
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Paper sx={{ flexGrow: 1, borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 120px)', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' } }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Identity</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Cycle</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Net Disbursement</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Security Status</TableCell>
                  <TableCell align="right" sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Operational Control</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fetchLoading ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress size={24} sx={{ color: '#1A202C' }} /></TableCell></TableRow>
                ) : payslips.map((payslip) => (
                  <TableRow key={payslip._id} hover sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: '#F1F5F9', color: '#1A202C', width: 28, height: 28, fontSize: '0.75rem', fontWeight: 800 }}>
                          <Security sx={{ fontSize: 14 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1A202C' }}>{payslip.employee?.name || 'Authorized Personnel'}</Typography>
                          <Typography variant="caption" sx={{ color: '#718096', fontWeight: 500, fontSize: '0.7rem' }}>ID: {payslip._id.substring(18, 24).toUpperCase()}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A5568', fontSize: '0.85rem' }}>{payslip.month}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#2B6CB0', fontSize: '0.85rem' }}>₹{payslip.netSalary?.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payslip.emailSent ? 'Delivered' : 'Internal Archive'}
                        size="small"
                        sx={{
                          borderRadius: '4px',
                          fontWeight: 800,
                          color: payslip.emailSent ? '#48BB78' : '#3182CE',
                          bgcolor: payslip.emailSent ? '#F0FFF4' : '#EBF8FF',
                          fontSize: '0.6rem',
                          textTransform: 'uppercase'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Secure Download">
                          <IconButton size="small" onClick={() => handleDownload(payslip._id)} sx={{ color: '#1A202C', p: 0.5 }}><Download sx={{ fontSize: 16 }} /></IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <Tooltip title="Initialize External Notification">
                            <IconButton size="small" onClick={() => handleOpenMailClient(payslip)} sx={{ color: '#3182CE', p: 0.5 }}><ContactMail sx={{ fontSize: 16 }} /></IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* GENERATION DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A202C', pt: 3 }}>Initialize Financial Cycle Audit</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
              <InputLabel>Personnel Target</InputLabel>
              <Select value={formData.employeeId} label="Personnel Target" onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}>
                {employees.map((emp) => (<MenuItem key={emp._id} value={emp._id}>{emp.name}</MenuItem>))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Cycle Mapping (Month)" type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            <Box sx={{ p: 2, bgcolor: '#FFF5F5', borderRadius: '8px', border: '1px solid #FED7D7' }}>
              <Typography variant="caption" sx={{ color: '#C53030', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ fontSize: 14 }} /> System Audit Warning
              </Typography>
              <Typography variant="caption" sx={{ color: '#9B2C2C', display: 'block', mt: 1 }}>
                Generation of this document will finalize all leave adjustments and loan EMIs for the restricted cycle.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 4 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#718096', fontWeight: 700, textTransform: 'none' }}>Cancel Audit</Button>
          <Button variant="contained" onClick={handleGeneratePayslip} disabled={loading} sx={{ bgcolor: '#1A202C', px: 4, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Generation'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} variant="filled" sx={{ borderRadius: '4px' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
