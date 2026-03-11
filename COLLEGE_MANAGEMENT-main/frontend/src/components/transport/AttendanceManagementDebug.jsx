import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, MenuItem, CircularProgress, Alert } from '@mui/material';
import { Search, Calendar, Download } from 'lucide-react';
import TransportService from '../../services/transportService';

const AttendanceManagementDebug = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('2026-01-23'); // Use a date we know has data
  const [filterType, setFilterType] = useState('All');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log('🔄 useEffect triggered for date:', filterDate);
    loadAttendance();
  }, [filterDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading attendance for date:', filterDate);

      const result = await TransportService.getAttendance({ date: filterDate });
      console.log('📡 API Response:', result);

      setDebugInfo({
        apiCalled: true,
        dateUsed: filterDate,
        responseReceived: !!result,
        success: result?.success,
        dataLength: result?.data?.length || 0,
        error: result?.error,
        timestamp: new Date().toISOString()
      });

      if (!result.success) {
        console.error('❌ API call failed:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Setting attendance data:', result.data?.length || 0, 'records');
      setAttendance(result.data || []);
      setError(null);
    } catch (err) {
      console.error('💥 Error in loadAttendance:', err);
      setError(err.message);
      setDebugInfo(prev => ({ ...prev, error: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.entity_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.entity_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || record.entity_type === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Box className="text-center">
          <CircularProgress />
          <Typography className="mt-4">Loading attendance data...</Typography>
          <Typography variant="body2" color="text.secondary">
            Date: {filterDate}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="p-6 space-y-6">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">Attendance Management (DEBUG)</Typography>
          <Typography variant="body1" color="text.secondary">Track transport attendance - Debug Version</Typography>
        </Box>
        <Button variant="contained" onClick={loadAttendance} className="bg-blue-600 hover:bg-blue-700">
          Reload Data
        </Button>
      </Box>

      {/* Debug Info */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent>
          <Typography variant="h6" className="mb-2 text-yellow-800">🔍 Debug Information</Typography>
          <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>API Called:</strong> {debugInfo.apiCalled ? '✅' : '❌'}</div>
            <div><strong>Date:</strong> {debugInfo.dateUsed}</div>
            <div><strong>Success:</strong> {debugInfo.success ? '✅' : '❌'}</div>
            <div><strong>Data Length:</strong> {debugInfo.dataLength}</div>
            <div><strong>Filtered:</strong> {filteredAttendance.length}</div>
            <div><strong>Timestamp:</strong> {debugInfo.timestamp?.split('T')[1]?.split('.')[0]}</div>
          </Box>
          {debugInfo.error && (
            <Typography variant="body2" color="error" className="mt-2">
              Error: {debugInfo.error}
            </Typography>
          )}
        </CardContent>
      </Card>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent>
          <Typography color="text.secondary" variant="body2">Total Records</Typography>
          <Typography variant="h4" className="font-bold">{stats.total}</Typography>
        </CardContent></Card>
        <Card><CardContent>
          <Typography color="text.secondary" variant="body2">Present</Typography>
          <Typography variant="h4" className="font-bold text-green-600">{stats.present}</Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%
          </Typography>
        </CardContent></Card>
        <Card><CardContent>
          <Typography color="text.secondary" variant="body2">Absent</Typography>
          <Typography variant="h4" className="font-bold text-red-600">{stats.absent}</Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : 0}%
          </Typography>
        </CardContent></Card>
      </Box>

      <Card><CardContent>
        <Box className="flex gap-4 flex-wrap">
          <TextField placeholder="Search..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search size={20} className="mr-2 text-gray-400" /> }}
            className="flex-1" size="small" />
          <TextField label="Date" type="date" value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            InputLabelProps={{ shrink: true }} size="small" className="w-48"
            InputProps={{ startAdornment: <Calendar size={20} className="mr-2 text-gray-400" /> }} />
          <TextField select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            size="small" className="w-40">
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
            <MenuItem value="Faculty">Faculty</MenuItem>
          </TextField>
        </Box>
      </CardContent></Card>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">Date</TableCell>
                <TableCell className="font-semibold">Type</TableCell>
                <TableCell className="font-semibold">ID</TableCell>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Route</TableCell>
                <TableCell className="font-semibold">Bus Number</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{TransportService.formatDate(record.date)}</TableCell>
                    <TableCell>
                      <Chip label={record.entity_type} size="small" variant="outlined"
                        color={record.entity_type === 'Student' ? 'primary' : 'secondary'} />
                    </TableCell>
                    <TableCell>{record.entity_id}</TableCell>
                    <TableCell className="font-medium">{record.entity_name}</TableCell>
                    <TableCell>{record.route_id}</TableCell>
                    <TableCell>{record.bus_number}</TableCell>
                    <TableCell>
                      <Chip label={record.status}
                        color={record.status === 'Present' ? 'success' : 'error'} size="small" />
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{record.remarks || '-'}</Typography></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" className="py-8">
                    <Typography variant="h6" color="text.secondary" className="mb-2">
                      📭 No attendance records found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {filterDate} | Total loaded: {attendance.length} | Filtered: {filteredAttendance.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className="mt-2">
                      Check browser console for detailed debug information
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AttendanceManagementDebug;
