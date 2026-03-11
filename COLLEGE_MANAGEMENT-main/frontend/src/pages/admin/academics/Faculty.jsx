import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Email, 
  Phone, 
  Person,
  Refresh 
} from '@mui/icons-material';
import axios from 'axios';

// Mock data for development and fallback
const mockFaculty = [
  {
    id: '1',
    employee_id: 'FAC001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@school.edu',
    phone: '+1 234 567 8901',
    department: 'Computer Science',
    designation: 'Professor',
    joining_date: '2020-01-15',
    qualification: 'Ph.D. in Computer Science',
    specialization: 'Artificial Intelligence'
  },
  {
    id: '2',
    employee_id: 'FAC002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@school.edu',
    phone: '+1 234 567 8902',
    department: 'Electronics',
    designation: 'Associate Professor',
    joining_date: '2021-03-22',
    qualification: 'M.Tech in Electronics',
    specialization: 'Embedded Systems'
  },
  {
    id: '3',
    employee_id: 'FAC003',
    first_name: 'Robert',
    last_name: 'Johnson',
    email: 'robert.j@school.edu',
    phone: '+1 234 567 8903',
    department: 'Mechanical',
    designation: 'Assistant Professor',
    joining_date: '2022-05-10',
    qualification: 'Ph.D. in Mechanical Engineering',
    specialization: 'Thermodynamics'
  }
];

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [currentFaculty, setCurrentFaculty] = useState({
    id: '',
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    designation: 'Professor',
    joining_date: new Date().toISOString().split('T')[0],
    qualification: '',
    specialization: ''
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In development, use mock data immediately
      if (import.meta.env.DEV) {
        console.log('Using mock faculty data in development mode');
        setFaculty(mockFaculty);
        return;
      }
      
      // In production, try to fetch from API
      const response = await axios.get('/api/academics/faculty');
      
      // Handle different response formats
      let facultyData = [];
      if (Array.isArray(response?.data)) {
        facultyData = response.data;
      } else if (response && Array.isArray(response.data)) {
        facultyData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        facultyData = response.data;
      } else {
        console.warn('Unexpected faculty response format, using mock data');
        facultyData = mockFaculty;
      }
      
      setFaculty(facultyData);
      
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setError('Failed to load faculty. Using sample data instead.');
      setFaculty(mockFaculty);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (facultyMember = null) => {
    if (facultyMember) {
      setCurrentFaculty({
        ...facultyMember,
        joining_date: facultyMember.joining_date || new Date().toISOString().split('T')[0]
      });
      setEditing(true);
    } else {
      setCurrentFaculty({
        id: '',
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: 'Computer Science',
        designation: 'Professor',
        joining_date: new Date().toISOString().split('T')[0],
        qualification: '',
        specialization: ''
      });
      setEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentFaculty(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // In development, update local state directly
      if (import.meta.env.DEV) {
        if (editing) {
          setFaculty(prev => 
            prev.map(f => 
              f.id === currentFaculty.id ? { ...currentFaculty } : f
            )
          );
        } else {
          setFaculty(prev => [
            ...prev, 
            { 
              ...currentFaculty, 
              id: Date.now().toString(),
              employee_id: `FAC${String(prev.length + 1).padStart(3, '0')}`
            }
          ]);
        }
        
        showSnackbar(
          `Faculty member ${editing ? 'updated' : 'added'} successfully! (Demo Mode)`,
          'success'
        );
        setOpen(false);
        return;
      }
      
      // In production, make API call
      let response;
      if (editing) {
        response = await axios.put(`/api/academics/faculty/${currentFaculty.id}`, currentFaculty);
      } else {
        response = await axios.post('/api/academics/faculty', currentFaculty);
      }

      if (response && (response.success || response.id)) {
        showSnackbar(
          `Faculty member ${editing ? 'updated' : 'added'} successfully!`,
          'success'
        );
        setOpen(false);
        fetchFaculty();
      } else {
        throw new Error(response?.error || 'Failed to save faculty member');
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
      showSnackbar(
        error.message || 'Failed to save faculty member. Changes not saved in demo mode.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        // In development, update local state directly
        if (import.meta.env.DEV) {
          setFaculty(prev => prev.filter(f => f.id !== id));
          showSnackbar('Faculty member deleted successfully! (Demo Mode)', 'success');
          return;
        }
        
        // In production, make API call
        const response = await axios.delete(`/api/academics/faculty/${id}`);
        
        if (response?.success || response === true) {
          showSnackbar('Faculty member deleted successfully!', 'success');
          fetchFaculty();
        } else {
          throw new Error(response?.error || 'Failed to delete faculty member');
        }
      } catch (error) {
        console.error('Error deleting faculty:', error);
        showSnackbar(
          error.message || 'Failed to delete faculty member. Please try again later.',
          'error'
        );
      }
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  // Departments for the dropdown
  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Information Technology',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Humanities'
  ];

  // Designations for the dropdown
  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Visiting Faculty',
    'Adjunct Professor'
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Manage Faculty</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          disabled={loading}
        >
          Add Faculty
        </Button>
      </Box>

      {error && (
        <Box mb={2}>
          <Alert severity="warning">
            {error}
            <Box mt={1}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={fetchFaculty}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Faculty</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && faculty.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Loading faculty data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : faculty.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No faculty members found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              faculty.map((facultyMember) => (
                <TableRow key={facultyMember.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          mr: 2,
                          width: 40,
                          height: 40,
                          fontSize: '1rem'
                        }}
                      >
                        {getInitials(facultyMember.first_name, facultyMember.last_name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {`${facultyMember.first_name} ${facultyMember.last_name}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {facultyMember.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={facultyMember.employee_id}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{facultyMember.department}</TableCell>
                  <TableCell>{facultyMember.designation}</TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column">
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" noWrap>
                          {facultyMember.email}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" noWrap>
                          {facultyMember.phone || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleOpen(facultyMember)} 
                        color="primary"
                        disabled={loading}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDelete(facultyMember.id)}
                        color="error"
                        disabled={loading}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editing ? 'Edit Faculty Member' : 'Add New Faculty Member'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                margin="dense"
                name="employee_id"
                label="Employee ID"
                type="text"
                fullWidth
                variant="outlined"
                value={currentFaculty.employee_id}
                onChange={handleChange}
                required
                disabled={loading || editing}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Designation</InputLabel>
                <Select
                  name="designation"
                  value={currentFaculty.designation}
                  onChange={handleChange}
                  label="Designation"
                  required
                  disabled={loading}
                >
                  {designations.map((designation) => (
                    <MenuItem key={designation} value={designation}>
                      {designation}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box display="flex" gap={2} mb={2}>
              <TextField
                margin="dense"
                name="first_name"
                label="First Name"
                type="text"
                fullWidth
                variant="outlined"
                value={currentFaculty.first_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <TextField
                margin="dense"
                name="last_name"
                label="Last Name"
                type="text"
                fullWidth
                variant="outlined"
                value={currentFaculty.last_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={currentFaculty.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <TextField
                margin="dense"
                name="phone"
                label="Phone"
                type="tel"
                fullWidth
                variant="outlined"
                value={currentFaculty.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={currentFaculty.department}
                  onChange={handleChange}
                  label="Department"
                  required
                  disabled={loading}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                margin="dense"
                name="joining_date"
                label="Joining Date"
                type="date"
                fullWidth
                variant="outlined"
                value={currentFaculty.joining_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={loading}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                margin="dense"
                name="qualification"
                label="Highest Qualification"
                type="text"
                fullWidth
                variant="outlined"
                value={currentFaculty.qualification}
                onChange={handleChange}
                disabled={loading}
              />
              <TextField
                margin="dense"
                name="specialization"
                label="Specialization"
                type="text"
                fullWidth
                variant="outlined"
                value={currentFaculty.specialization}
                onChange={handleChange}
                disabled={loading}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleClose} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {editing ? 'Update' : 'Add'} Faculty
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Faculty;
