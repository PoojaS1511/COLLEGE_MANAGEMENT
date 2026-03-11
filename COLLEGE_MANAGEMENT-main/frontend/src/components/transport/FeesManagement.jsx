import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, MenuItem, CircularProgress, Alert, Grid, TablePagination
} from '@mui/material';
import { Search, DollarSign, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import TransportService from '../../services/transportService';

const FeesManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0
  });
  const [summary, setSummary] = useState({
    total_amount: 0,
    collected_amount: 0,
    pending_amount: 0,
    overdue_amount: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentData, setPaymentData] = useState({ payment_mode: 'Online', payment_date: '', remarks: '' });

  useEffect(() => { loadFees(); }, [pagination.page, pagination.rowsPerPage, filterStatus, searchTerm]);

  const loadFees = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage
      };

      if (filterStatus !== 'All') {
        params.payment_status = filterStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const result = await TransportService.getTransportFees(params);
      if (!result.success) throw new Error(result.error);
      
      setFees(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
      if (result.summary) {
        setSummary(result.summary);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const handlePayment = (fee) => {
    setSelectedFee(fee);
    setPaymentData({ payment_mode: 'Online', payment_date: new Date().toISOString().split('T')[0], remarks: '' });
    setOpenDialog(true);
  };

  const handleSubmitPayment = async () => {
    try {
      await TransportService.recordPayment({
        ...paymentData,
        fee_id: selectedFee.id,
        student_id: selectedFee.student_id,
        student_name: selectedFee.student_name,
        amount: selectedFee.amount
      });
      setOpenDialog(false);
      loadFees();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  if (loading && fees.length === 0) {
    return <Box className="flex items-center justify-center min-h-screen"><CircularProgress /></Box>;
  }

  return (
    <Box className="p-6 space-y-6">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">Fees Management</Typography>
          <Typography variant="body1" color="text.secondary">Manage transport fee collection</Typography>
        </Box>
        <Button variant="contained" startIcon={<Download size={20} />} className="bg-blue-600 hover:bg-blue-700">
          Export Report
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">Total Amount</Typography>
                <Typography variant="h5" className="font-bold">{TransportService.formatCurrency(summary.total_amount)}</Typography>
              </Box>
              <DollarSign size={32} className="text-blue-600" />
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box><Typography color="text.secondary" variant="body2">Collected</Typography>
              <Typography variant="h5" className="font-bold text-green-600">{TransportService.formatCurrency(summary.collected_amount)}</Typography>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box><Typography color="text.secondary" variant="body2">Pending</Typography>
              <Typography variant="h5" className="font-bold text-orange-600">{TransportService.formatCurrency(summary.pending_amount)}</Typography>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box><Typography color="text.secondary" variant="body2">Overdue</Typography>
              <Typography variant="h5" className="font-bold text-red-600">{TransportService.formatCurrency(summary.overdue_amount || 0)}</Typography>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card><CardContent>
        <Box className="flex gap-4">
          <TextField placeholder="Search fees by student ID, bus, or route..." value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination(prev => ({ ...prev, page: 0 }));
            }}
            InputProps={{ startAdornment: <Search size={20} className="mr-2 text-gray-400" /> }}
            className="flex-1" size="small" />
          <TextField select value={filterStatus} onChange={(e) => {
              setFilterStatus(e.target.value);
              setPagination(prev => ({ ...prev, page: 0 }));
            }}
            size="small" className="w-40">
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
          </TextField>
        </Box>
      </CardContent></Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">Student ID</TableCell>
                <TableCell className="font-semibold">Student Name</TableCell>
                <TableCell className="font-semibold">Amount</TableCell>
                <TableCell className="font-semibold">Due Date</TableCell>
                <TableCell className="font-semibold">Payment Date</TableCell>
                <TableCell className="font-semibold">Payment Mode</TableCell>
                <TableCell className="font-semibold">Route</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id} hover>
                  <TableCell>{fee.student_id}</TableCell>
                  <TableCell>{fee.student_name}</TableCell>
                  <TableCell className="font-medium">{TransportService.formatCurrency(fee.amount)}</TableCell>
                  <TableCell>{TransportService.formatDate(fee.due_date)}</TableCell>
                  <TableCell>{fee.payment_date ? TransportService.formatDate(fee.payment_date) : '-'}</TableCell>
                  <TableCell>{fee.payment_mode || '-'}</TableCell>
                  <TableCell>{fee.route_id}</TableCell>
                  <TableCell>
                    <Chip label={fee.payment_status} color={getStatusColor(fee.payment_status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {fee.payment_status !== 'Paid' && (
                      <Button size="small" variant="contained" onClick={() => handlePayment(fee)}
                        className="bg-green-600 hover:bg-green-700">
                        Record Payment
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {fees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" className="py-8">
                    <Typography color="text.secondary">No fee records found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">Record Payment</Typography>
          <IconButton onClick={() => setOpenDialog(false)} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedFee && (
            <Box className="space-y-4 mt-2">
              <Box className="p-4 bg-gray-50 rounded-lg">
                <Typography variant="body2" color="text.secondary">Student</Typography>
                <Typography variant="h6">{selectedFee.student_name}</Typography>
                <Typography variant="body2">ID: {selectedFee.student_id}</Typography>
                <Typography variant="h5" className="mt-2 font-bold text-green-600">
                  {TransportService.formatCurrency(selectedFee.amount)}
                </Typography>
              </Box>
              <TextField select label="Payment Mode" value={paymentData.payment_mode}
                onChange={(e) => setPaymentData({ ...paymentData, payment_mode: e.target.value })} fullWidth>
                <MenuItem value="Online">Online</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
              </TextField>
              <TextField label="Payment Date" type="date" value={paymentData.payment_date}
                onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Remarks" value={paymentData.remarks}
                onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                fullWidth multiline rows={2} />
            </Box>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitPayment} className="bg-green-600 hover:bg-green-700">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeesManagement;