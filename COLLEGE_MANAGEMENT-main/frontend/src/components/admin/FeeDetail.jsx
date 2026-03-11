import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
  Avatar,
  Stack,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  AccountCircle as AccountIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { feesService } from '../../services/feesService';

const statusIcons = {
  paid: <CheckCircleIcon color="success" />,
  partial: <PendingIcon color="warning" />,
  unpaid: <WarningIcon color="error" />
};

const statusLabels = {
  paid: 'Paid in Full',
  partial: 'Partial Payment',
  unpaid: 'Payment Pending'
};

const FeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadFee = async () => {
      try {
        setLoading(true);
        
        // If the ID is 'new', don't try to fetch data
        if (id === 'new') {
          setLoading(false);
          navigate('/admin/fees'); // Redirect to fees list or show a form for new fee
          return;
        }

        const data = await feesService.getFeesByStudentId(id);
        if (data) {
          setFee(data);
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

    loadFee();
  }, [id, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleRecordPayment = () => {
    navigate(`/admin/fees/${id}/pay`);
  };

  const handlePrintReceipt = (payment) => {
    // In a real app, this would open a print dialog for the receipt
    console.log('Printing receipt for payment:', payment);
  };

  const handlePaymentSuccess = () => {
    // Show success message
    setMessage({ type: 'success', text: 'Payment recorded successfully!' });
    // Refresh fee data
    loadFee();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <LinearProgress />
      </Container>
    );
  }

  if (error || !fee) {
    return (
      <Container maxWidth="lg">
        <Box textAlign="center" py={4}>
          <Typography color="error" variant="h6">
            {error || 'Fee record not found'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/fees')}
            sx={{ mt: 2 }}
          >
            Back to Fees
          </Button>
        </Box>
      </Container>
    );
  }

  const paymentProgress = (fee.paidAmount / fee.totalAmount) * 100;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Success/Error Message */}
      {message && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}
      <Box sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/fees')}
          sx={{ mb: 2 }}
        >
          Back to Fees
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" gap={2}>
                    {statusIcons[fee.status]}
                    <Typography variant="h5">
                      {fee.studentName}'s Fee Details
                    </Typography>
                    <Chip
                      label={statusLabels[fee.status] || fee.status}
                      color={
                        fee.status === 'paid'
                          ? 'success'
                          : fee.status === 'partial'
                          ? 'warning'
                          : 'error'
                      }
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                }
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<PrintIcon />}
                      onClick={() => handlePrintReceipt()}
                    >
                      Print
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => {}}
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PaymentIcon />}
                      onClick={handleRecordPayment}
                      disabled={fee.balance <= 0}
                      sx={{ ml: 2 }}
                    >
                      Record Payment
                    </Button>
                  </Stack>
                }
              />
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom color="textSecondary">
                      Student Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <AccountIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={fee.studentName}
                          secondary="Student Name"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${fee.course} - Semester ${fee.semester}`}
                          secondary="Course & Semester"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={new Date(fee.dueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          secondary="Due Date"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom color="textSecondary">
                      Payment Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Fee Amount</TableCell>
                            <TableCell align="right">
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                <MoneyIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                {formatCurrency(fee.totalAmount)}
                              </Box>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Paid</TableCell>
                            <TableCell align="right">
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                <MoneyIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                {formatCurrency(fee.paidAmount)}
                              </Box>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>
                              <strong>Balance Due</strong>
                            </TableCell>
                            <TableCell align="right">
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                <MoneyIcon
                                  fontSize="small"
                                  color={fee.balance > 0 ? 'error' : 'action'}
                                  sx={{ mr: 0.5 }}
                                />
                                <Typography
                                  variant="subtitle1"
                                  color={fee.balance > 0 ? 'error' : 'textPrimary'}
                                  fontWeight="bold"
                                >
                                  {formatCurrency(fee.balance)}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box mt={2}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          Payment Progress
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {Math.round(paymentProgress)}%
                        </Typography>
                      </Box>
                      <Box width="100%" bgcolor="grey.200" borderRadius={1} overflow="hidden">
                        <Box
                          bgcolor={fee.status === 'paid' ? 'success.main' : 'primary.main'}
                          width={`${paymentProgress}%`}
                          height={8}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Payment History"
                action={
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    onClick={handleRecordPayment}
                    disabled={fee.status === 'paid'}
                  >
                    Record New Payment
                  </Button>
                }
              />
              <CardContent>
                {fee.paymentHistory && fee.paymentHistory.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Receipt #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fee.paymentHistory.map((payment, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{payment.receipt}</TableCell>
                            <TableCell>
                              {new Date(payment.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>Semester Fee Payment</TableCell>
                            <TableCell align="right">
                              <Box display="flex" alignItems="center" justifyContent="flex-end">
                                <MoneyIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                {formatCurrency(payment.amount)}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handlePrintReceipt(payment)}
                                title="Print Receipt"
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {}}
                                title="Download Receipt"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box textAlign="center" py={4}>
                    <ReceiptIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      No payment history found
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PaymentIcon />}
                      onClick={handleRecordPayment}
                      sx={{ mt: 1 }}
                    >
                      Record First Payment
                    </Button>
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

export default FeeDetail;
