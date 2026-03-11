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
import { Plus, Edit, Trash2, Search, Users, DollarSign, TrendingUp } from 'lucide-react';
import FinanceDataTable from './FinanceDataTable';
import MetricCard from './MetricCard';
import { API_URL } from '../../config';

const StaffPayroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalMonthlyPayroll: 0,
    totalStaffCount: 0,
    averageSalary: 0,
  });

  const departments = [
    'CSE',
    'ECE',
    'Mechanical',
    'Civil',
    'EEE',
    'Administration',
    'Accounts'
  ];

  const roles = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lab Technician',
    'Administrative Staff',
    'Accountant',
    'Support Staff'
  ];

  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    department: '',
    role: '',
    baseSalary: '',
    allowances: '',
    deductions: '',
    netSalary: '',
    paymentDate: '',
    paymentStatus: 'pending',
  });

  const columns = [
    { id: 'staffId', label: 'Staff ID', minWidth: 100 },
    { id: 'staffName', label: 'Staff Name', minWidth: 150 },
    { id: 'department', label: 'Department', minWidth: 120 },
    { id: 'role', label: 'Role', minWidth: 150 },
    { 
      id: 'baseSalary', 
      label: 'Base Salary', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'allowances', 
      label: 'Allowances', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'deductions', 
      label: 'Deductions', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'netSalary', 
      label: 'Net Salary', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'paymentDate', 
      label: 'Payment Date', 
      minWidth: 120,
      type: 'date'
    },
    { 
      id: 'paymentStatus', 
      label: 'Status', 
      minWidth: 100,
      type: 'status'
    },
  ];

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const response = await fetch(`${API_URL}/api/finance/staff-payroll`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const payrollData = result.data.map(item => ({
            id: item.id,
            staffId: item.staff_id,
            staffName: item.staff_name,
            department: item.department,
            role: item.role,
            baseSalary: item.base_salary,
            allowances: item.allowance,
            deductions: item.deduction,
            netSalary: item.net_salary,
            paymentDate: item.payment_date || '',
            paymentStatus: item.payment_status || 'pending',
          }));
          setPayroll(payrollData);
          calculateSummary(payrollData);
        }
      } else {
        console.error('Failed to fetch payroll');
        // Fallback to mock data if API fails
        const mockPayroll = [
          {
            id: 1,
            staffId: 'STF001',
            staffName: 'Dr. Rajesh Kumar',
            department: 'CSE',
            role: 'Professor',
            baseSalary: 150000,
            allowances: 25000,
            deductions: 15000,
            netSalary: 160000,
            paymentDate: '2024-01-31',
            paymentStatus: 'paid',
          },
          {
            id: 2,
            staffId: 'STF002',
            staffName: 'Dr. Priya Sharma',
            department: 'ECE',
            role: 'Associate Professor',
            baseSalary: 120000,
            allowances: 20000,
            deductions: 12000,
            netSalary: 128000,
            paymentDate: '2024-01-31',
            paymentStatus: 'paid',
          },
          {
            id: 3,
            staffId: 'STF003',
            staffName: 'John Smith',
            department: 'Mechanical',
            role: 'Lab Technician',
            baseSalary: 45000,
            allowances: 8000,
            deductions: 4500,
            netSalary: 48500,
            paymentDate: '2024-01-31',
            paymentStatus: 'paid',
          },
          {
            id: 4,
            staffId: 'STF004',
            staffName: 'Sarah Johnson',
            department: 'Administration',
            role: 'Administrative Staff',
            baseSalary: 35000,
            allowances: 5000,
            deductions: 3500,
            netSalary: 36500,
            paymentDate: '',
            paymentStatus: 'pending',
          },
          {
            id: 5,
            staffId: 'STF005',
            staffName: 'Michael Brown',
            department: 'Accounts',
            role: 'Accountant',
            baseSalary: 55000,
            allowances: 10000,
            deductions: 5500,
            netSalary: 59500,
            paymentDate: '2024-01-30',
            paymentStatus: 'paid',
          },
        ];
        setPayroll(mockPayroll);
        calculateSummary(mockPayroll);
      }
    } catch (error) {
      console.error('Error fetching payroll:', error);
      // Fallback to mock data if API fails
      const mockPayroll = [
        {
          id: 1,
          staffId: 'STF001',
          staffName: 'Dr. Rajesh Kumar',
          department: 'CSE',
          role: 'Professor',
          baseSalary: 150000,
          allowances: 25000,
          deductions: 15000,
          netSalary: 160000,
          paymentDate: '2024-01-31',
          paymentStatus: 'paid',
        },
        {
          id: 2,
          staffId: 'STF002',
          staffName: 'Dr. Priya Sharma',
          department: 'ECE',
          role: 'Associate Professor',
          baseSalary: 120000,
          allowances: 20000,
          deductions: 12000,
          netSalary: 128000,
          paymentDate: '2024-01-31',
          paymentStatus: 'paid',
        },
        {
          id: 3,
          staffId: 'STF003',
          staffName: 'John Smith',
          department: 'Mechanical',
          role: 'Lab Technician',
          baseSalary: 45000,
          allowances: 8000,
          deductions: 4500,
          netSalary: 48500,
          paymentDate: '2024-01-31',
          paymentStatus: 'paid',
        },
        {
          id: 4,
          staffId: 'STF004',
          staffName: 'Sarah Johnson',
          department: 'Administration',
          role: 'Administrative Staff',
          baseSalary: 35000,
          allowances: 5000,
          deductions: 3500,
          netSalary: 36500,
          paymentDate: '',
          paymentStatus: 'pending',
        },
        {
          id: 5,
          staffId: 'STF005',
          staffName: 'Michael Brown',
          department: 'Accounts',
          role: 'Accountant',
          baseSalary: 55000,
          allowances: 10000,
          deductions: 5500,
          netSalary: 59500,
          paymentDate: '2024-01-30',
          paymentStatus: 'paid',
        },
      ];
      setPayroll(mockPayroll);
      calculateSummary(mockPayroll);
    }
  };

  const calculateSummary = (payrollData) => {
    const totalMonthlyPayroll = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
    const totalStaffCount = payrollData.length;
    const averageSalary = totalStaffCount > 0 ? totalMonthlyPayroll / totalStaffCount : 0;

    setSummaryData({
      totalMonthlyPayroll,
      totalStaffCount,
      averageSalary,
    });
  };

  const handleOpenDialog = (payrollItem = null) => {
    if (payrollItem) {
      setEditingPayroll(payrollItem);
      setFormData({
        staffId: payrollItem.staffId,
        staffName: payrollItem.staffName,
        department: payrollItem.department,
        role: payrollItem.role,
        baseSalary: payrollItem.baseSalary,
        allowances: payrollItem.allowances,
        deductions: payrollItem.deductions,
        netSalary: payrollItem.netSalary,
        paymentDate: payrollItem.paymentDate,
        paymentStatus: payrollItem.paymentStatus,
      });
    } else {
      setEditingPayroll(null);
      setFormData({
        staffId: '',
        staffName: '',
        department: '',
        role: '',
        baseSalary: '',
        allowances: '',
        deductions: '',
        netSalary: '',
        paymentDate: '',
        paymentStatus: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPayroll(null);
  };

  const handleSubmit = () => {
    const baseSalary = parseFloat(formData.baseSalary) || 0;
    const allowances = parseFloat(formData.allowances) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const netSalary = baseSalary + allowances - deductions;

    const newPayroll = {
      ...formData,
      baseSalary,
      allowances,
      deductions,
      netSalary,
      id: editingPayroll ? editingPayroll.id : Date.now(),
    };

    if (editingPayroll) {
      setPayroll(payroll.map(p => p.id === editingPayroll.id ? newPayroll : p));
    } else {
      setPayroll([...payroll, newPayroll]);
    }

    calculateSummary([...payroll, newPayroll]);
    handleCloseDialog();
  };

  const handleDelete = (payrollItem) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      const updatedPayroll = payroll.filter(p => p.id !== payrollItem.id);
      setPayroll(updatedPayroll);
      calculateSummary(updatedPayroll);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-calculate net salary when base salary, allowances, or deductions change
    if (['baseSalary', 'allowances', 'deductions'].includes(field)) {
      const baseSalary = field === 'baseSalary' ? parseFloat(value) || 0 : parseFloat(formData.baseSalary) || 0;
      const allowances = field === 'allowances' ? parseFloat(value) || 0 : parseFloat(formData.allowances) || 0;
      const deductions = field === 'deductions' ? parseFloat(value) || 0 : parseFloat(formData.deductions) || 0;
      const netSalary = baseSalary + allowances - deductions;
      setFormData(prev => ({ ...prev, netSalary: netSalary.toString() }));
    }
  };

  const filteredPayroll = payroll.filter(item => {
    const matchesSearch = item.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.staffId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !filterDepartment || item.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d395e' }}>
          Staff Payroll Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#1d395e', '&:hover': { backgroundColor: '#2a4a7a' } }}
        >
          Add Payroll Record
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Monthly Payroll"
            value={summaryData.totalMonthlyPayroll}
            icon={DollarSign}
            color="primary"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Staff Count"
            value={summaryData.totalStaffCount}
            icon={Users}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Average Salary"
            value={summaryData.averageSalary}
            icon={TrendingUp}
            color="info"
            prefix="₹"
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
              placeholder="Search by staff name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} className="text-gray-400 mr-2" />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
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
        data={filteredPayroll}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        searchPlaceholder="Search payroll..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayroll ? 'Edit Payroll Record' : 'Add New Payroll Record'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Staff ID"
                value={formData.staffId}
                onChange={handleInputChange('staffId')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Staff Name"
                value={formData.staffName}
                onChange={handleInputChange('staffName')}
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
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={handleInputChange('role')}
                >
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Base Salary"
                type="number"
                value={formData.baseSalary}
                onChange={handleInputChange('baseSalary')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Allowances"
                type="number"
                value={formData.allowances}
                onChange={handleInputChange('allowances')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Deductions"
                type="number"
                value={formData.deductions}
                onChange={handleInputChange('deductions')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Net Salary"
                type="number"
                value={formData.netSalary}
                InputProps={{ readOnly: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={handleInputChange('paymentDate')}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPayroll ? 'Update' : 'Add'} Payroll Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffPayroll;
