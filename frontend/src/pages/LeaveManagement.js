import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, IconButton, Paper, Typography, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Snackbar, Alert as MuiAlert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import api from '../api';
import { useSelector } from 'react-redux';

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ type: 'casual', fromDate: '', toDate: '', reason: '' });
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
    fetchLeaves();
  }, [user]);

  const fetchLeaves = async () => {
    try {
      const res = await api.get(user?.role === 'admin' ? '/leaves/all' : `/leaves/employee/${user?.id}`);
      setLeaves(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestLeave = async () => {
    if (!formData.fromDate || !formData.toDate) {
      setMessage('Please select dates');
      setShowSnack(true);
      return;
    }
    setLoading(true);
    try {
      await api.post('/leaves', { ...formData, employee: user?.id });
      setMessage('✓ Leave request submitted');
      fetchLeaves();
      setOpenDialog(false);
      setFormData({ type: 'casual', fromDate: '', toDate: '', reason: '' });
      setShowSnack(true);
    } catch (err) {
      setMessage('Failed to request leave');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/leaves/${id}/approve`, {});
      setMessage('✓ Leave approved');
      fetchLeaves();
      setShowSnack(true);
    } catch (err) {
      setMessage('Error approving leave');
      setShowSnack(true);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/leaves/${id}/reject`, {});
      setMessage('✓ Leave rejected');
      fetchLeaves();
      setShowSnack(true);
    } catch (err) {
      setMessage('Error rejecting leave');
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
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>📋 Leave Management</Typography>
          {!isAdmin && <Button color="inherit" startIcon={<Add />} onClick={() => setOpenDialog(true)} sx={{ fontWeight: '700', textTransform: 'none', fontSize: '1rem' }}>➕ Request Leave</Button>}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
          <Table>
            <TableHead sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>👤 Employee</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>📅 Type</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>📆 From - To</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Status</TableCell>
                {isAdmin && <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>⚙️ Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave._id} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' }, transition: 'all 0.3s ease' }}>
                  <TableCell sx={{ fontWeight: '600' }}>{leave.employee?.name || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: '500', textTransform: 'capitalize' }}>{leave.type}</TableCell>
                  <TableCell sx={{ fontSize: '0.95rem' }}>{new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}</TableCell>
                  <TableCell><Chip label={leave.status} sx={{ background: getStatusColor(leave.status), color: 'white', fontWeight: '700' }} /></TableCell>
                  {isAdmin && leave.status === 'pending' && (
                    <TableCell>
                      <Button size="small" color="success" onClick={() => handleApprove(leave._id)} sx={{ fontWeight: '600', '&:hover': { background: 'rgba(34, 197, 94, 0.1)' } }}>✓ Approve</Button>
                      <Button size="small" color="error" onClick={() => handleReject(leave._id)} sx={{ fontWeight: '600', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>✗ Reject</Button>
                    </TableCell>
                  )}
                  {!isAdmin && leave.status === 'rejected' && leave.rejectionReason && (
                    <TableCell>
                      <Button size="small" onClick={() => { setSelectedLeave(leave); setShowDetailsDialog(true); }} sx={{ fontWeight: '600', color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>👁️ View Reason</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>📨 Request Leave</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Leave Type</InputLabel>
            <Select value={formData.type} label="Leave Type" onChange={(e) => setFormData({ ...formData, type: e.target.value })} sx={{ borderRadius: '12px' }}>
              <MenuItem value="sick">🤒 Sick Leave</MenuItem>
              <MenuItem value="casual">😊 Casual Leave</MenuItem>
              <MenuItem value="earned">💼 Earned Leave</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth label="📅 From Date" type="date" value={formData.fromDate} onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label="📅 To Date" type="date" value={formData.toDate} onChange={(e) => setFormData({ ...formData, toDate: e.target.value })} InputLabelProps={{ shrink: true }} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label="💬 Reason" multiline rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ fontWeight: '600' }}>Cancel</Button>
          <Button variant="contained" onClick={handleRequestLeave} disabled={loading} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: '700' }}>{loading ? '⏳ Submitting...' : '✅ Request'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>
          ❌ Rejection Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedLeave && (
            <>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                <strong>Leave Type:</strong> {selectedLeave.type}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                <strong>Period:</strong> {new Date(selectedLeave.fromDate).toLocaleDateString()} to {new Date(selectedLeave.toDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                <strong>Status:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Rejected</span>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: '#666', fontWeight: '700' }}>Rejection Reason:</Typography>
              <Paper sx={{ p: 2, background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ color: '#991b1b', whiteSpace: 'pre-wrap' }}>
                  {selectedLeave.rejectionReason || 'No reason provided'}
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
