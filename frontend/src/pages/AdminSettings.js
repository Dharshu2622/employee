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
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    Snackbar,
    Alert,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    ChevronRight,
    Business,
    Save,
    CloudUpload,
    Policy,
    Palette,
    Settings,
    AccountBalance,
    Timer,
    Lock,
    Language,
    InfoOutlined
} from '@mui/icons-material';
import api from '../api';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{
                    p: { xs: 2, md: 4 },
                    animation: 'slideUp 0.4s ease-out',
                    '@keyframes slideUp': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const SettingSection = ({ title, description, children }) => (
    <Box sx={{ mb: 6 }}>
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Box>
        {children}
    </Box>
);

const PremiumCard = ({ children, sx = {} }) => (
    <Card sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        overflow: 'visible',
        ...sx
    }}>
        <CardContent sx={{ p: 3 }}>
            {children}
        </CardContent>
    </Card>
);

export default function AdminSettings() {
    const [tabIndex, setTabIndex] = useState(0);
    const [showSnack, setShowSnack] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const [snackSeverity, setSnackSeverity] = useState('success');
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

    const tabs = [
        { label: 'Organization', icon: <Business />, description: 'Company details and identification' },
        { label: 'Payroll & Tax', icon: <AccountBalance />, description: 'Salary structure and tax settings' },
        { label: 'Attendance', icon: <Timer />, description: 'Tracking and grace period rules' },
        { label: 'Loan Policies', icon: <Policy />, description: 'Employee credit and loan rules' },
        { label: 'Security', icon: <Lock />, description: 'Access control and authentication' },
        { label: 'Internalization', icon: <Language />, description: 'Language and theme preferences' }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Action Bar */}
            <Paper elevation={0} sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid',
                borderColor: 'divider',
                px: { xs: 2, md: 6 },
                py: 2
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack spacing={0.5}>
                        <Breadcrumbs separator={<ChevronRight fontSize="small" />} sx={{ fontSize: '0.75rem' }}>
                            <Link underline="hover" color="inherit" onClick={() => navigate('/admin/dashboard')} sx={{ cursor: 'pointer' }}>
                                Admin
                            </Link>
                            <Typography color="text.primary" sx={{ fontWeight: 600 }}>Settings</Typography>
                        </Breadcrumbs>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                            Settings
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={() => window.location.reload()}
                            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                        >
                            Discard
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            Save Configuration
                        </Button>
                    </Stack>
                </Box>
            </Paper>

            <Container maxWidth="xl" sx={{ mt: 4, pb: 6 }}>
                <Grid container spacing={4}>
                    {/* Navigation Sidebar */}
                    <Grid item xs={12} md={3}>
                        <Paper sx={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            position: { md: 'sticky' },
                            top: { md: 100 },
                            bgcolor: 'background.paper',
                            p: 1
                        }}>
                            <Tabs
                                orientation={isMobile ? "horizontal" : "vertical"}
                                variant="scrollable"
                                value={tabIndex}
                                onChange={(e, v) => setTabIndex(v)}
                                sx={{
                                    borderRight: isMobile ? 'none' : 1,
                                    borderColor: 'divider',
                                    '& .MuiTab-root': {
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        minHeight: 64,
                                        borderRadius: '12px',
                                        mb: 1,
                                        mx: 1,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: 'rgba(59, 130, 246, 0.04)',
                                            transform: 'translateX(4px)'
                                        }
                                    },
                                    '& .Mui-selected': {
                                        bgcolor: 'rgba(59, 130, 246, 0.08) !important',
                                        color: 'primary.main',
                                        fontWeight: 700,
                                    },
                                    '& .MuiTabs-indicator': {
                                        width: 4,
                                        borderRadius: '4px',
                                        left: 0,
                                        right: 'auto'
                                    }
                                }}
                            >
                                {tabs.map((tab, idx) => (
                                    <Tab
                                        key={idx}
                                        icon={tab.icon}
                                        iconPosition="start"
                                        label={
                                            <Box sx={{ ml: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, display: 'block' }}>{tab.label}</Typography>
                                                {!isMobile && (
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                        {tab.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                ))}
                            </Tabs>
                        </Paper>
                    </Grid>

                    {/* Content Area */}
                    <Grid item xs={12} md={9}>
                        <Paper sx={{ borderRadius: '24px', minHeight: '600px', overflow: 'hidden' }}>
                            {/* TAB 0: ORGANIZATION */}
                            <TabPanel value={tabIndex} index={0}>
                                <SettingSection
                                    title="Company Profile"
                                    description="Manage your organization's legal information and branding assets."
                                >
                                    <Grid container spacing={4}>
                                        <Grid item xs={12} lg={4}>
                                            <PremiumCard sx={{ textAlign: 'center', py: 6, bgcolor: 'rgba(59, 130, 246, 0.02)' }}>
                                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                                    <Avatar
                                                        src={settings.organization.logoUrl ? `http://localhost:5000${settings.organization.logoUrl}` : undefined}
                                                        sx={{
                                                            width: 120,
                                                            height: 120,
                                                            mb: 3,
                                                            mx: 'auto',
                                                            bgcolor: 'white',
                                                            border: '2px solid #E2E8F0',
                                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                                        }}
                                                    >
                                                        <Business sx={{ fontSize: 48, color: '#CBD5E0' }} />
                                                    </Avatar>
                                                    <IconButton
                                                        component="label"
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 24,
                                                            right: -8,
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'primary.dark' }
                                                        }}
                                                        size="small"
                                                    >
                                                        <CloudUpload fontSize="small" />
                                                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                                                    </IconButton>
                                                </Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Corporate Logo</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                                                    Recommended: 256x256px PNG/SVG
                                                </Typography>
                                            </PremiumCard>
                                        </Grid>
                                        <Grid item xs={12} lg={8}>
                                            <Stack spacing={3}>
                                                <TextField
                                                    fullWidth
                                                    label="Organization Name"
                                                    placeholder="e.g. Acme Corp Industries"
                                                    value={settings.organization.name}
                                                    onChange={(e) => handleChange('organization', 'name', e.target.value)}
                                                    InputProps={{ startAdornment: <InputAdornment position="start"><Business color="disabled" /></InputAdornment> }}
                                                />
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Financial Year"
                                                            value={settings.organization.financialYear}
                                                            onChange={(e) => handleChange('organization', 'financialYear', e.target.value)}
                                                            placeholder="2023-2024"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="System Currency"
                                                            value={settings.organization.currency}
                                                            disabled
                                                            helperText="Contact support to change system currency"
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    label="Registered Office Address"
                                                    value={settings.organization.address}
                                                    onChange={(e) => handleChange('organization', 'address', e.target.value)}
                                                />
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </SettingSection>
                            </TabPanel>

                            {/* TAB 1: PAYROLL */}
                            <TabPanel value={tabIndex} index={1}>
                                <SettingSection
                                    title="Payroll Configuration"
                                    description="Define the algorithmic components of your salary calculations."
                                >
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <PremiumCard>
                                                <Stack spacing={4}>
                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Earnings Structure</Typography>
                                                        <Grid container spacing={3}>
                                                            <Grid item xs={12} sm={6}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Basic Salary Ratio"
                                                                    type="number"
                                                                    value={settings.payroll.basicSalaryPercent}
                                                                    onChange={(e) => handleChange('payroll', 'basicSalaryPercent', e.target.value)}
                                                                    InputProps={{ endAdornment: <InputAdornment position="end">% of Gross</InputAdornment> }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="HRA Allowance"
                                                                    type="number"
                                                                    value={settings.payroll.hraPercent}
                                                                    onChange={(e) => handleChange('payroll', 'hraPercent', e.target.value)}
                                                                    InputProps={{ endAdornment: <InputAdornment position="end">% of Basic</InputAdornment> }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>

                                                    <Divider />

                                                    <Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Mandatory Deductions</Typography>
                                                        <Grid container spacing={3}>
                                                            <Grid item xs={12} sm={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="PF Contribution"
                                                                    type="number"
                                                                    value={settings.payroll.pfEmployerPercent}
                                                                    onChange={(e) => handleChange('payroll', 'pfEmployerPercent', e.target.value)}
                                                                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="ESI Contribution"
                                                                    type="number"
                                                                    value={settings.payroll.esiEmployerPercent}
                                                                    onChange={(e) => handleChange('payroll', 'esiEmployerPercent', e.target.value)}
                                                                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={4}>
                                                                <TextField
                                                                    fullWidth
                                                                    label="Professional Tax"
                                                                    type="number"
                                                                    value={settings.payroll.professionalTax}
                                                                    onChange={(e) => handleChange('payroll', 'professionalTax', e.target.value)}
                                                                    InputProps={{ startAdornment: <InputAdornment position="start">{settings.organization.currency}</InputAdornment> }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>

                                                    <Divider />

                                                    <Stack direction="row" spacing={4} alignItems="center">
                                                        <FormControlLabel
                                                            control={<Switch checked={settings.payroll.autoBonus} onChange={(e) => handleChange('payroll', 'autoBonus', e.target.checked)} />}
                                                            label={
                                                                <Box>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Automated Bonuses</Typography>
                                                                    <Typography variant="caption" color="text.secondary">Automatically calculate performance-based incentives</Typography>
                                                                </Box>
                                                            }
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </PremiumCard>
                                        </Grid>
                                    </Grid>
                                </SettingSection>
                            </TabPanel>

                            {/* TAB 2: ATTENDANCE */}
                            <TabPanel value={tabIndex} index={2}>
                                <SettingSection
                                    title="Time & Attendance Rules"
                                    description="Configure thresholds for late marks, half-days, and office timings."
                                >
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <PremiumCard>
                                                <Stack spacing={3}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Timer sx={{ color: 'primary.main', mr: 1 }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Grace Period</Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        label="Permitted Late-in Margin"
                                                        type="number"
                                                        value={settings.attendance.gracePeriodMins}
                                                        onChange={(e) => handleChange('attendance', 'gracePeriodMins', e.target.value)}
                                                        InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment> }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Employees can sign-in within this period without being marked late.
                                                    </Typography>
                                                </Stack>
                                            </PremiumCard>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <PremiumCard>
                                                <Stack spacing={3}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Settings sx={{ color: 'primary.main', mr: 1 }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Half-Day Threshold</Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        label="Work Duration Required"
                                                        type="number"
                                                        value={settings.attendance.halfDayThresholdHrs}
                                                        onChange={(e) => handleChange('attendance', 'halfDayThresholdHrs', e.target.value)}
                                                        InputProps={{ endAdornment: <InputAdornment position="end">hours</InputAdornment> }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Minimum effective hours to be considered for a full-day's pay.
                                                    </Typography>
                                                </Stack>
                                            </PremiumCard>
                                        </Grid>
                                    </Grid>
                                </SettingSection>
                            </TabPanel>

                            {/* TAB 3: LOANS */}
                            <TabPanel value={tabIndex} index={3}>
                                <SettingSection
                                    title="Loan & Advance Disbursement"
                                    description="Set risk parameters for employee financial assistance programs."
                                >
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <PremiumCard>
                                                <Grid container spacing={4} alignItems="center">
                                                    <Grid item xs={12} md={7}>
                                                        <Stack spacing={3}>
                                                            <TextField
                                                                fullWidth
                                                                label="Annual Interest Rate (APR)"
                                                                type="number"
                                                                value={settings.loan.interestRatePercent}
                                                                onChange={(e) => handleChange('loan', 'interestRatePercent', e.target.value)}
                                                                InputProps={{ endAdornment: <InputAdornment position="end">% p.a.</InputAdornment> }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Maximum Loan Ceiling"
                                                                type="number"
                                                                value={settings.loan.maxLoanMultiplier}
                                                                onChange={(e) => handleChange('loan', 'maxLoanMultiplier', e.target.value)}
                                                                helperText="Capped at multiple of base salary"
                                                                InputProps={{ endAdornment: <InputAdornment position="end">X Salary</InputAdornment> }}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                label="Service Tenure Eligibility"
                                                                type="number"
                                                                value={settings.loan.eligibilityMonths}
                                                                onChange={(e) => handleChange('loan', 'eligibilityMonths', e.target.value)}
                                                                InputProps={{ endAdornment: <InputAdornment position="end">months</InputAdornment> }}
                                                            />
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item xs={12} md={5}>
                                                        <Box sx={{ p: 3, bgcolor: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                                <InfoOutlined color="primary" sx={{ mr: 1 }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>Policy Advice</Typography>
                                                            </Box>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                                                                Standard industry practice suggests maintaining interest rates close to RBI repo rates for compliance.
                                                            </Typography>
                                                            <FormControlLabel
                                                                control={<Switch checked={settings.loan.hrInterviewRequired} onChange={(e) => handleChange('loan', 'hrInterviewRequired', e.target.checked)} />}
                                                                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Require HR Interview for Approval</Typography>}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </PremiumCard>
                                        </Grid>
                                    </Grid>
                                </SettingSection>
                            </TabPanel>

                            {/* TAB 4: SECURITY */}
                            <TabPanel value={tabIndex} index={4}>
                                <SettingSection
                                    title="Platform Security"
                                    description="Safeguard sensitive financial data with advanced authentication policies."
                                >
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <PremiumCard>
                                                <Stack spacing={2}>
                                                    <FormControlLabel
                                                        control={<Switch checked={settings.security.twoFactorAuth} onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)} />}
                                                        label={<Typography sx={{ fontWeight: 700 }}>Two-Factor Authentication (2FA)</Typography>}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">Require email/SMS verification for admin login.</Typography>
                                                    <Divider sx={{ my: 1 }} />
                                                    <FormControlLabel
                                                        control={<Switch checked={settings.security.strongPasswordPolicy} onChange={(e) => handleChange('security', 'strongPasswordPolicy', e.target.checked)} />}
                                                        label={<Typography sx={{ fontWeight: 700 }}>Complex Password Policy</Typography>}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">Enforce symbols, numbers, and case-sensitive requirements.</Typography>
                                                </Stack>
                                            </PremiumCard>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <PremiumCard>
                                                <Stack spacing={3}>
                                                    <TextField
                                                        fullWidth
                                                        label="Session Inactivity Timeout"
                                                        type="number"
                                                        value={settings.security.sessionTimeoutMins}
                                                        onChange={(e) => handleChange('security', 'sessionTimeoutMins', e.target.value)}
                                                        InputProps={{ endAdornment: <InputAdornment position="end">mins</InputAdornment> }}
                                                    />
                                                    <FormControlLabel
                                                        control={<Switch checked={settings.security.lockoutAfterFailedAttempts} onChange={(e) => handleChange('security', 'lockoutAfterFailedAttempts', e.target.checked)} />}
                                                        label={<Typography sx={{ fontWeight: 700 }}>Auto-Lockout on Failure</Typography>}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">Suspend accounts after 5 consecutive failed attempts.</Typography>
                                                </Stack>
                                            </PremiumCard>
                                        </Grid>
                                    </Grid>
                                </SettingSection>
                            </TabPanel>

                            {/* TAB 5: UI/THEME */}
                            <TabPanel value={tabIndex} index={5}>
                                <SettingSection
                                    title="Personalization & Display"
                                    description="Configure visual preferences and reporting languages."
                                >
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <PremiumCard>
                                                <Stack spacing={3}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Palette sx={{ color: 'primary.main', mr: 1 }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>User Interface</Typography>
                                                    </Box>
                                                    <FormControlLabel
                                                        control={<Switch checked={settings.theme.darkMode} onChange={(e) => handleChange('theme', 'darkMode', e.target.checked)} />}
                                                        label="Global Dark Mode"
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        select
                                                        label="Interface Density"
                                                        value={settings.theme.density}
                                                        onChange={(e) => handleChange('theme', 'density', e.target.value)}
                                                        SelectProps={{ native: true }}
                                                    >
                                                        <option value="Comfortable">Comfortable</option>
                                                        <option value="Compact">Compact</option>
                                                        <option value="Spacious">Spacious</option>
                                                    </TextField>
                                                </Stack>
                                            </PremiumCard>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <PremiumCard>
                                                <Stack spacing={3}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Palette sx={{ color: 'primary.main', mr: 1 }} />
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Reporting & Payslips</Typography>
                                                    </Box>
                                                    <TextField
                                                        fullWidth
                                                        select
                                                        label="Default Payslip Theme"
                                                        value={settings.theme.payslipTheme}
                                                        onChange={(e) => handleChange('theme', 'payslipTheme', e.target.value)}
                                                        SelectProps={{ native: true }}
                                                    >
                                                        <option value="ModernBlue">Modern Blue</option>
                                                        <option value="ClassicWhite">Classic White</option>
                                                        <option value="ProfessionalGrey">Professional Grey</option>
                                                        <option value="EmeraldSafe">Emerald Safe</option>
                                                    </TextField>
                                                </Stack>
                                            </PremiumCard>
                                        </Grid>
                                    </Grid>
                                </SettingSection>
                            </TabPanel>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={showSnack} autoHideDuration={5000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackSeverity} variant="filled" sx={{ borderRadius: '16px', fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
