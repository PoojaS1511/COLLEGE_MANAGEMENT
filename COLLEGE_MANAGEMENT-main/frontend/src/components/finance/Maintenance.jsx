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
  IconButton,
} from '@mui/material';
import { Plus, Edit, Trash2, Search, Wrench, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import FinanceDataTable from './FinanceDataTable';
import MetricCard from './MetricCard';

const Maintenance = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    resolvedRequests: 0,
    totalCost: 0,
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

  const statuses = [
    'Pending',
    'In Progress',
    'Resolved'
  ];

  const [formData, setFormData] = useState({
    requestId: '',
    assetName: '',
    department: '',
    issueDescription: '',
    reportedDate: '',
    resolvedDate: '',
    maintenanceCost: '',
    status: 'pending',
  });

  const columns = [
    { id: 'requestId', label: 'Request ID', minWidth: 100 },
    { id: 'assetName', label: 'Asset Name', minWidth: 150 },
    { id: 'department', label: 'Department', minWidth: 120 },
    { id: 'issueDescription', label: 'Issue Description', minWidth: 200 },
    { 
      id: 'reportedDate', 
      label: 'Reported Date', 
      minWidth: 120,
      type: 'date'
    },
    { 
      id: 'resolvedDate', 
      label: 'Resolved Date', 
      minWidth: 120,
      type: 'date'
    },
    { 
      id: 'maintenanceCost', 
      label: 'Cost', 
      minWidth: 100,
      type: 'currency',
      align: 'right'
    },
    { 
      id: 'status', 
      label: 'Status', 
      minWidth: 100,
      type: 'status'
    },
  ];

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/finance/maintenance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const maintenanceData = result.data.map(item => ({
            id: item.id,
            requestId: item.request_id,
            assetName: item.asset_name,
            department: item.department,
            issueDescription: item.issue_description,
            reportedDate: item.reported_date,
            resolvedDate: item.resolved_date,
            maintenanceCost: item.maintenance_cost,
            status: item.status,
          }));
          setMaintenance(maintenanceData);
          calculateSummary(maintenanceData);
        }
      } else {
        console.error('Failed to fetch maintenance data');
        // Fallback to mock data if API fails
        const mockMaintenance = [
          {
            id: 1,
            requestId: 'MNT001',
            assetName: 'AC Unit - Lab 301',
            department: 'CSE',
            issueDescription: 'AC not cooling properly, needs gas refill',
            reportedDate: '2024-01-15',
            resolvedDate: '2024-01-18',
            maintenanceCost: 8500,
            status: 'resolved',
          },
          {
            id: 2,
            requestId: 'MNT002',
            assetName: 'Projector - Room 205',
            department: 'ECE',
            issueDescription: 'Projector bulb replacement needed',
            reportedDate: '2024-01-20',
            resolvedDate: '',
            maintenanceCost: 12000,
            status: 'in progress',
          },
          {
            id: 3,
            requestId: 'MNT003',
            assetName: 'Lathe Machine',
            department: 'Mechanical',
            issueDescription: 'Machine making unusual noise during operation',
            reportedDate: '2024-01-22',
            resolvedDate: '',
            maintenanceCost: 0,
            status: 'pending',
          },
          {
            id: 4,
            requestId: 'MNT004',
            assetName: 'Water Pump - Hostel Block A',
            department: 'Hostel',
            issueDescription: 'Water pump not functioning, affecting water supply',
            reportedDate: '2024-01-18',
            resolvedDate: '2024-01-19',
            maintenanceCost: 15000,
            status: 'resolved',
          },
          {
            id: 5,
            requestId: 'MNT005',
            assetName: 'Computers - Library',
            department: 'Library',
            issueDescription: '5 computers not booting up, need hardware check',
            reportedDate: '2024-01-25',
            resolvedDate: '',
            maintenanceCost: 0,
            status: 'pending',
          },
        ];

        setMaintenance(mockMaintenance);
        calculateSummary(mockMaintenance);
      }
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      // Fallback to mock data if API fails
      const mockMaintenance = [
        {
          id: 1,
          requestId: 'MNT001',
          assetName: 'AC Unit - Lab 301',
          department: 'CSE',
          issueDescription: 'AC not cooling properly, needs gas refill',
          reportedDate: '2024-01-15',
          resolvedDate: '2024-01-18',
          maintenanceCost: 8500,
          status: 'resolved',
        },
        {
          id: 2,
          requestId: 'MNT002',
          assetName: 'Projector - Room 205',
          department: 'ECE',
          issueDescription: 'Projector bulb replacement needed',
          reportedDate: '2024-01-20',
          resolvedDate: '',
          maintenanceCost: 12000,
          status: 'in progress',
        },
        {
          id: 3,
          requestId: 'MNT003',
          assetName: 'Lathe Machine',
          department: 'Mechanical',
          issueDescription: 'Machine making unusual noise during operation',
          reportedDate: '2024-01-22',
          resolvedDate: '',
          maintenanceCost: 0,
          status: 'pending',
        },
        {
          id: 4,
          requestId: 'MNT004',
          assetName: 'Water Pump - Hostel Block A',
          department: 'Hostel',
          issueDescription: 'Water pump not functioning, affecting water supply',
          reportedDate: '2024-01-18',
          resolvedDate: '2024-01-19',
          maintenanceCost: 15000,
          status: 'resolved',
        },
        {
          id: 5,
          requestId: 'MNT005',
          assetName: 'Computers - Library',
          department: 'Library',
          issueDescription: '5 computers not booting up, need hardware check',
          reportedDate: '2024-01-25',
          resolvedDate: '',
          maintenanceCost: 0,
          status: 'pending',
        },
      ];

      setMaintenance(mockMaintenance);
      calculateSummary(mockMaintenance);
    }
  };

  const calculateSummary = (maintenanceData) => {
    const totalRequests = maintenanceData.length;
    const pendingRequests = maintenanceData.filter(m => m.status === 'pending').length;
    const inProgressRequests = maintenanceData.filter(m => m.status === 'in progress').length;
    const resolvedRequests = maintenanceData.filter(m => m.status === 'resolved').length;
    const totalCost = maintenanceData.reduce((sum, m) => sum + m.maintenanceCost, 0);

    setSummaryData({
      totalRequests,
      pendingRequests,
      inProgressRequests,
      resolvedRequests,
      totalCost,
    });
  };

  const handleOpenDialog = (maintenanceItem = null) => {
    if (maintenanceItem) {
      setEditingMaintenance(maintenanceItem);
      setFormData({
        requestId: maintenanceItem.requestId,
        assetName: maintenanceItem.assetName,
        department: maintenanceItem.department,
        issueDescription: maintenanceItem.issueDescription,
        reportedDate: maintenanceItem.reportedDate,
        resolvedDate: maintenanceItem.resolvedDate,
        maintenanceCost: maintenanceItem.maintenanceCost,
        status: maintenanceItem.status,
      });
    } else {
      setEditingMaintenance(null);
      setFormData({
        requestId: '',
        assetName: '',
        department: '',
        issueDescription: '',
        reportedDate: '',
        resolvedDate: '',
        maintenanceCost: '',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMaintenance(null);
  };

  const handleSubmit = () => {
    const newMaintenance = {
      ...formData,
      maintenanceCost: parseFloat(formData.maintenanceCost) || 0,
      id: editingMaintenance ? editingMaintenance.id : Date.now(),
    };

    if (editingMaintenance) {
      setMaintenance(maintenance.map(m => m.id === editingMaintenance.id ? newMaintenance : m));
    } else {
      setMaintenance([...maintenance, newMaintenance]);
    }

    calculateSummary([...maintenance, newMaintenance]);
    handleCloseDialog();
  };

  const handleDelete = (maintenanceItem) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      const updatedMaintenance = maintenance.filter(m => m.id !== maintenanceItem.id);
      setMaintenance(updatedMaintenance);
      calculateSummary(updatedMaintenance);
    }
  };

  const handleStatusChange = (maintenanceItem, newStatus) => {
    const updatedItem = {
      ...maintenanceItem,
      status: newStatus,
      resolvedDate: newStatus === 'resolved' ? new Date().toISOString().split('T')[0] : maintenanceItem.resolvedDate,
    };

    const updatedMaintenance = maintenance.map(m => m.id === maintenanceItem.id ? updatedItem : m);
    setMaintenance(updatedMaintenance);
    calculateSummary(updatedMaintenance);
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const filteredMaintenance = maintenance.filter(item => {
    const matchesSearch = item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.issueDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !filterDepartment || item.department === filterDepartment;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'in progress':
        return <AlertCircle size={16} className="text-blue-600" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1d395e' }}>
          Maintenance Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#1d395e', '&:hover': { backgroundColor: '#2a4a7a' } }}
        >
          Create Maintenance Request
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Requests"
            value={summaryData.totalRequests}
            icon={Wrench}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Requests"
            value={summaryData.pendingRequests}
            icon={Clock}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="In Progress"
            value={summaryData.inProgressRequests}
            icon={AlertCircle}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Cost"
            value={summaryData.totalCost}
            icon={Wrench}
            color="secondary"
            prefix="₹"
          />
        </Grid>
      </Grid>

      {/* Status Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Request Status Overview
        </Typography>
        <Grid container spacing={2}>
          {statuses.map(status => {
            const count = maintenance.filter(m => m.status.toLowerCase() === status.toLowerCase()).length;
            const percentage = summaryData.totalRequests > 0 ? (count / summaryData.totalRequests) * 100 : 0;
            
            return (
              <Grid item xs={12} md={4} key={status}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 2,
                  backgroundColor: status === 'Pending' ? '#fef3c7' : status === 'In Progress' ? '#dbeafe' : '#d1fae5'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getStatusIcon(status.toLowerCase())}
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {status}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {percentage.toFixed(1)}% of total requests
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by asset name, ID, or description..."
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
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status.toLowerCase()}>{status}</MenuItem>
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
                setFilterStatus('');
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
        data={filteredMaintenance}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        searchPlaceholder="Search maintenance requests..."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMaintenance ? 'Edit Maintenance Request' : 'Create New Maintenance Request'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Request ID"
                value={formData.requestId}
                onChange={handleInputChange('requestId')}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Asset Name"
                value={formData.assetName}
                onChange={handleInputChange('assetName')}
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={handleInputChange('status')}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Reported Date"
                type="date"
                value={formData.reportedDate}
                onChange={handleInputChange('reportedDate')}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Resolved Date"
                type="date"
                value={formData.resolvedDate}
                onChange={handleInputChange('resolvedDate')}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maintenance Cost"
                type="number"
                value={formData.maintenanceCost}
                onChange={handleInputChange('maintenanceCost')}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Issue Description"
                multiline
                rows={3}
                value={formData.issueDescription}
                onChange={handleInputChange('issueDescription')}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMaintenance ? 'Update' : 'Create'} Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maintenance;
