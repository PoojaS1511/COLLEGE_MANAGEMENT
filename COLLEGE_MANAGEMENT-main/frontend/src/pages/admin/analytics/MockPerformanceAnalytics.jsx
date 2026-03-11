import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Label,
  Cell
} from 'recharts';

// Mock data
const mockStudents = [
  { id: '68b96c3d-3a3f-47c6-b427-5f0c96307eb6', name: 'Poongodi', register_number: 'REG20250006', course_id: '51a31a39-944d-481f-b581-e48980367732', current_semester: 1 },
  { id: '120d6b91-7882-4e15-835e-f92e662e1a18', name: 'Poongodi', register_number: 'REG20250007', course_id: '75d44179-8fe7-4006-9ddb-4f9e01f75a68', current_semester: 1 },
  { id: '1d87183a-53c7-40f7-82f0-e002ad940e08', name: 'Poongodi', register_number: 'REG20250008', course_id: '8976f62b-698f-496c-8a48-384ecbbdf7bd', current_semester: 1 },
  { id: '06ffaf24-965f-4bd5-9367-9af42aa4bc45', name: 'Kokila', register_number: 'REG252675', course_id: '056494a6-620a-46e4-bd07-484ae133ee51', current_semester: 1 },
  { id: '8ebbb006-b31a-4ad4-b212-cb14aafa75f2', name: 'Kokila', register_number: 'REG258568', course_id: '8976f62b-698f-496c-8a48-384ecbbdf7bd', current_semester: 1 },
  { id: '20145c54-0853-495a-8db1-c5edfce3d709', name: 'Thamizh Moorthy', register_number: 'REG20257059', course_id: null, current_semester: 1 },
  { id: 'f2fc8317-265a-4287-99b9-93828e36bb39', name: 'Uday Raj', register_number: 'REG20250008', course_id: null, current_semester: 2 },
  { id: '41fbc774-3fad-4775-aaec-72c58c40186e', name: 'Harini', register_number: 'REG20257059', course_id: null, current_semester: 4 }
];

const mockSubjects = [
  { id: 1, name: 'Introduction to Deep Learning', code: 'CS101', credits: 4, semester: 1 },
  { id: 2, name: 'Advanced Deep Learning', code: 'CS201', credits: 4, semester: 2 },
  { id: 3, name: 'Data Science Basics', code: 'DS101', credits: 4, semester: 1 },
  { id: 4, name: 'Machine Learning', code: 'DS201', credits: 4, semester: 2 },
  { id: 5, name: 'Computer Networks Fundamentals', code: 'CN101', credits: 4, semester: 1 },
  { id: 6, name: 'Advanced Networks', code: 'CN201', credits: 4, semester: 2 },
  { id: 7, name: 'Thermodynamics Basics', code: 'TH101', credits: 4, semester: 1 },
  { id: 8, name: 'Circuit Theory Basics', code: 'CT101', credits: 4, semester: 1 },
  { id: 9, name: 'Structural Analysis', code: 'SE101', credits: 4, semester: 1 },
  { id: 10, name: 'Signals & Systems', code: 'SS101', credits: 4, semester: 1 }
];

// Generate mock marks data
const generateMockMarks = () => {
  const marks = [];
  const examTypes = ['Quiz', 'Midterm', 'Final', 'Assignment'];
  
  mockStudents.forEach(student => {
    // Get subjects for student's semester
    const studentSubjects = mockSubjects.filter(subj => subj.semester === student.current_semester);
    
    studentSubjects.forEach(subject => {
      examTypes.forEach(examType => {
        marks.push({
          id: `mark-${student.id}-${subject.id}-${examType}`,
          student_id: student.id,
          student_name: student.name,
          register_number: student.register_number,
          subject_id: subject.id,
          subject_name: subject.name,
          subject_code: subject.code,
          exam_type: examType,
          marks_obtained: Math.floor(Math.random() * 40) + 60, // 60-100
          max_marks: 100,
          semester: student.current_semester,
          exam_date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
          is_present: Math.random() > 0.1 // 90% attendance
        });
      });
    });
  });
  
  return marks;
};

const mockMarks = generateMockMarks();

