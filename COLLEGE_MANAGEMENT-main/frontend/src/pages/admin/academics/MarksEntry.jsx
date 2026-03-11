import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import apiService from '../../../services/api';

const MarksEntry = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksData, setMarksData] = useState([]);
  
  // Form state
  const [filters, setFilters] = useState({
    course: '',
    academicYear: '2024-2025',
    semester: '1',
    exam: '',
    subject: ''
  });

  // UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: null
  });

  // Show snackbar notification
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Show confirmation dialog
  const showConfirmDialog = (title, content, onConfirm) => {
    setConfirmDialog({
      open: true,
      title,
      content,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        if (onConfirm) await onConfirm();
      }
    });
  };

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const { data: coursesData } = await apiService.getCourses();
        setCourses(coursesData || []);
      } catch (error) {
        showSnackbar('Failed to load courses', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch exams when course, academic year, or semester changes
  useEffect(() => {
    const fetchExams = async () => {
      if (!filters.course || !filters.academicYear || !filters.semester) return;
      
      try {
        setLoading(true);
        const { data: examsData, error } = await apiService.getExams({
          course_id: filters.course,
          academic_year: filters.academicYear,
          semester: parseInt(filters.semester)
        });
        
        if (error) throw error;
        setExams(examsData || []);
      } catch (error) {
        console.error('Error fetching exams:', error);
        showSnackbar('Failed to load exams', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, [filters.course, filters.academicYear, filters.semester]);

  // Fetch subjects when course changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!filters.course) return;
      
      try {
        setLoading(true);
        const { data: subjectsData, error } = await apiService.getSubjects(filters.course);
        
        if (error) throw error;
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        showSnackbar('Failed to load subjects', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, [filters.course]);

  // Fetch students with marks when exam and subject are selected
  const fetchStudentsWithMarks = async () => {
    if (!filters.exam || !filters.subject) return;
    
    try {
      setLoading(true);
      const { data, error } = await apiService.getStudentsForMarks(filters.exam, filters.subject);
      
      if (error) throw error;
      
      // Transform data to match the expected format
      const formattedData = data.map(item => ({
        id: item.id || null,
        student_id: item.student_id || item.id,
        name: item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : 'Unknown',
        register_number: item.register_number || 'N/A',
        marks_obtained: item.marks_obtained || '',
        grade: item.grade || '',
        remarks: item.remarks || ''
      }));
      
      setMarksData(formattedData);
    } catch (error) {
      console.error('Error fetching students with marks:', error);
      showSnackbar(error.message || 'Failed to load students and marks', 'error');
      setMarksData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      
      // Reset dependent filters
      if (name === 'course') {
        newFilters.exam = '';
        newFilters.subject = '';
      } else if (name === 'exam') {
        newFilters.subject = '';
      }
      
      return newFilters;
    });
  };

  // Handle marks change
  const handleMarksChange = (studentId, field, value) => {
    setMarksData(prevData => 
      prevData.map(item => 
        item.student_id === studentId 
          ? { 
              ...item, 
              [field]: value,
              ...(field === 'marks_obtained' ? { 
                grade: calculateGrade(value) 
              } : {})
            }
          : item
      )
    );
  };

  // Calculate grade based on marks
  const calculateGrade = (marks) => {
    if (marks === '' || marks === null || marks === undefined) return '';
    
    const numericMarks = parseFloat(marks);
    if (isNaN(numericMarks)) return '';
    
    if (numericMarks >= 90) return 'A+';
    if (numericMarks >= 80) return 'A';
    if (numericMarks >= 70) return 'B+';
    if (numericMarks >= 60) return 'B';
    if (numericMarks >= 50) return 'C';
    if (numericMarks >= 40) return 'D';
    return 'F';
  };

  // Handle save marks
  const handleSaveMarks = async () => {
    if (!filters.exam || !filters.subject) {
      showSnackbar('Please select an exam and subject', 'error');
      return;
    }
    
    // Validate marks
    const hasInvalidMarks = marksData.some(mark => {
      const marks = mark.marks_obtained;
      return marks !== '' && (isNaN(parseFloat(marks)) || parseFloat(marks) < 0);
    });
    
    if (hasInvalidMarks) {
      showSnackbar('Please enter valid marks for all students', 'error');
      return;
    }
    
    showConfirmDialog(
      'Confirm Save',
      'Are you sure you want to save these marks?',
      saveMarks
    );
  };

  // Save marks to the server
  const saveMarks = async () => {
    try {
      setSaving(true);
      
      // Prepare marks data for submission
      const marksToSave = marksData
        .filter(mark => mark.marks_obtained !== '')
        .map(mark => ({
          id: mark.id || undefined, // Let the database generate a new ID if not provided
          exam_id: filters.exam,
          student_id: mark.student_id,
          subject_id: filters.subject,
          marks_obtained: parseFloat(mark.marks_obtained),
          grade: mark.grade || calculateGrade(mark.marks_obtained),
          remarks: mark.remarks || ''
        }));
      
      if (marksToSave.length === 0) {
        showSnackbar('No valid marks to save', 'warning');
        return;
      }
      
      // Save marks
      const { error } = await apiService.upsertMarks(marksToSave);
      
      if (error) throw new Error(error);
      
      showSnackbar('Marks saved successfully', 'success');
      // Refresh the data
      fetchStudentsWithMarks();
    } catch (error) {
      console.error('Error saving marks:', error);
      showSnackbar(error.message || 'Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = Boolean(
    filters.course && 
    filters.academicYear && 
    filters.semester && 
    filters.exam && 
    filters.subject
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Marks Entry</Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Select Filters</Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          {/* Course Selector */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="course-label">Course</InputLabel>
              <Select
                labelId="course-label"
                value={filters.course}
                label="Course"
                onChange={(e) => handleFilterChange('course', e.target.value)}
                disabled={loading}
              >
                <MenuItem value=""><em>Select Course</em></MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </MenuItem>
                ))}
              </Select>
              {!filters.course && <FormHelperText>Required</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Academic Year */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="academic-year-label">Academic Year</InputLabel>
              <Select
                labelId="academic-year-label"
                value={filters.academicYear}
                label="Academic Year"
                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                disabled={!filters.course}
              >
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Semester */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="semester-label">Semester</InputLabel>
              <Select
                labelId="semester-label"
                value={filters.semester}
                label="Semester"
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                disabled={!filters.course}
              >
                <MenuItem value="1">Semester 1</MenuItem>
                <MenuItem value="2">Semester 2</MenuItem>
                <MenuItem value="3">Semester 3</MenuItem>
                <MenuItem value="4">Semester 4</MenuItem>
                <MenuItem value="5">Semester 5</MenuItem>
                <MenuItem value="6">Semester 6</MenuItem>
                <MenuItem value="7">Semester 7</MenuItem>
                <MenuItem value="8">Semester 8</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Exam Selector */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="exam-label">Exam</InputLabel>
              <Select
                labelId="exam-label"
                value={filters.exam}
                label="Exam"
                onChange={(e) => handleFilterChange('exam', e.target.value)}
                disabled={!filters.course || !filters.academicYear || !filters.semester || loading}
              >
                <MenuItem value=""><em>Select Exam</em></MenuItem>
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.name} ({formatDate(exam.exam_date)})
                  </MenuItem>
                ))}
              </Select>
              {!filters.exam && <FormHelperText>Required</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Subject Selector */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="subject-label">Subject</InputLabel>
              <Select
                labelId="subject-label"
                value={filters.subject}
                label="Subject"
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                disabled={!filters.course || loading}
              >
                <MenuItem value=""><em>Select Subject</em></MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </MenuItem>
                ))}
              </Select>
              {!filters.subject && <FormHelperText>Required</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Load Button */}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchStudentsWithMarks}
              disabled={!isFormValid || loading}
              fullWidth
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            >
              {loading ? 'Loading...' : 'Load Students'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Marks Table */}
      {marksData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">Student Marks</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveMarks}
              disabled={saving || marksData.length === 0}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Marks'}
            </Button>
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Register No.</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Marks Obtained</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marksData.map((row, index) => (
                  <TableRow key={row.student_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.register_number}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={row.marks_obtained}
                        onChange={(e) => handleMarksChange(row.student_id, 'marks_obtained', e.target.value)}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>
                      <TextField
                        value={row.remarks}
                        onChange={(e) => handleMarksChange(row.student_id, 'remarks', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Remarks"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* No Data Message */}
      {isFormValid && !loading && marksData.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No student data found. Please adjust your filters and click 'Load Students'.
          </Typography>
        </Paper>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.content}</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm} 
            color="primary" 
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

  // Fetch exams when course, academic year, or semester changes
  useEffect(() => {
    const fetchExams = async () => {
      if (!filters.course || !filters.academicYear || !filters.semester) return;
      
      try {
        setLoading(true);
        const { data: examsData, error } = await apiService.getExams({
          course_id: filters.course,
          academic_year: filters.academicYear,
          semester: parseInt(filters.semester)
        });
        
        if (error) throw error;
        setExams(examsData || []);
      } catch (error) {
        console.error('Error fetching exams:', error);
        showSnackbar('Failed to load exams', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, [filters.course, filters.academicYear, filters.semester]);

  // Fetch subjects when course changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!filters.course) return;
      
      try {
        setLoading(true);
        const { data: subjectsData } = await apiService.getSubjects(filters.course);
        setSubjects(subjectsData || []);
      } catch (error) {
        showSnackbar('Failed to load subjects', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [filters.course]);

  // Fetch students with marks when exam and subject are selected
  const fetchStudentsWithMarks = async () => {
    if (!filters.exam || !filters.subject) return;
    
    try {
      setLoading(true);
      const { data, error } = await apiService.getStudentsForMarks(filters.exam, filters.subject);
      
      if (error) throw new Error(error);
      
      // Transform data to match the expected format
      const formattedData = data.map(item => ({
        id: item.id || null,
        student_id: item.student_id || item.id,
        name: item.first_name ? `${item.first_name} ${item.last_name || ''}`.trim() : 'Unknown',
        register_number: item.register_number || 'N/A',
        marks_obtained: item.marks_obtained || '',
        grade: item.grade || '',
        remarks: item.remarks || ''
      }));
      
      setMarksData(formattedData);
    } catch (error) {
      console.error('Error fetching students with marks:', error);
      showSnackbar(error.message || 'Failed to load students and marks', 'error');
      setMarksData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      
      // Reset dependent filters
      if (name === 'course') {
        newFilters.exam = '';
        newFilters.subject = '';
      } else if (name === 'exam') {
        newFilters.subject = '';
      }
      
      return newFilters;
    });
  };

  // Handle marks change
  const handleMarksChange = (studentId, field, value) => {
    setMarksData(prevData => 
      prevData.map(item => 
        item.student_id === studentId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Calculate grade based on marks
  const calculateGrade = (marks) => {
    if (marks === '' || marks === null || marks === undefined) return '';
    
    const numericMarks = parseFloat(marks);
    if (isNaN(numericMarks)) return '';
    
    if (numericMarks >= 90) return 'A+';
    if (numericMarks >= 80) return 'A';
    if (numericMarks >= 70) return 'B+';
    if (numericMarks >= 60) return 'B';
    if (numericMarks >= 50) return 'C';
    if (numericMarks >= 40) return 'D';
    return 'F';
  };

  // Handle save marks
  const handleSaveMarks = async () => {
    if (!filters.exam || !filters.subject) {
      showSnackbar('Please select an exam and subject', 'error');
      return;
    }
    
    // Validate marks
    const hasInvalidMarks = marksData.some(mark => {
      const marks = mark.marks_obtained;
      return marks !== '' && (isNaN(parseFloat(marks)) || parseFloat(marks) < 0);
    });
    
    if (hasInvalidMarks) {
      showSnackbar('Please enter valid marks for all students', 'error');
      return;
    }
    
    showConfirmDialog(
      'Confirm Save',
      'Are you sure you want to save these marks?',
      saveMarks
    );
  };

  // Save marks to the server
  const saveMarks = async () => {
    try {
      setSaving(true);
      
      // Prepare marks data for submission
      const marksToSave = marksData
        .filter(mark => mark.marks_obtained !== '')
        .map(mark => ({
          id: mark.id || undefined, // Let the database generate a new ID if not provided
          exam_id: filters.exam,
          student_id: mark.student_id,
          subject_id: filters.subject,
          marks_obtained: parseFloat(mark.marks_obtained),
          grade: mark.grade || calculateGrade(mark.marks_obtained),
          remarks: mark.remarks || ''
        }));
      
      if (marksToSave.length === 0) {
        showSnackbar('No valid marks to save', 'warning');
        return;
      }
      
      // Save marks
      const { error } = await apiService.upsertMarks(marksToSave);
      
      if (error) throw new Error(error);
      
      showSnackbar('Marks saved successfully', 'success');
      // Refresh the data
      fetchStudentsWithMarks();
    } catch (error) {
      console.error('Error saving marks:', error);
      showSnackbar(error.message || 'Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = Boolean(
    filters.course && 
    filters.academicYear && 
    filters.semester && 
    filters.exam && 
    filters.subject
  );
  
  // Render the component
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Marks Entry</Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Select Filters</Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          {/* Course Selector */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="course-label">Course</InputLabel>
              <Select
                labelId="course-label"
                value={filters.course}
                label="Course"
                onChange={(e) => handleFilterChange('course', e.target.value)}
                disabled={loading}
              >
                <MenuItem value=""><em>Select Course</em></MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </MenuItem>
                ))}
              </Select>
              {!filters.course && <FormHelperText>Required</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Academic Year */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="academic-year-label">Academic Year</InputLabel>
              <Select
                labelId="academic-year-label"
                value={filters.academicYear}
                label="Academic Year"
                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                disabled={!filters.course}
              >
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
                <MenuItem value="2025-2026">2025-2026</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Semester */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="semester-label">Semester</InputLabel>
              <Select
                labelId="semester-label"
                value={filters.semester}
                label="Semester"
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                disabled={!filters.course}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <MenuItem key={sem} value={sem.toString()}>Semester {sem}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Exam Selector */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="exam-label">Exam</InputLabel>
              <Select
                labelId="exam-label"
                value={filters.exam}
                label="Exam"
                onChange={(e) => handleFilterChange('exam', e.target.value)}
                disabled={!filters.course || loading || exams.length === 0}
              >
                <MenuItem value=""><em>Select Exam</em></MenuItem>
                {exams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.name || `Exam #${exam.id}`}
                  </MenuItem>
                ))}
              </Select>
              {!filters.exam && <FormHelperText>Select course first</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Subject Selector */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small" required>
              <InputLabel id="subject-label">Subject</InputLabel>
              <Select
                labelId="subject-label"
                value={filters.subject}
                label="Subject"
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                disabled={!filters.exam || loading || subjects.length === 0}
              >
                <MenuItem value=""><em>Select Subject</em></MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </MenuItem>
                ))}
              </Select>
              {!filters.subject && <FormHelperText>Select exam first</FormHelperText>}
            </FormControl>
          </Grid>
          
          {/* Action Buttons */}
          <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStudentsWithMarks}
              disabled={loading || saving || !filters.exam || !filters.subject}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveMarks}
              disabled={loading || saving || !isFormValid || marksData.length === 0}
            >
              {saving ? 'Saving...' : 'Save Marks'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Marks Table */}
      {loading && filters.exam && filters.subject ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 2, overflow: 'auto' }}>
          {filters.exam && filters.subject && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {exams.find(e => e.id === filters.exam)?.name || 'Exam'} - 
                {subjects.find(s => s.id === filters.subject)?.name || 'Subject'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Marks: {exams.find(e => e.id === filters.exam)?.total_marks || 'N/A'}
                {exams.find(e => e.id === filters.exam)?.exam_date && (
                  <span> • Date: {format(new Date(exams.find(e => e.id === filters.exam).exam_date), 'dd MMM yyyy')}</span>
                )}
              </Typography>
            </Box>
          )}
          
          <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Register No.</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="center" sx={{ minWidth: 150 }}>Marks Obtained</TableCell>
                  <TableCell align="center" sx={{ minWidth: 100 }}>Grade</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marksData.length > 0 ? (
                  marksData.map((row, index) => (
                    <TableRow key={row.student_id || index} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.register_number}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={row.marks_obtained}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleMarksChange(row.student_id, 'marks_obtained', value);
                            // Auto-calculate grade
                            handleMarksChange(row.student_id, 'grade', calculateGrade(value));
                          }}
                          onBlur={(e) => {
                            const marks = parseFloat(e.target.value);
                            const maxMarks = exams.find(e => e.id === filters.exam)?.total_marks || 100;
                            if (!isNaN(marks) && marks > maxMarks) {
                              handleMarksChange(row.student_id, 'marks_obtained', maxMarks);
                              handleMarksChange(row.student_id, 'grade', calculateGrade(maxMarks));
                            }
                          }}
                          inputProps={{
                            min: 0,
                            step: '0.01',
                            style: { textAlign: 'center' },
                            'aria-label': `Marks for ${row.name}` 
                          }}
                          sx={{ width: 120 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          size="small"
                          value={row.grade}
                          onChange={(e) => handleMarksChange(row.student_id, 'grade', e.target.value)}
                          inputProps={{
                            style: { 
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: 'bold'
                            },
                            maxLength: 2,
                            'aria-label': `Grade for ${row.name}` 
                          }}
                          sx={{ 
                            width: 80,
                            '& input': { 
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: 'bold'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.remarks}
                          onChange={(e) => handleMarksChange(row.student_id, 'remarks', e.target.value)}
                          placeholder="Enter remarks"
                          inputProps={{
                            'aria-label': `Remarks for ${row.name}` 
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      {!filters.course ? (
                        'Please select a course to begin'
                      ) : !filters.exam || !filters.subject ? (
                        'Please select an exam and subject'
                      ) : (
                        'No students found for the selected criteria'
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {marksData.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveMarks}
                disabled={loading || saving || !isFormValid}
                sx={{ minWidth: 200 }}
              >
                {saving ? 'Saving...' : 'Save All Marks'}
              </Button>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.content}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            color="inherit"
            variant="outlined"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              if (confirmDialog.onConfirm) {
                await confirmDialog.onConfirm();
              }
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            color="primary"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MarksEntry;