import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, IconButton, Collapse, Chip, 
  CircularProgress, Alert, TextField, Dialog, DialogTitle, 
  DialogContent, DialogActions, MenuItem, FormControl, InputLabel, 
  Select, Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon
} from '@mui/icons-material';
import apiService from '../../../services/api';
import { supabase } from '../../../lib/supabase';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [expandedCourses, setExpandedCourses] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    description: '',
    duration: '4'
  });

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchCourses(), fetchDepartments()]);
      } catch (error) {
        setError('Failed to load data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await apiService.get('/courses');
      if (response?.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.get('/departments');
      if (response?.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  };

  const fetchSubjects = async (courseId) => {
    try {
      // First get the course to get its department_id
      const { data: course } = await supabase
        .from('courses')
        .select('department_id')
        .eq('id', courseId)
        .single();
      
      if (course && course.department_id) {
        // Then fetch subjects by department_id
        const { data: subjects } = await supabase
          .from('subjects')
          .select('*')
          .eq('department_id', course.department_id);
          
        if (subjects) {
          setSubjects(prev => ({ ...prev, [courseId]: subjects }));
        }
      } else {
        setSubjects(prev => ({ ...prev, [courseId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects(prev => ({ ...prev, [courseId]: [] }));
    }
  };

  const toggleExpand = async (courseId) => {
    setExpandedCourses(prev => {
      const newState = { ...prev, [courseId]: !prev[courseId] };
      if (newState[courseId] && !subjects[courseId]) {
        fetchSubjects(courseId);
      }
      return newState;
    });
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setFormData({
        name: course.name,
        code: course.code,
        department_id: course.department?.id || '',
        description: course.description || '',
        duration: course.duration ? course.duration.replace(' years', '') : '4'
      });
      setEditingCourse(course.id);
    } else {
      setFormData({
        name: '',
        code: '',
        department_id: '',
        description: '',
        duration: '4'
      });
      setEditingCourse(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingCourse 
        ? `/courses/${editingCourse}`
        : '/courses';
      
      const method = editingCourse ? 'put' : 'post';
      
      await apiService[method](url, {
        ...formData,
        duration: `${formData.duration} years`
      });

      await fetchCourses();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await apiService.delete(`/courses/${courseId}`);
      await fetchCourses();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete course');
    }
  };

  if (loading && courses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Courses Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <React.Fragment key={course.id}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(course.id)}
                      >
                        {expandedCourses[course.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.department?.name || 'N/A'}</TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(course)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(course.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={6}>
                      <Collapse in={expandedCourses[course.id]} timeout="auto" unmountOnExit>
                        <Box p={2} bgcolor="#f9f9f9">
                          <Typography variant="subtitle1" gutterBottom>
                            Subjects
                          </Typography>
                          {subjects[course.id] ? (
                            subjects[course.id].length > 0 ? (
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {subjects[course.id].map(subject => (
                                  <Chip
                                    key={subject.id}
                                    label={`${subject.code} - ${subject.name}`}
                                    variant="outlined"
                                    size="small"
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No subjects found for this course.
                              </Typography>
                            )
                          ) : (
                            <CircularProgress size={20} />
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No courses found. Click "Add Course" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="code"
                label="Course Code"
                value={formData.code}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
              />
              <TextField
                name="name"
                label="Course Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                name="duration"
                label="Duration (years)"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                required
                fullWidth
                margin="normal"
                inputProps={{ min: 1, max: 10 }}
              />
              <TextField
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingCourse ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CoursesPage;
