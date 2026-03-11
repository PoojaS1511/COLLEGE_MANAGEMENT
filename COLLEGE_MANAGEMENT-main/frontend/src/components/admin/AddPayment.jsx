import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, FormControl, InputLabel,
  Select, MenuItem, InputAdornment, Typography, Avatar,
  Box, Chip, FormHelperText, IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'demand_draft', label: 'Demand Draft' }
];

const AddPayment = ({ open, onClose, student, onPaymentSubmit }) => {
  const [formData, setFormData] = useState({
    amount: student?.pendingAmount || '',
    paymentDate: new Date(),
    paymentMethod: 'cash',
    referenceNumber: '',
    remarks: `Fee payment for ${student?.name || ''} - ${format(new Date(), 'MMM yyyy')}`
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const amount = Number(formData.amount);
    
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (student && amount > student.pendingAmount) {
      newErrors.amount = `Amount cannot exceed pending amount (₹${student.pendingAmount})`;
    }
    
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      paymentDate: date
    }));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const paymentData = {
      ...formData,
      amount: Number(formData.amount),
      paymentDate: format(formData.paymentDate, 'yyyy-MM-dd'),
      studentId: student?.id,
      studentName: student?.name,
      enrollment: student?.enrollment,
      course: student?.course,
      status: 'completed',
      collectedBy: 'Admin',
      collectedAt: new Date().toISOString()
    };

    onPaymentSubmit(paymentData);
  };

    if (!student) return null;

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Typography variant="h6">Record New Payment</Typography>
              </Box>
              <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Chip 
                      label={student.admissionNo || student.enrollment} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle1">
                      {student.name}
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    <Typography variant="body2" color="text.secondary">
                      Course: {student.courseName || student.course}
                    </Typography>
                    {student.batch && (
                      <Typography variant="body2" color="text.secondary">
                        Batch: {student.batch}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!errors.paymentDate}>
                  <DatePicker
                    label="Payment Date"
                    value={formData.paymentDate}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                  {errors.paymentDate && (
                    <FormHelperText>{errors.paymentDate}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!errors.paymentMethod}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    label="Payment Method"
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method.value} value={method.value}>
                        {method.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.paymentMethod && (
                    <FormHelperText>{errors.paymentMethod}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reference/Cheque No."
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  margin="normal"
                  disabled={formData.paymentMethod === 'cash'}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              startIcon={<ReceiptIcon />}
            >
              Record Payment
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    );
  };

  export default AddPayment;
