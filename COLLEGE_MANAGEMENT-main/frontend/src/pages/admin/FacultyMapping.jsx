import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarMonth as CalendarMonthIcon,
  Numbers as NumbersIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { supabase } from '../../services/supabaseClient';

const currentYear = new Date().getFullYear();
const academicYears = [
  `${currentYear}-${currentYear + 1}`,
  `${currentYear - 1}-${currentYear}`,
  `${currentYear + 1}-${currentYear + 2}`
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const sections = ['A', 'B', 'C', 'D'];

const FacultyMapping = () => {
  const [mappings, setMappings] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    faculty_id: '',
    subject_id: '',
    course_id: '',
    academic_year: academicYears[0],
    semester: 1,
    section: 'A',
    batch_year: currentYear,
    is_active: true,
    assigned_at: new Date().toISOString()
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch faculty
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculties')
        .select('id, full_name, email, employee_id')
        .order('full_name', { ascending: true });
      
      if (facultyError) throw facultyError;
      setFacultyList(facultyData || []);
      
      // Fetch courses
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name', { ascending: true });
      
      if (courseError) throw courseError;
      setCourses(courseData || []);
      
      // Fetch subjects
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id, name, code, course_id')
        .order('name', { ascending: true });
      
      if (subjectError) throw subjectError;
      setSubjects(subjectData || []);
      
      // Fetch existing mappings
      await fetchMappings();
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      showSnackbar('Error loading data: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty_subject_assignments')
        .select(`
          *,
          faculty:faculty_id!inner(
            id,
            full_name,
            email,
            employee_id
          ),
          subject:subject_id (
            id,
            name,
            code
          ),
          course:course_id (
            id,
            name,
            code
          )
        `)
        .order('academic_year', { ascending: false })
        .order('semester', { ascending: true });
      
      if (error) throw error;
      setMappings(data || []);
    } catch (err) {
      console.error('Error fetching mappings:', err);
      throw err;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    const selectedSubject = subjects.find(s => s.id === subjectId);
    
    setFormData(prev => ({
      ...prev,
      subject_id: subjectId,
      course_id: selectedSubject?.course_id || ''
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData(prev => ({
      ...prev,
      course_id: courseId,
      subject_id: '' // Reset subject when course changes
    }));
  };

  const resetForm = () => {
    setFormData({
      faculty_id: '',
      subject_id: '',
      course_id: '',
      academic_year: academicYears[0],
      semester: 1,
      section: 'A',
      batch_year: currentYear,
      is_active: true,
      assigned_at: new Date().toISOString()
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.faculty_id || !formData.subject_id || !formData.course_id) {
      showSnackbar('Please fill all required fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        faculty_id: formData.faculty_id,
        subject_id: formData.subject_id,
        course_id: formData.course_id,
        academic_year: formData.academic_year,
        semester: formData.semester,
        section: formData.section,
        batch_year: formData.batch_year,
        is_active: formData.is_active,
        assigned_at: formData.assigned_at
      };
      
      let data, error;
      
      if (formData.id) {
        // Update existing mapping
        const response = await supabase
          .from('faculty_subject_assignments')
          .update(payload)
          .eq('id', formData.id)
          .select();
        data = response.data;
        error = response.error;
      } else {
        // Create new mapping
        const response = await supabase
          .from('faculty_subject_assignments')
          .insert([payload])
          .select();
        data = response.data;
        error = response.error;
      }
      
      if (error) throw error;
      
      showSnackbar(
        formData.id ? 'Assignment updated successfully' : 'Assignment added successfully',
        'success'
      );
      
      await fetchMappings();
      handleCloseDialog();
      
    } catch (err) {
      console.error('Error saving assignment:', err);
      showSnackbar(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('faculty_subject_assignments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      showSnackbar('Assignment deleted successfully', 'success');
      await fetchMappings();
      
    } catch (err) {
      console.error('Error deleting assignment:', err);
      showSnackbar(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredSubjects = () => {
    if (!formData.course_id) return [];
    return subjects.filter(subject => subject.course_id === formData.course_id);
  };

  const handleEdit = (mapping) => {
    setFormData({
      id: mapping.id,
      faculty_id: mapping.faculty_id,
      subject_id: mapping.subject_id,
      course_id: mapping.course_id,
      academic_year: mapping.academic_year,
      semester: mapping.semester,
      section: mapping.section,
      batch_year: mapping.batch_year,
      is_active: mapping.is_active,
      assigned_at: mapping.assigned_at || new Date().toISOString()
    });
    setOpenDialog(true);
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      assigned_at: date ? date.toISOString() : new Date().toISOString()
    }));
  };

  if (loading && mappings.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Faculty Mapping
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Assignment'}
        </Button>
      </Box>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Faculty</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Academic Year</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Batch Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mappings.length > 0 ? (
                mappings.map((mapping) => (
                  <TableRow 
                    key={mapping.id}
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon color="action" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body1">{mapping.faculty?.full_name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {mapping.faculty?.employee_id || mapping.faculty?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={<ClassIcon />} 
                        label={mapping.course?.name || 'N/A'} 
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<CategoryIcon />}
                        label={`${mapping.subject?.code || ''}: ${mapping.subject?.name || 'N/A'}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{mapping.academic_year}</TableCell>
                    <TableCell>Sem {mapping.semester}</TableCell>
                    <TableCell>Sec {mapping.section}</TableCell>
                    <TableCell>{mapping.batch_year}</TableCell>
                    <TableCell>
                      <Chip 
                        label={mapping.is_active ? 'Active' : 'Inactive'} 
                        color={mapping.is_active ? 'success' : 'default'}
                        size="small"
                        variant={mapping.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Assignment">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(mapping)}
                          disabled={loading}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Assignment">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(mapping.id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box py={3} textAlign="center">
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        No faculty assignments found.
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                      >
                        Add Assignment
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {formData.id ? 'Edit Faculty Assignment' : 'Add New Faculty Assignment'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="faculty-select-label">Faculty</InputLabel>
                  <Select
                    labelId="faculty-select-label"
                    id="faculty_id"
                    name="faculty_id"
                    value={formData.faculty_id}
                    onChange={handleInputChange}
                    label="Faculty"
                    required
                  >
                    {facultyList.map((faculty) => (
                      <MenuItem key={faculty.id} value={faculty.id}>
                        {faculty.full_name} ({faculty.employee_id || faculty.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="course-select-label">Course</InputLabel>
                  <Select
                    labelId="course-select-label"
                    id="course_id"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleCourseChange}
                    label="Course"
                    required
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="subject-select-label">Subject</InputLabel>
                  <Select
                    labelId="subject-select-label"
                    id="subject_id"
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleSubjectChange}
                    label="Subject"
                    required
                    disabled={!formData.course_id}
                  >
                    {getFilteredSubjects().map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="academic-year-label">Academic Year</InputLabel>
                  <Select
                    labelId="academic-year-label"
                    id="academic_year"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleInputChange}
                    label="Academic Year"
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="semester-label">Semester</InputLabel>
                  <Select
                    labelId="semester-label"
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    label="Semester"
                  >
                    {semesters.map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        Semester {sem}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="section-label">Section</InputLabel>
                  <Select
                    labelId="section-label"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    label="Section"
                  >
                    {sections.map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        Section {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel id="batch-year-label">Batch Year</InputLabel>
                  <Select
                    labelId="batch-year-label"
                    id="batch_year"
                    name="batch_year"
                    value={formData.batch_year}
                    onChange={handleInputChange}
                    label="Batch Year"
                  >
                    {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Assigned Date"
                    value={new Date(formData.assigned_at)}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        margin="normal"
                        required
                      />
                    )}
                  />
                </LocalizationProvider>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_active: e.target.checked
                      }))}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="Active Assignment"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog} 
              color="secondary"
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained" 
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {formData.id ? 'Update' : 'Save'}
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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacultyMapping;
