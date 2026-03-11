import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExamScheduleTable from '../../../../components/exams/ExamScheduleTable';
import apiService from '../../../../services/apiService';

const ExamSchedule = () => {
  // State
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject_id: '',
    date: null,
    start_time: null,
    end_time: null,
    duration: '',
    exam_type: 'Midterm',
    status: 'Draft',
    academic_year: new Date().getFullYear().toString(),
    semester: '1',
    max_marks: 100,
    passing_marks: 35
  });

  const [errors, setErrors] = useState({});

  // Fetch data on mount
  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    semester: '1',
    subject_id: '',
    description: '',
    duration: 180,
    total_marks: 100
  });

  // Add state for subjects
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState('');

  // No mock data needed - we'll use real data from the backend

  // Fetch exams and subjects on component mount
  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      
      // Fetch exams using the API service
      const response = await apiService.getExams({
        academic_year: formData.academic_year,
        semester: formData.semester
      });
      
      if (response.success) {
        setExams(response.data || []);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'No exams found',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch exams',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const examData = {
        ...formData,
        date: formData.date, // Already in YYYY-MM-DD format
        course_id: formData.course_id || null,
        subject_id: formData.subject_id || null,
        duration: parseInt(formData.duration, 10),
        total_marks: parseInt(formData.total_marks, 10)
      };

      let response;
      if (editingExam) {
        // Update existing exam
        response = await apiService.updateExam(editingExam.id, examData);
        if (response.success) {
          setExams(exams.map(exam => 
            exam.id === editingExam.id ? response.data : exam
          ));
          setSnackbar({
            open: true,
            message: 'Exam updated successfully',
            severity: 'success'
          });
        } else {
          throw new Error(response.message || 'Failed to update exam');
        }
      } else {
        // Create new exam
        response = await apiService.createExam(examData);
        if (response.success) {
          setExams([...exams, response.data]);
          setSnackbar({
            open: true,
            message: 'Exam created successfully',
            severity: 'success'
          });
        } else {
          throw new Error(response.message || 'Failed to create exam');
        }
      }
      
      setOpen(false);
      setEditingExam(null);
      setFormData({
        name: '',
        exam_type: 'IA1',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        semester: '1',
        subject_id: '',
        course_id: '',
        description: '',
        duration: 180,
        total_marks: 100
      });
    } catch (error) {
      console.error('Error saving exam:', error);
      setSnackbar({
        message: error.message || 'Failed to save exam',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        name: exam.name || '',
        exam_type: exam.exam_type || 'IA1',
        date: exam.date || format(new Date(), 'yyyy-MM-dd'),
        start_time: exam.start_time || '09:00',
        academic_year: exam.academic_year || (new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)),
        semester: exam.semester || '1',
        subject_id: exam.subject_id || '',
        course_id: exam.course_id || '',
        description: exam.description || '',
        duration: exam.duration || 180,
        total_marks: exam.total_marks || 100
      });
    } else {
      setEditingExam(null);
      setFormData({
        name: '',
        exam_type: 'IA1',
        date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '09:00',
        academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        semester: '1',
        subject_id: '',
        course_id: '',
        description: '',
        duration: 180,
        total_marks: 100
      });
    }
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        setLoading(true);
        const response = await apiService.deleteExam(id);
        if (response.success) {
          setExams(exams.filter(exam => exam.id !== id));
          setSnackbar({
            open: true,
            message: 'Exam deleted successfully',
            severity: 'success'
          });
        } else {
          throw new Error(response.message || 'Failed to delete exam');
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to delete exam',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading && !exams.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Exam Schedules
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Exam
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.name}</TableCell>
                <TableCell>{exam.exam_type}</TableCell>
                <TableCell>{format(new Date(exam.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{exam.start_time}</TableCell>
                <TableCell>{exam.academic_year}</TableCell>
                <TableCell>{exam.semester}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(exam)}
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(exam.id)}
                    startIcon={<DeleteIcon />}
                    sx={{ ml: 1 }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingExam ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Exam Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  name="exam_type"
                  value={formData.exam_type}
                  onChange={handleInputChange}
                  label="Exam Type"
                >
                  <MenuItem value="IA1">Internal Assessment 1</MenuItem>
                  <MenuItem value="IA2">Internal Assessment 2</MenuItem>
                  <MenuItem value="model">Model Exam</MenuItem>
                  <MenuItem value="final">Final Exam</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                name="date"
                label="Exam Date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="start_time"
                label="Start Time"
                type="time"
                value={formData.start_time}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                required
              />
              
              <FormControl fullWidth margin="normal" required error={!formData.subject_id && formData.subject_id !== ''}>
                <InputLabel id="subject-select-label">Subject</InputLabel>
                <Select
                  labelId="subject-select-label"
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  label="Subject"
                  disabled={loadingSubjects}
                >
                  <MenuItem value="">
                    <em>Select a subject</em>
                  </MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </MenuItem>
                  ))}
                </Select>
                {!formData.subject_id && formData.subject_id !== '' && (
                  <FormHelperText error>Please select a subject</FormHelperText>
                )}
                {subjectError && (
                  <FormHelperText error>{subjectError}</FormHelperText>
                )}
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                name="academic_year"
                label="Academic Year"
                value={formData.academic_year}
                onChange={handleInputChange}
                required
                placeholder="e.g., 2023-2024"
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="semester"
                label="Semester"
                value={formData.semester}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="duration"
                label="Duration (minutes)"
                value={formData.duration}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                name="total_marks"
                label="Total Marks"
                value={formData.total_marks}
                onChange={handleInputChange}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExamSchedule;