// Helper functions for data processing
const calculateSubjectStats = (marks, subjectId = null) => {
  const subjectMarks = subjectId 
    ? marks.filter(mark => mark.subject_id === subjectId)
    : marks;
  
  if (subjectMarks.length === 0) return null;
  
  const marksList = subjectMarks.map(mark => mark.marks_obtained);
  const average = marksList.reduce((a, b) => a + b, 0) / marksList.length;
  const max = Math.max(...marksList);
  const min = Math.min(...marksList);
  const passCount = subjectMarks.filter(mark => mark.marks_obtained >= 40).length;
  const passRate = (passCount / subjectMarks.length) * 100;
  
  return {
    subject_id: subjectId,
    subject_name: subjectMarks[0]?.subject_name || 'All Subjects',
    subject_code: subjectMarks[0]?.subject_code || 'ALL',
    average_score: parseFloat(average.toFixed(2)),
    highest_score: max,
    lowest_score: min,
    pass_rate: parseFloat(passRate.toFixed(2)),
    total_students: new Set(subjectMarks.map(mark => mark.student_id)).size,
    total_marks: subjectMarks.length
  };
};

const calculateStudentStats = (marks, studentId = null) => {
  const studentMarks = studentId 
    ? marks.filter(mark => mark.student_id === studentId)
    : marks;
  
  if (studentMarks.length === 0) return [];
  
  const studentIds = [...new Set(studentMarks.map(mark => mark.student_id))];
  const results = [];
  
  studentIds.forEach(id => {
    const studentRecords = studentMarks.filter(mark => mark.student_id === id);
    const student = mockStudents.find(s => s.id === id) || {};
    const marksList = studentRecords.map(record => record.marks_obtained);
    const average = marksList.reduce((a, b) => a + b, 0) / marksList.length;
    const passedSubjects = studentRecords.filter(record => record.marks_obtained >= 40).length;
    const passRate = (passedSubjects / studentRecords.length) * 100;
    
    results.push({
      student_id: id,
      student_name: student.name || 'Unknown',
      register_number: student.register_number || 'N/A',
      average_score: parseFloat(average.toFixed(2)),
      total_subjects: new Set(studentRecords.map(r => r.subject_id)).size,
      passed_subjects: passedSubjects,
      pass_rate: parseFloat(passRate.toFixed(2)),
      semester: student.current_semester || 1
    });
  });
  
  return studentId ? (results[0] || null) : results;
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ 
        p: 2, 
        backgroundColor: 'background.paper',
        minWidth: 180,
        borderLeft: '4px solid',
        borderColor: payload[0]?.color || 'primary.main'
      }}>
        {payload[0]?.payload?.student_name && (
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {payload[0].payload.student_name}
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({payload[0].payload.register_number})
            </Typography>
          </Typography>
        )}
        {payload.map((entry, index) => (
          <Box key={`tooltip-${index}`} sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.5
          }}>
            <Typography variant="body2" color="text.secondary">
              {entry.name}:
            </Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ ml: 2, minWidth: 50, textAlign: 'right' }}>
              {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}%
            </Typography>
          </Box>
        ))}
        {payload[0]?.payload?.semester && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Semester: {payload[0].payload.semester}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }
  return null;
};

