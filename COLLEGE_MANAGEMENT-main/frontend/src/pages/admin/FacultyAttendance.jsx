import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { supabase } from '../../lib/supabase';
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
  Typography, 
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Group as UserGroupIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { getFaculty } from '../../services/facultyService';
import { 
  getFacultyAttendance, 
  updateFacultyAttendance, 
  batchUpdateAttendance 
} from '../../services/facultyAttendanceService';

const FacultyAttendance = () => {
  const [faculty, setFaculty] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [filter, setFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch faculty and attendance data in parallel
      const [facultyData, attendanceData] = await Promise.all([
        getFaculty(),
        getFacultyAttendance(date)
      ]);
      
      setFaculty(facultyData);
      setAttendance(attendanceData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleStatusChange = async (facultyId, status) => {
    try {
      // Get current user and their role from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('faculties')
        .select('id, role')
        .eq('auth_id', user.id)
        .single();

      const isAdmin = userData?.role === 'admin' || user?.user_metadata?.role === 'admin';
      
      await updateFacultyAttendance({
        facultyId,
        date,
        status,
        markedBy: isAdmin ? null : userData?.id,  // faculty marks → their faculties.id
        markedByAdmin: isAdmin ? user?.id : null  // admin marks → auth.users id
      });
      
      // Update local state
      setAttendance(prev => {
        const existing = prev.find(a => a.faculty_id === facultyId);
        if (existing) {
          return prev.map(a => 
            a.faculty_id === facultyId 
              ? { 
                  ...a, 
                  status,
                  marked_by: isAdmin ? null : userData?.id,
                  marked_by_admin: isAdmin ? user?.id : null
                } 
              : a
          );
        } else {
          return [...prev, { 
            faculty_id: facultyId, 
            status, 
            attendance_date: date.toISOString().split('T')[0],
            marked_by: isAdmin ? null : userData?.id,
            marked_by_admin: isAdmin ? user?.id : null
          }];
        }
      });
      
      showSnackbar('Attendance updated successfully');
    } catch (error) {
      console.error('Error updating attendance:', error);
      showSnackbar('Failed to update attendance', 'error');
    }
  };

  const onSubmit = async () => {
    try {
      // Get current user and their role from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('faculties')
        .select('id, role')
        .eq('auth_id', user.id)
        .single();

      const isAdmin = userData?.role === 'admin' || user?.user_metadata?.role === 'admin';
      
      // Prepare attendance data for batch update
      const attendanceData = faculty.map(facultyMember => {
        const record = attendance.find(a => a.faculty_id === facultyMember.id);
        return {
          faculty_id: facultyMember.id,
          attendance_date: date.toISOString().split('T')[0],
          status: record?.status || 'absent',
          marked_by: isAdmin ? null : userData?.id,  // faculty marks → their faculties.id
          marked_by_admin: isAdmin ? user?.id : null  // admin marks → auth.users id
        };
      });
      
      await batchUpdateAttendance(attendanceData, {
        markedBy: isAdmin ? null : userData?.id,
        markedByAdmin: isAdmin ? user?.id : null
      });
      
      showSnackbar('Attendance saved successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving attendance:', error);
      showSnackbar('Failed to save attendance', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon color="success" />;
      case 'absent':
        return <CancelIcon color="error" />;
      case 'late':
        return <AccessTimeIcon color="warning" />;
      default:
        return <CancelIcon color="disabled" />;
    }
  };

  const getStatusText = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Not Marked';
  };

  const filteredFaculty = faculty.filter(facultyMember => {
    if (filter === 'all') return true;
    const attendanceRecord = attendance.find(a => a.faculty_id === facultyMember.id);
    return attendanceRecord?.status === filter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Faculty Attendance
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2}>
            <DatePicker
              label="Select Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowMarkAttendance(!showMarkAttendance)}
              startIcon={showMarkAttendance ? <PersonIcon /> : <UserGroupIcon />}
            >
              {showMarkAttendance ? 'View Attendance' : 'Mark Attendance'}
            </Button>
          </Box>
        </Box>

        <Box mb={3}>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
              color="primary"
              size="small"
              startIcon={<UserGroupIcon />}
            >
              All
            </Button>
            <Button
              variant={filter === 'present' ? 'contained' : 'outlined'}
              onClick={() => setFilter('present')}
              color="success"
              size="small"
              startIcon={<CheckIcon />}
            >
              Present
            </Button>
            <Button
              variant={filter === 'absent' ? 'contained' : 'outlined'}
              onClick={() => setFilter('absent')}
              color="error"
              size="small"
              startIcon={<CloseIcon />}
            >
              Absent
            </Button>
            <Button
              variant={filter === 'late' ? 'contained' : 'outlined'}
              onClick={() => setFilter('late')}
              color="warning"
              size="small"
              startIcon={<AccessTimeIcon />}
            >
              Late
            </Button>
          </Box>
        </Box>

        {showMarkAttendance ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Faculty Member</TableCell>
                    <TableCell align="center">Department</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {faculty.map((facultyMember) => {
                    const attendanceRecord = attendance.find(a => a.faculty_id === facultyMember.id);
                    const status = attendanceRecord?.status || 'absent';
                    
                    return (
                      <TableRow key={facultyMember.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box 
                              bgcolor="grey.100" 
                              width={40} 
                              height={40} 
                              borderRadius="50%" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                              mr={2}
                            >
                              <PersonIcon color="action" />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2">{facultyMember.full_name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                {facultyMember.employee_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {facultyMember.department_id}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center" gap={1}>
                            <Button
                              variant={status === 'present' ? 'contained' : 'outlined'}
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleStatusChange(facultyMember.id, 'present')}
                            >
                              Present
                            </Button>
                            <Button
                              variant={status === 'absent' ? 'contained' : 'outlined'}
                              color="error"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => handleStatusChange(facultyMember.id, 'absent')}
                            >
                              Absent
                            </Button>
                            <Button
                              variant={status === 'late' ? 'contained' : 'outlined'}
                              color="warning"
                              size="small"
                              startIcon={<AccessTimeIcon />}
                              onClick={() => handleStatusChange(facultyMember.id, 'late')}
                            >
                              Late
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Save Attendance
              </Button>
            </Box>
          </form>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Faculty Member</TableCell>
                  <TableCell align="center">Department</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFaculty.length > 0 ? (
                  filteredFaculty.map((facultyMember) => {
                    const attendanceRecord = attendance.find(a => a.faculty_id === facultyMember.id);
                    const status = attendanceRecord?.status || 'Not Marked';
                    
                    return (
                      <TableRow key={facultyMember.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Box 
                              bgcolor="grey.100" 
                              width={40} 
                              height={40} 
                              borderRadius="50%" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                              mr={2}
                            >
                              <PersonIcon color="action" />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2">{facultyMember.full_name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                {facultyMember.employee_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {facultyMember.department_id}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center">
                            {getStatusIcon(status)}
                            <Box ml={1}>
                              {getStatusText(status)}
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="textSecondary">
                        No faculty members found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
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
    </LocalizationProvider>
  );
};

export default FacultyAttendance;
