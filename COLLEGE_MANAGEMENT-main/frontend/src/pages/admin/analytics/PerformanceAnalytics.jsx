// PerformanceAnalytics Component
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert,
  Table, 
  TableBody,
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  MenuItem,
  IconButton,
  Tooltip as MuiTooltip,
  Button
} from '@mui/material';
import { getMarksAnalytics } from '../../../services/analyticsService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  TableView as TableViewIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths } from 'date-fns';

// Color palette for charts
const CHART_COLORS = [
  '#3f51b5', '#4caf50', '#f44336', '#ff9800', '#9c27b0',
  '#00bcd4', '#ff5722', '#8bc34a', '#e91e63', '#2196f3'
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, minWidth: 150 }} elevation={3}>
        <Typography variant="subtitle2" gutterBottom>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={`tooltip-${index}`} variant="body2" color={entry.color}>
            {entry.name}: {entry.value.toFixed(2)}
            {entry.dataKey === 'pass_rate' ? '%' : ''}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Custom label for pie chart
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PerformanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    summary: {},
    subjectPerformance: [],
    performanceTrends: [],
    topPerformers: [],
    avgMarks: [],
    examMarks: [],
    studentTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'table'

  // Fetch all performance data
  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching performance data with filters:", {
        start_date: filters.start_date,
        end_date: filters.end_date,
        student_id: filters.student_id,
        subject_id: filters.subject_id
      });
      
      // Fetch all data without any filters
      const marksData = await getMarksAnalytics({});
      
      console.log("Received marks data:", marksData);
      
      // Ensure we have valid data
      if (!marksData) {
        throw new Error('No data returned from the server');
      }

      // Process the data with proper fallbacks
      const summary = {
        total_students: marksData.studentPerformance?.length || 0,
        total_subjects: new Set(marksData.subjectPerformance?.map(item => item.subject_id) || []).size,
        average_score: marksData.studentPerformance?.length > 0
          ? marksData.studentPerformance.reduce((sum, item) => 
              sum + (parseFloat(item.avg_marks) || 0), 0) / marksData.studentPerformance.length
          : 0,
        pass_rate: marksData.gradeDistribution?.reduce((sum, item) => 
          item.grade !== 'F' ? sum + (parseFloat(item.percentage) || 0) : sum, 0
        ) || 0,
        total_exams: marksData.examTrends?.length || 0,
        top_performer: marksData.studentPerformance?.[0] || null
      };
      
      console.log("Processed summary:", summary);
      
      setAnalyticsData(prev => ({
        ...prev,
        summary,
        subjectPerformance: marksData.subjectPerformance || [],
        performanceTrends: marksData.examTrends || [],
        topPerformers: marksData.studentPerformance || [],
        avgMarks: marksData.studentPerformance || [],
        examMarks: marksData.examTrends || [],
        studentTrends: marksData.studentTrends || []
      }));
      
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(`Failed to load performance data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we're not using any filters


  // Initial data fetch and refetch when filters change
  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);


  // Toggle chart type
  const toggleChartType = () => {
    setChartType(prev => prev === 'bar' ? 'line' : 'bar');
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Process the data with proper fallbacks
  const processChartData = useCallback(() => {
    const { subjectPerformance = [], performanceTrends = [], topPerformers = [], studentPerformance = [] } = analyticsData;
    
    // Process subject performance data
    const subjectChartData = (subjectPerformance || []).map((item, index) => {
      const avgMarks = parseFloat(item.avg_marks || item.average_score || 0);
      const passRate = parseFloat(item.pass_rate || 0);
      
      return {
        ...item,
        name: item.subject_name || item.name || `Subject ${index + 1}`,
        subject_name: item.subject_name || item.name || `Subject ${index + 1}`,
        average_score: !isNaN(avgMarks) ? avgMarks : 0,
        pass_rate: !isNaN(passRate) ? passRate : 0,
        student_count: item.student_count || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      };
    });
    
    // Process top performers
    const formattedTopPerformers = (topPerformers.length > 0 ? topPerformers : studentPerformance)
      .filter(student => student && (student.avg_marks || student.average_score))
      .sort((a, b) => (b.avg_marks || b.average_score || 0) - (a.avg_marks || a.average_score || 0))
      .slice(0, 10) // Limit to top 10 performers
      .map((student, index) => ({
        ...student,
        rank: index + 1,
        average_score: parseFloat(student.avg_marks || student.average_score || 0).toFixed(1),
        student_name: student.student_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || `Student ${index + 1}`,
        roll_number: student.roll_number || student.student_id || `ID${index + 1}`
      }));
    
    // Process exam trends - ensure we have valid dates and scores
    const examChartData = (performanceTrends || [])
      .filter(trend => trend && (trend.avg_marks || trend.average_score))
      .map(trend => {
        const date = trend.exam_date || trend.date || new Date().toISOString().split('T')[0];
        return {
          ...trend,
          date: date,
          exam_date: date,
          average_score: parseFloat(trend.avg_marks || trend.average_score || 0),
          pass_rate: parseFloat(trend.pass_rate || 0)
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      subjectChartData,
      topPerformers: formattedTopPerformers,
      examChartData
    };
  }, [analyticsData]);
  
  const { subjectChartData, examChartData, topPerformers: formattedTopPerformers } = processChartData();

  const { 
    summary = {
      totalStudents: 0,
      totalSubjects: 0,
      overallAvg: 0,
      passRate: 0,
      topPerformer: null
    }, 
    subjectPerformance = [], 
    performanceTrends = [], 
    studentTrends = []
  } = analyticsData;

  // Prepare data for pass/fail pie chart
  const passRate = summary.passRate || 0;
  
  const passFailData = [
    { name: 'Passed', value: passRate, color: '#4caf50' },
    { name: 'Failed', value: 100 - passRate, color: '#f44336' }
  ];

  // Prepare data for radar chart (subject comparison)
  const radarData = subjectChartData.map(subject => ({
    subject: subject.subject_name,
    'Average Score': subject.average_score,
    fullMark: 100
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="body1" ml={2}>Loading performance data...</Typography>
      </Box>
    );
  }
  
  // Error boundary
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box display="flex" gap={2} mb={3}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={fetchPerformanceData}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            Retry
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => setError(null)}
            disabled={loading}
          >
            Clear Filters
          </Button>
        </Box>
        <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="h6" gutterBottom>Debug Information</Typography>
          <pre style={{ fontSize: '12px', overflowX: 'auto' }}>
            {JSON.stringify({
              filters,
              dataSummary: {
                subjectCount: analyticsData.subjectPerformance?.length,
                studentCount: analyticsData.topPerformers?.length,
                trendCount: analyticsData.performanceTrends?.length
              }
            }, null, 2)}
          </pre>
        </Box>
      </Box>
    );
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Overview
        return (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Overall Performance */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Overall Performance" 
                    action={
                      <IconButton onClick={toggleChartType}>
                        {chartType === 'bar' ? <LineChartIcon /> : <BarChartIcon />}
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent sx={{ height: 400 }}>
                    {subjectChartData.length > 0 ? (
                      chartType === 'bar' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={subjectChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject_name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="average_score" name="Average Score" fill="#3f51b5" />
                            <Bar dataKey="pass_rate" name="Pass Rate %" fill="#4caf50" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={subjectChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject_name" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="average_score" name="Average Score" stroke="#3f51b5" />
                            <Line type="monotone" dataKey="pass_rate" name="Pass Rate %" stroke="#4caf50" />
                          </LineChart>
                        </ResponsiveContainer>
                      )
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography variant="body1" color="textSecondary">
                          No performance data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Pass/Fail Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Pass/Fail Distribution" />
                  <Divider />
                  <CardContent sx={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      Overall Pass Rate: {passRate.toFixed(1)}%
                    </Typography>
                    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                      {subjectPerformance.length > 0 ? (
                        <PieChart width={400} height={300}>
                          <Pie
                            data={passFailData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {passFailData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Legend />
                        </PieChart>
                      ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                          <Typography variant="body1" color="textSecondary">
                            No pass/fail data available
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Subject Comparison */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Subject Comparison" />
                  <Divider />
                  <CardContent sx={{ height: 400 }}>
                    {radarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar 
                            name="Average Score" 
                            dataKey="Average Score" 
                            stroke="#3f51b5" 
                            fill="#3f51b5" 
                            fillOpacity={0.6} 
                          />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography variant="body1" color="textSecondary">
                          No subject comparison data available
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        );
        
      case 1: // Subject Performance
        return (
          <Card>
            <CardHeader 
              title="Subject Performance" 
              subheader="Detailed performance analysis by subject"
            />
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell align="right">Students</TableCell>
                    <TableCell align="right">Avg. Score</TableCell>
                    <TableCell align="right">Pass Rate</TableCell>
                    <TableCell align="right">Highest</TableCell>
                    <TableCell align="right">Lowest</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subjectPerformance.map((subject) => (
                    <TableRow key={subject.subject_id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <SubjectIcon color="primary" sx={{ mr: 1 }} />
                          {subject.subject_name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{subject.student_count}</TableCell>
                      <TableCell align="right">{subject.average_score.toFixed(1)}</TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Box 
                            sx={{
                              width: 60,
                              height: 8,
                              bgcolor: subject.pass_rate >= 70 ? 'success.light' : 
                                      subject.pass_rate >= 40 ? 'warning.light' : 'error.light',
                              borderRadius: 4,
                              mr: 1
                            }}
                          />
                          {subject.pass_rate.toFixed(1)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">{subject.highest_score.toFixed(1)}</TableCell>
                      <TableCell align="right">{subject.lowest_score.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        );
        
      case 2: // Performance Trends
        return (
          <Card>
            <CardHeader 
              title="Performance Trends" 
              subheader="Performance trends over the last 6 months"
            />
            <Divider />
            <CardContent sx={{ height: 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3f51b5" />
                  <YAxis yAxisId="right" orientation="right" stroke="#4caf50" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="average_score" 
                    name="Average Score" 
                    stroke="#3f51b5" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="student_count" 
                    name="Students Count" 
                    stroke="#4caf50" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
        
      case 3: // Top Performers
        return (
          <Card>
            <CardHeader 
              title="Top Performers" 
              subheader="Top 10 students with highest average scores"
              action={
                <MuiTooltip title="Students with at least 3 subjects">
                  <SchoolIcon color="action" />
                </MuiTooltip>
              }
            />
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell align="right">Avg. Score</TableCell>
                    <TableCell align="right">Subjects</TableCell>
                    <TableCell align="center">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPerformers.map((student, index) => (
                    <TableRow key={student.student_id}>
                      <TableCell>
                        {index < 3 ? (
                          <EmojiEventsIcon 
                            sx={{ 
                              color: index === 0 ? 'gold' : index === 1 ? 'silver' : '#cd7f32',
                              verticalAlign: 'middle',
                              mr: 1
                            }} 
                          />
                        ) : null}
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <SchoolIcon color="primary" sx={{ mr: 1 }} />
                          {student.student_name}
                        </Box>
                      </TableCell>
                      <TableCell>{student.roll_number}</TableCell>
                      <TableCell align="right">{student.average_score.toFixed(1)}</TableCell>
                      <TableCell align="right">{student.subjects_count}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <Box 
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: student.average_score >= 80 ? 'success.light' : 
                                         student.average_score >= 60 ? 'warning.light' : 'error.light',
                                width: `${student.average_score}%`,
                                maxWidth: '100%'
                              }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 40, textAlign: 'right' }}>
                            {student.average_score.toFixed(0)}%
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Performance Analytics</Typography>
        <Box>
          <MuiTooltip title="Refresh Data">
            <IconButton 
              onClick={fetchPerformanceData} 
              color="primary"
              disabled={loading}
              size="large"
            >
              <RefreshIcon />
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title={chartType === 'bar' ? 'Switch to Line Chart' : 'Switch to Bar Chart'}>
            <IconButton 
              onClick={toggleChartType}
              disabled={loading}
              size="large"
            >
              {chartType === 'bar' ? <LineChartIcon /> : <BarChartIcon />}
            </IconButton>
          </MuiTooltip>
          <MuiTooltip title={showFilters ? 'Hide Filters' : 'Show Filters'}>
            <IconButton 
              onClick={toggleFilters}
              color={showFilters ? 'primary' : 'default'}
              disabled={loading}
              size="large"
            >
              <FilterListIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters Panel */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Subject"
                value={filters.subject_id}
                onChange={handleFilterChange('subject_id')}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Student"
                value={filters.student_id}
                onChange={handleFilterChange('student_id')}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Students</MenuItem>
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {`${student.first_name} ${student.last_name} (${student.roll_number})`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.start_date}
                  onChange={handleFilterChange('start_date')}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.end_date}
                  onChange={handleFilterChange('end_date')}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1}>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                disabled={!filters.subject_id && !filters.student_id && 
                  format(filters.start_date, 'yyyy-MM-dd') === format(subMonths(new Date(), 6), 'yyyy-MM-dd') &&
                  format(filters.end_date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={applyFilters}
                startIcon={<FilterListIcon />}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Students</Typography>
              <Typography variant="h4">{summary.total_students || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Average Score</Typography>
              <Typography variant="h4">
                {summary.average_score ? summary.average_score.toFixed(1) : '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pass Rate</Typography>
              <Typography variant="h4">
                {summary.pass_rate ? summary.pass_rate.toFixed(1) : '0.0'}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Exams</Typography>
              <Typography variant="h4">{summary.total_exams || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Overview" 
            icon={<AssessmentIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Subject Performance" 
            icon={<SubjectIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Performance Trends" 
            icon={<TrendingUpIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Top Performers" 
            icon={<EmojiEventsIcon />} 
            iconPosition="start" 
          />
        </Tabs>
        
        {/* Tab Panel Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box sx={{ height: 400 }}>
              <Typography variant="h6" gutterBottom>Average Scores by Subject</Typography>
              {subjectChartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={subjectChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      label={{ value: 'Score %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Average Score']}
                      labelFormatter={(label) => `Subject: ${label}`}
                    />
                    <Bar 
                      dataKey="average_score" 
                      name="Average Score"
                      fill="#3f51b5"
                      radius={[4, 4, 0, 0]}
                    >
                      {subjectChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="textSecondary">No subject performance data available</Typography>
                </Box>
              )}
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Subject Performance</Typography>
              {analyticsData.subjectPerformance?.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell align="right">Average Score</TableCell>
                        <TableCell align="right">Students Enrolled</TableCell>
                        <TableCell align="right">Pass Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.subjectPerformance.map((subject, index) => (
                        <TableRow key={index}>
                          <TableCell>{subject.name || 'N/A'}</TableCell>
                          <TableCell align="right">{subject.average_score?.toFixed(1)}%</TableCell>
                          <TableCell align="right">{subject.student_count || 0}</TableCell>
                          <TableCell align="right">{subject.pass_rate?.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No subject performance data available</Typography>
              )}
            </Box>
          )}
          
          {/* Add other tab panels here */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Performance Trends</Typography>
              {examChartData?.length > 0 ? (
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={examChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        label={{ value: 'Score %', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Average Score']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="average_score" 
                        name="Average Score"
                        stroke="#3f51b5"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography>No trend data available</Typography>
              )}
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Top Performers</Typography>
              {analyticsData.topPerformers?.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Student</TableCell>
                        <TableCell align="right">Average Score</TableCell>
                        <TableCell>Class</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticsData.topPerformers.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.name || 'N/A'}</TableCell>
                          <TableCell align="right">{student.average_score?.toFixed(1)}%</TableCell>
                          <TableCell>{student.class_name || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No top performers data available</Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          onClick={fetchPerformanceData}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>
    </Box>
  );

};

export default PerformanceAnalytics;
