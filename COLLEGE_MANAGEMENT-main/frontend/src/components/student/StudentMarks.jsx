import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, TablePagination, Card, CardContent, 
  LinearProgress, Alert, Snackbar
} from '@mui/material';

const StudentMarks = () => {
  // State hooks
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState({
    1: { id: 1, name: 'Data Structures', code: 'CS201', credits: 4 },
    2: { id: 2, name: 'Database Systems', code: 'CS202', credits: 4 },
    3: { id: 3, name: 'Computer Networks', code: 'CS301', credits: 3 },
    4: { id: 4, name: 'Operating Systems', code: 'CS302', credits: 4 },
    5: { id: 5, name: 'Software Engineering', code: 'CS401', credits: 3 },
  });
  
  // Sample marks data
  const [marksData, setMarksData] = useState([
    {
      id: 1,
      subject_id: 1,
      exam: { id: 1, name: 'Internal Assessment 1', exam_type: 'Internal' },
      marks_obtained: 45,
      max_marks: 50,
      date: '2025-09-15',
      grade: 'A',
      subject: { id: 1, name: 'Data Structures', code: 'CS201' }
    },
    {
      id: 2,
      subject_id: 2,
      exam: { id: 1, name: 'Internal Assessment 1', exam_type: 'Internal' },
      marks_obtained: 42,
      max_marks: 50,
      date: '2025-09-16',
      grade: 'A-',
      subject: { id: 2, name: 'Database Systems', code: 'CS202' }
    },
    {
      id: 3,
      subject_id: 3,
      exam: { id: 1, name: 'Internal Assessment 1', exam_type: 'Internal' },
      marks_obtained: 48,
      max_marks: 50,
      date: '2025-09-17',
      grade: 'A+',
      subject: { id: 3, name: 'Computer Networks', code: 'CS301' }
    },
    {
      id: 4,
      subject_id: 1,
      exam: { id: 2, name: 'Semester End Exam', exam_type: 'Semester' },
      marks_obtained: 85,
      max_marks: 100,
      date: '2025-10-05',
      grade: 'A',
      subject: { id: 1, name: 'Data Structures', code: 'CS201' }
    },
    {
      id: 5,
      subject_id: 2,
      exam: { id: 2, name: 'Semester End Exam', exam_type: 'Semester' },
      marks_obtained: 78,
      max_marks: 100,
      date: '2025-10-06',
      grade: 'B+',
      subject: { id: 2, name: 'Database Systems', code: 'CS202' }
    },
    {
      id: 6,
      subject_id: 3,
      exam: { id: 2, name: 'Semester End Exam', exam_type: 'Semester' },
      marks_obtained: 92,
      max_marks: 100,
      date: '2025-10-07',
      grade: 'A+',
      subject: { id: 3, name: 'Computer Networks', code: 'CS301' }
    },
    {
      id: 7,
      subject_id: 4,
      exam: { id: 2, name: 'Semester End Exam', exam_type: 'Semester' },
      marks_obtained: 88,
      max_marks: 100,
      date: '2025-10-08',
      grade: 'A',
      subject: { id: 4, name: 'Operating Systems', code: 'CS302' }
    },
    {
      id: 8,
      subject_id: 5,
      exam: { id: 2, name: 'Semester End Exam', exam_type: 'Semester' },
      marks_obtained: 95,
      max_marks: 100,
      date: '2025-10-09',
      grade: 'A+',
      subject: { id: 5, name: 'Software Engineering', code: 'CS401' }
    }
  ]);
  
  // Calculate CGPA based on the marks data
  const [cgpa, setCgpa] = useState('8.75');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Pagination logic
  const paginatedMarks = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return marksData.slice(start, end);
  }, [page, rowsPerPage, marksData]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [user, setUser] = useState(null);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Generate mock marks data
  const generateMockMarks = () => {
    const mockSubjects = [
      { id: 1, name: 'Mathematics', code: 'MATH101', credits: 4 },
      { id: 2, name: 'Physics', code: 'PHY102', credits: 4 },
      { id: 3, name: 'Chemistry', code: 'CHEM103', credits: 3 },
      { id: 4, name: 'Computer Programming', code: 'CSE201', credits: 4 },
      { id: 5, name: 'Electrical Engineering', code: 'EEE202', credits: 3 },
      { id: 6, name: 'Engineering Mechanics', code: 'MEC101', credits: 3 },
      { id: 7, name: 'Digital Electronics', code: 'ECE201', credits: 4 },
      { id: 8, name: 'Data Structures', code: 'CSE202', credits: 4 }
    ];

    const mockExams = [
      { id: 1, name: 'Internal Assessment 1' },
      { id: 2, name: 'Internal Assessment 2' },
      { id: 3, name: 'Semester End Exam' }
    ];

    // Generate marks for each subject and exam combination
    const marks = [];
    let id = 1;
    
    mockSubjects.forEach(subject => {
      mockExams.forEach(exam => {
        marks.push({
          id: id++,
          marks_obtained: Math.floor(Math.random() * 30) + 50, // Random marks between 50-80
          max_marks: 100,
          subject_id: subject.id,
          subject: subject,
          exam_id: exam.id,
          exam: exam,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });
    });

    return marks;
  };

  // Process marks data and update state
  const processMarksData = useCallback((marks) => {
    try {
      let processedMarks = [];
      let usingMockData = false;
      
      // If no marks provided, use mock data
      if (!marks || !Array.isArray(marks) || marks.length === 0) {
        processedMarks = generateMockMarks();
        usingMockData = true;
      } else {
        processedMarks = marks;
      }
      
      console.log('Processed Marks:', processedMarks); // Debug log
      setMarksData(processedMarks);
      
      // Calculate CGPA based on the marks data
      if (processedMarks.length > 0) {
        const calculatedCgpa = calculateCGPA(processedMarks);
        setCgpa(calculatedCgpa);
        
        // Extract and store unique subjects
        const subjectsMap = {};
        processedMarks.forEach(mark => {
          if (mark?.subject?.id) {
            subjectsMap[mark.subject.id] = mark.subject;
          } else if (mark?.subject_id) {
            // Handle case where subject is not expanded
            subjectsMap[mark.subject_id] = { 
              id: mark.subject_id, 
              name: `Subject ${mark.subject_id}`, 
              credits: 3 
            };
          }
        });
        setSubjects(subjectsMap);
        
        if (usingMockData) {
          setSnackbar({
            open: true,
            message: 'Displaying sample data for demonstration',
            severity: 'info',
            autoHideDuration: 5000
          });
        }
      } else {
        setCgpa('0.00');
        setSubjects({});
      }
    } catch (error) {
      console.error('Error processing marks data:', error);
      setSnackbar({
        open: true,
        message: 'Error processing marks data',
        severity: 'error',
        autoHideDuration: 5000
      });
    }
  }, []);

  // Initialize with sample data and calculate CGPA
  useEffect(() => {
    let isMounted = true;
    
    const calculateCGPA = () => {
      // This is a simplified CGPA calculation
      // In a real app, you would calculate this based on your institution's grading system
      return '8.75';
    };
    
    // Set initial CGPA
    setCgpa(calculateCGPA());
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (session?.user) {
            setUser(session.user);
            // Uncomment if you implement fetchMarks
            // fetchMarks(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setMarksData([]);
        }
        setLoading(false);
      }
    );
    
    // Initial session check
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // Uncomment if you implement fetchMarks
          // fetchMarks(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    getInitialSession();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Handle page change for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change for pagination
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Calculate grade based on marks
  const calculateGrade = (marksObtained, maxMarks) => {
    if (!marksObtained || !maxMarks) return 'N/A';
    const percentage = (parseFloat(marksObtained) / parseFloat(maxMarks)) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  // Calculate CGPA based on marks data
  const calculateCGPA = (marksData) => {
    if (!marksData || marksData.length === 0) {
      setCgpa('0.00');
      return;
    }
    
    const subjectResults = {};
    
    marksData.forEach(mark => {
      const subjectId = mark.subject_id || 'unknown';
      const subjectName = mark.subject?.name || 'Unknown Subject';
      const subjectCode = mark.subject?.code || '';
      const credits = mark.subject?.credits || 4;
      
      if (!subjectResults[subjectId]) {
        subjectResults[subjectId] = {
          name: subjectName,
          code: subjectCode,
          credits: credits,
          totalMarks: 0,
          maxMarks: 0,
          exams: []
        };
      }
      
      const marksObtained = parseFloat(mark.marks_obtained) || 0;
      const maxMarks = parseFloat(mark.exam?.total_marks) || 100;
      
      subjectResults[subjectId].exams.push({
        examName: mark.exam?.name || 'Exam',
        examType: mark.exam?.exam_type || 'exam',
        marksObtained: marksObtained,
        maxMarks: maxMarks,
        date: mark.exam?.exam_date || new Date().toISOString()
      });
      
      // Update subject totals
      subjectResults[subjectId].totalMarks += marksObtained;
      subjectResults[subjectId].maxMarks += maxMarks;
    });
    
    // Calculate CGPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    Object.values(subjectResults).forEach(subject => {
      const percentage = subject.maxMarks > 0 ? (subject.totalMarks / subject.maxMarks) * 100 : 0;
      let gradePoint = 0;
      
      if (percentage >= 90) gradePoint = 10;
      else if (percentage >= 80) gradePoint = 9;
      else if (percentage >= 70) gradePoint = 8;
      else if (percentage >= 60) gradePoint = 7;
      else if (percentage >= 50) gradePoint = 6;
      else if (percentage >= 40) gradePoint = 5;
      else gradePoint = 0; // Fail
      
      totalGradePoints += gradePoint * (subject.credits || 4);
      totalCredits += (subject.credits || 4);
    });
    
    const calculatedCgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    setCgpa(calculatedCgpa);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  // Render marks table
  const renderMarksTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Subject Code</strong></TableCell>
            <TableCell><strong>Subject Name</strong></TableCell>
            <TableCell><strong>Exam</strong></TableCell>
            <TableCell align="right"><strong>Marks Obtained</strong></TableCell>
            <TableCell align="right"><strong>Max Marks</strong></TableCell>
            <TableCell align="right"><strong>Percentage</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {marksData.map((mark) => (
            <TableRow key={`${mark.subject_id}-${mark.exam_id || mark.exam?.id}`}>
              <TableCell>{mark.subject?.code || `SUB${mark.subject_id}`}</TableCell>
              <TableCell>{mark.subject?.name || `Subject ${mark.subject_id}`}</TableCell>
              <TableCell>{mark.exam?.name || 'N/A'}</TableCell>
              <TableCell align="right">{mark.marks_obtained}</TableCell>
              <TableCell align="right">{mark.max_marks || 100}</TableCell>
              <TableCell align="right">
                {((mark.marks_obtained / (mark.max_marks || 100)) * 100).toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render CGPA card
  const renderCGPACard = () => (
    <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your CGPA
        </Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
            {cgpa}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Based on {Object.keys(subjects).length} subjects
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Render main content
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Marks & Results
      </Typography>
      
      {renderCGPACard()}
      <Typography variant="h6" gutterBottom>
        Subject-wise Marks
      </Typography>
      
      {loading ? (
        <Box sx={{ width: '100%', p: 3 }}>
          <LinearProgress />
        </Box>
      ) : marksData.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No marks data available. Your marks will be displayed here once they are available.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Subject Code</strong></TableCell>
                <TableCell><strong>Subject Name</strong></TableCell>
                <TableCell><strong>Exam</strong></TableCell>
                <TableCell align="right"><strong>Marks Obtained</strong></TableCell>
                <TableCell align="right"><strong>Max Marks</strong></TableCell>
                <TableCell align="right"><strong>Percentage</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {marksData.map((mark) => (
                <TableRow key={`${mark.subject_id}-${mark.exam_id || mark.exam?.id}`}>
                  <TableCell>{mark.subject?.code || `SUB${mark.subject_id}`}</TableCell>
                  <TableCell>{mark.subject?.name || `Subject ${mark.subject_id}`}</TableCell>
                  <TableCell>{mark.exam?.name || 'N/A'}</TableCell>
                  <TableCell align="right">{mark.marks_obtained}</TableCell>
                  <TableCell align="right">{mark.max_marks || 100}</TableCell>
                  <TableCell align="right">
                    {((mark.marks_obtained / (mark.max_marks || 100)) * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentMarks;
