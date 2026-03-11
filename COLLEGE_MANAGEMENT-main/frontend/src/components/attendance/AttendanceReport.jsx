import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  CircularProgress,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search as SearchIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

// Mock data - replace with actual API calls
const mockAttendanceData = [
  { id: 1, name: 'John Doe', rollNumber: '2023001', present: 18, absent: 2, total: 20, percentage: 90 },
  { id: 2, name: 'Jane Smith', rollNumber: '2023002', present: 19, absent: 1, total: 20, percentage: 95 },
  { id: 3, name: 'Robert Johnson', rollNumber: '2023003', present: 17, absent: 3, total: 20, percentage: 85 },
  { id: 4, name: 'Emily Davis', rollNumber: '2023004', present: 20, absent: 0, total: 20, percentage: 100 },
  { id: 5, name: 'Michael Wilson', rollNumber: '2023005', present: 16, absent: 4, total: 20, percentage: 80 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AttendanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [classFilter, setClassFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [attendanceData, setAttendanceData] = useState([]);

  // Mock classes - replace with API call
  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: '1', name: 'Class 1' },
    { id: '2', name: 'Class 2' },
    { id: '3', name: 'Class 3' },
  ];

  useEffect(() => {
    fetchAttendanceData();
  }, [classFilter, startDate, endDate]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setAttendanceData(mockAttendanceData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  const filteredData = attendanceData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getAttendanceSummary = () => {
    const totalStudents = attendanceData.length;
    const totalPresent = attendanceData.reduce((sum, student) => sum + student.present, 0);
    const totalAbsent = attendanceData.reduce((sum, student) => sum + student.absent, 0);
    const avgAttendance = totalStudents > 0 
      ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) 
      : 0;

    return { totalStudents, totalPresent, totalAbsent, avgAttendance };
  };

  const summary = getAttendanceSummary();

  const chartData = [
    { name: 'Present', value: summary.totalPresent },
    { name: 'Absent', value: summary.totalAbsent },
  ];

  const exportToCSV = () => {
    // Simple CSV export
    const headers = ['Name', 'Roll Number', 'Present', 'Absent', 'Total', 'Percentage'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(student => [
        `"${student.name}"`,
        student.rollNumber,
        student.present,
        student.absent,
        student.total,
        `${student.percentage}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Attendance Reports
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              size="small"
            >
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              onClick={fetchAttendanceData}
              startIcon={<SearchIcon />}
              fullWidth
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary" gutterBottom>Total Students</Typography>
            <Typography variant="h4">{summary.totalStudents}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary" gutterBottom>Total Present</Typography>
            <Typography variant="h4" color="success.main">{summary.totalPresent}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary" gutterBottom>Total Absent</Typography>
            <Typography variant="h4" color="error.main">{summary.totalAbsent}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="textSecondary" gutterBottom>Average Attendance</Typography>
            <Typography variant="h4">{summary.avgAttendance}%</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder="Search students..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
        <Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportToCSV}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ display: 'inline-flex' }}
          >
            <Tab value="table" label="Table" />
            <Tab value="bar" label="Bar Chart" />
            <Tab value="pie" label="Pie Chart" />
          </Tabs>
        </Box>
      </Box>

      {/* Data Display */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {viewMode === 'table' && (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Roll Number</TableCell>
                      <TableCell align="right">Present</TableCell>
                      <TableCell align="right">Absent</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.rollNumber}</TableCell>
                        <TableCell align="right">{row.present}</TableCell>
                        <TableCell align="right">{row.absent}</TableCell>
                        <TableCell align="right">{row.total}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'inline-block',
                              p: 0.5,
                              borderRadius: 1,
                              bgcolor: row.percentage >= 75 ? 'success.light' : 'error.light',
                              color: 'common.white',
                              minWidth: 60,
                              textAlign: 'center'
                            }}
                          >
                            {row.percentage}%
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}

          {viewMode === 'bar' && (
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Attendance Overview</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#4caf50" />
                  <Bar dataKey="absent" name="Absent" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {viewMode === 'pie' && (
            <Paper sx={{ p: 2, height: 400, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Attendance Distribution</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default AttendanceReport;
