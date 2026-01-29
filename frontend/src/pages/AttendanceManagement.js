import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Paper, Typography, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Snackbar, Alert as MuiAlert, CircularProgress, IconButton, Stack, Avatar
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, HistoryToggleOff, EventNote } from '@mui/icons-material';
import api from '../api';

export default function AttendanceManagement() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('present');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    // 30s polling for real-time accuracy
    const poll = setInterval(fetchAttendance, 30000);
    return () => clearInterval(poll);
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
      // Filter out records where employee is null (N/A)
      filtered = filtered.filter(a => a.employee);

      setAttendance(filtered);
      setFetchLoading(false);
    } catch (err) {
      console.error(err);
      setFetchLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!employeeId) {
      setMessage('Identification of personnel required');
      setShowSnack(true);
      return;
    }
    setLoading(true);
    try {
      await api.post('/attendance', { employee: employeeId, date, status });
      setMessage('✓ Operational status logged successfully');
      fetchAttendance();
      setEmployeeId('');
      setShowSnack(true);
    } catch (err) {
      setMessage('Registry error during logging');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (s) => {
    const configs = {
      present: { label: 'Present', color: '#48BB78', bg: '#F0FFF4', icon: CheckCircle },
      absent: { label: 'Absent', color: '#E53E3E', bg: '#FFF5F5', icon: Cancel },
      leave: { label: 'Leave', color: '#ED8936', bg: '#FFFAF0', icon: EventNote },
      halfday: { label: 'Half-Day', color: '#3182CE', bg: '#EBF8FF', icon: HistoryToggleOff }
    };
    const cur = configs[s] || configs.present;
    return (
      <Chip
        icon={<cur.icon style={{ color: cur.color, fontSize: '1rem' }} />}
        label={cur.label}
        sx={{ bgcolor: cur.bg, color: cur.color, fontWeight: 800, borderRadius: '6px', border: `1px solid ${cur.color}30` }}
      />
    );
  };

  return (
    <Box sx={{ bgcolor: '#F7FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* HEADER SECTION */}
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', minHeight: '64px' }}>
        <Container maxWidth="xl">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <ArrowBack sx={{ fontSize: 20, color: '#1A202C' }} />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Workforce Attendance</Typography>
              <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>OPERATIONAL LOGGING | REAL-TIME SYNC</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Grid container spacing={2} sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1A202C', mb: 2 }}>✓ Mark Personnel Status</Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                  <InputLabel>Personnel Identifier</InputLabel>
                  <Select value={employeeId} label="Personnel Identifier" onChange={(e) => setEmployeeId(e.target.value)}>
                    <MenuItem value="">-- Select Personnel --</MenuItem>
                    {employees.filter(e => e.role === 'superior').map((e) => (<MenuItem key={e._id} value={e._id}>{e.name} | {e.department}</MenuItem>))}
                  </Select>
                </FormControl>
                <TextField fullWidth size="small" label="Audit Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                  <InputLabel>Status Designation</InputLabel>
                  <Select value={status} label="Status Designation" onChange={(e) => setStatus(e.target.value)}>
                    <MenuItem value="present">Verification: Present</MenuItem>
                    <MenuItem value="absent">Verification: Absent</MenuItem>
                    <MenuItem value="leave">Designation: Leave</MenuItem>
                    <MenuItem value="halfday">Designation: Half-Day</MenuItem>
                  </Select>
                </FormControl>
                <Button fullWidth variant="contained" onClick={markAttendance} disabled={loading} sx={{ bgcolor: '#1A202C', py: 1.5, fontWeight: 800, borderRadius: '8px', textTransform: 'none', '&:hover': { bgcolor: '#2D3748' } }}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Log Status Record'}
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1A202C', mb: 2 }}>🔍 Temporal Filter</Typography>
              <TextField fullWidth size="small" label="Audit Cycle (Month)" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ flexGrow: 1, borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: 'none', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 120px)', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' } }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Personnel</TableCell>
                      <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Audit Date</TableCell>
                      <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Contact Identifier</TableCell>
                      <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.7rem', textTransform: 'uppercase' }}>Status Chip</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fetchLoading ? (
                      <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 5 }}><CircularProgress size={24} sx={{ color: '#1A202C' }} /></TableCell></TableRow>
                    ) : attendance.length > 0 ? attendance.map((record, idx) => (
                      <TableRow key={idx} hover sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: '#F1F5F9', color: '#1A202C', width: 28, height: 28, fontSize: '0.75rem', fontWeight: 800 }}>{record.employee?.name?.charAt(0)}</Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>{record.employee?.name || 'N/A'}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#4A5568', fontSize: '0.85rem' }}>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ color: '#718096', fontSize: '0.75rem' }}>{record.employee?.email || 'N/A'}</TableCell>
                        <TableCell>{getStatusChip(record.status)}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 5, color: '#94A3B8', fontWeight: 600 }}>Zero records found for current cycle.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} variant="filled" sx={{ borderRadius: '4px' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
