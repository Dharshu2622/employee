import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
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
  CircularProgress,
  IconButton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  PersonAdd,
  Male,
  Female,
  Transgender,
  Badge,
  VerifiedUser
} from '@mui/icons-material';
import api from '../api';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [superiors, setSuperiors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [enablePasswordChange, setEnablePasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    password: '',
    gender: 'male',
    baseSalary: 0,
    role: 'employee',
    manager: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setFetchLoading(true);
      const res = await api.get('/admin/employees');
      const allPersonnel = res.data || [];
      setEmployees(allPersonnel.filter(emp => emp.role === 'employee'));

      // Filter for superiors for the dropdown - keep all superiors as potential managers
      const superiorList = allPersonnel.filter(emp => emp.role === 'superior');
      setSuperiors(superiorList);

      setFetchLoading(false);
    } catch (err) {
      setMessage('Failed to fetch enterprise workforce data');
      setShowSnack(true);
      setFetchLoading(false);
    }
  };

  const handleOpen = (emp = null) => {
    if (emp) {
      setFormData({
        name: emp.name,
        email: emp.email,
        password: '', // Password not shown for security
        department: emp.department,
        position: emp.position,
        phone: emp.phone,
        gender: emp.gender || 'male',
        baseSalary: emp.baseSalary || 0,
        role: emp.role || 'employee',
        manager: emp.manager?._id || emp.manager || ''
      });
      setEditingId(emp._id);
      setEnablePasswordChange(false); // Disabled by default when editing
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        department: '',
        position: '',
        phone: '',
        gender: 'male',
        baseSalary: 0,
        role: 'employee',
        manager: ''
      });
      setEditingId(null);
      setEnablePasswordChange(true); // Always enabled for new employees
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      position: '',
      phone: '',
      gender: 'male',
      baseSalary: 0,
      role: 'employee',
      manager: ''
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.department.trim() || !formData.position.trim()) {
      setMessage('Please fill in all identity credentials');
      setShowSnack(true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage('Invalid enterprise email format');
      setShowSnack(true);
      return;
    }

    // Password validation: required for new employees
    if (!editingId && !formData.password) {
      setMessage('Initial password is required for new personnel');
      setShowSnack(true);
      return;
    }

    // Password validation: when updating and password change is enabled, password must not be empty
    if (editingId && enablePasswordChange && !formData.password.trim()) {
      setMessage('Please enter a new password or disable password change');
      setShowSnack(true);
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.manager) delete payload.manager;

      // Handle password field
      if (editingId) {
        // When editing: only send password if password change is enabled and password is provided
        if (!enablePasswordChange || !payload.password) {
          delete payload.password;
        }
      }
      // When creating: password is always required (validated above)

      if (editingId) {
        await api.put(`/admin/employees/${editingId}`, payload);
        setMessage('Personnel record successfully synchronized');
      } else {
        await api.post('/admin/employees', payload);
        setMessage('Employee created successfully. Login access granted.');
      }

      await fetchEmployees();
      handleClose();
      setShowSnack(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Biometric/System verification failed during synchronization');
      setShowSnack(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirm deactivation of this identity? This action will be audited.')) {
      try {
        await api.delete(`/admin/employees/${id}`);
        setMessage('Personnel access revoked');
        fetchEmployees();
        setShowSnack(true);
      } catch (err) {
        setMessage('Administrative error during deactivation');
        setShowSnack(true);
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const getGenderIcon = (gender) => {
    if (gender === 'male') return <Male sx={{ color: '#3182CE', fontSize: 20 }} />;
    if (gender === 'female') return <Female sx={{ color: '#9F7AEA', fontSize: 20 }} />;
    return <Transgender sx={{ color: '#718096', fontSize: 20 }} />;
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Workforce Management</Typography>
                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>IDENTITY PORTAL | ENTERPRISE CONTROL</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={3} alignItems="center">
              <TextField
                size="small"
                placeholder="Search personnel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC'
                  }
                }}
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAdd />}
                onClick={() => handleOpen()}
                sx={{ bgcolor: '#1A202C', fontWeight: 700, textTransform: 'none', px: 2, borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}
              >
                Add New Personnel
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Paper sx={{ flexGrow: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 120px)', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' } }}>
            <Table stickyHeader size="small">
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Personnel</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Access Hierarchy</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Department / Role</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Base Salary</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Reports To</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Control</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fetchLoading ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress size={24} sx={{ color: '#1A202C' }} /></TableCell></TableRow>
                ) : filteredEmployees.map((emp) => (
                  <TableRow key={emp._id} hover sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: emp.gender === 'female' ? '#9F7AEA15' : '#3182CE15', color: emp.gender === 'female' ? '#9F7AEA' : '#3182CE', fontWeight: 700, width: 32, height: 32, fontSize: '0.8rem' }}>
                          {emp.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#1A202C' }}>{emp.name}</Typography>
                            {getGenderIcon(emp.gender)}
                          </Stack>
                          <Typography variant="caption" sx={{ color: '#718096', fontWeight: 500, fontSize: '0.7rem' }}>{emp.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={emp.role === 'superior' ? 'Superior' : 'Employee'}
                        size="small"
                        icon={emp.role === 'superior' ? <VerifiedUser sx={{ fontSize: '12px !important' }} /> : <Badge sx={{ fontSize: '12px !important' }} />}
                        sx={{
                          bgcolor: emp.role === 'superior' ? '#0F172A' : '#EDF2F7',
                          color: emp.role === 'superior' ? 'white' : '#4A5568',
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          borderRadius: '4px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A5568', fontSize: '0.85rem' }}>{emp.department}</Typography>
                      <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>{emp.position}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A202C', fontSize: '0.85rem' }}>₹{emp.baseSalary?.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>
                      {emp.manager ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.6rem', bgcolor: '#3182CE' }}>
                            {(emp.manager.name || 'S').charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A5568', fontSize: '0.8rem' }}>
                            {emp.manager.name || 'Assigned Superior'}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#A0AEC0', fontStyle: 'italic' }}>Direct Report / Admin</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(emp)} sx={{ color: '#3182CE', p: 0.5 }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(emp._id)} sx={{ color: '#E53E3E', p: 0.5 }}><Delete sx={{ fontSize: 16 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* FORM DIALOG */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A202C', pt: 3 }}>
          {editingId ? '🔒 Modify Personnel Record' : '👤 Onboard New Personnel'}
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Operational Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                InputProps={{ startAdornment: <Badge sx={{ mr: 1, color: '#A0AEC0', fontSize: 20 }} /> }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Enterprise Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Security Contact" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>

            {/* Password Field Section */}
            {editingId && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={enablePasswordChange}
                      onChange={(e) => {
                        setEnablePasswordChange(e.target.checked);
                        if (!e.target.checked) {
                          setFormData({ ...formData, password: '' });
                        }
                      }}
                      sx={{
                        color: '#3182CE',
                        '&.Mui-checked': { color: '#3182CE' }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 600, color: '#4A5568', fontSize: '0.9rem' }}>
                      🔐 Enable Password Change
                    </Typography>
                  }
                />
              </Grid>
            )}

            {(enablePasswordChange || !editingId) && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={editingId ? "New Password" : "Initial Password"}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingId}
                  placeholder={editingId ? "Enter new password" : "Create secure password"}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  helperText={editingId ? "Enter a new password to update" : "Minimum 6 characters recommended"}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel>Operational Role</InputLabel>
                <Select value={formData.role} label="Operational Role" onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <MenuItem value="employee">Standard Employee</MenuItem>
                  <MenuItem value="superior">Superior (Managerial)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel>Identity Gender</InputLabel>
                <Select value={formData.gender} label="Identity Gender" onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Gross Base Salary" type="number" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <InputLabel>Assigned Superior</InputLabel>
                <Select
                  value={formData.manager}
                  label="Assigned Superior"
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  disabled={formData.role === 'superior'}
                >
                  <MenuItem value="">None / Executive Level</MenuItem>
                  {superiors.map(sup => (
                    <MenuItem key={sup._id} value={sup._id}>{sup.name} ({sup.department})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Assigned Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Official Position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 4 }}>
          <Button onClick={handleClose} sx={{ color: '#718096', fontWeight: 700, textTransform: 'none' }}>Cancel Audit</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ bgcolor: '#1A202C', px: 4, fontWeight: 700, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('success') || message.includes('successfully') || message.includes('complete') || message.includes('secured') ? 'success' : 'error'} variant="filled" sx={{ borderRadius: '4px' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
