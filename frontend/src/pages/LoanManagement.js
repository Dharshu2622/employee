import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, IconButton, Paper, Typography, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Snackbar, Alert as MuiAlert, Card, CardContent } from '@mui/material';
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
    try {
      await api.patch(`/loans/${id}/reject`, {});
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
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e0c3fc 100%)', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ '&:hover': { background: 'rgba(255,255,255,0.2)' } }}><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>💳 Loan Management</Typography>
          {!isAdmin && <Button color="inherit" startIcon={<Add />} onClick={() => setOpenDialog(true)} sx={{ fontWeight: '700', textTransform: 'none', fontSize: '1rem' }}>➕ Request Loan</Button>}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
          <Table>
            <TableHead sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>👤 Employee</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>💰 Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>📊 Monthly EMI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>📅 Term</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Status</TableCell>
                {isAdmin && <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>⚙️ Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan._id} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' }, transition: 'all 0.3s ease' }}>
                  <TableCell sx={{ fontWeight: '600' }}>{loan.employee?.name || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: '700', color: '#667eea', fontSize: '1.05rem' }}>₹{loan.amount.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>₹{loan.monthlyEMI.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{loan.termMonths} months</TableCell>
                  <TableCell><Chip label={loan.status} sx={{ background: getStatusColor(loan.status), color: 'white', fontWeight: '700' }} /></TableCell>
                  {isAdmin && loan.status === 'pending' && (
                    <TableCell>
                      <Button size="small" color="success" onClick={() => handleApprove(loan._id)} sx={{ fontWeight: '600', '&:hover': { background: 'rgba(34, 197, 94, 0.1)' } }}>✓ Approve</Button>
                      <Button size="small" color="error" onClick={() => handleReject(loan._id)} sx={{ fontWeight: '600', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>✗ Reject</Button>
                    </TableCell>
                  )}
                  {!isAdmin && loan.status === 'rejected' && loan.rejectionReason && (
                    <TableCell>
                      <Button size="small" onClick={() => { setSelectedLoan(loan); setShowDetailsDialog(true); }} sx={{ fontWeight: '600', color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>👁️ View Reason</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
