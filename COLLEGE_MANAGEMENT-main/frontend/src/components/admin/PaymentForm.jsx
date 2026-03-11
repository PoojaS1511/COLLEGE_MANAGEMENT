import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  LinearProgress,
  IconButton,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { feesService } from '../../services/feesService';

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'demand_draft', label: 'Demand Draft' },
  { value: 'other', label: 'Other' }
];

const PaymentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fee, setFee] = useState(null);
  
  // Form state
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Check if we're in edit mode (payment ID exists in URL)
  const isEditMode = location.pathname.includes('/edit');
  const paymentId = location.pathname.includes('/pay/') 
    ? location.pathname.split('/').pop() 
    : null;

  useEffect(() => {
    const loadFeeDetails = async () => {
      try {
        setLoading(true);
        const data = await feesService.getFeesByStudentId(id);
        if (data) {
          setFee(data);
          // Set max payable amount as default (remaining balance)
          if (!isEditMode) {
            setAmount(data.balance.toString());
          }
        } else {
          setError('Fee record not found');
        }
      } catch (err) {
        console.error('Error loading fee details:', err);
        setError('Failed to load fee details');
      } finally {
        setLoading(false);
      }
    };

    loadFeeDetails();
  }, [id, isEditMode]);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
      isValid = false;
    } else if (fee && parseFloat(amount) > fee.balance) {
      errors.amount = `Amount cannot exceed the outstanding balance of ${formatCurrency(fee.balance)}`;
      isValid = false;
    }

    if (!paymentDate) {
      errors.paymentDate = 'Payment date is required';
      isValid = false;
    }

    if (!paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const paymentData = {
        feeId: fee.id,
        amount: parseFloat(amount),
        paymentDate: paymentDate.toISOString().split('T')[0],
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined
      };

      await feesService.recordPayment(paymentData);
      
      // Redirect to fee details page after successful payment
      navigate(`/admin/fees/${fee.id}`, {
        state: { message: 'Payment recorded successfully!' }
      });
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err.message || 'Failed to record payment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error || !fee) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Failed to load fee details'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/fees')}
          sx={{ mt: 2 }}
        >
          Back to Fees
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/admin/fees/${id}`)}
          sx={{ mb: 2 }}
        >
          Back to Fee Details
        </Button>

        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? 'Update Payment' : 'Record New Payment'}
        </Typography>
        <Typography color="textSecondary" paragraph>
          {isEditMode 
            ? 'Update the payment details below.'
            : `Record a new payment for ${fee.studentName}'s fee.`}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Payment Details" />
              <Divider />
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Payment Date"
                          value={paymentDate}
                          onChange={(newValue) => setPaymentDate(newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              required
                              error={!!formErrors.paymentDate}
                              helperText={formErrors.paymentDate}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Amount"
                        value={amount}
                        onChange={handleAmountChange}
                        required
                        error={!!formErrors.amount}
                        helperText={formErrors.amount || `Outstanding balance: ${formatCurrency(fee.balance)}`}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!formErrors.paymentMethod}>
                        <InputLabel>Payment Method *</InputLabel>
                        <Select
                          value={paymentMethod}
                          label="Payment Method *"
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          {paymentMethods.map((method) => (
                            <MenuItem key={method.value} value={method.value}>
                              {method.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.paymentMethod && (
                          <FormHelperText>{formErrors.paymentMethod}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Reference Number"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="e.g., Transaction ID, Cheque #"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Any additional notes about this payment..."
                      />
                    </Grid>

                    {error && (
                      <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button
                          variant="outlined"
                          onClick={() => navigate(`/admin/fees/${id}`)}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          disabled={saving || (fee && parseFloat(amount) > fee.balance)}
                        >
                          {saving ? 'Processing...' : 'Record Payment'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Fee Summary" />
              <Divider />
              <CardContent>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>{fee.studentName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>{fee.course}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Semester</TableCell>
                        <TableCell>{fee.semester}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Fee</TableCell>
                        <TableCell>{formatCurrency(fee.totalAmount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Paid Amount</TableCell>
                        <TableCell>{formatCurrency(fee.paidAmount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Outstanding</strong></TableCell>
                        <TableCell>
                          <Typography color={fee.balance > 0 ? 'error' : 'textPrimary'} fontWeight="bold">
                            {formatCurrency(fee.balance)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} sx={{ p: 0 }}>
                          <Box width="100%" height={8} bgcolor="grey.200">
                            <Box
                              width={`${(fee.paidAmount / fee.totalAmount) * 100}%`}
                              height="100%"
                              bgcolor={fee.status === 'paid' ? 'success.main' : 'primary.main'}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
                  <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Payment Preview
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Amount to Pay</TableCell>
                            <TableCell align="right">{formatCurrency(parseFloat(amount))}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Payment Method</TableCell>
                            <TableCell align="right">
                              {paymentMethods.find(m => m.value === paymentMethod)?.label}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>New Balance</TableCell>
                            <TableCell align="right">
                              <Typography 
                                color={fee.balance - parseFloat(amount) > 0 ? 'error' : 'success.main'}
                                fontWeight="bold"
                              >
                                {formatCurrency(fee.balance - parseFloat(amount))}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PaymentForm;
