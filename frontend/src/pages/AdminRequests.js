import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert as MuiAlert,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel } from '@mui/icons-material';
import api from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminRequests() {
  const [tabValue, setTabValue] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [requestType, setRequestType] = useState('leave');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [leaveRes, loanRes] = await Promise.all([
        api.get('/leaves/all').catch(() => ({ data: [] })),
        api.get('/loans/all').catch(() => ({ data: [] }))
      ]);
      
      setLeaves(leaveRes.data || []);
      setLoans(loanRes.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type, id) => {
    try {
      const endpoint = type === 'leave' ? `/leaves/${id}/approve` : `/loans/${id}/approve`;
      await api.patch(endpoint, {});
      setMessage(`✓ ${type === 'leave' ? 'Leave' : 'Loan'} approved successfully`);
      fetchRequests();
      setShowSnack(true);
    } catch (err) {
      setMessage('Error approving request');
      setShowSnack(true);
    }
  };

  const handleRejectClick = (type, request) => {
    setRequestType(type);
    setSelectedRequest(request);
    setOpenRejectDialog(true);
    setRejectionReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setMessage('⚠️ Rejection reason is required');
      setShowSnack(true);
      return;
    }

    try {
      const endpoint = requestType === 'leave' 
        ? `/leaves/${selectedRequest._id}/reject` 
        : `/loans/${selectedRequest._id}/reject`;
      
      await api.patch(endpoint, { rejectionReason: rejectionReason.trim() });
      
      setMessage(`✓ ${requestType === 'leave' ? 'Leave' : 'Loan'} rejected successfully`);
      setOpenRejectDialog(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
      setShowSnack(true);
    } catch (err) {
      setMessage('Error rejecting request');
      setShowSnack(true);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: '#eab308', approved: '#22c55e', rejected: '#ef4444' };
    return colors[status] || '#999';
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pendingLoans = loans.filter(l => l.status === 'pending');

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e0c3fc 100%)', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ '&:hover': { background: 'rgba(255,255,255,0.2)' } }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>📋 Manage Requests</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Paper sx={{ borderRadius: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '2px solid #e0e0ff' }}>
            <Tab label={`📋 Leave Requests (${pendingLeaves.length})`} sx={{ fontWeight: '700' }} />
            <Tab label={`💳 Loan Requests (${pendingLoans.length})`} sx={{ fontWeight: '700' }} />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <TableContainer sx={{ borderRadius: '12px' }}>
                <Table>
                  <TableHead sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Employee</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Dates</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Reason</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingLeaves.length > 0 ? (
                      pendingLeaves.map((leave) => (
                        <TableRow key={leave._id} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }}>
                          <TableCell sx={{ fontWeight: '600' }}>{leave.employee?.name}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize', fontWeight: '500' }}>{leave.type}</TableCell>
                          <TableCell sx={{ fontSize: '0.9rem' }}>
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leave.reason}</TableCell>
                          <TableCell><Chip label={leave.status} sx={{ background: getStatusColor(leave.status), color: 'white', fontWeight: '700' }} /></TableCell>
                          <TableCell>
                            <Button size="small" startIcon={<CheckCircle />} onClick={() => handleApprove('leave', leave._id)} sx={{ color: '#22c55e', fontWeight: '600', mr: 1 }}>Approve</Button>
                            <Button size="small" startIcon={<Cancel />} onClick={() => handleRejectClick('leave', leave)} sx={{ color: '#ef4444', fontWeight: '600' }}>Reject</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: '#999', fontWeight: '500' }}>No pending leave requests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <TableContainer sx={{ borderRadius: '12px' }}>
                <Table>
                  <TableHead sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Employee</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Amount</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Monthly EMI</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Term</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: '800' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingLoans.length > 0 ? (
                      pendingLoans.map((loan) => (
                        <TableRow key={loan._id} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }}>
                          <TableCell sx={{ fontWeight: '600' }}>{loan.employee?.name}</TableCell>
                          <TableCell sx={{ color: '#667eea', fontWeight: '700' }}>₹{loan.amount.toLocaleString()}</TableCell>
                          <TableCell sx={{ fontWeight: '600' }}>₹{loan.monthlyEMI.toLocaleString()}</TableCell>
                          <TableCell sx={{ fontWeight: '500' }}>{loan.termMonths} months</TableCell>
                          <TableCell><Chip label={loan.status} sx={{ background: getStatusColor(loan.status), color: 'white', fontWeight: '700' }} /></TableCell>
                          <TableCell>
                            <Button size="small" startIcon={<CheckCircle />} onClick={() => handleApprove('loan', loan._id)} sx={{ color: '#22c55e', fontWeight: '600', mr: 1 }}>Approve</Button>
                            <Button size="small" startIcon={<Cancel />} onClick={() => handleRejectClick('loan', loan)} sx={{ color: '#ef4444', fontWeight: '600' }}>Reject</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: '#999', fontWeight: '500' }}>No pending loan requests</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Box>
        </Paper>
      </Container>

      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', color: 'white', fontWeight: '800' }}>
          ⚠️ Provide Rejection Reason
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666', fontWeight: '500' }}>
            📌 {requestType === 'leave' ? 'Leave' : 'Loan'} for: <strong>{selectedRequest?.employee?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please explain why this request is being rejected..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={() => setOpenRejectDialog(false)} sx={{ fontWeight: '600' }}>Cancel</Button>
          <Button variant="contained" onClick={handleRejectSubmit} sx={{ background: '#ef4444', fontWeight: '700' }}>✗ Reject</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} sx={{ borderRadius: '12px', fontWeight: '600' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
