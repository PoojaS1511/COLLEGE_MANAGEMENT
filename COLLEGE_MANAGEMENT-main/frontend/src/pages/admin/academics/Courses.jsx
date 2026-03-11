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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import apiService from '../../../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [departments, setDepartments] = useState([]);
  const [currentCourse, setCurrentCourse] = useState({
    id: '',
    name: '',
    code: '',
    duration: 1,
    credits: 0,
    description: '',
    department_id: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getAllDepartments();
      if (response && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showSnackbar('Failed to load departments', 'error');
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching courses from API...');

      // Use apiService for consistent API handling
      const response = await apiService.getCourses();

      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to fetch courses');
      }

      const coursesData = response.data || [];

      if (!Array.isArray(coursesData)) {
        throw new Error('Invalid data format received from server');
      }

      // Transform the data to match the expected format
      const formattedCourses = coursesData.map(course => ({
        id: course.id?.toString() || '',
        code: course.code || 'N/A',
        name: course.name || 'Unnamed Course',
        duration: parseInt(course.duration_years) || parseInt(course.duration) || 1,
        description: course.description || '',
        credits: course.credits || 0,
        department_id: course.department_id || null,
        // Include additional fields for display
        department_name: course.departments?.name || course.department_name || course.department?.name || 'N/A',
        fee_per_semester: course.fee_per_semester || 0
      }));

      console.log(`Loaded ${formattedCourses.length} courses`, formattedCourses);
      setCourses(formattedCourses);
      return formattedCourses;

    } catch (error) {
      console.error('Error in fetchCourses:', {
        error: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });

      const errorMessage = error.message || 'Failed to load courses';
      setError(errorMessage);
      setCourses([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const validateCourseData = (courseData) => {
    const requiredFields = ['name', 'code', 'department_id', 'credits', 'duration'];
    const errors = [];

    // Check required fields
    requiredFields.forEach(field => {
      if (courseData[field] === undefined || courseData[field] === null || courseData[field] === '') {
        errors.push(`${field.replace('_', ' ').toUpperCase()} is required`);
      }
    });

    // Validate numeric fields
    const credits = Number(courseData.credits);
    const duration = Number(courseData.duration);

    if (isNaN(credits) || credits < 0) {
      errors.push('CREDITS must be a non-negative number');
    }

    if (isNaN(duration) || duration < 1 || duration > 10) {
      errors.push('DURATION must be between 1 and 10 years');
    }

    return errors;
  };

  const checkForDuplicateCode = async (code, excludeId = null) => {
    try {
      if (!code || typeof code !== 'string') {
        return { isDuplicate: false, error: 'Invalid course code' };
      }

      console.log('Checking for duplicate code:', { code, excludeId });
      const { exists, error } = await apiService.checkCourseCodeExists(
        code.trim(), 
        excludeId
      );
      
      if (error) {
        console.error('Error checking course code:', error);
        // If we get a 409 error, it means the code already exists
        if (error.code === '23505' || error.message?.includes('already exists')) {
          return { isDuplicate: true, error: null };
        }
        return { isDuplicate: false, error: 'Error checking course code' };
      }
      
      return { 
        isDuplicate: Boolean(exists), 
        error: null 
      };
    } catch (error) {
      console.error('Exception in checkForDuplicateCode:', {
        error: error.message,
        code: error.code,
        details: error.details,
        stack: error.stack
      });
      
      // If we get a 409 error, it means the code already exists
      if (error.code === '23505' || error.message?.includes('already exists')) {
        return { isDuplicate: true, error: null };
      }
      
      return { 
        isDuplicate: false, 
        error: error.message || 'Failed to verify course code' 
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare course data with proper types
      const courseData = {
        ...currentCourse,
        code: String(currentCourse.code || '').trim(),
        name: String(currentCourse.name || '').trim(),
        description: String(currentCourse.description || '').trim(),
        credits: Number(currentCourse.credits) || 0,
        duration: Number(currentCourse.duration) || 1,
        department_id: currentCourse.department_id || null
      };

      // Validate course data
      const validationErrors = validateCourseData(courseData);
      if (validationErrors.length > 0) {
        showSnackbar(validationErrors.join('\n'), 'error');
        setLoading(false);
        return;
      }
      
      // Always check for duplicate course code
      const { isDuplicate, error: duplicateError } = await checkForDuplicateCode(
        courseData.code,
        editing ? currentCourse.id : null
      );
      
      if (duplicateError) {
        showSnackbar(`Error checking course code: ${duplicateError}`, 'error');
        setLoading(false);
        return;
      }
      
      if (isDuplicate) {
        showSnackbar('A course with this code already exists. Please use a different code.', 'error');
        setLoading(false);
        return;
      }

      // Log the course data being submitted
      console.log('Submitting course data:', {
        editing,
        currentCode: courseData.code,
        originalCode: currentCourse.originalCode,
        department_id: courseData.department_id,
        credits: courseData.credits,
        duration: courseData.duration
      });

      // In development, just update the local state
      if (import.meta.env.DEV) {
        setCourses(prevCourses => {
          if (editing) {
            return prevCourses.map(course => 
              course.id === currentCourse.id ? { ...course, ...courseData } : course
            );
          } else {
            return [...prevCourses, { ...courseData, id: Date.now().toString() }];
          }
        });
        
        showSnackbar(
          `Course ${editing ? 'updated' : 'created'} successfully! (Demo Mode)`,
          'success'
        );
        setOpen(false);
        setLoading(false);
        return;
      }
      
      // Real API call in production
      try {
        let response;
        if (editing) {
          response = await apiService.updateCourse(currentCourse.id, courseData);
        } else {
          response = await apiService.createCourse(courseData);
        }

        if (response && response.success) {
          showSnackbar(
            `Course ${editing ? 'updated' : 'created'} successfully!`,
            'success'
          );
          setOpen(false);
          await fetchCourses(); // Wait for courses to refresh
        } else {
          throw new Error(response?.error || 'Failed to save course');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        let errorMessage = 'Failed to save course. Please try again.';
        
        // Handle specific error cases
        if (apiError.code === '23505' || apiError.message?.includes('already exists')) {
          errorMessage = 'A course with this code already exists. Please use a different code.';
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        showSnackbar(errorMessage, 'error');
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error saving course:', error);
      showSnackbar(
        error.message || 'Failed to save course. Changes not saved in demo mode.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setLoading(true);
        const response = await apiService.deleteCourse(id);
        
        if (response.success) {
          showSnackbar('Course deleted successfully!', 'success');
          fetchCourses();
        } else {
          throw new Error(response.error || 'Failed to delete course');
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        showSnackbar(error.message || 'Failed to delete course', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpen = (course = null) => {
    if (course) {
      setCurrentCourse({
        ...course,
        credits: course.credits || 0,
        duration: course.duration || 1,
        department_id: course.department_id || '',
        originalCode: course.code // Store the original code for comparison
      });
      setEditing(true);
    } else {
      setCurrentCourse({
        id: '',
        name: '',
        code: '',
        duration: 1,
        credits: 0,
        description: '',
        department_id: departments.length > 0 ? departments[0].id : '',
        originalCode: ''
      });
      setEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convert numeric fields to numbers
    const numericFields = ['duration', 'credits'];
    const parsedValue = numericFields.includes(name) 
      ? value === '' ? '' : Number(value)
      : value;
      
    setCurrentCourse(prev => ({
      ...prev,
      [name]: parsedValue
    }));
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
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Courses</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Course
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="courses table">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <TableRow 
                  key={course.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>{course.code}</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {course.name}
                      </Typography>
                      {course.description && (
                        <Typography variant="caption" color="text.secondary">
                          {course.description.length > 60 
                            ? `${course.description.substring(0, 60)}...` 
                            : course.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{course.duration} {course.duration === 1 ? 'year' : 'years'}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpen(course)} 
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(course.id)} 
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {error ? error : 'No courses found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editing ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="code"
              label="Course Code"
              type="text"
              fullWidth
              variant="outlined"
              value={currentCourse.code}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="name"
              label="Course Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentCourse.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              select
              margin="dense"
              name="department_id"
              label="Department"
              fullWidth
              variant="outlined"
              value={currentCourse.department_id || ''}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              SelectProps={{
                native: true,
              }}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="duration"
              label="Duration (years)"
              type="number"
              fullWidth
              variant="outlined"
              value={currentCourse.duration}
              onChange={handleChange}
              required
              inputProps={{ min: 1, max: 10, step: 1 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="credits"
              label="Credits"
              type="number"
              fullWidth
              variant="outlined"
              value={currentCourse.credits || 0}
              onChange={handleChange}
              required
              inputProps={{ min: 0, step: 0.5 }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={currentCourse.description || ''}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Courses;
