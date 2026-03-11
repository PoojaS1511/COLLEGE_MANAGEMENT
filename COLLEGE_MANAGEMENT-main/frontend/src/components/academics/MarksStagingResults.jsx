import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Select, MenuItem, FormControl,
  InputLabel, Grid, CircularProgress, Alert, Divider, Button, TextField,
  Modal, Dialog, DialogTitle, DialogContent, DialogActions, FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const MarksStagingResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Mark Entry Modal State
  const [markEntryOpen, setMarkEntryOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    examType: 'class_test',
    date: new Date(),
    maxMarks: '100',
    passingMarks: '35'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMarksChange = (studentId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleMarkEntrySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(false);

    try {
      // Validate form data
      if (!formData.subject) {
        throw new Error('Please select a subject');
      }
      if (Object.keys(marks).length === 0) {
        throw new Error('Please enter marks for at least one student');
      }

      // Prepare marks data for submission
      const marksData = Object.entries(marks).map(([studentId, marksObtained]) => ({
        student_id: studentId,
        subject: formData.subject,
        exam_type: formData.examType,
        exam_date: formData.date.toISOString(),
        max_marks: parseInt(formData.maxMarks, 10),
        passing_marks: parseInt(formData.passingMarks, 10),
        marks_obtained: parseFloat(marksObtained),
        status: parseFloat(marksObtained) >= parseInt(formData.passingMarks, 10) ? 'pass' : 'fail'
      }));

      // Insert marks into the database
      const { error } = await supabase
        .from('marks_staging')
        .insert(marksData);

      if (error) throw error;

      // Reset form and show success message
      setFormSuccess(true);
      setMarks({});
      setFormData({
        subject: '',
        examType: 'class_test',
        date: new Date(),
        maxMarks: '100',
        passingMarks: '35'
      });

      // Refresh the marks data
      fetchMarksStagingData(filters);
      
      // Close the modal after a short delay
      setTimeout(() => {
        setMarkEntryOpen(false);
        setFormSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving marks:', error);
      setFormError(error.message || 'Failed to save marks. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const [filters, setFilters] = useState({
    course: '',
    semester: '',
    examType: '',
    subject: ''
  });

  const fetchMarksStagingData = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching marks staging data with filters:', currentFilters);
      
      // First, get the marks data with just the IDs
      console.log('Fetching marks data...');
      let query = supabase
        .from('marks_staging')
        .select('*');

      // Apply filters
      if (currentFilters.course) {
        query = query.eq('course_id', currentFilters.course);
      }
      if (currentFilters.semester) {
        query = query.eq('semester', currentFilters.semester);
      }
      if (currentFilters.examType) {
        query = query.eq('exam_type', currentFilters.examType);
      }
      if (currentFilters.subject) {
        query = query.eq('subject_id', currentFilters.subject);
      }

      const { data: marksData, error: marksError } = await query;
      
      if (marksError) {
        console.error('Error fetching marks data:', marksError);
        throw marksError;
      }
      
      if (!marksData || marksData.length === 0) {
        console.log('No marks data found');
        setResults([]);
        return;
      }
      
      console.log('Marks data:', marksData);
      
      // Get unique student, subject, and exam IDs for batch fetching
      const studentIds = [...new Set(marksData.map(item => item.student_id))];
      const subjectIds = [...new Set(marksData.map(item => item.subject_id))];
      const examIds = [...new Set(marksData.map(item => item.exam_id))];
      
      console.log('Fetching related data...', { studentIds, subjectIds, examIds });
      
      // Fetch related data in parallel, only if we have valid IDs
      const fetchPromises = [];
      
      // Only add fetch promises for non-empty ID arrays
      const fetchStudents = studentIds && studentIds.length > 0 && studentIds.every(id => id) 
        ? supabase.from('students').select('*').in('id', studentIds)
        : { data: [], error: null };
      
      const fetchSubjects = subjectIds && subjectIds.length > 0 && subjectIds.every(id => id)
        ? supabase.from('subjects').select('*').in('id', subjectIds)
        : { data: [], error: null };
      
      const fetchExams = examIds && examIds.length > 0 && examIds.every(id => id)
        ? supabase.from('exams').select('*').in('id', examIds)
        : { data: [], error: null };
      
      // Execute all valid fetches in parallel
      const [
        { data: studentsData, error: studentsError },
        { data: subjectsData, error: subjectsError },
        { data: examsData, error: examsError }
      ] = await Promise.all([
        fetchStudents,
        fetchSubjects,
        fetchExams
      ]);
      
      // Check for errors
      if (studentsError) console.error('Error fetching students:', studentsError);
      if (subjectsError) console.error('Error fetching subjects:', subjectsError);
      if (examsError) console.error('Error fetching exams:', examsError);
      
      // Create lookup maps for related data
      const studentsMap = new Map((studentsData || []).map(s => [s.id, s]));
      const subjectsMap = new Map((subjectsData || []).map(s => [s.id, s]));
      const examsMap = new Map((examsData || []).map(e => [e.id, e]));
      
      console.log('Related data:', { studentsMap, subjectsMap, examsMap });
      
      // Combine the data
      const combinedData = marksData.map(mark => ({
        ...mark,
        student: studentsMap.get(mark.student_id) || {},
        subject: subjectsMap.get(mark.subject_id) || {},
        exam: examsMap.get(mark.exam_id) || {}
      }));
      
      console.log('Combined data:', combinedData);
      setResults(combinedData);
    } catch (err) {
      console.error('Error in fetchMarksStagingData:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      setError('Failed to load marks data. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we don't use any external values

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching courses:', err);
      return [];
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching subjects:', err);
      return [];
    }
  };

  // Memoize the fetch function with useCallback
  const loadData = useCallback(async () => {
    await fetchMarksStagingData(filters);
    // Load additional data like courses and subjects if needed
    const [coursesData, subjectsData] = await Promise.all([
      fetchCourses(),
      fetchSubjects()
    ]);
    // You can set these to state if needed for dropdowns
  }, [filters, fetchMarksStagingData]);

  // Set up the effect to run when loadData changes
  useEffect(() => {
    const loadDataWithDebounce = setTimeout(() => {
      loadData();
    }, 300); // 300ms debounce to prevent rapid requests

    return () => clearTimeout(loadDataWithDebounce);
  }, [loadData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    // Only update if the value has actually changed
    setFilters(prev => {
      if (prev[name] === value) return prev;
      return {
        ...prev,
        [name]: value
      };
    });
    setPage(0);
  };

  // Calculate SGPA (if applicable)
  const calculateSGPA = (studentMarks) => {
    // Implement your SGPA calculation logic here
    return '8.00'; // Placeholder
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
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Group results by student
  const resultsByStudent = results.reduce((acc, result) => {
    const studentId = result.student_id;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: result.student,
        marks: []
      };
    }
    acc[studentId].marks.push(result);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Academic Results
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setMarkEntryOpen(true)}
          sx={{ mb: 2 }}
        >
          Mark Entry
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select
                name="course"
                value={filters.course}
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Exam Type</InputLabel>
              <Select
                name="examType"
                value={filters.examType}
                onChange={handleFilterChange}
                label="Exam Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="midterm">Midterm</MenuItem>
                <MenuItem value="final">Final</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                label="Subject"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {/* Add your subject options here */}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {Object.entries(resultsByStudent).map(([studentId, { student, marks }]) => (
        <Paper key={studentId} sx={{ mb: 4, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <div>
              <Typography variant="h6">
                {student?.first_name} {student?.last_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {student?.roll_number} | {student?.course_name} - Semester {student?.semester}
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
              <Typography variant="h6">{calculateSGPA(marks)}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {marks.map((mark, index) => (
            <Box key={index} mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                {mark.subject?.name || 'N/A'}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Exam Type</TableCell>
                      <TableCell>Max Marks</TableCell>
                      <TableCell>Marks Obtained</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{mark.exam?.exam_type || mark.exam_type || 'N/A'}</TableCell>
                      <TableCell>{mark.max_marks || mark.exam?.max_marks || 'N/A'}</TableCell>
                      <TableCell>{mark.marks_obtained || 'N/A'}</TableCell>
                      <TableCell>{mark.grade || 'N/A'}</TableCell>
                      <TableCell>
                        {mark.exam?.date 
                          ? new Date(mark.exam.date).toLocaleDateString() 
                          : mark.exam_date 
                            ? new Date(mark.exam_date).toLocaleDateString()
                            : 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Paper>
      ))}

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={Object.keys(resultsByStudent).length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* Mark Entry Modal */}
      <Dialog 
        open={markEntryOpen} 
        onClose={() => setMarkEntryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Enter Marks</DialogTitle>
        <form onSubmit={handleMarkEntrySubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    label="Subject"
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                    {subjects.map(subject => (
                      <MenuItem key={subject.id} value={subject.name}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    name="examType"
                    value={formData.examType}
                    onChange={handleInputChange}
                    label="Exam Type"
                  >
                    <MenuItem value="class_test">Class Test</MenuItem>
                    <MenuItem value="unit_test">Unit Test</MenuItem>
                    <MenuItem value="mid_term">Mid Term</MenuItem>
                    <MenuItem value="final_exam">Final Exam</MenuItem>
                    <MenuItem value="quiz">Quiz</MenuItem>
                    <MenuItem value="assignment">Assignment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <FormControl fullWidth margin="normal">
                    <DatePicker
                      label="Date"
                      value={formData.date}
                      onChange={(newValue) => {
                        setFormData(prev => ({
                          ...prev,
                          date: newValue
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </FormControl>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Max Marks"
                  name="maxMarks"
                  type="number"
                  value={formData.maxMarks}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  required
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Passing Marks"
                  name="passingMarks"
                  type="number"
                  value={formData.passingMarks}
                  onChange={handleInputChange}
                  inputProps={{ 
                    min: 0, 
                    max: formData.maxMarks 
                  }}
                  required
                />
              </Grid>
            </Grid>

            {formData.subject && students.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>Marks</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.branch}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="text"
                            value={marks[student.id] || ''}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            inputProps={{ 
                              style: { textAlign: 'right' },
                              inputMode: 'decimal',
                              max: formData.maxMarks
                            }}
                            sx={{ 
                              width: '80px',
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: marks[student.id] !== '' ? 
                                    (parseFloat(marks[student.id]) >= formData.passingMarks ? 'success.main' : 'error.main') : 
                                    'divider'
                                }
                              }
                            }}
                          />
                          <Typography variant="caption" display="block" color="textSecondary">
                            / {formData.maxMarks}
                          </Typography>
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            backgroundColor: getStatusColor(marks[student.id]),
                            fontWeight: 'medium',
                            color: marks[student.id] !== '' ? 
                              (parseFloat(marks[student.id]) >= formData.passingMarks ? 'success.dark' : 'error.dark') : 
                              'text.secondary'
                          }}
                        >
                          {marks[student.id] === '' 
                            ? '-' 
                            : parseFloat(marks[student.id]) >= formData.passingMarks 
                              ? 'Passed' 
                              : 'Failed'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {formError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formError}
              </Alert>
            )}
            {formSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Marks saved successfully!
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => {
                setMarkEntryOpen(false);
                setFormError(null);
                setFormSuccess(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting || !formData.subject}
            >
              {isSubmitting ? 'Saving...' : 'Save Marks'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MarksStagingResults;
