import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, Tabs, Tab, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, Calendar } from 'lucide-react';
import TransportService from '../../services/transportService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [reportType, setReportType] = useState('attendance');
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const generateReport = async () => {
    try {
      setLoading(true);
      const result = await TransportService.generateReport(reportType, dateRange);
      if (!result.success) throw new Error(result.error);
      setReportData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    alert('Export functionality will be implemented with actual data integration');
  };

  const renderAttendanceReport = () => (
    <Box className="space-y-6">
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: reportData.data.totalDays },
          { label: 'Present Days', value: reportData.data.presentDays, color: 'text-green-600' },
          { label: 'Absent Days', value: reportData.data.absentDays, color: 'text-red-600' },
          { label: 'Percentage', value: `${reportData.data.percentage}%`, color: 'text-blue-600' },
        ].map((stat, i) => (
          <Card key={i}><CardContent>
            <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            <Typography variant="h4" className={`font-bold ${stat.color || ''}`}>{stat.value}</Typography>
          </CardContent></Card>
        ))}
      </Box>
      <Card><CardContent>
        <Typography variant="h6" className="mb-4">Attendance by Route</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.data.byRoute}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#10b981" name="Present" />
            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent></Card>
    </Box>
  );

  const renderFeesReport = () => (
    <Box className="space-y-6">
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Amount', value: TransportService.formatCurrency(reportData.data.totalAmount) },
          { label: 'Collected', value: TransportService.formatCurrency(reportData.data.collected), color: 'text-green-600' },
          { label: 'Pending', value: TransportService.formatCurrency(reportData.data.pending), color: 'text-orange-600' },
          { label: 'Collection Rate', value: `${reportData.data.collectionRate}%`, color: 'text-blue-600' },
        ].map((stat, i) => (
          <Card key={i}><CardContent>
            <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            <Typography variant="h5" className={`font-bold ${stat.color || ''}`}>{stat.value}</Typography>
          </CardContent></Card>
        ))}
      </Box>
      <Card><CardContent>
        <Typography variant="h6" className="mb-4">Fee Collection by Route</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.data.byRoute}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="route_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="collected" fill="#10b981" name="Collected" />
            <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent></Card>
    </Box>
  );

  const renderRoutesReport = () => (
    <Box className="space-y-6">
      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Routes', value: reportData.data.totalRoutes },
          { label: 'Active Routes', value: reportData.data.activeRoutes, color: 'text-green-600' },
          { label: 'Avg Occupancy', value: `${reportData.data.avgOccupancy}%`, color: 'text-blue-600' },
        ].map((stat, i) => (
          <Card key={i}><CardContent>
            <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            <Typography variant="h4" className={`font-bold ${stat.color || ''}`}>{stat.value}</Typography>
          </CardContent></Card>
        ))}
      </Box>
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">Route ID</TableCell>
                <TableCell className="font-semibold">Students</TableCell>
                <TableCell className="font-semibold">Capacity</TableCell>
                <TableCell className="font-semibold">Occupancy</TableCell>
                <TableCell className="font-semibold">On-Time %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.data.byRoute.map((route) => (
                <TableRow key={route.route_id} hover>
                  <TableCell>{route.route_id}</TableCell>
                  <TableCell>{route.students}</TableCell>
                  <TableCell>{route.capacity}</TableCell>
                  <TableCell className="font-medium">{route.occupancy}%</TableCell>
                  <TableCell>{route.onTimePerformance}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );

  const renderDriversReport = () => (
    <Box className="space-y-6">
      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Drivers', value: reportData.data.totalDrivers },
          { label: 'Active Drivers', value: reportData.data.activeDrivers, color: 'text-green-600' },
          { label: 'Avg Experience', value: `${reportData.data.avgExperience} years`, color: 'text-blue-600' },
        ].map((stat, i) => (
          <Card key={i}><CardContent>
            <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            <Typography variant="h4" className={`font-bold ${stat.color || ''}`}>{stat.value}</Typography>
          </CardContent></Card>
        ))}
      </Box>
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">Driver ID</TableCell>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Total Trips</TableCell>
                <TableCell className="font-semibold">On-Time %</TableCell>
                <TableCell className="font-semibold">Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.data.byDriver.slice(0, 10).map((driver) => (
                <TableRow key={driver.driver_id} hover>
                  <TableCell>{driver.driver_id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.trips}</TableCell>
                  <TableCell>{driver.onTime}%</TableCell>
                  <TableCell className="font-medium">{driver.rating} ⭐</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );

  return (
    <Box className="p-6 space-y-6">
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">Reports & Analytics</Typography>
          <Typography variant="body1" color="text.secondary">Generate comprehensive transport reports</Typography>
        </Box>
        <Button variant="contained" startIcon={<Download size={20} />} onClick={exportReport}
          disabled={!reportData} className="bg-blue-600 hover:bg-blue-700">
          Export Report
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card><CardContent>
        <Box className="flex gap-4 flex-wrap">
          <TextField select label="Report Type" value={reportType}
            onChange={(e) => setReportType(e.target.value)} className="w-60">
            <MenuItem value="attendance">Attendance Report</MenuItem>
            <MenuItem value="fees">Fee Collection Report</MenuItem>
            <MenuItem value="routes">Route Efficiency Report</MenuItem>
            <MenuItem value="drivers">Driver Performance Report</MenuItem>
          </TextField>
          <TextField label="Start Date" type="date" value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <Calendar size={20} className="mr-2" /> }} />
          <TextField label="End Date" type="date" value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <Calendar size={20} className="mr-2" /> }} />
          <Button variant="contained" onClick={generateReport} disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <FileText size={20} />}
            className="bg-blue-600 hover:bg-blue-700">
            Generate Report
          </Button>
        </Box>
      </CardContent></Card>

      {reportData && (
        <Box>
          <Card className="mb-4"><CardContent>
            <Typography variant="h5" className="font-bold">{reportData.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Generated on {new Date().toLocaleString()}
            </Typography>
          </CardContent></Card>

          {reportType === 'attendance' && renderAttendanceReport()}
          {reportType === 'fees' && renderFeesReport()}
          {reportType === 'routes' && renderRoutesReport()}
          {reportType === 'drivers' && renderDriversReport()}
        </Box>
      )}
    </Box>
  );
};

export default Reports;