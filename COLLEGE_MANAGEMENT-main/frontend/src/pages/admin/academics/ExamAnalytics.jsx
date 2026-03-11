import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { 
  Download as DownloadIcon, 
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { format, subMonths } from 'date-fns';
import apiService from '../../../services/api';

// Mock data for development and fallback
const mockExams = [
  { id: '1', exam_name: 'Mid Semester - 1', academic_year: '2024-2025', max_marks: 100, exam_date: '2024-10-15' },
  { id: '2', exam_name: 'Mid Semester - 2', academic_year: '2024-2025', max_marks: 100, exam_date: '2025-02-20' },
  { id: '3', exam_name: 'End Semester', academic_year: '2024-2025', max_marks: 100, exam_date: '2025-05-10' },
];

const mockClasses = [
  { id: 'all', name: 'All Departments' },
  { id: 'CSE', name: 'Computer Science' },
  { id: 'ECE', name: 'Electronics & Communication' },
  { id: 'MECH', name: 'Mechanical' },
  { id: 'CIVIL', name: 'Civil' },
  { id: 'EEE', name: 'Electrical & Electronics' },
];

const mockSubjects = [
  { id: '1', name: 'Data Structures', code: 'CS201' },
  { id: '2', name: 'Digital Electronics', code: 'EC202' },
  { id: '3', name: 'Engineering Mathematics', code: 'MA203' },
  { id: '4', name: 'Computer Networks', code: 'CS301' },
  { id: '5', name: 'Database Management', code: 'CS302' },
  { id: '6', name: 'Artificial Intelligence', code: 'CS401' },
];

const mockStudents = [
  { id: '1', name: 'John Smith', class: 'CSE', year: '3rd Year' },
  { id: '2', name: 'Sarah Johnson', class: 'CSE', year: '3rd Year' },
  { id: '3', name: 'Michael Brown', class: 'ECE', year: '2nd Year' },
  { id: '4', name: 'Emily Davis', class: 'MECH', year: '4th Year' },
  { id: '5', name: 'Robert Wilson', class: 'CIVIL', year: '1st Year' },
  { id: '6', name: 'Lisa Anderson', class: 'EEE', year: '2nd Year' },
  { id: '7', name: 'David Lee', class: 'CSE', year: '4th Year' },
  { id: '8', name: 'Jennifer Kim', class: 'ECE', year: '3rd Year' },
];

// Generate mock analytics data
const generateMockAnalytics = (examId, classId) => {
  const selectedExam = mockExams.find(e => e.id === examId) || mockExams[0];
  const filteredStudents = classId === 'all' 
    ? mockStudents 
    : mockStudents.filter(s => s.class === classId);

  // Class performance
  const classPerformance = mockClasses.map(cls => ({
    id: cls.id,
    name: cls.name,
    average: Math.floor(Math.random() * 30) + 60, // 60-90%
    topPerformer: mockStudents[Math.floor(Math.random() * mockStudents.length)].name,
    passPercentage: Math.floor(Math.random() * 30) + 60, // 60-90%
  }));

  // Subject performance
  const subjectPerformance = mockSubjects.map(subject => ({
    subject: subject.name,
    average: Math.floor(Math.random() * 30) + 60, // 60-90%
    fullMark: 100
  }));

  // Grade distribution
  const gradeDistribution = [
    { grade: 'A+', count: Math.floor(Math.random() * 5) + 1 },
    { grade: 'A', count: Math.floor(Math.random() * 10) + 3 },
    { grade: 'B', count: Math.floor(Math.random() * 15) + 5 },
    { grade: 'C', count: Math.floor(Math.random() * 10) + 2 },
    { grade: 'D', count: Math.floor(Math.random() * 5) + 1 },
    { grade: 'F', count: Math.floor(Math.random() * 3) },
  ];

  // Trend analysis (last 5 exams)
  const trendAnalysis = Array.from({ length: 5 }, (_, i) => ({
    examName: `Exam ${i + 1}`,
    classAverage: Math.floor(Math.random() * 30) + 60,
    topperScore: Math.floor(Math.random() * 20) + 80,
  }));

  // Student performance
  const studentPerformance = filteredStudents.map((student, index) => {
    const totalMarks = Math.floor(Math.random() * 60) + 40; // 40-100
    const percentage = Math.min(100, Math.floor((totalMarks / selectedExam.max_marks) * 100));
    
    // Simple grade calculation
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    return {
      id: student.id,
      name: student.name,
      class: student.class,
      totalMarks,
      maxMarks: selectedExam.max_marks,
      percentage,
      grade,
      rank: index + 1,
    };
  }).sort((a, b) => b.percentage - a.percentage);

  return {
    classPerformance,
    subjectPerformance,
    gradeDistribution,
    trendAnalysis,
    studentPerformance,
    generatedAt: new Date().toISOString(),
  };
};

// Dynamic imports for client-side only modules
let saveAs;
let jsPDF;

export default function ExamAnalytics() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [analyticsData, setAnalyticsData] = useState({
    classPerformance: [],
    subjectPerformance: [],
    gradeDistribution: [],
    trendAnalysis: [],
    studentPerformance: [],
    generatedAt: null,
  });
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  // Show snackbar notification
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Fetch exams from API or use mock data
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (import.meta.env.DEV) {
        // Use mock data in development
        console.log('Using mock exams data in development mode');
        setExams(mockExams);
        if (mockExams.length > 0) {
          setSelectedExam(mockExams[0].id);
        }
        return;
      }
      
      // In production, fetch from API
      const response = await apiService.get('/exams');
      
      if (response?.success && Array.isArray(response.data)) {
        setExams(response.data);
        if (response.data.length > 0) {
          setSelectedExam(response.data[0].id);
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams. Using sample data.');
      setExams(mockExams);
      if (mockExams.length > 0) {
        setSelectedExam(mockExams[0].id);
      }
      showSnackbar('Using sample data due to connection error', 'warning');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    if (!selectedExam) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (import.meta.env.DEV) {
        // Use mock data in development
        console.log('Using mock analytics data in development mode');
        const mockData = generateMockAnalytics(selectedExam, selectedClass);
        setAnalyticsData(mockData);
        return;
      }
      
      // In production, fetch from API
      const response = await apiService.get('/analytics/exam', {
        params: {
          examId: selectedExam,
          classId: selectedClass !== 'all' ? selectedClass : undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });
      
      if (response?.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error(response?.error || 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Using sample data.');
      
      // Fallback to mock data
      const mockData = generateMockAnalytics(selectedExam, selectedClass);
      setAnalyticsData(mockData);
      showSnackbar('Using sample data due to connection error', 'warning');
    } finally {
      setLoading(false);
    }
  }, [selectedExam, selectedClass, dateRange, showSnackbar]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  // Handle date range change
  const handleDateChange = useCallback((e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    if (exams.length > 0) {
      fetchAnalyticsData();
    }
  }, [exams, fetchAnalyticsData]);

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      setSaving(true);
      
      // Lazy load jsPDF
      if (!jsPDF) {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default;
        await import('jspdf-autotable');
      }
      
      const doc = new jsPDF();
      const title = `Exam Analytics Report - ${exams.find(e => e.id === selectedExam)?.exam_name || ''}`;
      const dateRangeText = `Date Range: ${format(new Date(dateRange.start), 'MMM dd, yyyy')} - ${format(new Date(dateRange.end), 'MMM dd, yyyy')}`;
      const generatedAt = `Generated on: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`;
      
      // Add title and metadata
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(10);
      doc.text(dateRangeText, 14, 30);
      doc.text(generatedAt, 14, 36);
      
      // Add performance summary
      doc.setFontSize(14);
      doc.text('Performance Summary', 14, 50);
      
      // Add class performance table
      doc.autoTable({
        startY: 60,
        head: [['Class', 'Average Score', 'Top Performer', 'Pass %']],
        body: analyticsData.classPerformance.map(cp => [
          cp.name,
          `${cp.average}%`,
          cp.topPerformer,
          `${cp.passPercentage}%`
        ])
      });
      
      // Add a new page for student performance
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Student Performance', 14, 20);
      
      doc.autoTable({
        startY: 30,
        head: [['Rank', 'Student', 'Class', 'Marks', 'Percentage', 'Grade']],
        body: analyticsData.studentPerformance.map((student, index) => [
          index + 1,
          student.name,
          student.class,
          `${student.totalMarks}/${student.maxMarks}`,
          `${student.percentage}%`,
          student.grade
        ])
      });
      
      // Save the PDF
      doc.save(`exam-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      showSnackbar('PDF exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showSnackbar('Failed to export PDF. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }, [analyticsData, dateRange, exams, selectedExam, showSnackbar]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Lazy load file-saver
      if (!saveAs) {
        import('file-saver').then(module => {
          saveAs = module.default || module;
          performCSVExport();
        }).catch(err => {
          console.error('Failed to load file-saver:', err);
          showSnackbar('Failed to load export module', 'error');
        });
      } else {
        performCSVExport();
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      showSnackbar('Failed to export CSV', 'error');
    }
    
    function performCSVExport() {
      try {
        let csvContent = 'Rank,Student,Class,Marks,Percentage,Grade\n';
        
        analyticsData.studentPerformance.forEach((student, index) => {
          csvContent += `${index + 1},${student.name},${student.class},${student.totalMarks}/${student.maxMarks},${student.percentage}%,${student.grade}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `exam-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        
        showSnackbar('CSV exported successfully!', 'success');
      } catch (error) {
        console.error('Error in CSV export:', error);
        showSnackbar('Failed to generate CSV', 'error');
      }
    }
  }, [analyticsData.studentPerformance, showSnackbar]);

  // Render performance metrics charts
  const renderPerformanceMetrics = useCallback(() => {
    const { 
      classPerformance = [], 
      subjectPerformance = [], 
      gradeDistribution = [], 
      trendAnalysis = [] 
    } = analyticsData;

    return (
      <Grid container spacing={3}>
        {/* Class Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Class Performance</Typography>
                <Chip 
                  label={`Updated: ${format(new Date(analyticsData.generatedAt || new Date()), 'MMM dd, yyyy HH:mm')}`} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
              {classPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'average' ? 'Average Score' : 'Pass %'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="average" fill="#8884d8" name="Average Score" />
                    <Bar dataKey="passPercentage" fill="#82ca9d" name="Pass %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="textSecondary">No class performance data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Subject-wise Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Subject-wise Performance</Typography>
              {subjectPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar 
                      name="Score" 
                      dataKey="average" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`${value}%`, 'Average Score']}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="textSecondary">No subject performance data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Grade Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Grade Distribution</Typography>
              {gradeDistribution.length > 0 ? (
                <Box display="flex" flexDirection="column" alignItems="center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="grade"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'
                          ][index % 6]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name, props) => [
                          value,
                          `${props.payload.grade}: ${((value / gradeDistribution.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%`
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="textSecondary">No grade distribution data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Performance Trend */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Performance Trend</Typography>
              {trendAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="examName" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip 
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="classAverage" 
                      stroke="#8884d8" 
                      name="Class Average" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="topperScore" 
                      stroke="#82ca9d" 
                      name="Topper's Score" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="textSecondary">No trend data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }, [analyticsData]);

  // Render student performance table
  const renderStudentPerformance = useCallback(() => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Student Performance</Typography>
          <Chip 
            label={`Total Students: ${analyticsData.studentPerformance.length}`} 
            color="primary" 
            size="small" 
            variant="outlined"
          />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="right">Marks</TableCell>
                <TableCell align="right">Percentage</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.studentPerformance.length > 0 ? (
                analyticsData.studentPerformance.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.rank}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell align="right">{student.totalMarks}/{student.maxMarks}</TableCell>
                    <TableCell align="right">{student.percentage}%</TableCell>
                    <TableCell>
                      <Chip 
                        label={student.grade} 
                        size="small" 
                        color={
                          student.grade === 'A+' ? 'success' : 
                          ['A', 'B'].includes(student.grade) ? 'primary' :
                          student.grade === 'C' ? 'default' : 'error'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {student.percentage >= 75 ? (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="Passed" 
                          color="success" 
                          size="small" 
                          variant="outlined"
                        />
                      ) : student.percentage >= 50 ? (
                        <Chip 
                          icon={<WarningIcon />} 
                          label="Passed" 
                          color="warning" 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          icon={<ErrorIcon />} 
                          label="Failed" 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No student performance data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  ), [analyticsData.studentPerformance]);

  // Render loading state
  if (loading && !exams.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

      {/* Header with title and actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Exam Analytics
          {error && (
            <Typography variant="caption" color="error" ml={2}>
              <ErrorIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              {error}
            </Typography>
          )}
        </Typography>
        <Box>
          <Tooltip title="Export to PDF">
            <span>
              <IconButton 
                onClick={exportToPDF} 
                color="primary"
                disabled={saving || loading}
              >
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <span>
              <IconButton 
                onClick={exportToCSV} 
                color="primary"
                disabled={saving || loading}
                sx={{ ml: 1 }}
              >
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <span>
              <IconButton 
                onClick={fetchAnalyticsData} 
                color="primary"
                disabled={loading}
                sx={{ ml: 1 }}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small" disabled={loading}>
              <InputLabel>Select Exam</InputLabel>
              <Select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                label="Select Exam"
              >
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.exam_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small" disabled={loading}>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                label="Class"
              >
                {mockClasses.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              name="start"
              label="From Date"
              value={dateRange.start}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              name="end"
              label="To Date"
              value={dateRange.end}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={fetchAnalyticsData}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FilterListIcon />}
            >
              {loading ? 'Loading...' : 'Apply'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Loading indicator */}
      {loading && <LinearProgress />}

      {/* Tabs */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Performance Overview" />
          <Tab label="Student Performance" />
          <Tab label="Detailed Reports" disabled />
        </Tabs>
      </Box>

      {/* Tab content */}
      {tabValue === 0 && renderPerformanceMetrics()}
      {tabValue === 1 && renderStudentPerformance()}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Detailed Reports</Typography>
            <Typography color="textSecondary">
              This feature is coming soon. Please check back later for detailed reports.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
