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
  CircularProgress
} from '@mui/material';
import { ArrowBack, Add, Edit, Delete } from '@mui/icons-material';
import api from '../api';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', department: '', position: '', phone: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/admin/employees');
      setEmployees(res.data || []);
    } catch (err) {
      setMessage('Failed to fetch employees');
      setShowSnack(true);
    }
  };

  const handleOpen = (emp = null) => {
    if (emp) {
      setFormData(emp);
      setEditingId(emp._id);
    } else {
      setFormData({ name: '', email: '', department: '', position: '', phone: '' });
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setFormData({ name: '', email: '', department: '', position: '', phone: '' });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/admin/employees/${editingId}`, formData);
        setMessage('Employee updated successfully');
      } else {
        await api.post('/admin/employees', { ...formData, password: 'temp123' });
        setMessage('Employee created successfully');
      }
      fetchEmployees();
      handleClose();
      setShowSnack(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error saving employee');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/admin/employees/${id}`);
        setMessage('Employee deactivated');
        fetchEmployees();
        setShowSnack(true);
      } catch (err) {
        setMessage('Error deleting employee');
        setShowSnack(true);
      }
    }
  };

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
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '800', fontSize: '1.4rem' }}>👨‍💼 Employee Management</Typography>
          <Button color="inherit" startIcon={<Add />} onClick={() => handleOpen()} sx={{ fontWeight: '700', textTransform: 'none', fontSize: '1rem' }}>➕ Add Employee</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <TableContainer component={Paper} sx={{ borderRadius: '18px', boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)' }}>
          <Table>
            <TableHead sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Department</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Position</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: '800', fontSize: '1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id} sx={{ 
                  '&:hover': { background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' },
                  transition: 'all 0.3s ease'
                }}>
                  <TableCell sx={{ fontWeight: '600' }}>👤 {emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell sx={{ fontWeight: '500', color: '#667eea' }}>{emp.department}</TableCell>
                  <TableCell sx={{ fontWeight: '500' }}>{emp.position}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpen(emp)} sx={{ color: '#667eea', '&:hover': { background: 'rgba(102, 126, 234, 0.1)' } }}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(emp._id)} sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>
          {editingId ? '✏️ Edit Employee' : '➕ Add New Employee'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label="Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
          <TextField fullWidth label="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} margin="normal" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
        </DialogContent>
        <DialogActions sx={{ p: 2, background: '#f5f5f5' }}>
          <Button onClick={handleClose} sx={{ fontWeight: '600' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', fontWeight: '700' }}>{loading ? '⏳ Saving...' : '💾 Save'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('success') ? 'success' : 'error'} sx={{ borderRadius: '12px' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
