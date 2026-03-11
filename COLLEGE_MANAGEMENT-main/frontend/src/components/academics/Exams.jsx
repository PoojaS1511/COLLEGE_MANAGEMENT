import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, FormControl, InputLabel, Select, MenuItem, Switch,
  FormControlLabel, Chip, IconButton, Tooltip, TablePagination, Snackbar, Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Publish as PublishIcon,
  Unpublished as UnpublishedIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { supabase } from '../../lib/supabase';

const Exams = () => {
  // State
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    exam_date: new Date(),
    exam_type: 'Theory',
    course_id: '',
    subject_id: '',
    department_id: '',
    semester: 1,
    total_marks: 100,
    description: '',
    is_published: false,
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  });

  // Constants
  const examTypes = ['Theory', 'Practical', 'Midterm', 'Final', 'Internal', 'External'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const academicYears = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    return { value: `${year}-${year + 1}`, label: `${year}-${year + 1}` };
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch exams with related data
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select(`
          *,
          courses:course_id (id, name, department_id),
          subjects:subject_id (id, name, code),
          departments:department_id (id, name)
        `)
        .order('exam_date', { ascending: false });
      
      if (examsError) throw examsError;
      
      // Fetch additional data for forms
      const [departmentsRes, subjectsRes, coursesRes] = await Promise.all([
        supabase.from('departments').select('*').order('name'),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('courses').select('*').order('name')
      ]);
      
      if (departmentsRes.error) throw departmentsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      if (coursesRes.error) throw coursesRes.error;
      
      setExams(examsData || []);
      setFilteredExams(examsData || []);
      setDepartments(departmentsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setCourses(coursesRes.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setSnackbar({
        open: true,
        message: `Error fetching data: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter exams based on search term
  useEffect(() => {
    let filtered = [...exams];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(exam => 
        (exam.name && exam.name.toLowerCase().includes(searchLower)) ||
        (exam.exam_type && exam.exam_type.toLowerCase().includes(searchLower)) ||
        (exam.courses?.name && exam.courses.name.toLowerCase().includes(searchLower)) ||
        (exam.subjects?.name && exam.subjects.name.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredExams(filtered);
    setPage(0); // Reset to first page when filters change
  }, [searchTerm, exams]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle date changes
  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      exam_date: date
    }));
  };

  // Handle course change to update department and subjects
  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find(c => c.id === courseId);
    if (selectedCourse) {
      setFormData(prev => ({
        ...prev,
        course_id: courseId,
        department_id: selectedCourse.department_id || ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Note: We don't save course_id to exams table because exams relate to courses through subjects
      // The course_id in formData is only used for filtering subjects in the UI
      const examData = {
        name: formData.name,
        exam_type: formData.exam_type,
        description: formData.description,
        subject_id: formData.subject_id,
        exam_date: format(formData.exam_date, 'yyyy-MM-dd'),
        start_date: formData.start_date,
        end_date: formData.end_date,
        semester: parseInt(formData.semester),
        total_marks: parseInt(formData.total_marks),
        academic_year: formData.academic_year,
        is_published: formData.is_published
      };

      if (editingId) {
        // Update existing exam
        const { error } = await supabase
          .from('exams')
          .update({
            ...examData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;

        setSnackbar({
          open: true,
          message: 'Exam updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new exam
        const { error } = await supabase
          .from('exams')
          .insert([{
            ...examData,
            exam_uuid: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;

        setSnackbar({
          open: true,
          message: 'Exam created successfully!',
          severity: 'success'
        });
      }

      // Refresh data and close form
      await fetchData();
      handleClose();
      
    } catch (error) {
      console.error('Error saving exam:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (exam) => {
    setFormData({
      name: exam.name || '',
      exam_date: exam.exam_date ? new Date(exam.exam_date) : new Date(),
      exam_type: exam.exam_type || 'Theory',
      course_id: exam.course_id || '',
      subject_id: exam.subject_id || '',
      department_id: exam.department_id || '',
      semester: exam.semester || 1,
      total_marks: exam.total_marks || 100,
      description: exam.description || '',
      is_published: exam.is_published || false,
      academic_year: exam.academic_year || academicYears[0].value
    });
    setEditingId(exam.id);
    setOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        const { error } = await supabase
          .from('exams')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        await fetchData();
        
        setSnackbar({
          open: true,
          message: 'Exam deleted successfully!',
          severity: 'success'
        });
        
      } catch (error) {
        console.error('Error deleting exam:', error);
        setSnackbar({
          open: true,
          message: `Error: ${error.message}`,
          severity: 'error'
        });
      }
    }
  };

  // Toggle exam published status
  const togglePublishStatus = async (exam) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update({ is_published: !exam.is_published })
        .eq('id', exam.id);
      
      if (error) throw error;
      
      await fetchData();
      
      setSnackbar({
        open: true,
        message: `Exam ${!exam.is_published ? 'published' : 'unpublished'} successfully!`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error updating exam status:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Close dialog and reset form
  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      exam_date: new Date(),
      exam_type: 'Theory',
      course_id: '',
      subject_id: '',
      department_id: '',
      semester: 1,
      total_marks: 100,
      description: '',
      is_published: false,
      academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Exam Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Exam
        </Button>
      </Box>

      {/* Search and filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search exams..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
      </Box>

      {/* Exams Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Total Marks</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredExams.length > 0 ? (
                filteredExams
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((exam) => (
                    <TableRow key={exam.id} hover>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell>{exam.exam_type}</TableCell>
                      <TableCell>
                        {exam.exam_date ? format(new Date(exam.exam_date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{exam.subjects?.name || 'N/A'}</TableCell>
                      <TableCell>{exam.semester}</TableCell>
                      <TableCell>{exam.total_marks}</TableCell>
                      <TableCell>
                        <Chip
                          label={exam.is_published ? 'Published' : 'Draft'}
                          color={exam.is_published ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={exam.is_published ? 'Unpublish' : 'Publish'}>
                          <IconButton 
                            onClick={() => togglePublishStatus(exam)}
                            color={exam.is_published ? 'success' : 'default'}
                            size="small"
                          >
                            {exam.is_published ? <PublishIcon /> : <UnpublishedIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            onClick={() => handleEdit(exam)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={() => handleDelete(exam.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No exams found. Click 'Add Exam' to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25]}
          component="div"
          count={filteredExams.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add/Edit Exam Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Exam Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Exam Type</InputLabel>
                  <Select
                    name="exam_type"
                    value={formData.exam_type}
                    onChange={handleChange}
                    label="Exam Type"
                  >
                    {examTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Exam Date"
                    value={formData.exam_date}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth margin="normal" required />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    name="course_id"
                    value={formData.course_id}
                    onChange={(e) => {
                      handleCourseChange(e.target.value);
                      handleChange(e);
                    }}
                    label="Course"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    label="Department"
                    disabled
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    label="Subject"
                  >
                    {subjects
                      .filter(subject => formData.course_id ? subject.course_id === formData.course_id : true)
                      .map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    label="Semester"
                  >
                    {semesters.map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        {sem}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Marks"
                  name="total_marks"
                  type="number"
                  value={formData.total_marks}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    label="Academic Year"
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year.value} value={year.value}>
                        {year.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_published}
                      onChange={(e) =>
                        setFormData({ ...formData, is_published: e.target.checked })
                      }
                      name="is_published"
                      color="primary"
                    />
                  }
                  label="Publish Exam"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Exam'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Exams;
