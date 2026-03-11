import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Grid, Typography, CircularProgress, Card, CardContent, useTheme, useMediaQuery
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area
} from 'recharts';
import { format, subMonths, parseISO } from 'date-fns';
import { supabase } from '../../../services/supabaseClient';
import realtimeService from '../../../services/realtimeService';
import AcademicService from '../../../services/academicService';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EnrollmentAnalytics = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for enrollment data
  
  // State for enrollment data
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [courses, setCourses] = useState({}); // Store course ID to name mapping
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all enrollment data and courses
  const fetchEnrollmentData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch courses first to get the mapping of IDs to names
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, code');
      
      if (coursesError) throw coursesError;
      
      // Create a mapping of course IDs to course names
      const coursesMap = {};
      coursesData.forEach(course => {
        coursesMap[course.id] = course.name || `Course ${course.code}`;
      });
      setCourses(coursesMap);
      
      // Fetch enrollment data with course names
      const { data, error } = await supabase
        .from('admission_applications')
        .select('*');
      
      if (error) throw error;
      
      // Add course names to enrollment data
      const enrichedData = data.map(record => ({
        ...record,
        course_name: record.course_id ? (coursesMap[record.course_id] || `Course ${record.course_id}`) : 'Not Specified'
      }));
      
      setEnrollmentData(enrichedData);
    } catch (err) {
      console.error('Error fetching enrollment data:', err);
      setError('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    let subscription;
    
    const setupSubscription = async () => {
      try {
        // Subscribe to enrollment changes
        subscription = realtimeService.subscribeToTable(
          'admission_applications',
          '*',
          () => {
            console.log('Enrollment data changed, refreshing...');
            fetchEnrollmentData();
          }
        );
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription && typeof subscription === 'function') {
        subscription();
      }
    };
  }, [fetchEnrollmentData]);
  
  // Process data for enrollment trend chart
  const getEnrollmentTrend = () => {
    if (!enrollmentData || enrollmentData.length === 0) return [];
    
    // Group by month
    const monthlyData = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = format(date, 'MMM yyyy');
      monthlyData[monthYear] = 0;
    }
    
    // Count applications per month
    enrollmentData.forEach(record => {
      if (record.created_at) {
        const date = new Date(record.created_at);
        const monthYear = format(date, 'MMM yyyy');
        if (monthlyData.hasOwnProperty(monthYear)) {
          monthlyData[monthYear]++;
        }
      }
    });
    
    // Convert to array format for recharts
    return Object.entries(monthlyData).map(([name, applications]) => ({
      name,
      applications
    }));
  };
  
  // Process data for enrollment by department
  const getEnrollmentByDepartment = useMemo(() => {
    if (!enrollmentData || enrollmentData.length === 0) return [];
    
    const departmentCounts = {};
    
    // Count enrollments by course
    enrollmentData.forEach(record => {
      const courseName = record.course_name || 'Not Specified';
      
      if (!departmentCounts[courseName]) {
        departmentCounts[courseName] = {
          name: courseName,
          count: 0,
        };
      }
      
      departmentCounts[courseName].count += 1;
    });
    
    // Convert to array and sort by count
    return Object.values(departmentCounts).sort((a, b) => b.count - a.count);
  }, [enrollmentData]);
  
  // Process data for department distribution chart
  const getDepartmentDistribution = () => {
    if (!enrollmentData || enrollmentData.length === 0) return [];
    
    const departmentCounts = {};
    
    // Count enrollments by course
    enrollmentData.forEach(record => {
      const courseName = record.course_name || 'Not Specified';
      
      if (!departmentCounts[courseName]) {
        departmentCounts[courseName] = 0;
      }
      
      departmentCounts[courseName] += 1;
    });
    
    // Convert to array format for the chart
    return Object.entries(departmentCounts).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  // Get status distribution from enrollment data
  const getStatusDistribution = () => {
    const statusCounts = {};
    enrollmentData.forEach(record => {
      const status = record.status ? record.status.trim().toLowerCase() : 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    // Debug log to see all statuses and their counts
    console.log('Status counts:', statusCounts);
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter for display
      value,
      originalName: name // Keep original name for internal use
    }));
  };
  
  
  const getMonthlyTrend = () => {
    const monthlyData = {};
    const sixMonthsAgo = subMonths(new Date(), 6);
    
    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthYear = format(date, 'MMM yyyy');
      monthlyData[monthYear] = 0;
    }
    
    // Count applications per month
    enrollmentData.forEach(record => {
      const date = parseISO(record.created_at);
      if (date >= sixMonthsAgo) {
        const monthYear = format(date, 'MMM yyyy');
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
      }
    });
    
    return Object.entries(monthlyData).map(([name, count]) => ({
      name,
      applications: count
    }));
  };
  
  
  if (loading && enrollmentData.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  const departmentData = getDepartmentDistribution();
  const statusData = getStatusDistribution();
  const trendData = getMonthlyTrend();
  
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Enrollment Analytics</Typography>
      
      {/* Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Applications</Typography>
              <Typography variant="h4">{enrollmentData.length || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Departments</Typography>
              <Typography variant="h4">
                {enrollmentData.length > 0 
                  ? new Set(enrollmentData.map(item => item.course_id).filter(Boolean)).size 
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Acceptance Rate</Typography>
              <Typography variant="h4">
                {enrollmentData.length > 0
                  ? (() => {
                      const approvedCount = enrollmentData.filter(item => 
                        item.status && item.status.toString().toLowerCase() === 'approved'
                      ).length;
                      console.log('Approved applications:', approvedCount, 'out of', enrollmentData.length);
                      return `${Math.round((approvedCount / enrollmentData.length) * 100)}%`;
                    })()
                  : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        {/* Department Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Department Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {departmentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        
        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={statusData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        
        {/* Monthly Trend */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Enrollment Trend (Last 6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={trendData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="applications"
                  fill="#8884d8"
                  stroke="#8884d8"
                  name="Applications"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="applications"
                  stroke="#ff7300"
                  name="Trend"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EnrollmentAnalytics;
