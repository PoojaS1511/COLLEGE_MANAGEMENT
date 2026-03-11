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
  Chip,
  Stack,
  IconButton,
  Paper,
} from '@mui/material';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import FinanceDataTable from './FinanceDataTable';
import MetricCard from './MetricCard';
import { GraduationCap, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { API_URL } from '../../config';

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalFees: 0,
    totalPaid: 0,
    totalPending: 0,
  });

  const departments = [
    'CSE',
    'ECE', 
    'Mechanical',
    'Civil',
    'EEE'
  ];

  const academicYears = [
    '2024-25',
    '2023-24',
    '2022-23'
  ];

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    department: '',
    academicYear: '',
    totalFee: '',
    paidAmount: '',
    pendingAmount: '',
    paymentDate: '',
    paymentStatus: 'pending',
  });

  const columns = [
    { id: 'studentId', label: 'Student ID', minWidth: 120 },
    { id: 'studentName', label: 'Student Name', minWidth: 150 },
    { id: 'department', label: 'Department', minWidth: 120 },
    { id: 'academicYear', label: 'Academic Year', minWidth: 120 },
    { 
      id: 'totalFee', 
      label: 'Total Fee', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'paidAmount', 
      label: 'Paid Amount', 
      minWidth: 120,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'pendingAmount', 
      label: 'Pending Amount', 
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
    fetchStudentFees();
  }, []);

  const fetchStudentFees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/finance/student-fees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const feesData = result.data.map(fee => ({
            id: fee.id,
            studentId: fee.student_id,
            studentName: fee.student_name,
            department: fee.department,
            academicYear: fee.year,
            totalFee: fee.total_fee,
            paidAmount: fee.paid_amount,
            pendingAmount: fee.pending_amount,
            paymentDate: fee.payment_date || '',
            paymentStatus: fee.payment_status,
          }));
          setFees(feesData);
          calculateSummary(feesData);
        }
      } else {
        console.error('Failed to fetch student fees');
        // Fallback to mock data if API fails
        const mockFees = [
          {
            id: 1,
            studentId: 'STU001',
            studentName: 'John Doe',
            department: 'CSE',
            academicYear: '2024-25',
            totalFee: 150000,
            paidAmount: 75000,
            pendingAmount: 75000,
            paymentDate: '2024-01-15',
            paymentStatus: 'partial',
          },
          {
            id: 2,
            studentId: 'STU002',
            studentName: 'Jane Smith',
            department: 'ECE',
            academicYear: '2024-25',
            totalFee: 140000,
            paidAmount: 140000,
            pendingAmount: 0,
            paymentDate: '2024-01-10',
            paymentStatus: 'paid',
          },
          {
            id: 3,
            studentId: 'STU003',
            studentName: 'Mike Johnson',
            department: 'Mechanical',
            academicYear: '2024-25',
            totalFee: 130000,
            paidAmount: 0,
            pendingAmount: 130000,
            paymentDate: '',
            paymentStatus: 'pending',
          },
          {
            id: 4,
            studentId: 'STU004',
            studentName: 'Sarah Wilson',
            department: 'Civil',
            academicYear: '2023-24',
            totalFee: 120000,
            paidAmount: 120000,
            pendingAmount: 0,
            paymentDate: '2023-12-20',
            paymentStatus: 'paid',
          },
          {
            id: 5,
            studentId: 'STU005',
            studentName: 'David Brown',
            department: 'EEE',
            academicYear: '2024-25',
            totalFee: 135000,
            paidAmount: 65000,
            pendingAmount: 70000,
            paymentDate: '2024-01-08',
            paymentStatus: 'partial',
          },
        ];
        setFees(mockFees);
        calculateSummary(mockFees);
      }
    } catch (error) {
      console.error('Error fetching student fees:', error);
      // Fallback to mock data if API fails
      const mockFees = [
        {
          id: 1,
          studentId: 'STU001',
          studentName: 'John Doe',
          department: 'CSE',
          academicYear: '2024-25',
          totalFee: 150000,
          paidAmount: 75000,
          pendingAmount: 75000,
          paymentDate: '2024-01-15',
          paymentStatus: 'partial',
        },
        {
          id: 2,
          studentId: 'STU002',
          studentName: 'Jane Smith',
          department: 'ECE',
          academicYear: '2024-25',
          totalFee: 140000,
          paidAmount: 140000,
          pendingAmount: 0,
          paymentDate: '2024-01-10',
          paymentStatus: 'paid',
        },
        {
          id: 3,
          studentId: 'STU003',
          studentName: 'Mike Johnson',
          department: 'Mechanical',
          academicYear: '2024-25',
          totalFee: 130000,
          paidAmount: 0,
          pendingAmount: 130000,
          paymentDate: '',
          paymentStatus: 'pending',
        },
        {
          id: 4,
          studentId: 'STU004',
          studentName: 'Sarah Wilson',
          department: 'Civil',
          academicYear: '2023-24',
          totalFee: 120000,
          paidAmount: 120000,
          pendingAmount: 0,
          paymentDate: '2023-12-20',
          paymentStatus: 'paid',
        },
        {
          id: 5,
          studentId: 'STU005',
          studentName: 'David Brown',
          department: 'EEE',
          academicYear: '2024-25',
          totalFee: 135000,
          paidAmount: 65000,
          pendingAmount: 70000,
          paymentDate: '2024-01-08',
          paymentStatus: 'partial',
        },
      ];
      setFees(mockFees);
      calculateSummary(mockFees);
    }
  };

  const calculateSummary = (feesData) => {
    const summary = feesData.reduce(
      (acc, fee) => {
        acc.totalFees += fee.totalFee;
        acc.totalPaid += fee.paidAmount;
        acc.totalPending += fee.pendingAmount;
        return acc;
      },
      { totalFees: 0, totalPaid: 0, totalPending: 0 }
    );
    setSummaryData(summary);
  };

  const handleOpenDialog = (fee = null) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        studentId: fee.studentId,
        studentName: fee.studentName,
        department: fee.department,
        academicYear: fee.academicYear,
        totalFee: fee.totalFee,
        paidAmount: fee.paidAmount,
        pendingAmount: fee.pendingAmount,
        paymentDate: fee.paymentDate,
        paymentStatus: fee.paymentStatus,
      });
    } else {
      setEditingFee(null);
      setFormData({
        studentId: '',
        studentName: '',
        department: '',
        academicYear: '',
        totalFee: '',
        paidAmount: '',
        pendingAmount: '',
        paymentDate: '',
        paymentStatus: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFee(null);
    setFormData({
      studentId: '',
      studentName: '',
      department: '',
      academicYear: '',
      totalFee: '',
      paidAmount: '',
      pendingAmount: '',
      paymentDate: '',
      paymentStatus: 'pending',
    });
  };

  const handleSubmit = () => {
    const totalFee = parseFloat(formData.totalFee) || 0;
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const pendingAmount = totalFee - paidAmount;

    const newFee = {
      ...formData,
      totalFee,
      paidAmount,
      pendingAmount,
      id: editingFee ? editingFee.id : Date.now(),
    };

    if (editingFee) {
      setFees(fees.map(fee => fee.id === editingFee.id ? newFee : fee));
    } else {
      setFees([...fees, newFee]);
    }

    calculateSummary([...fees, newFee]);
    handleCloseDialog();
  };

  const handleDelete = (fee) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      const updatedFees = fees.filter(f => f.id !== fee.id);
      setFees(updatedFees);
      calculateSummary(updatedFees);
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-calculate pending amount when total fee or paid amount changes
    if (field === 'totalFee' || field === 'paidAmount') {
      const totalFee = field === 'totalFee' ? parseFloat(value) || 0 : parseFloat(formData.totalFee) || 0;
      const paidAmount = field === 'paidAmount' ? parseFloat(value) || 0 : parseFloat(formData.paidAmount) || 0;
      const pendingAmount = totalFee - paidAmount;
      setFormData(prev => ({ ...prev, pendingAmount: pendingAmount.toString() }));
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fee.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !filterDepartment || fee.department === filterDepartment;
    const matchesYear = !filterYear || fee.academicYear === filterYear;
    return matchesSearch && matchesDepartment && matchesYear;
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d395e' }}>
          Student Fees Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#1d395e', '&:hover': { backgroundColor: '#2a4a7a' } }}
        >
          Add Fee Record
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Fees"
            value={summaryData.totalFees}
            icon={DollarSign}
            color="primary"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Paid Amount"
            value={summaryData.totalPaid}
            icon={TrendingUp}
            color="secondary"
            prefix="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Total Pending Amount"
            value={summaryData.totalPending}
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
              placeholder="Search by student name or ID..."
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
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={filterYear}
                label="Academic Year"
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <MenuItem value="">All Years</MenuItem>
                {academicYears.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Filter size={20} />}
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
        data={filteredFees}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        searchPlaceholder="Search fees..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingFee ? 'Edit Fee Record' : 'Add New Fee Record'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Student ID"
                value={formData.studentId}
                onChange={handleInputChange('studentId')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Student Name"
                value={formData.studentName}
                onChange={handleInputChange('studentName')}
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
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={formData.academicYear}
                  label="Academic Year"
                  onChange={handleInputChange('academicYear')}
                >
                  {academicYears.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Fee"
                type="number"
                value={formData.totalFee}
                onChange={handleInputChange('totalFee')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Paid Amount"
                type="number"
                value={formData.paidAmount}
                onChange={handleInputChange('paidAmount')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pending Amount"
                type="number"
                value={formData.pendingAmount}
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
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingFee ? 'Update' : 'Add'} Fee Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentFees;
