import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  MenuItem,
  CircularProgress,
  Alert,
  TablePagination
} from '@mui/material';
import { Search, Plus, Edit, Trash2, X, Bus, ChevronLeft, ChevronRight } from 'lucide-react';
import TransportService from '../../services/transportService';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    route_id: '',
    route_name: '',
    capacity: 40,
    driver_id: '',
    driver_name: '',
    status: 'Active',
    last_service: '',
    next_service: '',
  });

  useEffect(() => {
    loadBuses();
  }, [pagination.page, pagination.rowsPerPage, filterStatus, searchTerm]);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage
      };

      if (filterStatus !== 'All') {
        params.status = filterStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const result = await TransportService.getBuses(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      setBuses(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const handleOpenDialog = (bus = null) => {
    if (bus) {
      setEditingBus(bus);
      setFormData({
        bus_number: bus.bus_number,
        route_id: bus.route_id || '',
        route_name: bus.route_name || '',
        capacity: bus.capacity,
        driver_id: bus.driver_id || '',
        driver_name: bus.driver_name || '',
        status: bus.status,
        last_service: bus.last_service || '',
        next_service: bus.next_service || '',
      });
    } else {
      setEditingBus(null);
      setFormData({
        bus_number: '',
        route_id: '',
        route_name: '',
        capacity: 40,
        driver_id: '',
        driver_name: '',
        status: 'Active',
        last_service: '',
        next_service: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBus(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingBus) {
        await TransportService.updateBus(editingBus.id, formData);
      } else {
        await TransportService.addBus(formData);
      }
      handleCloseDialog();
      loadBuses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await TransportService.deleteBus(id);
        loadBuses();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.route_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || bus.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Under Maintenance': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6 space-y-6">
      {/* Header */}
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">
            Bus Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage transport fleet and bus details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Bus
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">Total Buses</Typography>
                <Typography variant="h4" className="font-bold">{pagination.total}</Typography>
              </Box>
              <Bus size={32} className="text-blue-600" />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">Active</Typography>
                <Typography variant="h4" className="font-bold text-green-600">
                  {buses.filter(b => b.status === 'Active').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">Under Maintenance</Typography>
                <Typography variant="h4" className="font-bold text-orange-600">
                  {buses.filter(b => b.status === 'Under Maintenance').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">Inactive</Typography>
                <Typography variant="h4" className="font-bold text-gray-600">
                  {buses.filter(b => b.status === 'Inactive').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card>
        <CardContent>
          <Box className="flex gap-4">
            <TextField
              placeholder="Search buses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} className="mr-2 text-gray-400" />,
              }}
              className="flex-1"
              size="small"
            />
            <TextField
              select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 0 }));
              }}
              size="small"
              className="w-52"
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">Bus Number</TableCell>
                <TableCell className="font-semibold">Route</TableCell>
                <TableCell className="font-semibold">Capacity</TableCell>
                <TableCell className="font-semibold">Driver</TableCell>
                <TableCell className="font-semibold">Last Service</TableCell>
                <TableCell className="font-semibold">Next Service</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id} hover>
                  <TableCell className="font-medium">{bus.bus_number}</TableCell>
                  <TableCell>{bus.route_name}</TableCell>
                  <TableCell>{bus.capacity}</TableCell>
                  <TableCell>{bus.driver_name}</TableCell>
                  <TableCell>{TransportService.formatDate(bus.last_service)}</TableCell>
                  <TableCell>{TransportService.formatDate(bus.next_service)}</TableCell>
                  <TableCell>
                    <Chip
                      label={bus.status}
                      color={getStatusColor(bus.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-2">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(bus)}
                        className="text-blue-600"
                      >
                        <Edit size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(bus.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {buses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" className="py-8">
                    <Typography color="text.secondary">No buses found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">
            {editingBus ? 'Edit Bus' : 'Add Bus'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              label="Bus Number"
              value={formData.bus_number}
              onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Route ID"
              value={formData.route_id}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Route Name"
              value={formData.route_name}
              onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              fullWidth
              required
            />
            <TextField
              label="Driver ID"
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Driver Name"
              value={formData.driver_name}
              onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Service Date"
              type="date"
              value={formData.last_service}
              onChange={(e) => setFormData({ ...formData, last_service: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Next Service Date"
              type="date"
              value={formData.next_service}
              onChange={(e) => setFormData({ ...formData, next_service: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingBus ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusManagement;