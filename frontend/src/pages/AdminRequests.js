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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Verified,
  Payments,
  CalendarMonth,
  InfoOutlined
} from '@mui/icons-material';
import api from '../api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>}
    </div>
  );
}

export default function AdminRequests() {
  const [tabValue, setTabValue] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [loans, setLoans] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState('');
  const [showSnack, setShowSnack] = useState(false);
  const [requestType, setRequestType] = useState('leave');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      setFetchLoading(true);
      const [leaveRes, loanRes] = await Promise.all([
        api.get('/leaves/all').catch(() => ({ data: [] })),
        api.get('/loans/all').catch(() => ({ data: [] }))
      ]);
      setLeaves((leaveRes.data || []).filter(item => item.employee));
      setLoans((loanRes.data || []).filter(item => item.employee));
      setFetchLoading(false);
    } catch (err) {
      console.error('Governance fetch error:', err);
      setFetchLoading(false);
    }
  };

  const getFilteredData = (items) => {
    return items.filter(req => {
      const matchesSearch = !searchQuery ||
        req.employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.employee?.department?.toLowerCase().includes(searchQuery.toLowerCase());

      const reqDate = new Date(req.appliedOn);
      const matchesDate = !dateFilter ||
        reqDate.toISOString().split('T')[0] === dateFilter;

      const matchesMonth = !monthFilter ||
        (reqDate.getFullYear() === parseInt(monthFilter.split('-')[0]) &&
          (reqDate.getMonth() + 1) === parseInt(monthFilter.split('-')[1]));

      return matchesSearch && matchesDate && matchesMonth;
    });
  };

  const stats = {
    totalLeaves: leaves.length,
    totalLoans: loans.length,
    pendingCount: [...leaves, ...loans].filter(r => r.status === 'pending').length,
    approvedCount: [...leaves, ...loans].filter(r => r.status === 'approved').length
  };

  const handleApprove = async (type, id) => {
    try {
      const endpoint = type === 'leave' ? `/leaves/${id}/approve` : `/loans/${id}/approve`;
      await api.patch(endpoint, {});
      setMessage(`✓ Authority confirmation successful`);
      fetchRequests();
      setShowSnack(true);
    } catch (err) {
      setMessage('Administrative approval error');
      setShowSnack(true);
    }
  };

  const handleRejectClick = (type, request) => {
    setRequestType(type);
    setSelectedRequest(request);
    setOpenRejectDialog(true);
    setRejectionReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      setMessage('Audit explanation required for rejection');
      setShowSnack(true);
      return;
    }

    try {
      const endpoint = requestType === 'leave'
        ? `/leaves/${selectedRequest._id}/reject`
        : `/loans/${selectedRequest._id}/reject`;

      await api.patch(endpoint, { rejectionReason: rejectionReason.trim() });

      setMessage(`✗ Request formally declined`);
      setOpenRejectDialog(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
      setShowSnack(true);
    } catch (err) {
      setMessage('Administrative rejection error');
      setShowSnack(true);
    }
  };

  const getStatusChip = (status) => {
    const configs = {
      pending: { label: 'Audit Pending', color: '#ED8936', bg: '#FFFAF0' },
      approved: { label: 'Verified', color: '#48BB78', bg: '#F0FFF4' },
      rejected: { label: 'Declined', color: '#E53E3E', bg: '#FFF5F5' },
      closed: { label: 'Closed', color: '#718096', bg: '#F7FAFC' }
    };
    const cur = configs[status] || configs.pending;
    return (
      <Chip
        label={cur.label}
        size="small"
        sx={{
          borderRadius: '6px',
          fontWeight: 800,
          color: cur.color,
          bgcolor: cur.bg,
          border: `1px solid ${cur.color}30`,
          fontSize: '0.65rem',
          textTransform: 'uppercase'
        }}
      />
    );
  };

  const RequestTable = ({ items, type }) => (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.75rem', textTransform: 'uppercase' }}>Personnel</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.75rem', textTransform: 'uppercase' }}>Details</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reason / Audit</TableCell>
            <TableCell sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
            <TableCell align="right" sx={{ bgcolor: '#F8FAFC', fontWeight: 800, color: '#4A5568', fontSize: '0.75rem', textTransform: 'uppercase' }}>Governance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((req) => {
            const isSuperior = req.employee?.role === 'superior';
            return (
              <TableRow key={req._id} hover>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: isSuperior ? '#3182CE15' : '#71809615', color: isSuperior ? '#3182CE' : '#718096', width: 36, height: 36, fontSize: '0.8rem', fontWeight: 800 }}>
                      {isSuperior ? 'SU' : 'EM'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1A202C' }}>{req.employee?.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>{req.employee?.department}</Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  {type === 'leave' ? (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A5568' }}>{req.type?.toUpperCase()}</Typography>
                      <Typography variant="caption" sx={{ color: '#718096' }}>{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#4A5568' }}>₹{req.amount?.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ color: '#718096' }}>EMI: ₹{req.monthlyEMI} | {req.termMonths} Months</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#4A5568', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {req.reason}
                  </Typography>
                  {req.rejectionReason && (
                    <Typography variant="caption" sx={{ color: '#E53E3E', fontWeight: 600, display: 'block' }}>Audit: {req.rejectionReason}</Typography>
                  )}
                </TableCell>
                <TableCell>{getStatusChip(req.status)}</TableCell>
                <TableCell align="right">
                  {isSuperior && req.status === 'pending' ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="contained" onClick={() => handleApprove(type, req._id)} sx={{ bgcolor: '#48BB78', fontWeight: 800, fontSize: '0.65rem', textTransform: 'none', minWidth: '80px', '&:hover': { bgcolor: '#38A169' } }}>Approve</Button>
                      <Button size="small" variant="outlined" onClick={() => handleRejectClick(type, req)} sx={{ color: '#E53E3E', borderColor: '#FED7D7', fontWeight: 800, fontSize: '0.65rem', textTransform: 'none', minWidth: '80px', '&:hover': { borderColor: '#E53E3E' } }}>Decline</Button>
                    </Stack>
                  ) : (
                    <Tooltip title={isSuperior ? "Actioned by Global Admin" : "Governed by Departmental Superior"}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, color: '#A0AEC0' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Oversight Pattern</Typography>
                        <InfoOutlined sx={{ fontSize: 16 }} />
                      </Box>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A202C', lineHeight: 1.2 }}>Oversight Registry</Typography>
              <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>ADMINISTRATIVE GOVERNANCE | REQUEST BALANCING</Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2.5, height: '100%', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px -10px rgba(0,0,0,0.1)' } }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#8B5CF610', color: '#8B5CF6' }}><CalendarMonth /></Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Leaves</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A202C' }}>{stats.totalLeaves}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2.5, height: '100%', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px -10px rgba(0,0,0,0.1)' } }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F9731610', color: '#F97316' }}><Payments /></Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#718096', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Loans</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A202C' }}>{stats.totalLoans}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2.5, height: '100%', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px -10px rgba(0,0,0,0.1)' } }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#ED893610', color: '#ED8936' }}><InfoOutlined /></Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#ED8936', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Audit</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#ED8936' }}>{stats.pendingCount}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2.5, height: '100%', borderRadius: '16px', bgcolor: '#1A2024', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.1)' }}><Verified /></Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Work</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats.approvedCount}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Paper sx={{ flexGrow: 1, borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: 'none', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* SEARCH & FILTERS */}
          <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Search personnel or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  type="date"
                  size="small"
                  label="Filter by Date"
                  InputLabelProps={{ shrink: true }}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  sx={{ width: 170, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                <TextField
                  type="month"
                  size="small"
                  label="Filter Month"
                  InputLabelProps={{ shrink: true }}
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  sx={{ width: 150, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
                <Button
                  variant="outlined"
                  onClick={() => { setDateFilter(''); setMonthFilter(''); setSearchQuery(''); }}
                  sx={{ px: 3, textTransform: 'none', fontWeight: 700, borderRadius: '10px', color: '#718096', borderColor: '#E2E8F0' }}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              px: 3, pt: 0.5, minHeight: '40px',
              '& .MuiTab-root': { fontWeight: 800, textTransform: 'none', fontSize: '0.85rem', color: '#718096', minHeight: '40px' },
              '& .Mui-selected': { color: '#1A202C' },
              '& .MuiTabs-indicator': { bgcolor: '#1A202C', height: 2, borderRadius: '2px 2px 0 0' }
            }}
          >
            <Tab label="Leave Allocations" icon={<CalendarMonth sx={{ fontSize: 16 }} />} iconPosition="start" />
            <Tab label="Financial Assistance" icon={<Payments sx={{ fontSize: 16 }} />} iconPosition="start" />
          </Tabs>

          <Divider />

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: '10px' } }}>
            {fetchLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={24} color="inherit" /></Box>
            ) : (
              <>
                <TabPanel value={tabValue} index={0}>
                  <RequestTable items={getFilteredData(leaves)} type="leave" />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <RequestTable items={getFilteredData(loans)} type="loan" />
                </TabPanel>
              </>
            )}
          </Box>
        </Paper>
      </Container>

      {/* REJECTION DIALOG */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#1A202C', pt: 3 }}>Declination Audit Prompt</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: '#718096' }}>
            Provide a detailed administrative reason for declining the request from <strong>{selectedRequest?.employee?.name}</strong>.
          </Typography>
          <TextField
            fullWidth
            label="Internal Audit Remark"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 4 }}>
          <Button onClick={() => setOpenRejectDialog(false)} sx={{ color: '#718096', fontWeight: 700, textTransform: 'none' }}>Cancel Audit</Button>
          <Button variant="contained" onClick={handleRejectSubmit} sx={{ bgcolor: '#E53E3E', px: 4, fontWeight: 700, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: '#C53030' } }}>Formalize Rejection</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSnack} autoHideDuration={4000} onClose={() => setShowSnack(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert severity={message.includes('✓') ? 'success' : 'error'} variant="filled" sx={{ borderRadius: '4px' }}>{message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
