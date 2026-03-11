import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, CircularProgress, Alert, List, ListItem, ListItemText, TablePagination, MenuItem
} from '@mui/material';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import TransportService from '../../services/transportService';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_id: '',
    route_name: '',
    stops: [],
    pickup_time: '',
    drop_time: '',
    total_students: 0,
    assigned_bus: '',
    assigned_driver: '',
    status: 'Active',
  });

  useEffect(() => { loadRoutes(); }, [pagination.page, pagination.rowsPerPage, searchTerm]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const result = await TransportService.getRoutes(params);
      if (!result.success) throw new Error(result.error);
      setRoutes(result.data);
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

  const handleOpenDialog = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        route_id: route.route_id || '',
        route_name: route.route_name || '',
        stops: route.stops || [],
        pickup_time: route.pickup_time || '',
        drop_time: route.drop_time || '',
        total_students: route.total_students || 0,
        assigned_bus: route.assigned_bus || '',
        assigned_driver: route.assigned_driver || '',
        status: route.status || 'Active',
      });
    } else {
      setEditingRoute(null);
      setFormData({
        route_id: '',
        route_name: '',
        stops: [],
        pickup_time: '',
        drop_time: '',
        total_students: 0,
        assigned_bus: '',
        assigned_driver: '',
        status: 'Active',
      });
    }
    setOpenDialog(true);
  };

  const handleViewRoute = async (route) => {
    const result = await TransportService.getRouteById(route.id);
    if (result.success) {
      setSelectedRoute(result.data);
      setViewDialog(true);
    }
  };

  const handleCloseDialog = () => { setOpenDialog(false); setEditingRoute(null); };
  const handleCloseViewDialog = () => { setViewDialog(false); setSelectedRoute(null); };

  const handleSubmit = async () => {
    try {
      if (editingRoute) {
        await TransportService.updateRoute(editingRoute.id, formData);
      } else {
        await TransportService.addRoute(formData);
      }
      handleCloseDialog();
      loadRoutes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await TransportService.deleteRoute(id);
        loadRoutes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredRoutes = routes.filter(route =>
    (route.route_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (route.route_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Box className="flex items-center justify-center min-h-screen"><CircularProgress /></Box>;
  }

  return (
    <Box className="p-6 space-y-6">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">Route Management</Typography>
          <Typography variant="body1" color="text.secondary">Manage transport routes and stops</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700">Add Route</Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card><CardContent>
        <TextField placeholder="Search routes by ID or name..." value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPagination(prev => ({ ...prev, page: 0 }));
          }}
          InputProps={{ startAdornment: <Search size={20} className="mr-2 text-gray-400" /> }}
          className="w-full" size="small" />
      </CardContent></Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">Route ID</TableCell>
                <TableCell className="font-semibold">Route Name</TableCell>
                <TableCell className="font-semibold">Pickup Time</TableCell>
                <TableCell className="font-semibold">Drop Time</TableCell>
                <TableCell className="font-semibold">Students</TableCell>
                <TableCell className="font-semibold">Bus</TableCell>
                <TableCell className="font-semibold">Driver</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id} hover className="cursor-pointer" onClick={() => handleViewRoute(route)}>
                  <TableCell>{route.route_id}</TableCell>
                  <TableCell className="font-medium">{route.route_name}</TableCell>
                  <TableCell>{route.pickup_time}</TableCell>
                  <TableCell>{route.drop_time}</TableCell>
                  <TableCell>{route.total_students}</TableCell>
                  <TableCell>{route.assigned_bus}</TableCell>
                  <TableCell>{route.assigned_driver}</TableCell>
                  <TableCell>
                    <Chip label={route.status} size="small" color={route.status === 'Active' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={() => handleOpenDialog(route)} className="text-blue-600">
                        <Edit size={18} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(route.id)} className="text-red-600">
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {routes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" className="py-8">
                    <Typography color="text.secondary">No routes found</Typography>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">{editingRoute ? 'Edit Route' : 'Add Route'}</Typography>
          <IconButton onClick={handleCloseDialog} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField label="Route ID" value={formData.route_id}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value })} fullWidth required />
            <TextField label="Route Name" value={formData.route_name}
              onChange={(e) => setFormData({ ...formData, route_name: e.target.value })} fullWidth required />
            <TextField label="Pickup Time" type="time" value={formData.pickup_time}
              onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label="Drop Time" type="time" value={formData.drop_time}
              onChange={(e) => setFormData({ ...formData, drop_time: e.target.value })} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label="Assigned Bus" value={formData.assigned_bus}
              onChange={(e) => setFormData({ ...formData, assigned_bus: e.target.value })} fullWidth />
            <TextField label="Assigned Driver" value={formData.assigned_driver}
              onChange={(e) => setFormData({ ...formData, assigned_driver: e.target.value })} fullWidth />
            <TextField select label="Status" value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })} fullWidth>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {editingRoute ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">Route Details</Typography>
          <IconButton onClick={handleCloseViewDialog} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRoute && (
            <Box className="space-y-4">
              <Box className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <Box>
                  <Typography variant="body2" color="text.secondary">Route ID</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.route_id}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Route Name</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.route_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Pickup Time</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.pickup_time}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Drop Time</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.drop_time}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Students</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.total_students}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Assigned Bus</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.assigned_bus}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Assigned Driver</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.assigned_driver}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Typography variant="body1" className="font-medium">{selectedRoute.status}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RouteManagement;