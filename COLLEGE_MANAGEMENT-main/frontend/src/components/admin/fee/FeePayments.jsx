import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  IconButton,
  Chip,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { supabase } from '../../../lib/supabase';

const FeePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('fee_payments')
        .select(`
          *,
          fee_structures (id, name, amount),
          students (id, first_name, last_name, admission_number)
        `);

      // Apply filters
      if (searchTerm) {
        query = query.or(
          `receipt_number.ilike.%${searchTerm}%,
          students.first_name.ilike.%${searchTerm}%,
          students.last_name.ilike.%${searchTerm}%,
          students.admission_number.ilike.%${searchTerm}%`
        );
      }
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      if (filterMethod !== 'all') {
        query = query.eq('payment_method', filterMethod);
      }

      const { data, error } = await query.order('payment_date', { ascending: false });
      
      if (error) throw error;
      
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showSnackbar('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch students and fee structures for filters
  const fetchReferenceData = async () => {
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, admission_number')
        .order('first_name');
      
      if (studentsError) throw studentsError;
      
      // Fetch fee structures
      const { data: feeStructuresData, error: feeStructuresError } = await supabase
        .from('fee_structures')
        .select('id, name, amount')
        .order('name');
      
      if (feeStructuresError) throw feeStructuresError;
      
      setStudents(studentsData || []);
      setFeeStructures(feeStructuresData || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      showSnackbar('Failed to load reference data', 'error');
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchReferenceData();
  }, [searchTerm, filterStatus, filterMethod]);

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;
    
    try {
      const { error } = await supabase
        .from('fee_payments')
        .delete()
        .eq('id', paymentToDelete.id);
      
      if (error) throw error;
      
      showSnackbar('Payment record deleted successfully', 'success');
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      showSnackbar('Failed to delete payment record', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewReceipt = (paymentId) => {
    navigate(`/admin/fees/receipts/${paymentId}`);
  };

  const handleAddPayment = () => {
    navigate('/admin/fees/payments/new');
  };

  // Filter and paginate data
  const filteredData = payments.filter((payment) => {
    const matchesSearch = !searchTerm || 
      payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${payment.students?.first_name} ${payment.students?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.students?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'bank_transfer':
        return '🏦';
      case 'cheque':
        return '📝';
      case 'online':
        return '🌐';
      default:
        return '💰';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={filterMethod}
              label="Payment Method"
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <MenuItem value="all">All Methods</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="online">Online</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPayment}
          >
            Record Payment
          </Button>
        </Box>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt #</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Fee Structure</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No payment records found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {payment.receipt_number || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {payment.students?.first_name} {payment.students?.last_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {payment.students?.admission_number || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {payment.fee_structures?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: payment.currency || 'USD',
                      }).format(payment.amount_paid || 0)}
                    </TableCell>
                    <TableCell>
                      {payment.payment_date ? format(parseISO(payment.payment_date), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{getPaymentMethodIcon(payment.payment_method)}</span>
                        <span>{payment.payment_method?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}</span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'N/A'}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Receipt">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewReceipt(payment.id)}
                          color="primary"
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Receipt">
                        <IconButton 
                          size="small"
                          onClick={() => window.print()}
                          color="primary"
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(payment)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Payment Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the payment record for receipt #{paymentToDelete?.receipt_number}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeePayments;
