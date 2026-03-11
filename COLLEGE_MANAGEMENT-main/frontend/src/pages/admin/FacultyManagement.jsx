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
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
  VpnKey as KeyIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getDepartments,
  getFacultyAttendance,
  markFacultyAttendance,
  deleteFacultyAttendance
} from '../../services/facultyService';
import { supabase } from '../../services/supabaseClient';

// Departments will be fetched from the database

const FacultyManagement = ({ showAttendance = false }) => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
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
    employee_id: '',
    full_name: '',
    email: '',
    password: '',  // Added password field for new faculty
    phone: '',
    gender: 'Male',
    date_of_birth: null,
    address: '',
    blood_group: 'A+',
    joining_date: new Date(),
    designation: 'Professor',
    is_hod: false,
    department_id: 1,
    status: 'Active',
    profile_picture_url: ''
  });

  // Attendance state
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(showAttendance);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState('Present');
  const [attendanceRemarks, setAttendanceRemarks] = useState('');
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);

  // Fetch departments data
  const fetchDepartments = async () => {
    try {
      const departmentsData = await getDepartments();
      setDepartments(departmentsData);
      return departmentsData;
    } catch (err) {
      console.error('Error fetching departments:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load departments',
        severity: 'error'
      });
      throw err;
    }
  };

  // Fetch faculty data
  const fetchFaculty = async () => {
    try {
      setLoading(true);
      
      // Fetch departments and faculty in parallel
      const [departmentsData, facultyData] = await Promise.all([
        getDepartments(),
        getFaculty()
      ]);
      
      setDepartments(departmentsData);
      setFaculty(facultyData);
      setError(null);
      
      return { departments: departmentsData, faculty: facultyData };
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to load data',
        severity: 'error'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFaculty().catch(console.error);
  }, []);

  // Handle showAttendance prop changes
  useEffect(() => {
    if (showAttendance && faculty.length > 0) {
      // If showAttendance is true and we have faculty data, open the dialog for the first faculty
      handleOpenAttendanceDialog(faculty[0]);
    }
  }, [showAttendance, faculty]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentFaculty(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setCurrentFaculty(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Open dialog for adding/editing faculty
  const handleOpenDialog = async (facultyId = null) => {
    if (facultyId) {
      try {
        setLoading(true);
        const facultyData = await getFacultyById(facultyId);
        setCurrentFaculty({
          ...facultyData,
          date_of_birth: facultyData.date_of_birth ? new Date(facultyData.date_of_birth) : null,
          joining_date: facultyData.joining_date ? new Date(facultyData.joining_date) : new Date()
        });
        setEditing(true);
      } catch (err) {
        console.error('Error fetching faculty details:', err);
        setSnackbar({
          open: true,
          message: 'Failed to load faculty details',
          severity: 'error'
        });
        return;
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentFaculty({
        employee_id: '',
        full_name: '',
        email: '',
        phone: '',
        gender: 'Male',
        date_of_birth: null,
        address: '',
        blood_group: 'A+',
        joining_date: new Date(),
        designation: 'Professor',
        is_hod: false,
        department_id: 1,
        status: 'Active',
        profile_picture_url: ''
      });
      setEditing(false);
    }
    setOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!currentFaculty.employee_id || !currentFaculty.full_name || !currentFaculty.email) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    // Additional validation for new faculty
    if (!editing && !currentFaculty.password) {
      setSnackbar({
        open: true,
        message: 'Password is required for new faculty members',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format data for the API
      const formattedData = {
        ...currentFaculty,
        // Ensure required fields are present
        email: currentFaculty.email,
        full_name: currentFaculty.full_name,
        employee_id: currentFaculty.employee_id || `FAC${Date.now().toString().slice(-6)}`,
        // Optional fields with defaults
        phone: currentFaculty.phone || null,
        gender: currentFaculty.gender || 'Male',
        date_of_birth: currentFaculty.date_of_birth ? currentFaculty.date_of_birth.toISOString() : null,
        joining_date: currentFaculty.joining_date ? currentFaculty.joining_date.toISOString() : new Date().toISOString(),
        designation: currentFaculty.designation || 'Professor',
        is_hod: Boolean(currentFaculty.is_hod),
        department_id: Number(currentFaculty.department_id) || 1,
        status: currentFaculty.status || 'Active'
      };

      // Only include password for new faculty
      if (!editing) {
        formattedData.password = currentFaculty.password;
      }

      if (editing) {
        await updateFaculty(currentFaculty.id, formattedData);
        setSnackbar({
          open: true,
          message: 'Faculty member updated successfully',
          severity: 'success'
        });
      } else {
        await createFaculty(formattedData);
        setSnackbar({
          open: true,
          message: 'Faculty member added successfully',
          severity: 'success'
        });
      }
      
      setOpen(false);
      fetchFaculty();
    } catch (err) {
      console.error('Error saving faculty member:', err);
      setSnackbar({
        open: true,
        message: `Failed to ${editing ? 'update' : 'add'} faculty member`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete faculty
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        setLoading(true);
        await deleteFaculty(id);
        setSnackbar({
          open: true,
          message: 'Faculty member deleted successfully',
          severity: 'success'
        });
        fetchFaculty();
      } catch (err) {
        console.error('Error deleting faculty member:', err);
        setSnackbar({
          open: true,
          message: 'Failed to delete faculty member',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpen(false);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Add this function to render the attendance status chip
  const renderStatusChip = (status) => {
    let color = 'default';
    switch (status) {
      case 'Present':
        color = 'success';
        break;
      case 'Absent':
        color = 'error';
        break;
      case 'Late':
        color = 'warning';
        break;
      case 'Half Day':
        color = 'info';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} size="small" />;
  };

  // Handle opening the attendance dialog with error handling and loading states
  const handleOpenAttendanceDialog = async (faculty) => {
    if (!faculty || !faculty.id) {
      console.error('Invalid faculty data provided to handleOpenAttendanceDialog:', faculty);
      setSnackbar({
        open: true,
        message: 'Invalid faculty data. Please try again.',
        severity: 'error'
      });
      return;
    }

    console.log('[handleOpenAttendanceDialog] Opening dialog for faculty:', faculty.id, faculty.full_name);
    
    try {
      // Set loading state and open dialog
      setLoading(true);
      setCurrentFaculty(faculty);
      
      // Fetch attendance for the current month
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      console.log(`[handleOpenAttendanceDialog] Fetching attendance for ${faculty.id} from ${startDate} to ${endDate}`);
      
      // Set default empty records first
      setAttendanceRecords([]);
      
      // Show the dialog immediately
      setAttendanceDialogOpen(true);
      
      // Then fetch the data
      const attendance = await getFacultyAttendance(faculty.id, startDate, endDate);
      
      console.log(`[handleOpenAttendanceDialog] Received ${attendance?.length || 0} attendance records`);
      setAttendanceRecords(Array.isArray(attendance) ? attendance : []);
      
    } catch (error) {
      console.error('[handleOpenAttendanceDialog] Error:', {
        error,
        message: error.message,
        stack: error.stack
      });
      
      setSnackbar({
        open: true,
        message: `Failed to load attendance records: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
      
      // Keep the dialog open but show error state
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle saving attendance
  const handleSaveAttendance = async () => {
    try {
      const attendanceData = {
        faculty_id: currentFaculty.id,
        attendance_date: selectedDate.toISOString().split('T')[0],
        status: attendanceStatus,
        remarks: attendanceRemarks,
        marked_by: supabase.auth.user()?.id // Get the current user's ID
      };

      if (editingAttendanceId) {
        attendanceData.id = editingAttendanceId;
      }

      await markFacultyAttendance(attendanceData);
      
      // Refresh attendance records
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const attendance = await getFacultyAttendance(
        currentFaculty.id,
        firstDay.toISOString().split('T')[0],
        lastDay.toISOString().split('T')[0]
      );
      
      setAttendanceRecords(attendance);
      
      setSnackbar({
        open: true,
        message: 'Attendance saved successfully',
        severity: 'success'
      });
      
      // Reset form
      setSelectedDate(new Date());
      setAttendanceStatus('Present');
      setAttendanceRemarks('');
      setEditingAttendanceId(null);
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save attendance',
        severity: 'error'
      });
    }
  };

  // Add this function to handle editing an attendance record
  const handleEditAttendance = (record) => {
    setSelectedDate(new Date(record.attendance_date));
    setAttendanceStatus(record.status);
    setAttendanceRemarks(record.remarks || '');
    setEditingAttendanceId(record.id);
  };

  // Add this function to handle deleting an attendance record
  const handleDeleteAttendance = async (id) => {
    try {
      if (window.confirm('Are you sure you want to delete this attendance record?')) {
        await deleteFacultyAttendance(id);
        
        // Refresh attendance records
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const attendance = await getFacultyAttendance(
          currentFaculty.id,
          firstDay.toISOString().split('T')[0],
          lastDay.toISOString().split('T')[0]
        );
        
        setAttendanceRecords(attendance);
        
        setSnackbar({
          open: true,
          message: 'Attendance record deleted successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete attendance record',
        severity: 'error'
      });
    }
  };

  // Handle closing the attendance dialog
  const handleCloseAttendanceDialog = () => {
    setAttendanceDialogOpen(false);
    setSelectedDate(new Date());
  };

  // Render attendance dialog
  const renderAttendanceDialog = () => (
    <Dialog 
      open={attendanceDialogOpen} 
      onClose={handleCloseAttendanceDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {currentFaculty?.full_name}'s Attendance
        {loading && <CircularProgress size={24} sx={{ ml: 2, verticalAlign: 'middle' }} />}
      </DialogTitle>
      <DialogContent>
      <Box sx={{ mt: 2, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    disabled={loading}
                  />
                )}
                disabled={loading}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={attendanceStatus}
                label="Status"
                onChange={(e) => setAttendanceStatus(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
                <MenuItem value="Half Day">Half Day</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Remarks"
              value={attendanceRemarks}
              onChange={(e) => setAttendanceRemarks(e.target.value)}
              disabled={loading}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveAttendance}
            fullWidth
            disabled={loading}
          >
            {editingAttendanceId ? 'Update' : 'Mark'} Attendance
          </Button>
        </Grid>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Attendance History (This Month)
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Marked By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceRecords.length > 0 ? (
              attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.attendance_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(record.status)}
                  </TableCell>
                  <TableCell>{record.remarks || '-'}</TableCell>
                  <TableCell>
                    {record.marked_by_user?.email || 'System'}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditAttendance(record)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteAttendance(record.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No attendance records found for this month.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseAttendanceDialog} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

// Add/Edit Faculty Dialog
const renderAddEditFacultyDialog = () => (
  <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
    <form onSubmit={handleSubmit}>
      <DialogTitle>
        {editing ? 'Edit Faculty Member' : 'Add New Faculty Member'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Employee ID"
              name="employee_id"
              value={currentFaculty.employee_id}
              onChange={handleChange}
              disabled={editing}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="full_name"
              value={currentFaculty.full_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={currentFaculty.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              required={!editing}
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={currentFaculty.password || ''}
              onChange={handleChange}
              disabled={editing}
              autoComplete="new-password"
              helperText={editing ? "Leave blank to keep current password" : ""}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              required={!editing}
              fullWidth
              name="confirm_password"
              label="Confirm Password"
              type="password"
              value={currentFaculty.confirm_password || ''}
              onChange={handleChange}
              disabled={editing}
              error={currentFaculty.password && currentFaculty.password !== currentFaculty.confirm_password}
              helperText={currentFaculty.password && currentFaculty.password !== currentFaculty.confirm_password ? "Passwords do not match" : ""}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              margin="normal"
              fullWidth
              label="Phone"
              name="phone"
              value={currentFaculty.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={currentFaculty.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                value={currentFaculty.date_of_birth}
                onChange={(date) => handleDateChange('date_of_birth', date)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={2}
              label="Address"
              name="address"
              value={currentFaculty.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Blood Group</InputLabel>
              <Select
                name="blood_group"
                value={currentFaculty.blood_group}
                onChange={handleChange}
                label="Blood Group"
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Joining Date"
                value={currentFaculty.joining_date}
                onChange={(date) => handleDateChange('joining_date', date)}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={currentFaculty.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Department</InputLabel>
              <Select
                name="department_id"
                value={currentFaculty.department_id || ''}
                onChange={handleChange}
                label="Department"
                disabled={loading || departments.length === 0}
              >
                {departments.length === 0 ? (
                  <MenuItem disabled>
                    {loading ? 'Loading departments...' : 'No departments found'}
                  </MenuItem>
                ) : (
                  departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Designation</InputLabel>
              <Select
                name="designation"
                value={currentFaculty.designation}
                onChange={handleChange}
                label="Designation"
              >
                <MenuItem value="Professor">Professor</MenuItem>
                <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                <MenuItem value="Lecturer">Lecturer</MenuItem>
                <MenuItem value="Visiting Faculty">Visiting Faculty</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <input
                  type="checkbox"
                  name="is_hod"
                  checked={currentFaculty.is_hod || false}
                  onChange={handleChange}
                />
              }
              label="Is Head of Department (HOD)"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              fullWidth
              label="Profile Picture URL"
              name="profile_picture_url"
              value={currentFaculty.profile_picture_url || ''}
              onChange={handleChange}
              placeholder="https://example.com/profile.jpg"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseDialog}
          color="secondary"
          startIcon={<CancelIcon />}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          disabled={loading}
        >
          {editing ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </form>
  </Dialog>
);

  // Render snackbar for notifications
  const renderSnackbar = () => (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Main content */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Faculty Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Faculty
        </Button>
      </Box>

      {/* Faculty List */}
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : faculty.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No faculty members found
                  </TableCell>
                </TableRow>
              ) : (
                faculty.map((facultyMember) => (
                  <TableRow key={facultyMember.id}>
                    <TableCell>{facultyMember.employee_id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={facultyMember.profile_picture_url} alt={facultyMember.full_name} />
                        {facultyMember.full_name}
                      </Box>
                    </TableCell>
                    <TableCell>{facultyMember.email}</TableCell>
                    <TableCell>
                      {departments.find(d => d.id === facultyMember.department_id)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{facultyMember.designation}</TableCell>
                    <TableCell>
                      <Chip
                        label={facultyMember.status}
                        color={facultyMember.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog(facultyMember.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          onClick={() => handleDelete(facultyMember.id)}
                          disabled={facultyMember.is_hod}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Attendance">
                        <IconButton onClick={() => handleOpenAttendanceDialog(facultyMember)}>
                          <EventIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogs */}
      {renderAddEditFacultyDialog()}
      {renderAttendanceDialog()}
      {renderSnackbar()}
    </Box>
  );
};

export default FacultyManagement;
