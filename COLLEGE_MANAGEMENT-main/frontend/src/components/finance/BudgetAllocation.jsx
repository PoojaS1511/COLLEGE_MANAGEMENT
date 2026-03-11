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
  LinearProgress,
  Chip,
} from '@mui/material';
import { Plus, Edit, Trash2, Search, PieChart, TrendingUp, AlertCircle } from 'lucide-react';
import FinanceDataTable from './FinanceDataTable';
import MetricCard from './MetricCard';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { API_URL } from '../../config';

const BudgetAllocation = () => {
  const [budgets, setBudgets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalAllocatedBudget: 0,
    totalUsedBudget: 0,
    totalRemainingBudget: 0,
  });

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

  const financialYears = [
    '2024-25',
    '2023-24',
    '2022-23'
  ];

  const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4', '#10b981', '#f97316'];

  const [formData, setFormData] = useState({
    budgetId: '',
    department: '',
    financialYear: '',
    allocatedAmount: '',
    usedAmount: '',
    remainingAmount: '',
    budgetStatus: 'active',
  });

  const columns = [
    { id: 'budgetId', label: 'Budget ID', minWidth: 100 },
    { id: 'department', label: 'Department', minWidth: 120 },
    { id: 'financialYear', label: 'Financial Year', minWidth: 120 },
    { 
      id: 'allocatedAmount', 
      label: 'Allocated Amount', 
      minWidth: 140,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'usedAmount', 
      label: 'Used Amount', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'remainingAmount', 
      label: 'Remaining Amount', 
      minWidth: 140,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'utilizationPercentage', 
      label: 'Utilization %', 
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(value, 100)}
            sx={{ width: 60, height: 8 }}
            color={value > 90 ? 'error' : value > 75 ? 'warning' : 'success'}
          />
          <Typography variant="body2" sx={{ minWidth: 40 }}>
            {value.toFixed(1)}%
          </Typography>
        </Box>
      )
    },
    { 
      id: 'budgetStatus', 
      label: 'Status', 
      minWidth: 100,
      type: 'status'
    },
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_URL}/api/finance/budget`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const budgetsData = result.data.map(budget => ({
            id: budget.budget_id,
            budgetId: budget.budget_id,
            department: budget.department,
            financialYear: budget.financial_year,
            allocatedAmount: budget.allocated_amount,
            usedAmount: budget.used_amount,
            remainingAmount: budget.remaining_amount,
            budgetStatus: budget.status,
            utilizationPercentage: (budget.used_amount / budget.allocated_amount) * 100,
          }));
          setBudgets(budgetsData);
          calculateSummary(budgetsData);
        }
      } else {
        console.error('Failed to fetch budgets');
        // Fallback to mock data if API fails
        const mockBudgets = [
          {
            id: 1,
            budgetId: 'BUD001',
            department: 'CSE',
            financialYear: '2024-25',
            allocatedAmount: 5000000,
            usedAmount: 3200000,
            remainingAmount: 1800000,
            budgetStatus: 'active',
          },
          {
            id: 2,
            budgetId: 'BUD002',
            department: 'ECE',
            financialYear: '2024-25',
            allocatedAmount: 4000000,
            usedAmount: 2800000,
            remainingAmount: 1200000,
            budgetStatus: 'active',
          },
          {
            id: 3,
            budgetId: 'BUD003',
            department: 'Mechanical',
            financialYear: '2024-25',
            allocatedAmount: 3500000,
            usedAmount: 3400000,
            remainingAmount: 100000,
            budgetStatus: 'warning',
          },
          {
            id: 4,
            budgetId: 'BUD004',
            department: 'Civil',
            financialYear: '2024-25',
            allocatedAmount: 2500000,
            usedAmount: 1800000,
            remainingAmount: 700000,
            budgetStatus: 'active',
          },
          {
            id: 5,
            budgetId: 'BUD005',
            department: 'EEE',
            financialYear: '2024-25',
            allocatedAmount: 3000000,
            usedAmount: 1500000,
            remainingAmount: 1500000,
            budgetStatus: 'active',
          },
        ];

        const budgetsWithUtilization = mockBudgets.map(budget => ({
          ...budget,
          utilizationPercentage: (budget.usedAmount / budget.allocatedAmount) * 100,
        }));

        setBudgets(budgetsWithUtilization);
        calculateSummary(budgetsWithUtilization);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      // Fallback to mock data if API fails
      const mockBudgets = [
        {
          id: 1,
          budgetId: 'BUD001',
          department: 'CSE',
          financialYear: '2024-25',
          allocatedAmount: 5000000,
          usedAmount: 3200000,
          remainingAmount: 1800000,
          budgetStatus: 'active',
        },
        {
          id: 2,
          budgetId: 'BUD002',
          department: 'ECE',
          financialYear: '2024-25',
          allocatedAmount: 4000000,
          usedAmount: 2800000,
          remainingAmount: 1200000,
          budgetStatus: 'active',
        },
        {
          id: 3,
          budgetId: 'BUD003',
          department: 'Mechanical',
          financialYear: '2024-25',
          allocatedAmount: 3500000,
          usedAmount: 3400000,
          remainingAmount: 100000,
          budgetStatus: 'warning',
        },
        {
          id: 4,
          budgetId: 'BUD004',
          department: 'Civil',
          financialYear: '2024-25',
          allocatedAmount: 2500000,
          usedAmount: 1800000,
          remainingAmount: 700000,
          budgetStatus: 'active',
        },
        {
          id: 5,
          budgetId: 'BUD005',
          department: 'EEE',
          financialYear: '2024-25',
          allocatedAmount: 3000000,
          usedAmount: 1500000,
          remainingAmount: 1500000,
          budgetStatus: 'active',
        },
      ];

      const budgetsWithUtilization = mockBudgets.map(budget => ({
        ...budget,
        utilizationPercentage: (budget.usedAmount / budget.allocatedAmount) * 100,
      }));

      setBudgets(budgetsWithUtilization);
      calculateSummary(budgetsWithUtilization);
    }
  };

  const calculateSummary = (budgetsData) => {
    const totalAllocatedBudget = budgetsData.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    const totalUsedBudget = budgetsData.reduce((sum, budget) => sum + budget.usedAmount, 0);
    const totalRemainingBudget = totalAllocatedBudget - totalUsedBudget;

    setSummaryData({
      totalAllocatedBudget,
      totalUsedBudget,
      totalRemainingBudget,
    });
  };

  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        budgetId: budget.budgetId,
        department: budget.department,
        financialYear: budget.financialYear,
        allocatedAmount: budget.allocatedAmount,
        usedAmount: budget.usedAmount,
        remainingAmount: budget.remainingAmount,
        budgetStatus: budget.budgetStatus,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        budgetId: '',
        department: '',
        financialYear: '',
        allocatedAmount: '',
        usedAmount: '',
        remainingAmount: '',
        budgetStatus: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleSubmit = () => {
    const allocatedAmount = parseFloat(formData.allocatedAmount) || 0;
    const usedAmount = parseFloat(formData.usedAmount) || 0;
    const remainingAmount = allocatedAmount - usedAmount;
    const utilizationPercentage = allocatedAmount > 0 ? (usedAmount / allocatedAmount) * 100 : 0;

    const newBudget = {
      ...formData,
      allocatedAmount,
      usedAmount,
      remainingAmount,
      utilizationPercentage,
      id: editingBudget ? editingBudget.id : Date.now(),
    };

    if (editingBudget) {
      setBudgets(budgets.map(b => b.id === editingBudget.id ? newBudget : b));
    } else {
      setBudgets([...budgets, newBudget]);
    }

    calculateSummary([...budgets, newBudget]);
    handleCloseDialog();
  };

  const handleDelete = (budget) => {
    if (window.confirm('Are you sure you want to delete this budget allocation?')) {
      const updatedBudgets = budgets.filter(b => b.id !== budget.id);
      setBudgets(updatedBudgets);
      calculateSummary(updatedBudgets);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-calculate remaining amount and utilization when allocated or used amount changes
    if (field === 'allocatedAmount' || field === 'usedAmount') {
      const allocatedAmount = field === 'allocatedAmount' ? parseFloat(value) || 0 : parseFloat(formData.allocatedAmount) || 0;
      const usedAmount = field === 'usedAmount' ? parseFloat(value) || 0 : parseFloat(formData.usedAmount) || 0;
      const remainingAmount = allocatedAmount - usedAmount;
      setFormData(prev => ({ 
        ...prev, 
        remainingAmount: remainingAmount.toString(),
        budgetStatus: remainingAmount <= 0 ? 'exceeded' : remainingAmount < allocatedAmount * 0.1 ? 'warning' : 'active'
      }));
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         budget.budgetId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !filterDepartment || budget.department === filterDepartment;
    const matchesYear = !filterYear || budget.financialYear === filterYear;
    return matchesSearch && matchesDepartment && matchesYear;
  });

  // Prepare data for charts
  const pieChartData = budgets.map(budget => ({
    name: budget.department,
    value: budget.allocatedAmount,
  }));

  const barChartData = budgets.map(budget => ({
    department: budget.department,
    allocated: budget.allocatedAmount,
    used: budget.usedAmount,
    remaining: budget.remainingAmount,
  }));

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d395e' }}>
          Budget Allocation Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#1d395e', '&:hover': { backgroundColor: '#2a4a7a' } }}
        >
          Add Budget Allocation
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Allocated Budget"
            value={summaryData.totalAllocatedBudget}
            icon={PieChart}
            color="primary"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Used Budget"
            value={summaryData.totalUsedBudget}
            icon={TrendingUp}
            color="warning"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Remaining Budget"
            value={summaryData.totalRemainingBudget}
            icon={AlertCircle}
            color="secondary"
            prefix="₹"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Budget Allocation by Department
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Budget Utilization Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                <Legend />
                <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
                <Bar dataKey="used" fill="#f59e0b" name="Used" />
                <Bar dataKey="remaining" fill="#16a34a" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by department or budget ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} className="text-gray-400 mr-2" />,
              }}
            />
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Financial Year</InputLabel>
              <Select
                value={filterYear}
                label="Financial Year"
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <MenuItem value="">All Years</MenuItem>
                {financialYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
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
                setFilterDepartment('');
                setFilterYear('');
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
        data={filteredBudgets}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        searchPlaceholder="Search budgets..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBudget ? 'Edit Budget Allocation' : 'Add New Budget Allocation'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget ID"
                value={formData.budgetId}
                onChange={handleInputChange('budgetId')}
                size="small"
              />
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
              <FormControl fullWidth size="small">
                <InputLabel>Financial Year</InputLabel>
                <Select
                  value={formData.financialYear}
                  label="Financial Year"
                  onChange={handleInputChange('financialYear')}
                >
                  {financialYears.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Budget Status</InputLabel>
                <Select
                  value={formData.budgetStatus}
                  label="Budget Status"
                  onChange={handleInputChange('budgetStatus')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="exceeded">Exceeded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Allocated Amount"
                type="number"
                value={formData.allocatedAmount}
                onChange={handleInputChange('allocatedAmount')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Used Amount"
                type="number"
                value={formData.usedAmount}
                onChange={handleInputChange('usedAmount')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Remaining Amount"
                type="number"
                value={formData.remainingAmount}
                InputProps={{ readOnly: true }}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBudget ? 'Update' : 'Add'} Budget Allocation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetAllocation;
