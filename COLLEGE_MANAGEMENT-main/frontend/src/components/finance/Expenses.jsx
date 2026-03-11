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
} from '@mui/material';
import { Plus, Edit, Trash2, Search, Receipt, CreditCard, AlertCircle } from 'lucide-react';
import FinanceDataTable from './FinanceDataTable';
import MetricCard from './MetricCard';
import { API_URL } from '../../config';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalExpenses: 0,
    paidExpenses: 0,
    pendingExpenses: 0,
  });

  const categories = [
    'Infrastructure',
    'Equipment',
    'Maintenance',
    'Utilities',
    'Supplies',
    'Travel',
    'Training',
    'Events',
    'Insurance',
    'Legal',
    'Marketing',
    'Other'
  ];

  const departments = [
    'CSE',
    'ECE',
    'Mechanical',
    'Civil',
    'EEE',
    'Administration',
    'Library',
    'Sports',
    'Hostel'
  ];

  const [formData, setFormData] = useState({
    expenseId: '',
    expenseCategory: '',
    department: '',
    amount: '',
    vendor: '',
    expenseDate: '',
    paymentStatus: 'pending',
    description: '',
  });

  const columns = [
    { id: 'expenseId', label: 'Expense ID', minWidth: 120 },
    { id: 'expenseCategory', label: 'Category', minWidth: 120 },
    { id: 'department', label: 'Department', minWidth: 120 },
    { id: 'vendor', label: 'Vendor', minWidth: 150 },
    { 
      id: 'amount', 
      label: 'Amount', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'expenseDate', 
      label: 'Expense Date', 
      minWidth: 120,
      type: 'date'
    },
    { 
      id: 'paymentStatus', 
      label: 'Payment Status', 
      minWidth: 120,
      type: 'status'
    },
    { id: 'description', label: 'Description', minWidth: 200 },
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/finance/expenses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const expensesData = result.data.map(expense => ({
            id: expense.id,
            expenseId: expense.expense_id,
            expenseCategory: expense.category,
            department: expense.department,
            amount: expense.amount,
            vendor: expense.vendor,
            expenseDate: expense.date,
            paymentStatus: expense.payment_status,
            description: expense.description,
          }));
          setExpenses(expensesData);
          calculateSummary(expensesData);
        }
      } else {
        console.error('Failed to fetch expenses');
        // Fallback to mock data if API fails
        const mockExpenses = [
          {
            id: 1,
            expenseId: 'EXP001',
            expenseCategory: 'Infrastructure',
            department: 'CSE',
            amount: 250000,
            vendor: 'ABC Construction',
            expenseDate: '2024-01-15',
            paymentStatus: 'paid',
            description: 'Lab renovation and equipment installation',
          },
          {
            id: 2,
            expenseId: 'EXP002',
            expenseCategory: 'Equipment',
            department: 'ECE',
            amount: 180000,
            vendor: 'Tech Solutions Ltd',
            expenseDate: '2024-01-20',
            paymentStatus: 'pending',
            description: 'Oscilloscopes and testing equipment',
          },
          {
            id: 3,
            expenseId: 'EXP003',
            expenseCategory: 'Utilities',
            department: 'Administration',
            amount: 75000,
            vendor: 'City Electricity Board',
            expenseDate: '2024-01-25',
            paymentStatus: 'paid',
            description: 'Monthly electricity bill',
          },
          {
            id: 4,
            expenseId: 'EXP004',
            expenseCategory: 'Supplies',
            department: 'Mechanical',
            amount: 45000,
            vendor: 'Stationery World',
            expenseDate: '2024-01-18',
            paymentStatus: 'paid',
            description: 'Office supplies and stationery',
          },
          {
            id: 5,
            expenseId: 'EXP005',
            expenseCategory: 'Maintenance',
            department: 'Civil',
            amount: 120000,
            vendor: 'Quick Fix Services',
            expenseDate: '2024-01-22',
            paymentStatus: 'pending',
            description: 'Building maintenance and repairs',
          },
        ];
        setExpenses(mockExpenses);
        calculateSummary(mockExpenses);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Fallback to mock data if API fails
      const mockExpenses = [
        {
          id: 1,
          expenseId: 'EXP001',
          expenseCategory: 'Infrastructure',
          department: 'CSE',
          amount: 250000,
          vendor: 'ABC Construction',
          expenseDate: '2024-01-15',
          paymentStatus: 'paid',
          description: 'Lab renovation and equipment installation',
        },
        {
          id: 2,
          expenseId: 'EXP002',
          expenseCategory: 'Equipment',
          department: 'ECE',
          amount: 180000,
          vendor: 'Tech Solutions Ltd',
          expenseDate: '2024-01-20',
          paymentStatus: 'pending',
          description: 'Oscilloscopes and testing equipment',
        },
        {
          id: 3,
          expenseId: 'EXP003',
          expenseCategory: 'Utilities',
          department: 'Administration',
          amount: 75000,
          vendor: 'City Electricity Board',
          expenseDate: '2024-01-25',
          paymentStatus: 'paid',
          description: 'Monthly electricity bill',
        },
        {
          id: 4,
          expenseId: 'EXP004',
          expenseCategory: 'Supplies',
          department: 'Mechanical',
          amount: 45000,
          vendor: 'Stationery World',
          expenseDate: '2024-01-18',
          paymentStatus: 'paid',
          description: 'Office supplies and stationery',
        },
        {
          id: 5,
          expenseId: 'EXP005',
          expenseCategory: 'Maintenance',
          department: 'Civil',
          amount: 120000,
          vendor: 'Quick Fix Services',
          expenseDate: '2024-01-22',
          paymentStatus: 'pending',
          description: 'Building maintenance and repairs',
        },
      ];
      setExpenses(mockExpenses);
      calculateSummary(mockExpenses);
    }
  };

  const calculateSummary = (expensesData) => {
    const totalExpenses = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
    const paidExpenses = expensesData
      .filter(exp => exp.paymentStatus === 'paid')
      .reduce((sum, exp) => sum + exp.amount, 0);
    const pendingExpenses = totalExpenses - paidExpenses;

    setSummaryData({
      totalExpenses,
      paidExpenses,
      pendingExpenses,
    });
  };

  const handleOpenDialog = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        expenseId: expense.expenseId,
        expenseCategory: expense.expenseCategory,
        department: expense.department,
        amount: expense.amount,
        vendor: expense.vendor,
        expenseDate: expense.expenseDate,
        paymentStatus: expense.paymentStatus,
        description: expense.description,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        expenseId: '',
        expenseCategory: '',
        department: '',
        amount: '',
        vendor: '',
        expenseDate: '',
        paymentStatus: 'pending',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
  };

  const handleSubmit = () => {
    const newExpense = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      id: editingExpense ? editingExpense.id : Date.now(),
    };

    if (editingExpense) {
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? newExpense : exp));
    } else {
      setExpenses([...expenses, newExpense]);
    }

    calculateSummary([...expenses, newExpense]);
    handleCloseDialog();
  };

  const handleDelete = (expense) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      const updatedExpenses = expenses.filter(exp => exp.id !== expense.id);
      setExpenses(updatedExpenses);
      calculateSummary(updatedExpenses);
    }
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.expenseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || expense.expenseCategory === filterCategory;
    const matchesDepartment = !filterDepartment || expense.department === filterDepartment;
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d395e' }}>
          Expenses Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#1d395e', '&:hover': { backgroundColor: '#2a4a7a' } }}
        >
          Add Expense Record
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Expenses"
            value={summaryData.totalExpenses}
            icon={Receipt}
            color="primary"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Paid Expenses"
            value={summaryData.paidExpenses}
            icon={CreditCard}
            color="secondary"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Pending Expenses"
            value={summaryData.pendingExpenses}
            icon={AlertCircle}
            color="warning"
            prefix="₹"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by vendor, ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} className="text-gray-400 mr-2" />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                label="Department"
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
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
                setFilterCategory('');
                setFilterDepartment('');
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
        data={filteredExpenses}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        searchPlaceholder="Search expenses..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Edit Expense Record' : 'Add New Expense Record'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expense ID"
                value={formData.expenseId}
                onChange={handleInputChange('expenseId')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.expenseCategory}
                  label="Category"
                  onChange={handleInputChange('expenseCategory')}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={handleInputChange('department')}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vendor"
                value={formData.vendor}
                onChange={handleInputChange('vendor')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange('amount')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Expense Date"
                type="date"
                value={formData.expenseDate}
                onChange={handleInputChange('expenseDate')}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.paymentStatus}
                  label="Payment Status"
                  onChange={handleInputChange('paymentStatus')}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange('description')}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingExpense ? 'Update' : 'Add'} Expense Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;
