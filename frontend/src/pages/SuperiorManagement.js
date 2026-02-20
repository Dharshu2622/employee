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
    Male,
    Female,
    Transgender,
    VerifiedUser,
    SupervisorAccount
} from '@mui/icons-material';
import api from '../api';

export default function SuperiorManagement() {
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
        role: 'superior'
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchSuperiors();
    }, []);

    const fetchSuperiors = async () => {
        try {
            setFetchLoading(true);
            const res = await api.get('/admin/employees');
            const allPersonnel = res.data || [];
            // Filter for superiors only
            const superiorList = allPersonnel.filter(emp => emp.role === 'superior');
            setSuperiors(superiorList);
            setFetchLoading(false);
        } catch (err) {
            setMessage('Failed to fetch superior personnel data');
            setShowSnack(true);
            setFetchLoading(false);
        }
    };

    const handleOpen = (emp = null) => {
        if (emp) {
            setFormData({
                name: emp.name,
                email: emp.email,
                password: '',
                department: emp.department,
                position: emp.position,
                phone: emp.phone,
                gender: emp.gender || 'male',
                baseSalary: emp.baseSalary || 0,
                role: 'superior'
            });
            setEditingId(emp._id);
            setEnablePasswordChange(false);
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
                role: 'superior'
            });
            setEditingId(null);
            setEnablePasswordChange(true);
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
            role: 'superior'
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

        if (!editingId && !formData.password) {
            setMessage('Initial password is required for new personnel');
            setShowSnack(true);
            return;
        }

        if (editingId && enablePasswordChange && !formData.password.trim()) {
            setMessage('Please enter a new password or disable password change');
            setShowSnack(true);
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };

            if (editingId) {
                if (!enablePasswordChange || !payload.password) {
                    delete payload.password;
                }
            }

            if (editingId) {
                await api.put(`/admin/employees/${editingId}`, payload);
                setMessage('Superior record successfully updated');
            } else {
                await api.post('/admin/employees', payload);
                setMessage('Superior created successfully. Login access granted.');
            }

            await fetchSuperiors();
            handleClose();
            setShowSnack(true);
        } catch (err) {
            setMessage(err.response?.data?.message || 'System error during synchronization');
            setShowSnack(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Confirm deactivation of this superior identity? This action will be audited.')) {
            try {
                await api.delete(`/admin/employees/${id}`);
                setMessage('Superior access revoked');
                fetchSuperiors();
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

    const filteredSuperiors = superiors.filter(emp =>
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
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Superior Management</Typography>
                                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>EXECUTIVE PORTAL | MANAGEMENT CONTROL</Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={3} alignItems="center">
                            <TextField
                                size="small"
                                placeholder="Search superiors..."
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
                                startIcon={<SupervisorAccount />}
                                onClick={() => handleOpen()}
                                sx={{ bgcolor: '#0F172A', fontWeight: 700, textTransform: 'none', px: 2, borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}
                            >
                                Add New Superior
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
                                    <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Superior Name</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Access Level</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Department / Role</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Base Salary</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Reports To</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#4A5568', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5 }}>Control</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fetchLoading ? (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}><CircularProgress size={24} sx={{ color: '#1A202C' }} /></TableCell></TableRow>
                                ) : filteredSuperiors.map((emp) => (
                                    <TableRow key={emp._id} hover sx={{ '& .MuiTableCell-root': { py: 1.5 } }}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ bgcolor: '#0F172A15', color: '#0F172A', fontWeight: 700, width: 32, height: 32, fontSize: '0.8rem' }}>
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
                                                label="SUPERIOR"
                                                size="small"
                                                icon={<VerifiedUser sx={{ fontSize: '12px !important' }} />}
                                                sx={{
                                                    bgcolor: '#0F172A',
                                                    color: 'white',
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
                                            <Typography variant="caption" sx={{ color: '#A0AEC0', fontStyle: 'italic', fontWeight: 600 }}>Direct Report / Admin</Typography>
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
                    {editingId ? '🔒 Modify Superior Record' : '👤 Onboard New Superior'}
                </DialogTitle>
                <DialogContent sx={{ pb: 3 }}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Full Operational Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

                        {editingId && (
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={enablePasswordChange}
                                            onChange={(e) => {
                                                setEnablePasswordChange(e.target.checked);
                                                if (!e.target.checked) setFormData({ ...formData, password: '' });
                                            }}
                                            sx={{ color: '#3182CE', '&.Mui-checked': { color: '#3182CE' } }}
                                        />
                                    }
                                    label={<Typography sx={{ fontWeight: 600, color: '#4A5568', fontSize: '0.9rem' }}>🔐 Enable Password Change</Typography>}
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
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                />
                            </Grid>
                        )}

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
                    <Button variant="contained" onClick={handleSave} disabled={loading} sx={{ bgcolor: '#0F172A', px: 4, fontWeight: 700, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#2D3748' } }}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <MuiAlert severity={message.includes('success') ? 'success' : 'error'} variant="filled" sx={{ borderRadius: '4px' }}>{message}</MuiAlert>
            </Snackbar>
        </Box>
    );
}
