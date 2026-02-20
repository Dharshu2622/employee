import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Stack,
    Tabs,
    Tab,
    TextField,
    Button,
    Grid,
    Avatar,
    Breadcrumbs,
    Link,
    Divider,
    InputAdornment,
    Card,
    Snackbar,
    Alert
} from '@mui/material';
import {
    ChevronRight,
    Business,
    Save,
    CloudUpload,
    Policy
} from '@mui/icons-material';
import api from '../api';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3, animation: 'fadeIn 0.4s ease-out' }}>{children}</Box>}
        </div>
    );
}

export default function AdminSettings() {
    const [tabIndex, setTabIndex] = useState(0);
    const [showSnack, setShowSnack] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const [snackSeverity, setSnackSeverity] = useState('success');
    const navigate = useNavigate();

    const [settings, setSettings] = useState({
        organization: { name: '', logoUrl: '', financialYear: '', address: '', currency: 'INR', timezone: 'IST' },
        payroll: { basicSalaryPercent: 50, hraPercent: 20, pfEmployerPercent: 12, esiEmployerPercent: 3.25, professionalTax: 200, roundingRule: 'None', autoBonus: true },
        attendance: { gracePeriodMins: 15, halfDayThresholdHrs: 4.5 },
        loan: { maxLoanMultiplier: 3, interestRatePercent: 6.5, eligibilityMonths: 12, hrInterviewRequired: true },
        security: { twoFactorAuth: true, sessionTimeoutMins: 20, strongPasswordPolicy: true, lockoutAfterFailedAttempts: true },
        theme: { darkMode: false, language: 'EN', density: 'Default', payslipTheme: 'ModernBlue' }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data) setSettings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const showNotification = (msg, severity = 'success') => {
        setSnackMessage(msg);
        setSnackSeverity(severity);
        setShowSnack(true);
    };

    const handleSave = async () => {
        try {
            await api.put('/settings', settings);
            showNotification('Settings saved successfully!', 'success');
        } catch (err) {
            showNotification('Failed to save settings.', 'error');
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await api.post('/settings/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSettings(prev => ({
                ...prev,
                organization: { ...prev.organization, logoUrl: res.data.logoUrl }
            }));
            showNotification('Logo updated successfully!', 'success');
        } catch (err) {
            console.error('Logo upload failed', err);
            showNotification('Failed to upload logo.', 'error');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', pb: 8 }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E0E0E0', px: 4, py: 2 }}>
                <Breadcrumbs separator={<ChevronRight fontSize="small" />} sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => navigate('/admin/dashboard')} sx={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                        Dashboard
                    </Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Settings</Typography>
                </Breadcrumbs>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
                        System Configuration
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            fontWeight: 600,
                            bgcolor: '#2563EB',
                            '&:hover': { bgcolor: '#1D4ED8' }
                        }}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Paper sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E0E0E0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                    <Tabs
                        value={tabIndex}
                        onChange={(e, v) => setTabIndex(v)}
                        sx={{
                            borderBottom: '1px solid #E0E0E0',
                            px: 3,
                            pt: 2,
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                minHeight: 48,
                                mr: 2
                            },
                            '& .MuiTabs-indicator': {
                                bgcolor: '#2563EB',
                                height: 3,
                                borderRadius: '3px 3px 0 0'
                            },
                            '& .Mui-selected': {
                                color: '#2563EB !important'
                            }
                        }}
                    >
                        <Tab label="Company Profile" icon={<Business sx={{ mb: 0, mr: 1 }} />} iconPosition="start" />
                        <Tab label="Policies & Rules" icon={<Policy sx={{ mb: 0, mr: 1 }} />} iconPosition="start" />
                    </Tabs>

                    <Box sx={{ p: 4, bgcolor: 'white', minHeight: '500px' }}>
                        {/* TAB 1: COMPANY PROFILE */}
                        <TabPanel value={tabIndex} index={0}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, border: '1px dashed #E0E0E0', borderRadius: '12px', bgcolor: '#FAFAFA' }}>
                                        <Avatar
                                            src={settings.organization.logoUrl ? `http://localhost:5000${settings.organization.logoUrl}` : undefined}
                                            sx={{ width: 100, height: 100, mb: 2, bgcolor: 'white', border: '1px solid #EEEEEE' }}
                                        >
                                            <Business sx={{ fontSize: 40, color: '#9E9E9E' }} />
                                        </Avatar>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Company Logo</Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            size="small"
                                            startIcon={<CloudUpload />}
                                            sx={{ textTransform: 'none', borderRadius: '8px' }}
                                        >
                                            Upload Not
                                            <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Stack spacing={3}>
                                        <TextField
                                            fullWidth
                                            label="Company Legal Name"
                                            value={settings.organization.name}
                                            onChange={(e) => handleChange('organization', 'name', e.target.value)}
                                            variant="outlined"
                                            InputProps={{ sx: { borderRadius: '8px' } }}
                                        />
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Financial Year"
                                                    value={settings.organization.financialYear}
                                                    onChange={(e) => handleChange('organization', 'financialYear', e.target.value)}
                                                    variant="outlined"
                                                    InputProps={{ sx: { borderRadius: '8px' } }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Base Currency"
                                                    value={settings.organization.currency}
                                                    disabled
                                                    variant="outlined"
                                                    InputProps={{ sx: { borderRadius: '8px', bgcolor: '#F5F5F5' } }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="Registered Address"
                                            value={settings.organization.address}
                                            onChange={(e) => handleChange('organization', 'address', e.target.value)}
                                            variant="outlined"
                                            InputProps={{ sx: { borderRadius: '8px' } }}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </TabPanel>

                        {/* TAB 2: POLICIES */}
                        <TabPanel value={tabIndex} index={1}>
                            <Grid container spacing={3}>
                                {/* Payroll Section */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#334155' }}>Payroll Configuration</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label="Basic Salary"
                                                type="number"
                                                value={settings.payroll.basicSalaryPercent}
                                                onChange={(e) => handleChange('payroll', 'basicSalaryPercent', e.target.value)}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                    sx: { borderRadius: '8px' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label="HRA Allowance"
                                                type="number"
                                                value={settings.payroll.hraPercent}
                                                onChange={(e) => handleChange('payroll', 'hraPercent', e.target.value)}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                    sx: { borderRadius: '8px' }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label="PF Contribution (Employer)"
                                                type="number"
                                                value={settings.payroll.pfEmployerPercent}
                                                onChange={(e) => handleChange('payroll', 'pfEmployerPercent', e.target.value)}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                    sx: { borderRadius: '8px' }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid item xs={12}><Divider /></Grid>

                                {/* Attendance Section */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#334155' }}>Attendance Rules</Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            label="Grace Period (Clock-in)"
                                            type="number"
                                            value={settings.attendance.gracePeriodMins}
                                            onChange={(e) => handleChange('attendance', 'gracePeriodMins', e.target.value)}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                                                sx: { borderRadius: '8px' }
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Half-Day Work Duration"
                                            type="number"
                                            value={settings.attendance.halfDayThresholdHrs}
                                            onChange={(e) => handleChange('attendance', 'halfDayThresholdHrs', e.target.value)}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
                                                sx: { borderRadius: '8px' }
                                            }}
                                        />
                                    </Stack>
                                </Grid>

                                {/* Loan Section */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#334155' }}>Loan Policy</Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            label="Annual Interest Rate"
                                            type="number"
                                            value={settings.loan.interestRatePercent}
                                            onChange={(e) => handleChange('loan', 'interestRatePercent', e.target.value)}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                sx: { borderRadius: '8px' }
                                            }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Max Loan Amount"
                                            type="number"
                                            value={settings.loan.maxLoanMultiplier}
                                            onChange={(e) => handleChange('loan', 'maxLoanMultiplier', e.target.value)}
                                            helperText="Multiplier of Base Salary"
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">x</InputAdornment>,
                                                sx: { borderRadius: '8px' }
                                            }}
                                        />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </Box>
                </Paper>
            </Container>

            <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackSeverity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
