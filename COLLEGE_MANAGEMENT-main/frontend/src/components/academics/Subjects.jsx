import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, IconButton, Tooltip, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Select, MenuItem, FormControl, InputLabel, FormHelperText, Alert,
  Snackbar, CircularProgress, Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import { useConfirm } from 'material-ui-confirm';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirm = useConfirm();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    course_id: '',
    semester: 1,
    credits: 3,
    subject_type: 'theory',
    description: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch subjects with related course and department data
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          *,
          courses!fk_subject_course (
            id, 
            name, 
            code,
            department_id,
            departments (id, duration, total_semesters, duration_years)
          )
        `)
        .order('semester', { ascending: true })
        .order('name', { ascending: true });
      
      // Fetch courses with department duration information
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id, 
          name, 
          code, 
          department_id,
          departments (id, duration, total_semesters, duration_years)
        `)
        .order('name', { ascending: true });
        
      // Map the data to include duration information from the department
      const processedCourses = (coursesData || []).map(course => ({
        ...course,
        duration: course.departments?.duration || '4 years',
        total_semesters: course.departments?.total_semesters || 8,
        duration_years: course.departments?.duration_years || 4
      }));

      if (subjectsError) throw new Error(`Failed to load subjects: ${subjectsError.message}`);
      if (coursesError) throw new Error(`Failed to load courses: ${coursesError.message}`);

      setSubjects(subjectsData || []);
      setCourses(processedCourses);
      
      showSnackbar('Subjects loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load data. Please try again.');
      showSnackbar(error.message || 'Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' || name === 'credits' ? parseInt(value) || 0 : value
    }));
    
    // Update max semester based on selected course's duration
    if (name === 'course_id') {
      const selectedCourse = courses.find(c => c.id === value);
      if (selectedCourse && selectedCourse.duration_years) {
        const maxSemesters = selectedCourse.duration_years * 2; // Assuming 2 semesters per year
        if (formData.semester > maxSemesters) {
          setFormData(prev => ({
            ...prev,
            semester: maxSemesters
          }));
        }
      }
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.code || !formData.course_id) {
        throw new Error('Please fill in all required fields');
      }

      if (editingId) {
        // Update existing subject
        const { error } = await supabase
          .from('subjects')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);
          
        if (error) throw error;
        showSnackbar('Subject updated successfully', 'success');
      } else {
        // Create new subject
        const { data, error } = await supabase
          .from('subjects')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (error) throw error;
        showSnackbar('Subject created successfully', 'success');
      }
      
      // Reset form and refresh data
      setOpen(false);
      setFormData({
        name: '',
        code: '',
        course_id: '',
        semester: 1,
        credits: 3,
        subject_type: 'theory',
        description: ''
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving subject:', error);
      showSnackbar(error.message || 'Failed to save subject', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      code: subject.code,
      course_id: subject.course_id,
      semester: subject.semester,
      credits: subject.credits,
      subject_type: subject.subject_type,
      description: subject.description || ''
    });
    setOpen(true);
  };

  const getSubjectTypeChip = (type) => {
    const color = type === 'theory' ? 'primary' : type === 'practical' ? 'secondary' : 'default';
    const label = type === 'theory' ? 'Theory' : type === 'practical' ? 'Practical' : 'Other';
    
    return (
      <Chip 
        label={label} 
        color={color} 
        size="small" 
        variant="outlined"
        sx={{ minWidth: 80 }}
      />
    );
  };

  const handleDelete = async (id) => {
    try {
      await confirm({
        title: 'Confirm Delete',
        description: 'Are you sure you want to delete this subject? This action cannot be undone.',
        confirmationText: 'Delete',
        confirmationButtonProps: { variant: 'contained', color: 'error' }
      });
      
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      showSnackbar('Subject deleted successfully', 'success');
      fetchData();
    } catch (error) {
      if (error && error.type !== 'cancel') {
        console.error('Error deleting subject:', error);
        showSnackbar(error.message || 'Failed to delete subject', 'error');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'N/A';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !subjects.length) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom={false}>
              Subjects Management
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {subjects.length} subjects found
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                code: '',
                course_id: '',
                semester: 1,
                credits: 3,
                subject_type: 'theory',
                description: ''
              });
              setOpen(true);
            }}
          >
            Add Subject
          </Button>
        </Box>

        <Paper>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Code</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Course</strong></TableCell>
                  <TableCell align="center"><strong>Semester</strong></TableCell>
                  <TableCell align="center"><strong>Credits</strong></TableCell>
                  <TableCell align="center"><strong>Type</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box>
                        <HelpIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="subtitle1" color="textSecondary">
                          No subjects found
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          onClick={() => setOpen(true)}
                          sx={{ mt: 2 }}
                        >
                          Add Your First Subject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  subjects
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((subject) => (
                      <TableRow 
                        key={subject.id}
                        hover
                        sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {subject.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body1">{subject.name}</Typography>
                            {subject.description && (
                              <Typography variant="caption" color="textSecondary">
                                {subject.description.length > 50 
                                  ? `${subject.description.substring(0, 50)}...` 
                                  : subject.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {subject.courses?.name || 'N/A'}
                          {subject.courses?.code && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              {subject.courses.code}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`Sem ${subject.semester}`} 
                            size="small"
                            color="default"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={subject.credits} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {getSubjectTypeChip(subject.subject_type)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => handleEdit(subject)} 
                              color="primary"
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => handleDelete(subject.id)} 
                              color="error"
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={subjects.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        <Dialog 
          open={open} 
          onClose={() => !isSubmitting && setOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingId ? 'Edit Subject' : 'Add New Subject'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subject Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    margin="normal"
                    disabled={isSubmitting}
                    helperText="Unique identifier for the subject"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }} required>
                    <InputLabel>Course</InputLabel>
                    <Select
                      name="course_id"
                      value={formData.course_id}
                      onChange={handleChange}
                      label="Course *"
                    >
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          <Box>
                            <Box>{course.name} ({course.code})</Box>
                            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              {course.duration} • {course.total_semesters} semesters
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the course this subject belongs to</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      label="Semester"
                      disabled={isSubmitting}
                    >
                      {[...Array(8)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          Semester {i + 1}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the semester for this subject</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Credits"
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    required
                    margin="normal"
                    inputProps={{ min: 1, max: 10 }}
                    disabled={isSubmitting}
                    helperText="Credit weight of the subject"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Subject Type</InputLabel>
                    <Select
                      name="subject_type"
                      value={formData.subject_type}
                      onChange={handleChange}
                      label="Subject Type"
                      disabled={isSubmitting}
                    >
                      <MenuItem value="theory">Theory</MenuItem>
                      <MenuItem value="practical">Practical</MenuItem>
                      <MenuItem value="project">Project</MenuItem>
                      <MenuItem value="seminar">Seminar</MenuItem>
                      <MenuItem value="workshop">Workshop</MenuItem>
                      <MenuItem value="internship">Internship</MenuItem>
                    </Select>
                    <FormHelperText>Type of subject</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    margin="normal"
                    multiline
                    rows={3}
                    disabled={isSubmitting}
                    helperText="Brief description of the subject (optional)"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={() => setOpen(false)} 
                disabled={isSubmitting}
                color="inherit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {editingId ? 'Update Subject' : 'Create Subject'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default Subjects;
