import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Alert, CircularProgress, Snackbar, Tooltip, Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import ApiService from '../../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head_of_department: '',
    duration: '4 years',
    duration_years: 4,
    total_semesters: 8
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getAllDepartments();
      
      if (response.success) {
        setDepartments(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError(error.message || 'Failed to fetch departments');
      showSnackbar(error.message || 'Failed to fetch departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      
      if (editingId) {
        response = await ApiService.updateDepartment(editingId, formData);
      } else {
        response = await ApiService.createDepartment(formData);
      }
      
      if (response.success) {
        showSnackbar(
          `Department ${editingId ? 'updated' : 'created'} successfully`,
          'success'
        );
        setOpen(false);
        setFormData({
          name: '',
          code: '',
          head_of_department: '',
          duration: '4 years',
          duration_years: 4,
          total_semesters: 8
        });
        setEditingId(null);
        fetchDepartments();
      }
    } catch (error) {
      console.error('Error saving department:', error);
      showSnackbar(
        error.response?.data?.error || 'Failed to save department', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        setLoading(true);
        const response = await ApiService.deleteDepartment(id);
        
        if (response.success) {
          showSnackbar('Department deleted successfully', 'success');
          fetchDepartments();
        }
      } catch (error) {
        console.error('Error deleting department:', error);
        showSnackbar(
          error.response?.data?.error || 'Failed to delete department',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (department) => {
    setEditingId(department.id);
    setFormData({
      name: department.name,
      code: department.code,
      head_of_department: department.head_of_department || '',
      duration: department.duration || '4 years',
      duration_years: department.duration_years || 4,
      total_semesters: department.total_semesters || 8
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Convert duration_years and total_semesters to numbers
      const newValue = ['duration_years', 'total_semesters'].includes(name) 
        ? parseInt(value, 10) || 0 
        : value;
      
      // Update duration text when duration_years changes
      if (name === 'duration_years') {
        return {
          ...prev,
          [name]: newValue,
          duration: `${newValue} ${newValue === 1 ? 'year' : 'years'}`
        };
      }
      
      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      code: '',
      head_of_department: '',
      duration: '4 years',
      duration_years: 4,
      total_semesters: 8
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Departments
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
            >
              Add Department
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Head of Department</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Semesters</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No departments found
                    </TableCell>
                  </TableRow>
                ) : (
                  departments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell>{dept.name}</TableCell>
                        <TableCell>{dept.code}</TableCell>
                        <TableCell>{dept.head_of_department || '-'}</TableCell>
                        <TableCell>{dept.duration}</TableCell>
                        <TableCell>{dept.total_semesters}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEdit(dept)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDelete(dept.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={departments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Department Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? 'Edit Department' : 'Add New Department'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Head of Department"
                  name="head_of_department"
                  value={formData.head_of_department}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Duration (Years)"
                  name="duration_years"
                  value={formData.duration_years}
                  onChange={handleChange}
                  margin="normal"
                  SelectProps={{ native: true }}
                  required
                >
                  {[1, 2, 3, 4, 5].map((years) => (
                    <option key={years} value={years}>
                      {years} {years === 1 ? 'year' : 'years'}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Semesters"
                  name="total_semesters"
                  value={formData.total_semesters}
                  onChange={handleChange}
                  margin="normal"
                  inputProps={{ min: 1, max: 12 }}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Departments;