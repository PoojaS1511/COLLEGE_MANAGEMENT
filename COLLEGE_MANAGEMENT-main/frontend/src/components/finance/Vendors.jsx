import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { Plus, Edit, Trash2, Search, Building, CreditCard, Users } from 'lucide-react';
import FinanceDataTable from './FinanceDataTable';
import MetricCard from './MetricCard';
import { API_URL } from '../../config';
import financeService from '../../services/financeService';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterServiceType, setFilterServiceType] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalAmountDue: 0,
    totalAmountPaid: 0,
    totalVendors: 0,
  });

  const serviceTypes = [
    'Construction',
    'Equipment Supply',
    'Maintenance',
    'Utilities',
    'Stationery',
    'Software',
    'Consulting',
    'Training',
    'Security',
    'Catering',
    'Transport',
    'Other'
  ];

  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    serviceType: '',
    contactNumber: '',
    email: '',
    amountDue: '',
    amountPaid: '',
    totalTransactions: 0,
  });

  const columns = [
    { id: 'vendorId', label: 'Vendor ID', minWidth: 100 },
    { id: 'vendorName', label: 'Vendor Name', minWidth: 150 },
    { id: 'serviceType', label: 'Service Type', minWidth: 120 },
    { id: 'contactNumber', label: 'Contact Number', minWidth: 130 },
    { id: 'email', label: 'Email', minWidth: 180 },
    { 
      id: 'amountDue', 
      label: 'Amount Due', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'amountPaid', 
      label: 'Amount Paid', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'totalTransactions', 
      label: 'Total Transactions', 
      minWidth: 120,
      align: 'center'
    },
  ];

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const result = await financeService.getVendors();
      if (result.success) {
        const vendorsData = result.data.map(vendor => ({
          id: vendor.vendor_id,
          vendorId: vendor.vendor_id,
          vendorName: vendor.vendor_name,
          serviceType: vendor.service_type,
          contactNumber: vendor.contact_no,
          email: vendor.email,
          amountDue: vendor.amount_due,
          amountPaid: vendor.amount_paid,
          totalTransactions: vendor.total_transactions,
        }));
        setVendors(vendorsData);
        calculateSummary(vendorsData);
      } else {
        console.error('Failed to fetch vendors:', result.error);
        // Fallback to mock data if API fails
        setVendors(mockVendors);
        calculateSummary(mockVendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Fallback to mock data if API fails
      setVendors(mockVendors);
      calculateSummary(mockVendors);
    }
  };

  // Mock data as fallback
  const mockVendors = [
    {
      id: 1,
      vendorId: 'VEN001',
      vendorName: 'ABC Construction Co.',
      serviceType: 'Construction',
      contactNumber: '+91-9876543210',
      email: 'info@abcconstruction.com',
      amountDue: 250000,
      amountPaid: 750000,
      totalTransactions: 12,
    },
    {
      id: 2,
      vendorId: 'VEN002',
      vendorName: 'Tech Solutions Ltd',
      serviceType: 'Equipment Supply',
      contactNumber: '+91-9876543211',
      email: 'sales@techsolutions.com',
      amountDue: 180000,
      amountPaid: 320000,
      totalTransactions: 8,
    },
    {
      id: 3,
      vendorId: 'VEN003',
      vendorName: 'Quick Fix Services',
      serviceType: 'Maintenance',
      contactNumber: '+91-9876543212',
      email: 'service@quickfix.com',
      amountDue: 45000,
      amountPaid: 155000,
      totalTransactions: 15,
    },
    {
      id: 4,
      vendorId: 'VEN004',
      vendorName: 'Stationery World',
      serviceType: 'Stationery',
      contactNumber: '+91-9876543213',
      email: 'orders@stationeryworld.com',
      amountDue: 15000,
      amountPaid: 85000,
      totalTransactions: 24,
    },
    {
      id: 5,
      vendorId: 'VEN005',
      vendorName: 'City Electricity Board',
      serviceType: 'Utilities',
      contactNumber: '+91-9876543214',
      email: 'billing@electricityboard.gov.in',
      amountDue: 75000,
      amountPaid: 425000,
      totalTransactions: 36,
    },
  ];

  const calculateSummary = (vendorsData) => {
    const totalAmountDue = vendorsData.reduce((sum, vendor) => sum + vendor.amountDue, 0);
    const totalAmountPaid = vendorsData.reduce((sum, vendor) => sum + vendor.amountPaid, 0);
    const totalVendors = vendorsData.length;

    setSummaryData({
      totalAmountDue,
      totalAmountPaid,
      totalVendors,
    });
  };

  const handleOpenDialog = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        serviceType: vendor.serviceType,
        contactNumber: vendor.contactNumber,
        email: vendor.email,
        amountDue: vendor.amountDue,
        amountPaid: vendor.amountPaid,
        totalTransactions: vendor.totalTransactions,
      });
    } else {
      setEditingVendor(null);
      setFormData({
        vendorId: '',
        vendorName: '',
        serviceType: '',
        contactNumber: '',
        email: '',
        amountDue: '',
        amountPaid: '',
        totalTransactions: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVendor(null);
  };

  const handleSubmit = () => {
    const newVendor = {
      ...formData,
      amountDue: parseFloat(formData.amountDue) || 0,
      amountPaid: parseFloat(formData.amountPaid) || 0,
      totalTransactions: parseInt(formData.totalTransactions) || 0,
      id: editingVendor ? editingVendor.id : Date.now(),
    };

    if (editingVendor) {
      setVendors(vendors.map(v => v.id === editingVendor.id ? newVendor : v));
    } else {
      setVendors([...vendors, newVendor]);
    }

    calculateSummary([...vendors, newVendor]);
    handleCloseDialog();
  };

  const handleDelete = (vendor) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      const updatedVendors = vendors.filter(v => v.id !== vendor.id);
      setVendors(updatedVendors);
      calculateSummary(updatedVendors);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.vendorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServiceType = !filterServiceType || vendor.serviceType === filterServiceType;
    return matchesSearch && matchesServiceType;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d395e' }}>
          Vendor Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#1d395e', '&:hover': { backgroundColor: '#2a4a7a' } }}
        >
          Add New Vendor
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Amount Due"
            value={summaryData.totalAmountDue}
            icon={CreditCard}
            color="warning"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Amount Paid"
            value={summaryData.totalAmountPaid}
            icon={Building}
            color="secondary"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Vendors"
            value={summaryData.totalVendors}
            icon={Users}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by vendor name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} className="text-gray-400 mr-2" />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Service Type</InputLabel>
              <Select
                value={filterServiceType}
                label="Service Type"
                onChange={(e) => setFilterServiceType(e.target.value)}
              >
                <MenuItem value="">All Service Types</MenuItem>
                {serviceTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setFilterServiceType('');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table */}
      <FinanceDataTable
        columns={columns}
        data={filteredVendors}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        searchPlaceholder="Search vendors..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor ID"
                value={formData.vendorId}
                onChange={handleInputChange('vendorId')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor Name"
                value={formData.vendorName}
                onChange={handleInputChange('vendorName')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={formData.serviceType}
                  label="Service Type"
                  onChange={handleInputChange('serviceType')}
                >
                  {serviceTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contactNumber}
                onChange={handleInputChange('contactNumber')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Amount Due"
                type="number"
                value={formData.amountDue}
                onChange={handleInputChange('amountDue')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Amount Paid"
                type="number"
                value={formData.amountPaid}
                onChange={handleInputChange('amountPaid')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Transactions"
                type="number"
                value={formData.totalTransactions}
                onChange={handleInputChange('totalTransactions')}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingVendor ? 'Update' : 'Add'} Vendor
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vendors;
