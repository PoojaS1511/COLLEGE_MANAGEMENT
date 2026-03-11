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
  Divider
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Label
} from 'recharts';

// Mock data from the provided JSON
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
  { id: 10, name: 'Signals & Systems', code: 'SS101', credits: 4, semester: 1 },
  { id: 11, name: 'Database Concepts', code: 'DB101', credits: 4, semester: 1 },
  { id: 12, name: 'Operating Systems Basics', code: 'OS101', credits: 4, semester: 1 },
  { id: 13, name: 'Fluid Mechanics Basics', code: 'FM101', credits: 4, semester: 1 },
  { id: 14, name: 'Power Systems Concepts', code: 'PS101', credits: 4, semester: 1 },
  { id: 15, name: 'Transportation Engg Basics', code: 'TE101', credits: 4, semester: 1 },
  { id: 16, name: 'Environmental Science', code: 'ENV201', credits: 3, semester: 2, is_elective: true },
  { id: 17, name: 'Advanced Networks Elective', code: 'CNE301', credits: 3, semester: 3, is_elective: true },
  { id: 18, name: 'AI Ethics', code: 'AIE301', credits: 3, semester: 3, is_elective: true },
  { id: 19, name: 'Energy Systems', code: 'ES301', credits: 3, semester: 3, is_elective: true },
  { id: 20, name: 'Smart Cities', code: 'SC301', credits: 3, semester: 3, is_elective: true },
  { id: 21, name: 'Deep Learning', code: '123df', credits: 4, semester: 1 },
  { id: 23, name: 'Mathematics', code: 'MATH101', credits: 3, semester: 1 },
  { id: 24, name: 'Physics', code: 'PHY101', credits: 4, semester: 1 },
  { id: 25, name: 'Chemistry', code: 'CHEM101', credits: 4, semester: 1 },
  { id: 26, name: 'SQTA', code: 'CT0042', credits: 3, semester: 1 },
  { id: 27, name: 'Cloud Computing', code: '22CL09', credits: 3, semester: 1 }
];

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

// Debug: Log the generated mock data
console.log('Mock Students:', mockStudents);
console.log('Mock Subjects:', mockSubjects);
console.log('Mock Marks:', mockMarks);

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
      <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={`tooltip-${index}`} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const PerformanceAnalytics = () => {
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
        result = result.filter(mark => mark.subject_id === selectedSubject);
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
  
  // Calculate statistics
  const subjectStats = calculateSubjectStats(filteredMarks);
  const studentPerformance = calculateStudentStats(filteredMarks);
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
        <Typography>Loading performance data...</Typography>
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
      <Typography variant="h5" gutterBottom>Performance Analytics</Typography>
      
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Average Score</Typography>
              <Typography variant="h4">{subjectStats?.average_score || 0}%</Typography>
              <Typography variant="caption">across {selectedSubject ? 'selected subject' : 'all subjects'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pass Rate</Typography>
              <Typography variant="h4">{subjectStats?.pass_rate || 0}%</Typography>
              <Typography variant="caption">of all assessments</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Students</Typography>
              <Typography variant="h4">{new Set(filteredMarks.map(m => m.student_id)).size}</Typography>
              <Typography variant="caption">in selected data</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
        {/* Top Performers */}
        <Grid item xs={12} md={6}>
          <Card>
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
                              <Typography variant="caption" color="textSecondary">
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
                            {student.average_score}%
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${student.pass_rate}%`} 
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
        
        {/* Subject Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedSubject 
                  ? `${mockSubjects.find(s => s.id === selectedSubject)?.name || 'Subject'} Performance` 
                  : 'Top Performing Subjects'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={selectedSubject 
                      ? filteredMarks
                          .filter(m => m.subject_id === selectedSubject)
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
                      : subjectPerformance.slice(0, 5).map(subj => ({
                          subject: subj.subject_code,
                          average_score: subj.average_score
                        }))
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={selectedSubject ? "exam_type" : "subject"} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Performance Distribution</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 20,
                      right: 20,
                      bottom: 40,
                      left: 40,
                    }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="average_score" 
                      name="Average Score" 
                      unit="%" 
                      domain={[0, 100]}
                    >
                      <Label value="Average Score (%)" offset={-10} position="insideBottom" />
                    </XAxis>
                    <YAxis 
                      type="number" 
                      dataKey="pass_rate" 
                      name="Pass Rate" 
                      unit="%" 
                      domain={[0, 100]}
                    >
                      <Label value="Pass Rate (%)" angle={-90} position="insideLeft" />
                    </YAxis>
                    <ZAxis type="number" dataKey="total_students" range={[60, 400]} name="Students" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Scatter 
                      name="Students" 
                      data={studentPerformance}
                      fill="#8884d8"
                    >
                      {studentPerformance.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.average_score >= 75 && entry.pass_rate >= 75 ? '#4caf50' : 
                            entry.average_score >= 50 && entry.pass_rate >= 50 ? '#ff9800' : '#f44336'
                          } 
                        />
                      ))}
                    </Scatter>
                    <ReferenceLine x={50} stroke="red" label="Passing Threshold" />
                    <ReferenceLine y={50} stroke="red" label="50% Pass Rate" />
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceAnalytics;
