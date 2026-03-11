import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Select, MenuItem, FormControl,
  InputLabel, Grid, CircularProgress, Alert, Divider
} from '@mui/material';
import { supabase } from '../../lib/supabase';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    examId: '',
    studentId: '',
    courseId: '',
    semester: ''
  });

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('exam_results')
        .select(`
          *,
          exam:exam_id (*, subject:subject_id (*)),
          student:student_id (*)
        `);

      // Apply filters if they exist
      if (filters.examId) {
        query = query.eq('exam_id', filters.examId);
      }
      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      if (filters.courseId) {
        query = query.eq('course_id', filters.courseId);
      }
      if (filters.semester) {
        query = query.eq('semester', filters.semester);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setResults(data || []);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  // Calculate SGPA (this is a simplified version)
  const calculateSGPA = (studentResults) => {
    if (!studentResults || studentResults.length === 0) return 0;
    
    const totalCredits = studentResults.reduce((sum, result) => {
      return sum + (result.exam?.subject?.credits || 0);
    }, 0);
    
    if (totalCredits === 0) return 0;
    
    const totalGradePoints = studentResults.reduce((sum, result) => {
      const gradePoint = getGradePoint(result.marks_obtained, result.exam?.max_marks || 100);
      return sum + (gradePoint * (result.exam?.subject?.credits || 0));
    }, 0);
    
    return (totalGradePoints / totalCredits).toFixed(2);
  };

  const getGradePoint = (marksObtained, maxMarks) => {
    const percentage = (marksObtained / maxMarks) * 100;
    
    if (percentage >= 90) return 10;
    if (percentage >= 80) return 9;
    if (percentage >= 70) return 8;
    if (percentage >= 60) return 7;
    if (percentage >= 50) return 6;
    if (percentage >= 40) return 5;
    return 0; // Fail
  };

  const getGrade = (marksObtained, maxMarks) => {
    const percentage = (marksObtained / maxMarks) * 100;
    
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  // Group results by student
  const resultsByStudent = results.reduce((acc, result) => {
    const studentId = result.student_id;
    if (!acc[studentId]) {
      acc[studentId] = [];
    }
    acc[studentId].push(result);
    return acc;
  }, {});

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Academic Results
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select
                name="courseId"
                value={filters.courseId}
                onChange={handleFilterChange}
                label="Course"
              >
                <MenuItem value="">All Courses</MenuItem>
                {/* Add your course options here */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester</InputLabel>
              <Select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                label="Semester"
              >
                <MenuItem value="">All Semesters</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* Add more filters as needed */}
        </Grid>
      </Paper>

      {Object.entries(resultsByStudent).map(([studentId, studentResults]) => {
        const student = studentResults[0]?.student || {};
        const sgpa = calculateSGPA(studentResults);

        return (
          <Paper key={studentId} sx={{ mb: 4, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <div>
                <Typography variant="h6">
                  {student.first_name} {student.last_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {student.roll_number} | {student.course_name} - Semester {student.semester}
                </Typography>
              </div>
              <Box sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="caption" display="block">SGPA</Typography>
                <Typography variant="h6">{sgpa}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Exam Type</TableCell>
                    <TableCell>Max Marks</TableCell>
                    <TableCell>Marks Obtained</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.exam?.subject?.name || 'N/A'}</TableCell>
                      <TableCell>{result.exam?.exam_type || 'N/A'}</TableCell>
                      <TableCell>{result.exam?.max_marks || 'N/A'}</TableCell>
                      <TableCell>{result.marks_obtained}</TableCell>
                      <TableCell>
                        {getGrade(result.marks_obtained, result.exam?.max_marks || 100)}
                      </TableCell>
                      <TableCell>
                        {new Date(result.exam?.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      })}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={Object.keys(resultsByStudent).length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default Results;
