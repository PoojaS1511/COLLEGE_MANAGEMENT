import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Box, Grid, Paper, Typography, CircularProgress, Button, 
  FormControl, InputLabel, Select, MenuItem, TextField, 
  FormGroup, FormControlLabel, Checkbox, Divider, Stack, Tabs, Tab,
  Card, CardContent, CardHeader, Chip, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LabelList, LineChart, Line
} from 'recharts';
import { format, subMonths, parseISO } from 'date-fns';
import AnalyticsService from '../../../services/analyticsService';
import { supabase } from '../../../services/supabaseClient';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// Define scrollbar styles that work with Material-UI
const scrollbarStyles = {
  '& .MuiPaper-root': {
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
      '&:hover': {
        background: '#555',
      },
    },
  },
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
      return 'warning';
    case 'waitlisted':
      return 'info';
    default:
      return 'default';
  }
};

const tabProps = (index) => ({
  id: `tab-${index}`,
  'aria-controls': `tabpanel-${index}`,
});

const AdmissionAnalytics = () => {
  const [admissionData, setAdmissionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  // Initialize state
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Initialize filters with proper default values
  const [filters, setFilters] = useState({
    dateRange: {
      start: subMonths(new Date(), 6),
      end: new Date(),
    },
    applicationDateRange: {
      start: null,
      end: null,
    },
    statuses: ['pending', 'approved', 'rejected'],
    courses: [],
    departments: [],
    sources: [],
    schoolTypes: [],
    genders: [],
    searchQuery: '',
    academicYear: '',
    minMarks: '',
    maxMarks: ''
  });
  
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byDate: [],
    recentApplications: [],
    source_distribution: [],
    course_distribution: [],
    department_distribution: [],
    gender_distribution: [],
    school_type_distribution: []
  });

  /**
   * Fetches admission data with fallback to direct database query if analytics endpoint fails
   // Fetch admission data with filters
  const fetchAdmissionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare query parameters
      const params = {};
      
      // Add date range if available
      if (filters.dateRange?.start) {
        params.start_date = format(filters.dateRange.start, 'yyyy-MM-dd');
      }
      if (filters.dateRange?.end) {
        params.end_date = format(filters.dateRange.end, 'yyyy-MM-dd');
      }
      
      // Add status filter if any statuses are selected
      if (filters.statuses?.length > 0) {
        params.statuses = filters.statuses.join(',');
      }
      
      // Add other filters if they exist
      if (filters.courses?.length > 0) params.courses = filters.courses.join(',');
      if (filters.departments?.length > 0) params.departments = filters.departments.join(',');
      if (filters.sources?.length > 0) params.sources = filters.sources.join(',');
      if (filters.schoolTypes?.length > 0) params.school_types = filters.schoolTypes.join(',');
      if (filters.genders?.length > 0) params.genders = filters.genders.join(',');
      
      console.log('Fetching data with params:', params);
      
      // Make the API call
      const response = await AnalyticsService.getAdmissionAnalytics(params);
      
      if (!response || !response.data) {
        throw new Error('Invalid response format from server');
      }
      
      const { data } = response;
      
      // Transform the data to match our frontend format
      const statusData = {};
      if (data.applicationsByStatus) {
        data.applicationsByStatus.forEach(item => {
          statusData[item.status] = item.count;
        });
      }
      
      const dateSeries = data.admissionTrends || [];
      
      // Update state with the transformed data
      setAdmissionData([]); // We don't have individual records in the current response
      setStats(prevStats => ({
        ...prevStats,
        total: data.totalApplications || 0,
        byStatus: statusData,
        byDate: dateSeries,
        source_distribution: data.applicationsBySource || [],
        department_distribution: data.applicationsByDepartment || [],
        gender_distribution: data.genderDistribution || [],
        school_type_distribution: data.applicationsBySchoolType || []
      }));
      
      // If we don't have recent applications, try to fetch them separately
      if (!data.recentApplications || data.recentApplications.length === 0) {
        try {
          const { data: recentData } = await AnalyticsService.getAdmissionApplications({
            start_date: params.start_date,
            end_date: params.end_date,
            status: filters.statuses?.join(','),
            limit: 5,
            sort: 'created_at',
            order: 'desc'
          });
          
          setStats(prevStats => ({
            ...prevStats,
            recentApplications: recentData || []
          }));
        } catch (recentError) {
          console.warn('Could not fetch recent applications:', recentError);
        }
      }
    } catch (err) {
      console.error('Error in fetchAdmissionData:', err);
      setError(err.message || 'Failed to load admission data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchAdmissionData();
  }, [fetchAdmissionData]);

  // Subscribe to real-time updates
  useEffect(() => {
    let subscription;
    
    const setupSubscription = async () => {
      try {
        subscription = supabase
          .from('admission_applications')
          .on('INSERT', (payload) => {
            console.log('Received admission update:', payload);
            // Refresh data when an admission is created, updated, or deleted
            fetchAdmissionData();
          })
          .subscribe();
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (subscription && typeof subscription === 'function') {
        subscription();
      }
    };
  }, [fetchAdmissionData]);

  // Handle date range changes
  const handleDateRangeChange = (field) => (date) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date
      }
    }));
  };

  // Handle source change
  const handleSourceChange = (source) => (event) => {
    const newSources = event.target.checked
      ? [...filters.sources, source]
      : filters.sources.filter(s => s !== source);
    
    setFilters(prev => ({
      ...prev,
      sources: newSources.length > 0 ? newSources : allSources
    }));
  };

  // Prepare data for charts
  const statusData = useMemo(() => {
    if (!stats.byStatus) return [];
    return Object.entries(stats.byStatus).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: Math.round((count / (stats.total || 1)) * 100) || 0
    }));
  }, [stats.byStatus, stats.total]);
  
  // Set default data if not available
  const data = useMemo(() => ({
    status_summary: {
      total_applications: stats.total || 0,
      pending_applications: stats.byStatus?.pending || 0,
      approved_applications: stats.byStatus?.approved || 0,
      rejected_applications: stats.byStatus?.rejected || 0
    },
    gender_distribution: stats.gender_distribution || [],
    school_type_distribution: stats.school_type_distribution || [],
    source_distribution: stats.source_distribution || [],
    course_distribution: stats.course_distribution || [],
    department_distribution: stats.department_distribution || [],
    monthly_trends: stats.byDate || [],
    // Add empty arrays for other required data structures
    age_distribution: [],
    category_distribution: [],
    school_analysis: []
  }), [stats]);
  
  // Get unique values for filter options
  const allSources = useMemo(() => 
    [...new Set(stats.source_distribution?.map(item => item.source) || [])], 
    [stats.source_distribution]
  );
  
  const allCourses = useMemo(() => 
    stats.course_distribution?.map(item => item.course) || [], 
    [stats.course_distribution]
  );
  
  const allDepartments = useMemo(() => 
    [...new Set(stats.department_distribution?.map(item => item.department) || [])], 
    [stats.department_distribution]
  );
  
  const allSchoolTypes = useMemo(() => 
    [...new Set(stats.school_type_distribution?.map(item => item.school_type) || [])], 
    [stats.school_type_distribution]
  );
  
  const allGenders = useMemo(() => 
    [...new Set(stats.gender_distribution?.map(item => item.gender) || [])], 
    [stats.gender_distribution]
  );

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Render loading state
  if (loading && admissionData.length === 0) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh" gap={2}>
        <CircularProgress />
        <Typography variant="body1">Loading admission analytics...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box m={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchAdmissionData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  // Update last updated timestamp when data changes
  useEffect(() => {
    if (admissionData.length > 0) {
      setLastUpdated(new Date());
    }
  }, [admissionData]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admission Analytics
        </Typography>
        
        {/* Filters Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            {/* Status Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  multiple
                  value={filters.statuses}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({
                      ...filters,
                      statuses: typeof value === 'string' ? value.split(',') : value,
                    });
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={statusOptions.find(opt => opt.value === value)?.label || value}
                          size="small"
                          color={getStatusColor(value)}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Checkbox checked={filters.statuses.includes(option.value)} />
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Search Query */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Applications"
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                placeholder="Search by name, email, or ID..."
              />
            </Grid>

            {/* Academic Year */}
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Academic Year"
                value={filters.academicYear}
                onChange={(e) =>
                  setFilters({ ...filters, academicYear: e.target.value })
                }
                placeholder="e.g., 2023-2024"
              />
            </Grid>

            {/* Date Range Picker */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Application Date Range</Typography>
              <Box display="flex" gap={1}>
                <DatePicker
                  label="Start Date"
                  value={filters.applicationDateRange.start}
                  onChange={(date) =>
                    setFilters({
                      ...filters,
                      applicationDateRange: {
                        ...filters.applicationDateRange,
                        start: date,
                      },
                    })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="End Date"
                  value={filters.applicationDateRange.end}
                  onChange={(date) =>
                    setFilters({
                      ...filters,
                      applicationDateRange: {
                        ...filters.applicationDateRange,
                        end: date,
                      },
                    })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={filters.applicationDateRange.start}
                />
              </Box>
            </Grid>

            {/* Apply Filters Button */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  // Reset filters to default
                  setFilters({
                    dateRange: {
                      start: subMonths(new Date(), 6),
                      end: new Date(),
                    },
                    applicationDateRange: {
                      start: null,
                      end: null,
                    },
                    statuses: ['pending', 'approved', 'rejected'],
                    courses: [],
                    departments: [],
                    sources: [],
                    schoolTypes: [],
                    genders: [],
                    searchQuery: '',
                    academicYear: '',
                    minMarks: '',
                    maxMarks: ''
                  });
                }}
              >
                Reset Filters
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchAdmissionData}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Applying...' : 'Apply Filters'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="admission analytics tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Overview" {...tabProps(0)} />
              <Tab label="Department Analytics" {...tabProps(1)} />
              <Tab label="Demographics" {...tabProps(2)} />
              <Tab label="School Analysis" {...tabProps(3)} />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ mt: 3 }}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Box>
                {/* Status Summary Cards */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {data.status_summary.total_applications.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Applications
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main">
                        {data.status_summary.pending_applications.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Pending
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">
                        {data.status_summary.approved_applications.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Approved
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="error.main">
                        {data.status_summary.rejected_applications.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Rejected
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {/* Status Distribution Pie Chart */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom>Application Status</Typography>
                      <Box height={400}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name, props) => [
                                `${value} applications (${(props.payload.percent * 100).toFixed(1)}%)`,
                                name
                              ]} 
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Application Trends Line Chart */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="h6" gutterBottom>Application Trends</Typography>
                      <Box height={400}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={data.monthly_trends}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="count"
                              name="Applications"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Department Analytics Tab */}
            {activeTab === 1 && (
              <Box>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Department-wise Distribution</Typography>
                  <Box height={500}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.department_distribution}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="Applications" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="approval_rate" name="Approval Rate %" fill="#82ca9d">
                          <LabelList 
                            dataKey="approval_rate" 
                            position="top" 
                            formatter={(value) => `${value}%`}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Demographics Tab */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                {/* Gender Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
                    <Box height={400}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.gender_distribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="gender"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {data.gender_distribution?.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} students (${(props.payload.percent * 100).toFixed(1)}%)`,
                              name
                            ]} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>

                {/* School Type Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>School Type Distribution</Typography>
                    <Box height={400}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={data.school_type_distribution}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="school_type" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Students" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* School Analysis Tab */}
            {activeTab === 3 && (
              <Box>
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>School Performance Analysis</Typography>
                  <Box height={500}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 20,
                        }}
                      >
                        <CartesianGrid />
                        <XAxis 
                          type="number" 
                          dataKey="avg_score" 
                          name="Average Score" 
                          label={{ value: 'Average Academic Score', position: 'bottom' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="admission_rate" 
                          name="Admission Rate" 
                          label={{ value: 'Admission Rate %', angle: -90, position: 'left' }}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="total_students" 
                          range={[60, 400]} 
                          name="Total Students"
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          formatter={(value, name, props) => {
                            if (name === 'School Type') return [props.payload.school_type, name];
                            if (name === 'Average Score') return [value, name];
                            if (name === 'Admission Rate') return [`${value}%`, name];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Scatter 
                          name="Schools" 
                          data={data.school_analysis} 
                          fill="#8884d8"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AdmissionAnalytics;
                />
                <TextField
                  fullWidth
                  label="Max Marks %"
                  type="number"
                  value={filters.maxMarks}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    maxMarks: e.target.value ? Math.min(100, Math.max(0, e.target.value)) : ''
                  }))}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Box>
            </Grid>

            {/* Date Range Picker */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Report Date Range</Typography>
              <Box display="flex" gap={1}>
                <DatePicker
                  label="Start Date"
                  value={filters.dateRange.start}
                  onChange={handleDateRangeChange('start')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  maxDate={filters.dateRange.end || new Date()}
                />
                <DatePicker
                  label="End Date"
                  value={filters.dateRange.end}
                  onChange={handleDateRangeChange('end')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={filters.dateRange.start}
                  maxDate={new Date()}
                />
              </Box>
            </Grid>

            {/* Application Date Range Picker */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>Application Date Range</Typography>
              <Box display="flex" gap={1}>
                <DatePicker
                  label="App Start Date"
                  value={filters.applicationDateRange.start}
                  onChange={(date) => setFilters(prev => ({
                    ...prev,
                    applicationDateRange: {
                      ...prev.applicationDateRange,
                      start: date
                    }
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  maxDate={filters.applicationDateRange.end || null}
                />
                <DatePicker
                  label="App End Date"
                  value={filters.applicationDateRange.end}
                  onChange={(date) => setFilters(prev => ({
                    ...prev,
                    applicationDateRange: {
                      ...prev.applicationDateRange,
                      end: date
                    }
                  }))}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={filters.applicationDateRange.start || null}
                  maxDate={new Date()}
                />
              </Box>
            </Grid>
            
            {/* Status Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.statuses}
                  onChange={handleStatusChange}
                  renderValue={(selected) => selected.map(s => 
                    statusOptions.find(opt => opt.value === s)?.label || s
                  ).join(', ')}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      <Checkbox checked={filters.statuses.indexOf(status.value) > -1} />
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Course Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Courses</InputLabel>
                <Select
                  multiple
                  value={filters.courses}
                  onChange={handleCourseChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {allCourses.map((course) => (
                    <MenuItem key={course} value={course}>
                      <Checkbox checked={filters.courses.indexOf(course) > -1} />
                      {course}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Source Filter */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Sources</Typography>
              <FormGroup row>
                {allSources.map((source) => (
                  <FormControlLabel
                    key={source}
                    control={
                      <Checkbox
                        checked={filters.sources.includes(source)}
                        onChange={handleSourceChange(source)}
                      />
                    }
                    label={source}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>

          {/* Marks Range */}
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                label="Min Marks %"
                type="number"
                value={filters.minMarks}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minMarks: e.target.value ? Math.min(100, Math.max(0, e.target.value)) : ''
                }))}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
              <TextField
                fullWidth
                label="Max Marks %"
                type="number"
                value={filters.maxMarks}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maxMarks: e.target.value ? Math.min(100, Math.max(0, e.target.value)) : ''
                }))}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Box>
          </Grid>

          {/* Date Range Picker */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Report Date Range</Typography>
            <Box display="flex" gap={1}>
              <DatePicker
                label="Start Date"
                value={filters.dateRange.start}
                onChange={handleDateRangeChange('start')}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={filters.dateRange.end || new Date()}
              />
              <DatePicker
                label="End Date"
                value={filters.dateRange.end}
                onChange={handleDateRangeChange('end')}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={filters.dateRange.start}
                maxDate={new Date()}
              />
            </Box>
          </Grid>

          {/* Application Date Range Picker */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>Application Date Range</Typography>
            <Box display="flex" gap={1}>
              <DatePicker
                label="App Start Date"
                value={filters.applicationDateRange.start}
                onChange={(date) => setFilters(prev => ({
                  ...prev,
                  applicationDateRange: {
                    ...prev.applicationDateRange,
                    start: date
                  }
                }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={filters.applicationDateRange.end || null}
              />
              <DatePicker
                label="App End Date"
                value={filters.applicationDateRange.end}
                onChange={(date) => setFilters(prev => ({
                  ...prev,
                  applicationDateRange: {
                    ...prev.applicationDateRange,
                    end: date
                  }
                }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={filters.applicationDateRange.start || null}
                maxDate={new Date()}
              />
            </Box>
          </Grid>
          
          {/* Status Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={filters.statuses}
                onChange={handleStatusChange}
                renderValue={(selected) => selected.map(s => 
                  statusOptions.find(opt => opt.value === s)?.label || s
                ).join(', ')}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Checkbox checked={filters.statuses.indexOf(status.value) > -1} />
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Course Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Courses</InputLabel>
              <Select
                multiple
                value={filters.courses}
                onChange={handleCourseChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {allCourses.map((course) => (
                  <MenuItem key={course} value={course}>
                    <Checkbox checked={filters.courses.indexOf(course) > -1} />
                    {course}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Source Filter */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Sources</Typography>
            <FormGroup row>
              {allSources.map((source) => (
                <FormControlLabel
                  key={source}
                  control={
                    <Checkbox
                      checked={filters.sources.includes(source)}
                      onChange={handleSourceChange(source)}
                    />
                  }
                  label={source}
                />
              ))}
            </FormGroup>
          </Grid>
        </Grid>
      </Box>
    </Paper>

    <Box sx={{ mt: 3 }}>
      <Paper sx={{ mb: 3, p: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="analytics tabs"
        >
          <Tab label="Overview" {...tabProps(0)} />
          <Tab label="Department Analytics" {...tabProps(1)} />
          <Tab label="Demographics" {...tabProps(2)} />
          <Tab label="School Analysis" {...tabProps(3)} />
        </Tabs>
      </Paper>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Department Filter - Only show when on Department Analytics tab */}
          {activeTab === 1 && allDepartments.length > 0 && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Filter by Department</InputLabel>
                <Select
                  multiple
                  value={filters.departments}
                  onChange={handleDepartmentChange}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {allDepartments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      <Checkbox checked={filters.departments.indexOf(dept) > -1} />
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Gender Filter - Show for all tabs */}
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" gutterBottom>Gender Distribution</Typography>
              <FormGroup row>
                {allGenders.map((gender) => (
                  <FormControlLabel
                    key={gender}
                    control={
                      <Checkbox
                        checked={filters.genders.map(g => g.toLowerCase()).includes(gender.toLowerCase())}
                        onChange={(e) => {
                          const newGenders = e.target.checked
                            ? [...filters.genders, gender.toLowerCase()]
                            : filters.genders.filter(g => g.toLowerCase() !== gender.toLowerCase());
                          setFilters(prev => ({
                            ...prev,
                            genders: newGenders.length > 0 ? newGenders : allGenders.map(g => g.toLowerCase())
                          }));
                        }}
                      />
                    }
                    label={`${gender} (${data.gender_distribution?.find(g => g.gender.toLowerCase() === gender.toLowerCase())?.count || 0})`}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Grid>

          {/* School Type Filter - Only show when on School Analysis tab */}
          {activeTab === 3 && (
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle2" gutterBottom>School Type</Typography>
                <FormGroup row>
                  {allSchoolTypes.map((type) => (
                    <FormControlLabel
                      key={type}
                      control={
                        <Checkbox
                          checked={filters.schoolTypes.includes(type)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...filters.schoolTypes, type]
                              : filters.schoolTypes.filter(t => t !== type);
                            setFilters(prev => ({
                              ...prev,
                              schoolTypes: newTypes.length > 0 ? newTypes : allSchoolTypes
                            }));
                          }}
                        />
                      }
                      label={`${type} (${data.school_type_distribution?.find(t => t.school_type === type)?.count || 0})`}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </Grid>
          )}
        </Grid>

        {/* Tab Panels */}
        <Box sx={{ mt: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && data?.status_summary && (
            <Box>
              {/* Status Summary Cards */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {data.status_summary.total_applications?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Applications
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="info.main">
                      {data.status_summary.pending_applications?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {data.status_summary.approved_applications?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Approved
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="error.main">
                      {data.status_summary.rejected_applications?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rejected
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Gender Distribution Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Gender Distribution</Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.gender_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="gender"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.gender_distribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} students (${(props.payload.percent * 100).toFixed(1)}%)`,
                        name
                      ]} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Location Distribution */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Location Distribution</Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.location_distribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="location" 
                      type="category" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} students`, 'Count']} 
                      labelFormatter={(label) => `Location: ${label}`}
                    />
                    <Bar dataKey="count" fill="#8884d8" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Monthly Trends */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Monthly Admission Trends</Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.monthly_trends}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                    <Bar dataKey="approved" fill="#82ca9d" name="Approved" />
                    <Bar dataKey="rejected" fill="#ff8042" name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Course Distribution */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Applications by Course</Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.course_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="applications"
                      nameKey="course"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.course_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [
                      `${value} applications (${(props.payload.percent * 100).toFixed(1)}%)`,
                      name
                    ]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Source Distribution */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Applications by Source</Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.source_distribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="source" type="category" />
                    <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                    <Bar dataKey="count" fill="#8884d8" name="Applications" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* School Type Distribution */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>School Type Distribution</Typography>
              <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.school_type_distribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="school_type" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                    <Bar dataKey="count" fill="#82ca9d" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
            </>
          )}

          {/* Department Analytics Tab */}
          {activeTab === 1 && data.department_distribution && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Department-wise Admission Statistics</Typography>
                <Box height={500}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.department_distribution}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total_applications" name="Total Applications" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="approval_rate" name="Approval Rate %" fill="#82ca9d">
                        <LabelList 
                          dataKey="approval_rate" 
                          position="top" 
                          formatter={(value) => `${value}%`}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Demographics Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Age Distribution</Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.age_distribution}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="age_group" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                        <Bar dataKey="count" fill="#ffc658" name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Category Distribution</Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.category_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="category"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.category_distribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [
                          `${value} students (${(props.payload.percent * 100).toFixed(1)}%)`,
                          name
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* School Analysis Tab */}
          {activeTab === 3 && data.school_analysis && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>School Type Performance</Typography>
                  <Box height={500}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 20,
                          left: 20,
                        }}
                      >
                        <CartesianGrid />
                        <XAxis 
                          type="number" 
                          dataKey="avg_score" 
                          name="Average Score" 
                          label={{ value: 'Average Academic Score', position: 'bottom' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="admission_rate" 
                          name="Admission Rate" 
                          label={{ value: 'Admission Rate %', angle: -90, position: 'left' }}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="total_students" 
                          range={[60, 400]} 
                          name="Total Students"
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }} 
                          formatter={(value, name, props) => {
                            if (name === 'School Type') return [props.payload.school_type, name];
                            if (name === 'Average Score') return [value, name];
                            if (name === 'Admission Rate') return [`${value}%`, name];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Scatter 
                          name="Schools" 
                          data={data.school_analysis} 
                          fill="#8884d8"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
        
        {/* Debug View - Only shown in development */}
        {process.env.NODE_ENV === 'development' && (
          <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={1}>
            <Typography variant="h6" gutterBottom>Debug Information</Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              <Box>
                <Typography variant="subtitle2">Loading State:</Typography>
                <Typography variant="body2" color={loading ? 'primary.main' : 'text.secondary'}>
                  {loading ? 'Loading...' : 'Idle'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Last Updated:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Data Status:</Typography>
                <Typography variant="body2" color={data ? 'success.main' : 'error.main'}>
                  {data ? 'Data Loaded' : 'No Data'}
                </Typography>
              </Box>
            </Box>
            
            {error && (
              <Box mt={2} p={1} bgcolor="error.light" borderRadius={1}>
                <Typography variant="subtitle2" color="error.dark">Error:</Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {error}
                </Typography>
              </Box>
            )}
            
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>Current Filters:</Typography>
              <Typography variant="caption" component="pre" sx={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: 'background.paper', 
                p: 1, 
                borderRadius: 1,
                fontSize: '0.75rem',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {JSON.stringify(filters, null, 2)}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AdmissionAnalytics;
