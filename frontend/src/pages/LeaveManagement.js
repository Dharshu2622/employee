import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, IconButton, Paper, Typography, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Snackbar, Alert as MuiAlert, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';
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
    const reason = window.prompt('Please enter rejection reason:');
    if (!reason || reason.trim() === '') {
      setMessage('Rejection reason is required');
      setShowSnack(true);
      return;
    }

    try {
      await api.patch(`/leaves/${id}/reject`, { rejectionReason: reason.trim() });
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
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Leave Management</Typography>
                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>Track and manage leave requests.</Typography>
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
                Request Leave
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
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Employee</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Leave Type</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Period</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Reason</TableCell>
                  <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</TableCell>
                  {isAdmin && <TableCell align="right" sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Action</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.length > 0 ? leaves.map((leave) => (
                  <TableRow key={leave._id} hover sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{leave.employee?.name || 'N/A'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', color: '#718096' }}>{leave.type}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem', color: '#4A5568' }}>{new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '200px' }}>
                      {leave.reason || '-'}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={leave.status}
                          size="small"
                          sx={{ bgcolor: getStatusColor(leave.status) + '15', color: getStatusColor(leave.status), fontWeight: 800, borderRadius: '4px', border: `1px solid ${getStatusColor(leave.status)}30`, fontSize: '0.65rem', textTransform: 'uppercase' }}
                        />
                        {leave.status === 'rejected' && leave.rejectionReason && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#E53E3E', fontWeight: 600, fontSize: '0.7rem' }}>
                            ⚠️ {leave.rejectionReason}
                          </Typography>
                        )}
                        {leave.status === 'approved' && leave.approvedBy && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#22c55e', fontWeight: 600, fontSize: '0.7rem' }}>
                            ✓ By {leave.approvedBy.name}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        {leave.status === 'pending' ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" variant="contained" onClick={() => handleApprove(leave._id)} sx={{ bgcolor: '#48BB78', fontWeight: 800, fontSize: '0.65rem', textTransform: 'none', minWidth: '80px' }}>Approve</Button>
                            <Button size="small" variant="outlined" onClick={() => handleReject(leave._id)} sx={{ color: '#E53E3E', borderColor: '#FED7D7', fontWeight: 800, fontSize: '0.65rem', textTransform: 'none', minWidth: '80px' }}>Decline</Button>
                          </Stack>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#A0AEC0', fontWeight: 700 }}>PROCESSED</Typography>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 10, color: '#94A3B8', fontWeight: 600 }}>NO LEAVE REQUESTS FOUND</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
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
