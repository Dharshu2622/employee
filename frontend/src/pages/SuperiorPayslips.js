import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    CircularProgress,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    ArrowBack,
    Download,
    Description,
    FileDownload,
} from '@mui/icons-material';
import api from '../api';

const PayslipCard = ({ payslip, onDownload, onView, downloading }) => (
    <Card sx={{
        borderRadius: '20px',
        border: '1px solid #EEF2F6',
        transition: 'all 0.3s ease',
        height: '100%',
        '&:hover': {
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            transform: 'translateY(-8px)',
            borderColor: '#6366f1'
        }
    }}>
        <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
                {/* Header */}
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#1A202C' }}>
                            {new Date(`${payslip.month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Typography>
                        <Box sx={{
                            px: 2,
                            py: 1,
                            borderRadius: '12px',
                            bgcolor: payslip.status === 'paid' ? '#D1FAE5' : '#FEF3C7'
                        }}>
                            <Typography variant="caption" sx={{
                                fontWeight: 800,
                                color: payslip.status === 'paid' ? '#047857' : '#D97706',
                                textTransform: 'capitalize'
                            }}>
                                {payslip.status || 'Pending'}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#718096' }}>
                        Salary Statement
                    </Typography>
                </Box>

                <Divider />

                {/* Salary Details */}
                <Box>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>Gross Salary</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1A202C' }}>
                                ₹{payslip.salary?.gross?.toLocaleString() || '0'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>Deductions</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#EF4444' }}>
                                ₹{payslip.salary?.totalDeductions?.toLocaleString() || '0'}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#1A202C' }}>Net Salary</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, color: '#10B981', fontSize: '1.1rem' }}>
                                ₹{payslip.salary?.net?.toLocaleString() || '0'}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Divider />

                {/* Actions */}
                <Stack direction="row" spacing={2}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<FileDownload />}
                        onClick={() => onDownload(payslip)}
                        disabled={downloading}
                        sx={{
                            bgcolor: '#6366f1',
                            color: 'white',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '12px',
                            py: 1.5,
                            '&:hover': { bgcolor: '#4f46e5' }
                        }}
                    >
                        {downloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                </Stack>
            </Stack>
        </CardContent>
    </Card>
);

export default function SuperiorPayslips() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPayslips();
    }, []);

    const fetchPayslips = async () => {
        try {
            setLoading(true);
            const res = await api.get('/payslips/my-payslips');
            setPayslips(res.data || []);
        } catch (err) {
            console.error('Error fetching payslips:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPayslip = async (payslip) => {
        try {
            setDownloading(true);
            const response = await api.get(`/payslips/${payslip._id}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip-${payslip.month}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Error downloading payslip:', err);
            alert('Failed to download payslip');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ background: '#f8fafc', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                pt: 6,
                pb: 10,
                borderRadius: '0 0 40px 40px'
            }}>
                <Container maxWidth="xl">
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/superior/dashboard')}
                            sx={{
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Back to Dashboard
                        </Button>
                    </Stack>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>My Payslips</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            View and download your salary payslips
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: -6 }}>
                {payslips && payslips.length > 0 ? (
                    <Grid container spacing={3}>
                        {payslips.map((payslip) => (
                            <Grid item xs={12} sm={6} md={4} key={payslip._id}>
                                <PayslipCard
                                    payslip={payslip}
                                    onDownload={downloadPayslip}
                                    downloading={downloading}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper sx={{
                        p: 6,
                        borderRadius: '24px',
                        textAlign: 'center',
                        bgcolor: '#FAFBFC',
                        border: '2px dashed #E5E7EB',
                        mt: 4
                    }}>
                        <Description sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 700, mb: 1 }}>
                            No Payslips Available
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                            Your payslips will appear here once they are generated by the administrator.
                        </Typography>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
