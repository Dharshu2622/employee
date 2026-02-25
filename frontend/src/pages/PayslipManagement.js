import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
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
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  Download,
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

  const handleDownload = async (id, employeeId, month) => {
    try {
      // Sync latest data if possible before download
      if (employeeId && month) {
        await api.post('/salary/generate', { employeeId, month }).catch(() => null);
      }

      const response = await api.get(`/payslips/${id}/download`, { responseType: 'blob' });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
      setMessage('✓ Payslip archetyped and decrypted for viewing');
      setShowSnack(true);
      fetchPayslips(); // Refresh to show any net salary updates
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
    <Box sx={{ background: '#f8fafc', minHeight: '100vh', pb: 8, overflowY: 'auto' }}>
      {/* HEADER SECTION */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        pt: 6,
        pb: 10,
        borderRadius: '0 0 40px 40px'
      }}>
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                color: 'white',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Back to Dashboard
            </Button>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>My Payslips</Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                View and download your salary payslips
              </Typography>
            </Box>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<Receipt />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  bgcolor: 'white',
                  color: '#0f172a',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  borderRadius: '12px',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                Generate Record
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {fetchLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: '#1A202C' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {payslips.slice(0, 1).map((payslip) => (
              <Grid item xs={12} sm={6} md={4} key={payslip._id}>
                <Card sx={{
                  borderRadius: '20px',
                  border: '1px solid #EEF2F6',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  bgcolor: 'white',
                  '&:hover': {
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    transform: 'translateY(-8px)',
                    borderColor: '#6366f1'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#1A202C' }}>
                            {new Date(`${payslip.month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </Typography>
                          <Box sx={{
                            px: 2,
                            py: 1,
                            borderRadius: '12px',
                            bgcolor: payslip.emailSent ? '#D1FAE5' : '#EBF8FF'
                          }}>
                            <Typography variant="caption" sx={{
                              fontWeight: 800,
                              color: payslip.emailSent ? '#047857' : '#3182CE',
                              textTransform: 'uppercase',
                              fontSize: '0.65rem'
                            }}>
                              {payslip.emailSent ? 'Delivered' : 'Internal'}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
                          {payslip.employee?.name || 'Staff Member'}
                        </Typography>
                      </Box>

                      <Divider />

                      <Box>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>Gross Salary</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A202C' }}>
                              ₹{payslip.salary?.gross?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>Deductions</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#EF4444' }}>
                              ₹{payslip.salary?.totalDeductions?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#1A202C' }}>Net Salary</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>
                              ₹{payslip.netSalary?.toLocaleString() || payslip.salary?.net?.toLocaleString() || '0'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Divider />

                      <Stack direction="row" spacing={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Download />}
                          onClick={() => handleDownload(payslip._id, payslip.employee?._id, payslip.month)}
                          sx={{
                            bgcolor: '#6366f1',
                            color: 'white',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '12px',
                            py: 1.5,
                            '&:hover': { bgcolor: '#4f46e5' }
                          }}
                        >
                          Download PDF
                        </Button>
                        {isAdmin && (
                          <Tooltip title="Send Email">
                            <Button
                              variant="outlined"
                              onClick={() => handleOpenMailClient(payslip)}
                              sx={{
                                borderRadius: '12px',
                                minWidth: '48px',
                                borderColor: '#E2E8F0',
                                color: '#4A5568',
                                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E0' }
                              }}
                            >
                              <ContactMail sx={{ fontSize: 20 }} />
                            </Button>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
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
    </Box >
  );
}
