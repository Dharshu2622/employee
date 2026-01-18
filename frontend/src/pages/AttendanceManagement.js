import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, AppBar, Toolbar, IconButton, Paper, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Snackbar, Alert as MuiAlert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import api from '../api';

export default function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('present');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/all');
      let filtered = res.data || [];
      if (selectedMonth) {
        filtered = filtered.filter(a => a.date?.startsWith(selectedMonth));
      }
      setAttendance(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const markAttendance = async () => {
    if (!employeeId) {
      setMessage('Please select an employee');
      setShowSnack(true);
      return;
    }
    setLoading(true);
    try {
      await api.post('/attendance', { employee: employeeId, date, status });
      setMessage('✓ Attendance marked successfully');
      fetchAttendance();
      setEmployeeId('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowSnack(true);
    } catch (err) {
      setMessage('Failed to mark attendance');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s) => {
    const colors = { present: '#22c55e', absent: '#ef4444', leave: '#eab308', halfday: '#f97316' };
    return colors[s] || '#999';
  };

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 50%, #e0c3fc 100%)', minHeight: '100vh' }}>
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ '&:hover': { background: 'rgba(255,255,255,0.2)' } }}><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>📋 Attendance Management</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3.5, borderRadius: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.9) 100%)', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: '800', color: '#333', fontSize: '1.2rem' }}>✓ Mark Attendance</Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>👤 Select Employee</InputLabel>
                <Select value={employeeId} label="👤 Select Employee" onChange={(e) => setEmployeeId(e.target.value)} sx={{ borderRadius: '12px' }}>
                  <MenuItem value="">-- Select Employee --</MenuItem>
                  {employees.map((e) => (<MenuItem key={e._id} value={e._id}>{e.name} — {e.email}</MenuItem>))}
                </Select>
              </FormControl>
              <TextField fullWidth label="📅 Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)} sx={{ borderRadius: '12px' }}>
                  <MenuItem value="present">✓ Present</MenuItem>
                  <MenuItem value="absent">✗ Absent</MenuItem>
                  <MenuItem value="leave">📋 Leave</MenuItem>
                  <MenuItem value="halfday">⏱️ Half Day</MenuItem>
                </Select>
              </FormControl>
              <Button fullWidth variant="contained" onClick={markAttendance} disabled={loading} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', py: 1.8, fontWeight: '800', borderRadius: '12px', fontSize: '1rem', textTransform: 'none' }}>
                {loading ? '⏳ Marking...' : '✅ Mark Attendance'}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3.5, borderRadius: '18px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.9) 100%)', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: '800', color: '#333', fontSize: '1.2rem' }}>🔍 Filter Records</Typography>
              <TextField fullWidth label="📅 Month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
              <Table>
                <TableHead sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>📅 Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>👤 Employee</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>✉️ Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.length > 0 ? attendance.map((record, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' }, transition: 'all 0.3s ease' }}>
                      <TableCell sx={{ fontWeight: '600' }}>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.employee?.name || 'N/A'}</TableCell>
                      <TableCell>{record.employee?.email || 'N/A'}</TableCell>
                      <TableCell><Chip label={record.status} sx={{ background: getStatusColor(record.status), color: 'white', fontWeight: '700' }} /></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#999', fontWeight: '500' }}>No attendance records found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} sx={{ borderRadius: '12px', fontWeight: '600' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
