import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Card, CardContent, Divider,
  Tabs, Tab, Grid, Chip, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`semester-tabpanel-${index}`}
      aria-labelledby={`semester-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `semester-tab-${index}`,
    'aria-controls': `semester-tabpanel-${index}`,
  };
}

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { user } = useAuth();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch student's academic records
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, enrollment_number')
        .eq('user_id', user.id)
        .single();

      if (studentError) throw studentError;
      if (!studentData) throw new Error('Student record not found');

      // Fetch exam results for the student
      const { data: resultsData, error: resultsError } = await supabase
        .from('exam_results')
        .select(`
          id,
          marks_obtained,
          grade,
          exam_date,
          exam:exams(
            id,
            name,
            max_marks,
            exam_type:exam_types(name),
            subject:subjects(name, code, semester)
          )
        `)
        .eq('student_id', studentData.id)
        .order('exam_date', { ascending: false });

      if (resultsError) throw resultsError;

      // Transform the data to match the expected format
      const formattedResults = resultsData.map(result => ({
        id: result.id,
        student_id: studentData.enrollment_number,
        subject_id: result.exam?.subject?.name || 'Unknown Subject',
        subject_code: result.exam?.subject?.code || '',
        exam_type: result.exam?.exam_type?.name || 'Exam',
        max_marks: result.exam?.max_marks || 0,
        marks_obtained: result.marks_obtained,
        grade: result.grade,
        exam_date: result.exam_date,
        semester: result.exam?.subject?.semester || 0
      }));

      setResults(formattedResults);
      
      // Extract unique semesters
      const uniqueSemesters = [...new Set(formattedResults.map(item => item.semester))]
        .sort((a, b) => a - b);
      setSemesters(uniqueSemesters);
      
      if (uniqueSemesters.length > 0) {
        setValue(uniqueSemesters[0]);
      }
      
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error.message || 'Failed to load results. Please try again later.');
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load results',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'success';
      case 'A': return 'success';
      case 'B': return 'primary';
      case 'C': return 'warning';
      case 'D': return 'error';
      case 'F': return 'error';
      default: return 'default';
    }
  };

  const getSubjectResults = (subject, semester) => {
    return results.filter(
      result => result.subject_id === subject && result.semester === semester
    );
  };

  const getSubjects = (semester) => {
    return [...new Set(
      results
        .filter(result => result.semester === semester)
        .map(result => result.subject_id)
    )];
  };

  const calculateSGPA = (semester) => {
    const semesterResults = results.filter(result => result.semester === semester);
    const gradePoints = {
      'A+': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'F': 0
    };
    
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    // Assuming each subject has 4 credits (you may need to adjust this)
    const creditsPerSubject = 4;
    
    const subjects = getSubjects(semester);
    
    subjects.forEach(subject => {
      const subjectResults = getSubjectResults(subject, semester);
      const bestResult = subjectResults.reduce((best, current) => {
        return (best.marks_obtained > current.marks_obtained) ? best : current;
      }, { marks_obtained: 0 });
      
      if (bestResult.grade && gradePoints[bestResult.grade] !== undefined) {
        totalGradePoints += gradePoints[bestResult.grade] * creditsPerSubject;
        totalCredits += creditsPerSubject;
      }
    });
    
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const currentSemesterResults = results.filter(
    result => result.semester === semesters[value]
  );

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Academic Results
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {results.length > 0 
              ? `Showing results for ${results[0]?.student_name || 'student'}`
              : 'No results found'}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {semesters && semesters.length > 0 ? (
            <>
              <Tabs
                value={value}
                onChange={(e, newValue) => setValue(newValue)}
                aria-label="semester tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
              >
                {semesters.map((semester, index) => (
                  <Tab 
                    key={semester} 
                    label={`Semester ${semester}`} 
                    value={semester}
                    {...a11yProps(index)} 
                  />
                ))}
              </Tabs>

              {currentSemesterResults && currentSemesterResults.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Subject Code</TableCell>
                        <TableCell>Exam Type</TableCell>
                        <TableCell align="right">Marks Obtained</TableCell>
                        <TableCell align="right">Max Marks</TableCell>
                        <TableCell align="center">Grade</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentSemesterResults.map((result) => (
                        <TableRow key={`${result.subject_code}-${result.exam_type}-${result.exam_date}`}>
                          <TableCell>{result.subject_id || 'N/A'}</TableCell>
                          <TableCell>{result.subject_code || 'N/A'}</TableCell>
                          <TableCell>{result.exam_type || 'N/A'}</TableCell>
                          <TableCell align="right">{result.marks_obtained ?? 'N/A'}</TableCell>
                          <TableCell align="right">{result.max_marks ?? 'N/A'}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={result.grade || 'N/A'} 
                              color={getGradeColor(result.grade || '')} 
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {result.exam_date ? new Date(result.exam_date).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No results found for this semester.
                </Alert>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No academic records found for this student.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentResults;
