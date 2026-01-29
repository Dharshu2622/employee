import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, IconButton, Paper, Typography, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Snackbar, Alert as MuiAlert, Card, CardContent, Stack } from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import api from '../api';
import { useSelector } from 'react-redux';

export default function LoanManagement() {
  const [loans, setLoans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ amount: 0, termMonths: 12, reason: '' });
  const [emi, setEmi] = useState(0);
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
    fetchLoans();
  }, [user]);

  const fetchLoans = async () => {
    try {
      const res = await api.get(user?.role === 'admin' ? '/loans/all' : `/loans/employee/${user?.id}`);
      setLoans(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateEMI = (amount, months) => {
    return months && amount ? Math.round(amount / months) : 0;
  };

  const handleAmountChange = (val) => {
    setFormData(prev => ({ ...prev, amount: Number(val) }));
    setEmi(calculateEMI(Number(val), formData.termMonths));
  };

  const handleTermChange = (val) => {
    setFormData(prev => ({ ...prev, termMonths: Number(val) }));
    setEmi(calculateEMI(formData.amount, Number(val)));
  };

  const handleRequestLoan = async () => {
    if (formData.amount <= 0 || formData.termMonths <= 0 || formData.termMonths > 60) {
      setMessage('Please enter valid loan details');
      setShowSnack(true);
      return;
    }
    setLoading(true);
    try {
      await api.post('/loans', { ...formData, employee: user?.id });
      setMessage('✓ Loan request submitted');
      fetchLoans();
      setOpenDialog(false);
      setFormData({ amount: 0, termMonths: 12, reason: '' });
      setEmi(0);
      setShowSnack(true);
    } catch (err) {
      setMessage('Failed to request loan');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/loans/${id}/approve`, {});
      setMessage('✓ Loan approved');
      fetchLoans();
      setShowSnack(true);
    } catch (err) {
      setMessage('Error approving loan');
      setShowSnack(true);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please enter rejection reason:');
    if (!reason || reason.trim() === '') {
      setMessage('Rejection reason is required');
      setShowSnack(true);
      return;
    }

    try {
      await api.patch(`/loans/${id}/reject`, { rejectionReason: reason.trim() });
      setMessage('✓ Loan rejected');
      fetchLoans();
      setShowSnack(true);
    } catch (err) {
      setMessage('Error rejecting loan');
      setShowSnack(true);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: '#eab308', approved: '#22c55e', rejected: '#ef4444' };
    return colors[status] || '#999';
  };

  return (
    <Box sx={{ bgcolor: '#F7FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* HEADER SECTION */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', minHeight: '64px' }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <ArrowBack sx={{ fontSize: 20, color: '#1A202C' }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Loan Management</Typography>
                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>FINANCIAL ASSISTANCE | LIABILITY LOG</Typography>
              </Box>
            </Stack>
            {!isAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{ bgcolor: '#1A202C', fontWeight: 700, textTransform: 'none', px: 2, borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}
              >
                Request Assistance
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
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Personnel</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Principal Amount</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Monthly EMI</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Term Duration</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Reason</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</TableCell>
                  {isAdmin && <TableCell align="right" sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Governance</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loans.length > 0 ? loans.map((loan) => (
                  <TableRow key={loan._id} hover sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{loan.employee?.name || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#2B6CB0', fontSize: '0.85rem' }}>₹{loan.amount.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#4A5568', fontSize: '0.85rem' }}>₹{loan.monthlyEMI.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#718096' }}>{loan.termMonths} Months</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '200px' }}>
                      {loan.reason || '-'}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={loan.status}
                          size="small"
                          sx={{ bgcolor: getStatusColor(loan.status) + '15', color: getStatusColor(loan.status), fontWeight: 800, borderRadius: '4px', border: `1px solid ${getStatusColor(loan.status)}30`, fontSize: '0.65rem', textTransform: 'uppercase' }}
                        />
                        {loan.status === 'rejected' && loan.rejectionReason && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#E53E3E', fontWeight: 600, fontSize: '0.7rem' }}>
                            ⚠️ {loan.rejectionReason}
                          </Typography>
                        )}
                        {loan.status === 'approved' && loan.approvedBy && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#22c55e', fontWeight: 600, fontSize: '0.7rem' }}>
                            ✓ By {loan.approvedBy.name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        {loan.status === 'pending' ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" variant="contained" onClick={() => handleApprove(loan._id)} sx={{ bgcolor: '#48BB78', fontWeight: 800, fontSize: '0.65rem', textTransform: 'none', minWidth: '80px' }}>Approve</Button>
                            <Button size="small" variant="outlined" onClick={() => handleReject(loan._id)} sx={{ color: '#E53E3E', borderColor: '#FED7D7', fontWeight: 800, fontSize: '0.65rem', textTransform: 'none', minWidth: '80px' }}>Decline</Button>
                          </Stack>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 700 }}>AUDITED</Typography>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 10, color: '#94A3B8', fontWeight: 600 }}>ZERO ACTIVE LIABILITIES FOUND</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>💳 Request Loan</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField fullWidth label="💰 Loan Amount" type="number" value={formData.amount} onChange={(e) => handleAmountChange(e.target.value)} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label="📅 Term (Months)" type="number" inputProps={{ min: 1, max: 60 }} value={formData.termMonths} onChange={(e) => handleTermChange(e.target.value)} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          {emi > 0 && (
            <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)', border: '2px solid #667eea', borderRadius: '15px' }}>
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: '700', color: '#666' }}>📊 Monthly EMI Calculation</Typography>
                <Typography variant="h5" sx={{ color: '#667eea', fontWeight: '900', fontSize: '1.8rem', mt: 1 }}>₹{emi.toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ mt: 2, fontWeight: '600', color: '#333' }}>💵 Total Repayment: ₹{(emi * formData.termMonths).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          )}
          <TextField fullWidth label="💬 Reason" multiline rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: '600' }}>Cancel</Button>
          <Button variant="contained" onClick={handleRequestLoan} disabled={loading} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: '700' }}>{loading ? '⏳ Submitting...' : '✅ Request'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>
          ❌ Rejection Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedLoan && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                <strong>Loan Amount:</strong> ₹{selectedLoan.amount.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                <strong>Term:</strong> {selectedLoan.termMonths} months
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                <strong>Monthly EMI:</strong> ₹{selectedLoan.monthlyEMI.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                <strong>Status:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Rejected</span>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#666', fontWeight: '700' }}>Rejection Reason:</Typography>
              <Paper sx={{ p: 2, background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ color: '#991b1b', whiteSpace: 'pre-wrap' }}>
                  {selectedLoan.rejectionReason || 'No reason provided'}
                </Typography>
              </Paper>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={() => setShowDetailsDialog(false)} sx={{ fontWeight: '600' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} sx={{ borderRadius: '12px', fontWeight: '600' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
