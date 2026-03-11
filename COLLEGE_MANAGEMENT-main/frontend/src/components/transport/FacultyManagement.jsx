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
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import TransportService from '../../services/transportService';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    faculty_id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    route_id: '',
    route_name: '',
    status: 'Active',
  });

  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];

  useEffect(() => {
    loadFaculty();
  }, [pagination.page, pagination.rowsPerPage, filterDepartment, searchTerm]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage
      };

      if (filterDepartment !== 'All') {
        params.department = filterDepartment;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const result = await TransportService.getTransportFaculty(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      setFaculty(result.data);
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

  const handleOpenDialog = (facultyMember = null) => {
    if (facultyMember) {
      setEditingFaculty(facultyMember);
      setFormData({
        faculty_id: facultyMember.faculty_id || '',
        name: facultyMember.name || '',
        email: facultyMember.email || '',
        phone: facultyMember.phone || '',
        department: facultyMember.department || '',
        route_id: facultyMember.route_id || '',
        route_name: facultyMember.route_name || '',
        status: facultyMember.status || 'Active',
      });
    } else {
      setEditingFaculty(null);
      setFormData({
        faculty_id: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        route_id: '',
        route_name: '',
        status: 'Active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFaculty(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingFaculty) {
        await TransportService.updateTransportFaculty(editingFaculty.id, formData);
      } else {
        await TransportService.addTransportFaculty(formData);
      }
      handleCloseDialog();
      loadFaculty();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await TransportService.deleteTransportFaculty(id);
        loadFaculty();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.faculty_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || member.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

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
            Faculty Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage faculty using transport services
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Faculty
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box className="flex gap-4">
            <TextField
              placeholder="Search faculty by ID, name, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 0 }));
              }}
              InputProps={{
                startAdornment: <Search size={20} className="mr-2 text-gray-400" />,
              }}
              className="flex-1"
              size="small"
            />
            <TextField
              select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setPagination(prev => ({ ...prev, page: 0 }));
              }}
              size="small"
              className="w-40"
            >
              <MenuItem value="All">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
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
                <TableCell className="font-semibold">Faculty ID</TableCell>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Email</TableCell>
                <TableCell className="font-semibold">Phone</TableCell>
                <TableCell className="font-semibold">Department</TableCell>
                <TableCell className="font-semibold">Route</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faculty.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>{member.faculty_id}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>
                    <Chip label={member.department} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{member.route_name || member.route}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.status}
                      color={member.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-2">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(member)}
                        className="text-blue-600"
                      >
                        <Edit size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {faculty.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" className="py-8">
                    <Typography color="text.secondary">No faculty members found</Typography>
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
            {editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              label="Faculty ID"
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
              required
            >
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Route ID"
              value={formData.route_id}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Route Name"
              value={formData.route_name}
              onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
              fullWidth
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
            {editingFaculty ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultyManagement;