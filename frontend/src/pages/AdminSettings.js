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
    Switch,
    FormControlLabel,
    Divider,
    Grid,
    IconButton,
    Avatar,
    Breadcrumbs,
    Link,
    useTheme,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
    Slider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Tooltip
} from '@mui/material';
import {
    ArrowBack,
    Business,
    AccountBalance,
    Security,
    NotificationsNone,
    Save,
    CloudUpload,
    ChevronRight,
    SettingsOutlined,
    Tune,
    Language,
    Timer,
    Group,
    Payments,
    Rule,
    Description,
    Storage,
    Palette,
    VpnKey,
    Lock,
    History,
    InfoOutlined,
    FileUpload,
    FileDownload,
    GTranslate,
    DarkMode,
    Email
} from '@mui/icons-material';
import api from '../api';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3, animation: 'fadeIn 0.3s ease-in-out' }}>{children}</Box>}
        </div>
    );
}

const SectionTitle = ({ title, subtitle }) => (
    <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>{subtitle}</Typography>
    </Box>
);

export default function AdminSettings() {
    const [tabIndex, setTabIndex] = useState(0);
    const [showSnack, setShowSnack] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');
    const [snackSeverity, setSnackSeverity] = useState('success');
    const navigate = useNavigate();
    const theme = useTheme();

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
            showNotification('Failed to load settings', 'error');
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

    const handleSave = async () => {
        try {
            await api.put('/settings', settings);
            showNotification('Enterprise configuration successfully synchronized with global cloud ledger.', 'success');
        } catch (err) {
            showNotification('Failed to save settings', 'error');
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
            showNotification('Organization logo updated successfully', 'success');
        } catch (err) {
            showNotification('Logo upload failed', 'error');
        }
    };

    const showNotification = (msg, severity = 'success') => {
        setSnackMessage(msg);
        setSnackSeverity(severity);
        setShowSnack(true);
    };

    const navItems = [
        { label: 'Organization', icon: <Business />, desc: 'Identity & Hours' },
        { label: 'User & Roles', icon: <Group />, desc: 'RBAC & Access' },
        { label: 'Salary & Payroll', icon: <Payments />, desc: 'Money & Tax' },
        { label: 'Attendance', icon: <Timer />, desc: 'Rules & Leaves' },
        { label: 'Loans', icon: <AccountBalance />, desc: 'Credit Policies' },
        { label: 'Documents', icon: <Description />, desc: 'Branding & PDF' },
        { label: 'Notifications', icon: <NotificationsNone />, desc: 'Alert Triggers' },
        { label: 'Security', icon: <Security />, desc: 'MFA & Logs' },
        { label: 'Data & System', icon: <Storage />, desc: 'Backups & Logs' },
        { label: 'Theme & UI', icon: <Palette />, desc: 'Appearance' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', pb: 8 }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* PROFESSIONAL HEADER */}
            <Box sx={{
                p: 2.5, px: 4,
                bgcolor: 'white',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1100
            }}>
                <Stack spacing={0.5}>
                    <Breadcrumbs separator={<ChevronRight sx={{ fontSize: 16 }} />} sx={{ '& .MuiBreadcrumbs-li': { color: '#94A3B8', fontWeight: 500, fontSize: '0.75rem' } }}>
                        <Link underline="hover" color="inherit" href="#" onClick={() => navigate('/admin/dashboard')}>Home</Link>
                        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>System Control</Typography>
                    </Breadcrumbs>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>Enterprise Configurations</Typography>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3 }}>Discard</Button>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        sx={{
                            borderRadius: '10px', px: 3, fontWeight: 700, textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
                        }}
                    >
                        Synchronize Changes
                    </Button>
                </Stack>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {/* MODERN NAVIGATION SIDEBAR */}
                    <Grid item xs={12} md={3.5} lg={3}>
                        <Paper sx={{
                            p: 2, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: 'none',
                            position: 'sticky', top: 100
                        }}>
                            <Tabs
                                orientation="vertical"
                                value={tabIndex}
                                onChange={(e, v) => setTabIndex(v)}
                                sx={{
                                    '& .MuiTabs-indicator': { left: 0, width: 4, borderRadius: '0 4px 4px 0', bgcolor: '#2563EB' },
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        alignItems: 'flex-start',
                                        textAlign: 'left',
                                        fontWeight: 600,
                                        minHeight: 'auto',
                                        borderRadius: '12px',
                                        color: '#64748B',
                                        py: 1.5,
                                        px: 2,
                                        mb: 0.5,
                                        transition: 'all 0.2s',
                                        '&.Mui-selected': { color: '#2563EB', bgcolor: '#EFF6FF' },
                                        '&:hover:not(.Mui-selected)': { bgcolor: '#F8FAFC' }
                                    }
                                }}
                            >
                                {navItems.map((item, idx) => (
                                    <Tab
                                        key={idx}
                                        icon={item.icon}
                                        iconPosition="start"
                                        label={
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>{item.label}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 500, color: 'inherit', opacity: 0.8 }}>{item.desc}</Typography>
                                            </Box>
                                        }
                                    />
                                ))}
                            </Tabs>
                        </Paper>
                    </Grid>

                    {/* DYNAMIC CONTENT AREA */}
                    <Grid item xs={12} md={8.5} lg={9}>
                        <Paper sx={{ p: 4, borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: 'none', minHeight: '70vh' }}>

                            {/* 1. ORGANIZATION SETTINGS */}
                            <TabPanel value={tabIndex} index={0}>
                                <SectionTitle title="Organization Identity" subtitle="Manage your corporate profile, headquarters, and operational core." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                                        <Avatar
                                            src={settings.organization.logoUrl ? `http://localhost:5000${settings.organization.logoUrl}` : undefined}
                                            sx={{ width: 80, height: 80, bgcolor: '#F1F5F9', border: '1px dashed #CBD5E1' }}
                                        >
                                            <Business sx={{ color: '#94A3B8', fontSize: 32 }} />
                                        </Avatar>
                                        <Box>
                                            <Button variant="outlined" component="label" size="small" startIcon={<CloudUpload />} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                                                Update Logo
                                                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                                            </Button>
                                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#94A3B8' }}>High-res SVG or PNG (800x800px)</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth label="Company Legal Name"
                                            value={settings.organization.name}
                                            onChange={(e) => handleChange('organization', 'name', e.target.value)}
                                            variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth label="Financial Year"
                                            value={settings.organization.financialYear}
                                            onChange={(e) => handleChange('organization', 'financialYear', e.target.value)}
                                            variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth multiline rows={2} label="Registered Address"
                                            value={settings.organization.address}
                                            onChange={(e) => handleChange('organization', 'address', e.target.value)}
                                            variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                                            <InputLabel>Base Currency</InputLabel>
                                            <Select
                                                value={settings.organization.currency}
                                                onChange={(e) => handleChange('organization', 'currency', e.target.value)}
                                                label="Base Currency"
                                            >
                                                <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                                                <MenuItem value="USD">US Dollar ($)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                                            <InputLabel>Primary Timezone</InputLabel>
                                            <Select
                                                value={settings.organization.timezone}
                                                onChange={(e) => handleChange('organization', 'timezone', e.target.value)}
                                                label="Primary Timezone"
                                            >
                                                <MenuItem value="IST">Asia/Kolkata (GMT+5:30)</MenuItem>
                                                <MenuItem value="UTC">UTC (GMT+0:00)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 2. USER & ROLE MANAGEMENT */}
                            <TabPanel value={tabIndex} index={1}>
                                <SectionTitle title="Governance & RBAC" subtitle="Define operational permissions and manage administrative access levels." />
                                <List sx={{ border: '1px solid #F1F5F9', borderRadius: '16px', mb: 4 }}>
                                    {['Admin', 'Superior Employee', 'Employee'].map((role, i) => (
                                        <React.Fragment key={role}>
                                            <ListItem sx={{ py: 2 }}>
                                                <ListItemIcon><VpnKey sx={{ color: i === 0 ? '#EF4444' : '#3B82F6' }} /></ListItemIcon>
                                                <ListItemText
                                                    primary={<Typography sx={{ fontWeight: 700 }}>{role}</Typography>}
                                                    secondary={`${i === 0 ? 'Full System' : i === 1 ? 'Departmental' : 'Self-service'} Clearance`}
                                                />
                                                <Button size="small" variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none' }}>Edit Matrix</Button>
                                            </ListItem>
                                            {i < 2 && <Divider variant="inset" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Enforce Strong Password Policy</Typography>} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Lock Accounts after 5 Failed Attempts</Typography>} />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 3. SALARY & PAYROLL SETTINGS */}
                            <TabPanel value={tabIndex} index={2}>
                                <SectionTitle title="Payroll Logic" subtitle="Configure legal deductions, allowances, and statutory requirements." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Basic Salary %" type="number" defaultValue={50} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="HRA %" type="number" defaultValue={20} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField fullWidth label="PF Employer %" type="number" defaultValue={12} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField fullWidth label="ESI Employer %" type="number" defaultValue={3.25} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField fullWidth label="Professional Tax" type="number" defaultValue={200} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                                            <InputLabel>Rounding Rule</InputLabel>
                                            <Select defaultValue="None" label="Rounding Rule">
                                                <MenuItem value="None">Floating Decimals</MenuItem>
                                                <MenuItem value="Nearest">Nearest Integer</MenuItem>
                                                <MenuItem value="Next">Next Higher Integer</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Automate Bonus Calculation on Quarterly Performance</Typography>} />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 4. ATTENDANCE & LEAVE SETTINGS */}
                            <TabPanel value={tabIndex} index={3}>
                                <SectionTitle title="Operational Hours" subtitle="Set parameters for daily tracking, half-days, and leave workflows." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Clock-In Grace Period (Mins)" type="number" defaultValue={15} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Half-Day Threshold (Hrs)" type="number" defaultValue={4.5} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Leave Approval Hierarchy <InfoOutlined sx={{ fontSize: 16, color: '#94A3B8' }} />
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC' }}>
                                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Workflow: Employee → Superior (Approval) → HR (Verification)</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="outlined" size="small" startIcon={<Timer />} sx={{ textTransform: 'none', borderRadius: '8px' }}>Manage Holiday Calendar</Button>
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 5. LOAN MANAGEMENT SETTINGS */}
                            <TabPanel value={tabIndex} index={4}>
                                <SectionTitle title="Financial Assistance" subtitle="Establish rules for employee loans, advances, and interest metrics." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Max Loan Multiplier (x Base Salary)" type="number" defaultValue={3} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Annual Interest Rate (%)" type="number" defaultValue={6.5} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>Work Experience Eligibility (Months)</Typography>
                                        <Slider defaultValue={12} step={1} min={0} max={60} valueLabelDisplay="auto" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Mandatory HR Interview for Advanced Loans (&gt; ₹1L)</Typography>} />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 6. PAYSLIP & DOCUMENT SETTINGS */}
                            <TabPanel value={tabIndex} index={5}>
                                <SectionTitle title="Branding & Deliverables" subtitle="Customize the visual presentation of official company documents." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                                            <InputLabel>Payslip Theme</InputLabel>
                                            <Select defaultValue="ModernBlue" label="Payslip Theme">
                                                <MenuItem value="ModernBlue">Enterprise Modern (Blue)</MenuItem>
                                                <MenuItem value="ClassicGrey">Standard Classic (Grey)</MenuItem>
                                                <MenuItem value="HighContrast">High Contrast (Dark)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControlLabel control={<Switch defaultChecked />} label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Include Digital Signatory Hash</Typography>} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 4, borderRadius: '16px', border: '2px dashed #E2E8F0', textAlign: 'center' }}>
                                            <Description sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Payslip Watermark Image</Typography>
                                            <Button variant="outlined" size="small" component="label">Upload Asset <input type="file" hidden /></Button>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 7. NOTIFICATION & ALERT SETTINGS */}
                            <TabPanel value={tabIndex} index={6}>
                                <SectionTitle title="Omni-channel Alerts" subtitle="Stay synchronized with system events via Email and In-App triggers." />
                                <Stack spacing={2}>
                                    {[
                                        { t: 'Salary Disbursement', d: 'Fired when payroll is finalized and credited.', k: 'salary' },
                                        { t: 'Leave Approval/Rejection', d: 'Real-time alert for employee leave status updates.', k: 'leave' },
                                        { t: 'Loan Request Activity', d: 'Notifies HR and Superiors of new financial requests.', k: 'loan' },
                                        { t: 'System Integrity Alerts', d: 'Critical logs and unauthorized access attempts.', k: 'security' }
                                    ].map((n) => (
                                        <Box key={n.k} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: '12px' }}>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>{n.t}</Typography>
                                                <Typography variant="caption" sx={{ color: '#64748B' }}>{n.d}</Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Email Notification"><IconButton size="small"><Email sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                                <Tooltip title="In-App Notification"><IconButton size="small"><NotificationsNone sx={{ fontSize: 18, color: '#3B82F6' }} /></IconButton></Tooltip>
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </TabPanel>

                            {/* 8. SECURITY & ACCESS CONTROL SETTINGS */}
                            <TabPanel value={tabIndex} index={7}>
                                <SectionTitle title="System Perimeter" subtitle="Hardened security protocols for data protection and access logging." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch defaultChecked />} label={<Stack><Typography variant="body2" sx={{ fontWeight: 700 }}>Enable Two-Factor Authentication (2FA)</Typography><Typography variant="caption" sx={{ color: '#64748B' }}>Requires a temporal token for all administrative logins.</Typography></Stack>} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField fullWidth label="Session Timeout (Minutes)" type="number" defaultValue={20} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button variant="contained" color="inherit" startIcon={<History />} sx={{ borderRadius: '8px', textTransform: 'none', bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 700 }}>Export Audit Logs (CSV)</Button>
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 9. DATA & SYSTEM SETTINGS */}
                            <TabPanel value={tabIndex} index={8}>
                                <SectionTitle title="Infrastructure Health" subtitle="Monitor system storage, database snapshots, and import utilities." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Storage sx={{ color: '#1D4ED8' }} />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>Storage Efficiency</Typography>
                                                <Box sx={{ height: 6, bgcolor: '#DBEAFE', borderRadius: 3, mt: 0.5, position: 'relative' }}>
                                                    <Box sx={{ width: '45%', height: '100%', bgcolor: '#1D4ED8', borderRadius: 3 }} />
                                                </Box>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1D4ED8' }}>420 GB / 1 TB</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Button fullWidth variant="outlined" startIcon={<FileUpload />} sx={{ borderRadius: '12px', height: 50, textTransform: 'none' }}>Batch Import Employees</Button>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Button fullWidth variant="outlined" startIcon={<FileDownload />} sx={{ borderRadius: '12px', height: 50, textTransform: 'none' }}>System Full Backup</Button>
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* 10. THEME & UI SETTINGS */}
                            <TabPanel value={tabIndex} index={9}>
                                <SectionTitle title="Visual Experience" subtitle="Personalize the interface density, language, and accessibility modes." />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <FormControlLabel control={<Switch />} label={<Stack direction="row" spacing={1} alignItems="center"><DarkMode fontSize="small" /><Typography variant="body2" sx={{ fontWeight: 700 }}>Dark Mode System Overlay</Typography></Stack>} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                                            <InputLabel>Default Language</InputLabel>
                                            <Select defaultValue="EN" label="Default Language" icon={<GTranslate />}>
                                                <MenuItem value="EN">English (US)</MenuItem>
                                                <MenuItem value="ES">Spanish</MenuItem>
                                                <MenuItem value="HI">Hindi</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Interface Density</Typography>
                                        <Stack direction="row" spacing={2}>
                                            {['Compact', 'Default', 'Comfortable'].map(d => (
                                                <Button key={d} variant={d === 'Default' ? 'contained' : 'outlined'} size="small" sx={{ borderRadius: '20px', textTransform: 'none', px: 3 }}>{d}</Button>
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </TabPanel>

                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackSeverity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
