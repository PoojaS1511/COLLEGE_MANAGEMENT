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
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Email, 
  Phone, 
  Person,
  Refresh,
  Class,
  Book
} from '@mui/icons-material';
import axios from 'axios';

const CourseAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState({
    id: '',
    course_id: '',
    subject_id: '',
    faculty_id: '',
    academic_year: new Date().getFullYear(),
    semester: '1',
    is_active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          fetchAssignments(),
          fetchCourses(),
          fetchSubjects(),
          fetchFaculty()
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/academics/course-assignments');
      // Ensure we're working with an array
      const data = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error; // Let the error be caught by the parent try-catch
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/academics/courses');
      // Ensure we're working with an array
      const data = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Set empty array on error to prevent .map errors
      setCourses([]);
      throw error; // Let the error be caught by the parent try-catch
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/academics/subjects');
      // Ensure we're working with an array
      const data = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Set empty array on error to prevent .map errors
      setSubjects([]);
      throw error; // Let the error be caught by the parent try-catch
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('/api/academics/faculty');
      setFaculty(response.data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      throw error; // Let the error be caught by the parent try-catch
    }
  };

  const handleOpen = (assignment = null) => {
    if (assignment) {
      setCurrentAssignment(assignment);
      setEditing(true);
    } else {
      setCurrentAssignment({
        id: '',
        course_id: '',
        subject_id: '',
        faculty_id: '',
        academic_year: new Date().getFullYear(),
        semester: '1',
        is_active: true
      });
      setEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`/api/academics/course-assignments/${currentAssignment.id}`, currentAssignment);
      } else {
        await axios.post('/api/academics/course-assignments', currentAssignment);
      }
      fetchAssignments();
      handleClose();
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`/api/academics/course-assignments/${id}`);
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'N/A';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };

  const getFacultyName = (facultyId) => {
    const facultyMember = faculty.find(f => f.id === facultyId);
    return facultyMember ? `${facultyMember.first_name} ${facultyMember.last_name}` : 'N/A';
  };

  // Filter subjects based on selected course
  const filteredSubjects = currentAssignment.course_id 
    ? subjects.filter(subject => subject.course_id === currentAssignment.course_id)
    : [];

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
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  // Ensure assignments is always an array before mapping
  const assignmentsToRender = Array.isArray(assignments) ? assignments : [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Manage Course Assignments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          New Assignment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignmentsToRender.length > 0 ? (
              assignmentsToRender.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Class color="primary" sx={{ mr: 1 }} />
                      {getCourseName(assignment.course_id)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Book color="secondary" sx={{ mr: 1 }} />
                      {getSubjectName(assignment.subject_id)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Person color="action" sx={{ mr: 1 }} />
                      {getFacultyName(assignment.faculty_id)}
                    </Box>
                  </TableCell>
                  <TableCell>{assignment.academic_year}</TableCell>
                  <TableCell>Semester {assignment.semester}</TableCell>
                  <TableCell>
                    <Chip 
                      label={assignment.is_active ? 'Active' : 'Inactive'} 
                      color={assignment.is_active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton onClick={() => handleOpen(assignment)} color="primary">
                          <Edit />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton onClick={() => handleDelete(assignment.id)} color="error">
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No course assignments found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? 'Edit Course Assignment' : 'New Course Assignment'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel id="course-select-label">Course *</InputLabel>
              <Select
                labelId="course-select-label"
                id="course_id"
                name="course_id"
                value={currentAssignment.course_id}
                onChange={handleChange}
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

            <FormControl fullWidth margin="normal">
              <InputLabel id="subject-select-label">Subject *</InputLabel>
              <Select
                labelId="subject-select-label"
                id="subject_id"
                name="subject_id"
                value={currentAssignment.subject_id}
                onChange={handleChange}
                label="Subject"
                required
                disabled={!currentAssignment.course_id}
              >
                {filteredSubjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="faculty-select-label">Faculty *</InputLabel>
              <Select
                labelId="faculty-select-label"
                id="faculty_id"
                name="faculty_id"
                value={currentAssignment.faculty_id}
                onChange={handleChange}
                label="Faculty"
                required
              >
                {faculty.map((facultyMember) => (
                  <MenuItem key={facultyMember.id} value={facultyMember.id}>
                    {facultyMember.first_name} {facultyMember.last_name} ({facultyMember.designation})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" gap={2} mt={2}>
              <TextField
                margin="dense"
                name="academic_year"
                label="Academic Year"
                type="number"
                fullWidth
                variant="outlined"
                value={currentAssignment.academic_year}
                onChange={handleChange}
                required
                inputProps={{ min: 2000, max: 2100 }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel id="semester-select-label">Semester *</InputLabel>
                <Select
                  labelId="semester-select-label"
                  id="semester"
                  name="semester"
                  value={currentAssignment.semester}
                  onChange={handleChange}
                  label="Semester"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel id="status-select-label">Status *</InputLabel>
              <Select
                labelId="status-select-label"
                id="is_active"
                name="is_active"
                value={currentAssignment.is_active}
                onChange={(e) => setCurrentAssignment(prev => ({
                  ...prev,
                  is_active: e.target.value === 'true'
                }))}
                label="Status"
                required
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editing ? 'Update' : 'Create'} Assignment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CourseAssignments;
