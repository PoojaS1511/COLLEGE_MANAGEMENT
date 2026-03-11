import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, MenuItem, CircularProgress, Alert, Grid, TablePagination
} from '@mui/material';
import { Search, Plus, Edit, Trash2, X, UserCheck, AlertCircle } from 'lucide-react';
import TransportService from '../../services/transportService';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
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
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    driver_id: '', name: '', phone: '', license_number: '', license_expiry: '', blood_group: '',
    emergency_contact: '', experience_years: 5, shift: 'Morning', working_hours: '8 hours',
    assigned_bus: '', status: 'Active',
  });

  useEffect(() => { loadDrivers(); }, [pagination.page, pagination.rowsPerPage, filterStatus, searchTerm]);

  const loadDrivers = async () => {
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

      const result = await TransportService.getDrivers(params);
      if (!result.success) throw new Error(result.error);
      setDrivers(result.data);
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

  const handleOpenDialog = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        driver_id: driver.driver_id || '',
        name: driver.name || '',
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        license_expiry: driver.license_expiry || '',
        blood_group: driver.blood_group || '',
        emergency_contact: driver.emergency_contact || '',
        experience_years: driver.experience_years || 0,
        shift: driver.shift || 'Morning',
        working_hours: driver.working_hours || '8 hours',
        assigned_bus: driver.assigned_bus || '',
        status: driver.status || 'Active',
      });
    } else {
      setEditingDriver(null);
      setFormData({
        driver_id: '',
        name: '',
        phone: '',
        license_number: '',
        license_expiry: '',
        blood_group: '',
        emergency_contact: '',
        experience_years: 5,
        shift: 'Morning',
        working_hours: '8 hours',
        assigned_bus: '',
        status: 'Active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { setOpenDialog(false); setEditingDriver(null); };

  const handleSubmit = async () => {
    try {
      if (editingDriver) {
        await TransportService.updateDriver(editingDriver.id, formData);
      } else {
        await TransportService.addDriver(formData);
      }
      handleCloseDialog();
      loadDrivers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await TransportService.deleteDriver(id);
        loadDrivers();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const isLicenseExpiring = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > 0;
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.driver_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <Box className="flex items-center justify-center min-h-screen"><CircularProgress /></Box>;
  }

  return (
    <Box className="p-6 space-y-6">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">Driver Management</Typography>
          <Typography variant="body1" color="text.secondary">Manage drivers and their details</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700">
          Add Driver
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">Total Drivers</Typography>
                <Typography variant="h4" className="font-bold">{pagination.total}</Typography>
              </Box>
              <UserCheck size={32} className="text-blue-600" />
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">Active</Typography>
                <Typography variant="h4" className="font-bold text-green-600">
                  {drivers.filter(d => d.status === 'Active').length}
                </Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">On Leave</Typography>
                <Typography variant="h4" className="font-bold text-orange-600">
                  {drivers.filter(d => d.status === 'On Leave').length}
                </Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box className="flex items-center justify-between">
              <Box>
                <Typography color="text.secondary" variant="body2">License Expiring</Typography>
                <Typography variant="h4" className="font-bold text-red-600">
                  {drivers.filter(d => isLicenseExpiring(d.license_expiry)).length}
                </Typography>
              </Box>
              <AlertCircle size={32} className="text-red-600" />
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box className="flex gap-4">
            <TextField placeholder="Search drivers by ID, name, or phone..." value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 0 }));
              }}
              InputProps={{ startAdornment: <Search size={20} className="mr-2 text-gray-400" /> }}
              className="flex-1" size="small" />
            <TextField select value={filterStatus} onChange={(e) => {
                setFilterStatus(e.target.value);
                setPagination(prev => ({ ...prev, page: 0 }));
              }}
              size="small" className="w-40">
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">Driver ID</TableCell>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Phone</TableCell>
                <TableCell className="font-semibold">License No.</TableCell>
                <TableCell className="font-semibold">License Expiry</TableCell>
                <TableCell className="font-semibold">Experience</TableCell>
                <TableCell className="font-semibold">Shift</TableCell>
                <TableCell className="font-semibold">Assigned Bus</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id} hover>
                  <TableCell>{driver.driver_id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.license_number}</TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-1">
                      {TransportService.formatDate(driver.license_expiry)}
                      {isLicenseExpiring(driver.license_expiry) && (
                        <AlertCircle size={16} className="text-red-600" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{driver.experience_years} years</TableCell>
                  <TableCell><Chip label={driver.shift} size="small" variant="outlined" /></TableCell>
                  <TableCell>{driver.assigned_bus}</TableCell>
                  <TableCell>
                    <Chip label={driver.status}
                      color={driver.status === 'Active' ? 'success' : 'warning'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-2">
                      <IconButton size="small" onClick={() => handleOpenDialog(driver)} className="text-blue-600">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(driver.id)} className="text-red-600">
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {drivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" className="py-8">
                    <Typography color="text.secondary">No drivers found</Typography>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">{editingDriver ? 'Edit Driver' : 'Add Driver'}</Typography>
          <IconButton onClick={handleCloseDialog} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="mt-2">
            <Grid item xs={12} sm={6}>
              <TextField label="Name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="License Number" value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="License Expiry" type="date" value={formData.license_expiry}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                fullWidth required InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Blood Group" value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} fullWidth>
                {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
                  <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Emergency Contact" value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Experience (Years)" type="number" value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Shift" value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })} fullWidth>
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Evening">Evening</MenuItem>
                <MenuItem value="Full Day">Full Day</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Working Hours" value={formData.working_hours}
                onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Assigned Bus" value={formData.assigned_bus}
                onChange={(e) => setFormData({ ...formData, assigned_bus: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Status" value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {editingDriver ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverManagement;