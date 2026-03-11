import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  FormControl, 
  Grid, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import ReportService from '../../services/reportService';
import { useAuth } from '../../contexts/AuthContext';

const ReportManager = () => {
  const { hasPermission } = useAuth();
  const [reportType, setReportType] = useState('exam');
  const [format, setFormat] = useState('pdf');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reportHistory, setReportHistory] = useState([]);

  // Available report types and their configurations
  const reportTypes = [
    { 
      id: 'exam', 
      label: 'Exam Report',
      description: 'Generate reports for exam schedules, results, and analytics',
      availableFormats: ['pdf', 'xlsx', 'csv']
    },
    { 
      id: 'fee', 
      label: 'Fee Report',
      description: 'Generate reports for fee collections, dues, and receipts',
      availableFormats: ['pdf', 'xlsx', 'csv']
    },
    { 
      id: 'attendance', 
      label: 'Attendance Report',
      description: 'Generate attendance reports for students and classes',
      availableFormats: ['pdf', 'xlsx']
    },
    { 
      id: 'student', 
      label: 'Student Report',
      description: 'Generate detailed student reports and progress cards',
      availableFormats: ['pdf']
    }
  ];

  // Load report history on component mount
  useEffect(() => {
    loadReportHistory();
  }, []);

  const loadReportHistory = async () => {
    try {
      setLoading(true);
      const response = await ReportService.getReportHistory();
      if (response.success) {
        setReportHistory(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load report history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!hasPermission('canViewReports')) {
      showSnackbar('You do not have permission to generate reports', 'error');
      return;
    }

    try {
      setLoading(true);
      const reportFilters = {
        ...filters,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        format
      };

      let response;
      if (reportType === 'exam') {
        response = await ReportService.generateExamReport(reportFilters);
      } else if (reportType === 'fee') {
        response = await ReportService.generateFeeReport(reportFilters);
      }

      if (response?.success) {
        showSnackbar(`Report generated successfully: ${response.filename}`, 'success');
        loadReportHistory();
      }
    } catch (error) {
      showSnackbar(`Failed to generate report: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadHistory = async (reportId, filename) => {
    try {
      // This would be implemented to download a previously generated report
      // For now, we'll just show a success message
      showSnackbar(`Downloading report: ${filename}`, 'info');
    } catch (error) {
      showSnackbar(`Failed to download report: ${error.message}`, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const selectedReport = reportTypes.find(rt => rt.id === reportType);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Generate Report" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      label="Report Type"
                    >
                      {reportTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {selectedReport?.description}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      label="Format"
                    >
                      {selectedReport?.availableFormats.map((fmt) => (
                        <MenuItem key={fmt} value={fmt}>
                          {fmt.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth size="small" />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateReport}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Report History" 
              action={
                <Tooltip title="Refresh">
                  <IconButton onClick={loadReportHistory} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Generated On</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportHistory.length > 0 ? (
                      reportHistory.map((report) => (
                        <TableRow key={report.id} hover>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>{report.type}</TableCell>
                          <TableCell>
                            {new Date(report.generatedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{report.format.toUpperCase()}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Download">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDownloadHistory(report.id, report.name)}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No report history available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default ReportManager;
