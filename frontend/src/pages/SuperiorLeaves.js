import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import { Check, Close, Assignment } from '@mui/icons-material';
import api from '../api';

export default function SuperiorLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openReject, setOpenReject] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [message, setMessage] = useState('');
    const [showSnack, setShowSnack] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const resp = await api.get('/leaves/all');
            setLeaves(resp.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/leaves/${id}/approve`);
            setMessage('Leave request approved');
            setShowSnack(true);
            fetchLeaves();
        } catch (err) {
            setMessage('Failed to approve request');
            setShowSnack(true);
        }
    };

    const handleRejectClick = (leave) => {
        setSelectedLeave(leave);
        setOpenReject(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) return;
        try {
            await api.patch(`/leaves/${selectedLeave._id}/reject`, { rejectionReason });
            setOpenReject(false);
            setRejectionReason('');
            setMessage('Leave request rejected');
            setShowSnack(true);
            fetchLeaves();
        } catch (err) {
            setMessage('Failed to reject request');
            setShowSnack(true);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ background: '#f8fafc', minHeight: '100vh', py: 6 }}>
            <Container maxWidth="xl">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#ec489915', color: '#ec4899' }}><Assignment /></Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#1a202c' }}>Leave Requests</Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Manage and authorize employee absence requests.</Typography>
                    </Box>
                </Stack>

                <TableContainer component={Paper} sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaves.map((leave) => (
                                <TableRow key={leave._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{leave.employee?.name}</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>{leave.employee?.department}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{leave.type}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>{leave.reason}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={leave.status}
                                            color={getStatusColor(leave.status)}
                                            size="small"
                                            sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {leave.status === 'pending' && (
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <IconButton
                                                    onClick={() => handleApprove(leave._id)}
                                                    sx={{ bgcolor: '#dcfce7', color: '#15803d', '&:hover': { bgcolor: '#bbf7d0' } }}
                                                >
                                                    <Check fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleRejectClick(leave)}
                                                    sx={{ bgcolor: '#fee2e2', color: '#b91c1c', '&:hover': { bgcolor: '#fecaca' } }}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>

            <Dialog open={openReject} onClose={() => setOpenReject(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Reason for Rejection</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: '#64748b' }}>
                        Please provide a mandatory reason for rejecting this leave request. This will be visible to the employee.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="e.g., Departmental workload is high during these dates."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenReject(false)} sx={{ color: '#64748b' }}>Cancel</Button>
                    <Button
                        variant="contained"
                        disabled={!rejectionReason.trim()}
                        onClick={handleRejectSubmit}
                        sx={{ borderRadius: '8px', bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
                    >
                        Confirm Rejection
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)}>
                <Alert severity={message.includes('success') || message.includes('approved') ? 'success' : 'error'} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