const MockPerformanceAnalytics = () => {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter marks based on selected filters
  const filteredMarks = useMemo(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      let result = [...mockMarks];
      
      if (selectedSemester) {
        const semesterNum = parseInt(selectedSemester, 10);
        result = result.filter(mark => {
          const student = mockStudents.find(s => s.id === mark.student_id);
          return student?.current_semester === semesterNum;
        });
      }
      
      if (selectedSubject) {
        const subjectId = parseInt(selectedSubject, 10);
        result = result.filter(mark => mark.subject_id === subjectId);
      }
      
      console.log('Filtered Marks:', result);
      return result;
    } catch (err) {
      console.error('Error filtering marks:', err);
      setError('Failed to filter marks. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [selectedSemester, selectedSubject]);
  
  // Calculate student performance data
  const studentPerformance = useMemo(() => {
    if (!filteredMarks || filteredMarks.length === 0) return [];
    
    const studentStats = calculateStudentStats(filteredMarks);
    return studentStats.map(stat => ({
      ...stat,
      name: stat.student_name,
      average_score: parseFloat(stat.average_score.toFixed(2)),
      pass_rate: parseFloat(stat.pass_rate.toFixed(2)),
      total_subjects: stat.subjects_count
    }));
  }, [filteredMarks]);

  // Calculate average scores and other statistics
  const averageScores = useMemo(() => {
    if (studentPerformance.length === 0) {
      return {
        overall: 0,
        passed: 0,
        failed: 0,
        total: 0
      };
    }
    
    const total = studentPerformance.reduce((sum, student) => sum + student.average_score, 0);
    const passed = studentPerformance.filter(s => s.average_score >= 50).length;
    
    return {
      overall: parseFloat((total / studentPerformance.length).toFixed(2)),
      passed: passed,
      failed: studentPerformance.length - passed,
      total: studentPerformance.length
    };
  }, [studentPerformance]);

  const subjectStats = calculateSubjectStats(filteredMarks);
  const topStudents = [...studentPerformance]
    .sort((a, b) => b.average_score - a.average_score)
    .slice(0, 5);
    
  const subjectPerformance = mockSubjects
    .map(subj => calculateSubjectStats(filteredMarks, subj.id))
    .filter(Boolean)
    .sort((a, b) => b.average_score - a.average_score);
  
  // Get unique semesters from the data
  const semesters = useMemo(() => {
    const sems = [...new Set(mockStudents.map(s => s.current_semester).filter(Boolean))].sort();
    console.log('Available Semesters:', sems);
    return sems;
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading performance data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} bgcolor="error.light" color="error.contrastText" borderRadius={1} mb={3}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Performance Analytics (Mock Data)</Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                label="Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                {semesters.map(sem => (
                  <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                label="Subject"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {mockSubjects.map(subject => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Average Score</Typography>
              <Typography variant="h4">{subjectStats?.average_score?.toFixed(2) || 0}%</Typography>
              <Typography variant="caption">across {selectedSubject ? 'selected subject' : 'all subjects'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pass Rate</Typography>
              <Typography variant="h4">{subjectStats?.pass_rate?.toFixed(2) || 0}%</Typography>
              <Typography variant="caption">of all assessments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Students</Typography>
              <Typography variant="h4">{new Set(filteredMarks.map(m => m.student_id)).size}</Typography>
              <Typography variant="caption">in selected data</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Subjects</Typography>
              <Typography variant="h4">{new Set(filteredMarks.map(m => m.subject_id)).size}</Typography>
              <Typography variant="caption">being tracked</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Top Performers - Moved to the top */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Top Performers</Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell align="right">Avg. Score</TableCell>
                      <TableCell align="right">Pass Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topStudents.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                              {student.student_name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2">{student.student_name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.register_number}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: student.average_score >= 75 ? 'success.main' : 
                                         student.average_score >= 50 ? 'warning.main' : 'error.main',
                                mr: 1
                              }}
                            />
                            {student.average_score.toFixed(2)}%
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${student.pass_rate.toFixed(2)}%`} 
                            size="small"
                            color={student.pass_rate >= 75 ? 'success' : student.pass_rate >= 50 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Subject Performance - Full width */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedSubject 
                  ? `${mockSubjects.find(s => s.id === parseInt(selectedSubject))?.name || 'Subject'} Performance` 
                  : 'Top Performing Subjects'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 500, width: '100%', overflow: 'hidden', minWidth: '800px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={selectedSubject 
                      ? filteredMarks
                          .filter(m => m.subject_id === parseInt(selectedSubject))
                          .reduce((acc, curr) => {
                            const existing = acc.find(item => item.exam_type === curr.exam_type);
                            if (existing) {
                              existing.marks_obtained = 
                                (existing.marks_obtained * existing.count + curr.marks_obtained) / (existing.count + 1);
                              existing.count += 1;
                            } else {
                              acc.push({
                                exam_type: curr.exam_type,
                                marks_obtained: curr.marks_obtained,
                                count: 1
                              });
                            }
                            return acc;
                          }, [])
                          .map(item => ({
                            exam_type: item.exam_type,
                            marks_obtained: parseFloat(item.marks_obtained.toFixed(2))
                          }))
                      : subjectPerformance.slice(0, 5).map(subj => {
                          const subjectInfo = mockSubjects.find(s => s.code === subj.subject_code) || {};
                          return {
                            subject: subjectInfo.name || subj.subject_code,
                            subject_code: subj.subject_code,
                            average_score: subj.average_score
                          };
                        })
                    }
                    margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
                    barSize={60}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={selectedSubject ? "exam_type" : "subject"}
                      interval={0}
                      tick={{ angle: -45, textAnchor: 'end', fontSize: 10 }}
                      height={90}
                      label={{ 
                        value: selectedSubject ? 'Exam Type' : 'Subject', 
                        position: 'bottom',
                        offset: 20,
                        style: { fontSize: 12 }
                      }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      label={{ 
                        value: 'Average Score (%)', 
                        angle: -90, 
                        position: 'left',
                        offset: 10
                      }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <Box sx={{ 
                            background: 'white', 
                            padding: '8px', 
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}>
                            <div><strong>{data.subject || label}</strong></div>
                            {data.subject_code && <div>Code: {data.subject_code}</div>}
                            <div>Score: {payload[0].value}%</div>
                          </Box>
                        );
                      }}
                    />
                    <Bar 
                      dataKey={selectedSubject ? "marks_obtained" : "average_score"} 
                      name={selectedSubject ? "Average Score" : "Average Score"} 
                      fill="#8884d8" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Performance Distribution */}
        <Grid item xs={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box>
                <Typography variant="h6" gutterBottom>Performance Distribution</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Distribution of student performance with key statistics
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Box>
              
              <Box sx={{ flex: 1, minHeight: 500 }}>
                <Grid container spacing={3}>
                  {/* Simple Bar Chart */}
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Performance Distribution</Typography>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={studentPerformance}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                              dataKey="student_name"
                              label={{ 
                                value: 'Student Name', 
                                position: 'bottom',
                                offset: 30
                              }}
                              tickFormatter={(value) => value.split(' ').map(n => n[0]).join('') + '.'}
                            />
                            <YAxis 
                              label={{ 
                                value: 'Average Score (%)', 
                                angle: -90, 
                                position: 'insideLeft',
                                offset: 10
                              }}
                              domain={[0, 100]}
                            />
                            <Tooltip 
                              formatter={(value) => [`${value}%`, 'Score']}
                              labelFormatter={(label, payload) => {
                                const student = studentPerformance.find(s => s.student_name === label) || {};
                                return `${label} (${student.register_number || 'N/A'})`;
                              }}
                            />
                            <Bar 
                              dataKey="average_score" 
                              name="Score"
                              fill="#4a90e2"
                              radius={[4, 4, 0, 0]}
                            >
                              {studentPerformance.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`}
                                  fill={
                                    entry.average_score >= 75 ? '#4caf50' : 
                                    entry.average_score >= 50 ? '#ff9800' : '#f44336'
                                  }
                                />
                              ))}
                            </Bar>
                            <ReferenceLine 
                              y={averageScores.overall} 
                              label={{
                                value: `Class Avg: ${averageScores.overall.toFixed(1)}%`,
                                position: 'top',
                                fill: '#666',
                                fontSize: 12,
                                offset: 10
                              }}
                              stroke="#666" 
                              strokeDasharray="3 3"
                              strokeWidth={2}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                {/* Summary Stats */}
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">Class Average</Typography>
                        <Typography variant="h5">{averageScores.overall.toFixed(1)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">Pass Rate</Typography>
                        <Typography variant="h5">
                          {Math.round((averageScores.passed / averageScores.total) * 100)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">Top Score</Typography>
                        <Typography variant="h5">
                          {Math.max(...studentPerformance.map(s => s.average_score), 0).toFixed(1)}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" variant="body2">Students</Typography>
                        <Typography variant="h5">{averageScores.total}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="caption" color="text.secondary">
                  {studentPerformance.length} students shown
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MockPerformanceAnalytics;
