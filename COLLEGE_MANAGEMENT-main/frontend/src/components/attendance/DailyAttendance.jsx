import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Checkbox, 
  Button, 
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon, 
  Save as SaveIcon,
  Today as TodayIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Mock data - Replace with actual API calls
const mockStudents = [
  { id: 1, studentId: 'S001', name: 'John Doe', class: '10A', status: 'present' },
  { id: 2, studentId: 'S002', name: 'Jane Smith', class: '10A', status: 'absent' },
  { id: 3, studentId: 'S003', name: 'Bob Johnson', class: '10B', status: 'present' },
  { id: 4, studentId: 'S004', name: 'Alice Brown', class: '10B', status: 'present' },
];

const DailyAttendance = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Check if we should mark all as present
  useEffect(() => {
    if (searchParams.get('mark') === 'all') {
      handleMarkAllPresent();
    }
  }, [searchParams]);

  // Fetch attendance data
  useEffect(() => {
    fetchAttendanceData();
  }, [date, selectedClass]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would fetch data from your API
      // const response = await api.get(`/attendance/daily?date=${format(date, 'yyyy-MM-dd')}&class=${selectedClass}`);
      // setStudents(response.data);
      
      setStudents(mockStudents);
      setSelectedStudents(mockStudents.filter(s => s.status === 'present').map(s => s.id));
      setSelectAll(selectedClass === 'all' && mockStudents.every(s => s.status === 'present'));
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allStudentIds = students.map(student => student.id);
      setSelectedStudents(allStudentIds);
      setSelectAll(true);
    } else {
      setSelectedStudents([]);
      setSelectAll(false);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleMarkAllPresent = () => {
    const allStudentIds = students.map(student => student.id);
    setSelectedStudents(allStudentIds);
    setSelectAll(true);
  };

  const handleMarkAllAbsent = () => {
    setSelectedStudents([]);
    setSelectAll(false);
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would save the attendance to your API
      // await api.post('/attendance/save', {
      //   date: format(date, 'yyyy-MM-dd'),
      //   class: selectedClass,
      //   attendance: students.map(student => ({
      //     studentId: student.id,
      //     status: selectedStudents.includes(student.id) ? 'present' : 'absent'
      //   }))
      // });
      
      toast.success('Attendance saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term and selected class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                         student.studentId.toLowerCase().includes(searchTerm);
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          <TodayIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Daily Attendance
        </Typography>
        
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Class"
                  onChange={handleClassChange}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  <MenuItem value="10A">Class 10A</MenuItem>
                  <MenuItem value="10B">Class 10B</MenuItem>
                  <MenuItem value="11A">Class 11A</MenuItem>
                  <MenuItem value="11B">Class 11B</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search students"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton 
                  color="primary" 
                  onClick={fetchAttendanceData}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                disabled={loading}
              >
                Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Button 
              variant="outlined" 
              onClick={handleMarkAllPresent}
              disabled={loading || students.length === 0}
              sx={{ mr: 1 }}
            >
              Mark All Present
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleMarkAllAbsent}
              disabled={loading || students.length === 0}
            >
              Mark All Absent
            </Button>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveAttendance}
            disabled={loading || students.length === 0}
          >
            {loading ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
                    checked={selectAll && students.length > 0}
                    onChange={handleSelectAll}
                    disabled={loading || students.length === 0}
                  />
                </TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>Loading attendance data...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1">No students found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow 
                    key={student.id}
                    hover
                    sx={{ 
                      '&:hover': { cursor: 'pointer' },
                      bgcolor: selectedStudents.includes(student.id) ? 'action.hover' : 'inherit'
                    }}
                    onClick={() => handleSelectStudent(student.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                      />
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell align="center">
                      <Box 
                        component="span"
                        sx={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: selectedStudents.includes(student.id) ? 'success.main' : 'error.main',
                          mr: 1
                        }}
                      />
                      {selectedStudents.includes(student.id) ? 'Present' : 'Absent'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DailyAttendance;
