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
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExamScheduleTable from '../../../../components/exams/ExamScheduleTable';
import apiService from '../../../../services/apiService';
import { format } from 'date-fns';

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

  // Fetch exams from API
  const fetchExams = async () => {
    try {
      setLoading(true);
      console.log('Fetching exams...');
      
      // Use the correct API endpoint
      const response = await apiService.get('/api/exams');
      console.log('Exams API Response:', response);
      
      // Handle both array and object responses
      const examsData = response.data || (Array.isArray(response) ? response : []);
      
      if (examsData && examsData.length > 0) {
        // Map the API response to the expected format
        const formattedExams = examsData.map(exam => ({
          id: exam.id || exam.exam_uuid || `exam-${Math.random().toString(36).substr(2, 9)}`,
          name: exam.name || `Exam #${exam.id || 'N/A'}`,
          date: exam.exam_date || exam.date || new Date().toISOString().split('T')[0],
          start_time: exam.start_time || '09:00:00',
          end_time: exam.end_time || '12:00:00',
          duration: exam.duration || 180,
          exam_type: exam.exam_type || 'Midterm',
          status: exam.status || (exam.is_published ? 'Published' : 'Draft'),
          academic_year: exam.academic_year || new Date().getFullYear().toString(),
          semester: exam.semester?.toString() || '1',
          max_marks: exam.max_marks || exam.total_marks || 100,
          passing_marks: exam.passing_marks || Math.ceil((exam.total_marks || 100) * 0.35),
          description: exam.description || '',
          subject: {
            id: exam.subject_id || exam.course_id || '',
            name: exam.subject?.name || exam.subject_name || `Course ${(exam.course_id || '').substring(0, 8) || 'N/A'}`,
            code: exam.subject?.code || exam.subject_code || `CRS${(exam.course_id || '').substring(0, 4) || ''}`
          }
        }));
        
        console.log('Formatted Exams:', formattedExams);
        setExams(formattedExams);
      } else {
        setSnackbar({
          open: true,
          message: 'No exams found',
          severity: 'info'
        });
        setExams([]);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch exams. Please check console for details.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      const response = await apiService.get('/api/subjects');
      console.log('Subjects API Response:', response);
      
      if (response.data) {
        setSubjects(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Don't show error to user as it's not critical
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date/time picker changes
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Exam name is required';
    if (!formData.subject_id) newErrors.subject_id = 'Please select a subject';
    if (!formData.date) newErrors.date = 'Exam date is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const examData = {
        ...formData,
        date: formData.date.toISOString().split('T')[0],
        start_time: formData.start_time.toTimeString().slice(0, 5),
        end_time: formData.end_time.toTimeString().slice(0, 5),
        duration: parseInt(formData.duration, 10)
      };

      let response;
      if (editingExam) {
        response = await apiService.updateExam(editingExam.id, examData);
      } else {
        response = await apiService.createExam(examData);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: editingExam ? 'Exam updated successfully' : 'Exam created successfully',
          severity: 'success'
        });
        fetchExams();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save exam',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for adding/editing exam
  const handleOpenDialog = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        ...exam,
        date: new Date(exam.date),
        start_time: new Date(`1970-01-01T${exam.start_time}`),
        end_time: new Date(`1970-01-01T${exam.end_time}`)
      });
    } else {
      setEditingExam(null);
      setFormData({
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
    }
    setErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExam(null);
  };

  // Handle exam deletion
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
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete exam',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle view exam details
  const handleView = (exam) => {
    // Navigate to exam details or show in a dialog
    console.log('View exam:', exam);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Exam Schedule</Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchExams}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Schedule Exam
            </Button>
          </Box>
        </Box>
        
        {/* Quick Stats */}
        <Box mb={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Exams</Typography>
                  <Typography variant="h4">{exams.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Upcoming Exams</Typography>
                  <Typography variant="h4">
                    {exams.filter(exam => new Date(exam.date) >= new Date()).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Active Academic Year</Typography>
                  <Typography variant="h4">{formData.academic_year}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Exam Schedule Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardHeader 
              title="Exam Schedule" 
              subheader={`Showing ${exams.length} exams`}
              action={
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200, mr: 2 }}>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={formData.academic_year}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, academic_year: e.target.value }));
                      fetchExams();
                    }}
                    label="Academic Year"
                  >
                    {[2023, 2024, 2025].map(year => (
                      <MenuItem key={year} value={year.toString()}>
                        {`${year}-${year + 1}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              }
            />
            <Divider />
            <Box p={2}>
              <ExamScheduleTable
                exams={exams}
                loading={loading}
                onView={handleView}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
              />
            </Box>
          </Card>
        )}

        {/* Add/Edit Exam Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingExam ? 'Edit Exam' : 'Schedule New Exam'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Exam Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    margin="normal"
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl
                    fullWidth
                    margin="normal"
                    size="small"
                    error={!!errors.subject_id}
                    required
                  >
                    <InputLabel>Subject</InputLabel>
                    <Select
                      name="subject_id"
                      value={formData.subject_id}
                      onChange={handleInputChange}
                      label="Subject *"
                    >
                      {subjects.map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.subject_id && (
                      <FormHelperText>{errors.subject_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Exam Type</InputLabel>
                    <Select
                      name="exam_type"
                      value={formData.exam_type}
                      onChange={handleInputChange}
                      label="Exam Type"
                    >
                      <MenuItem value="Quiz">Quiz</MenuItem>
                      <MenuItem value="Midterm">Midterm</MenuItem>
                      <MenuItem value="Final">Final</MenuItem>
                      <MenuItem value="Assignment">Assignment</MenuItem>
                      <MenuItem value="Project">Project</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Exam Date"
                    value={formData.date}
                    onChange={(date) => handleDateChange(date, 'date')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        size="small"
                        error={!!errors.date}
                        helperText={errors.date}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="Start Time"
                    value={formData.start_time}
                    onChange={(time) => handleDateChange(time, 'start_time')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        size="small"
                        error={!!errors.start_time}
                        helperText={errors.start_time}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TimePicker
                    label="End Time"
                    value={formData.end_time}
                    onChange={(time) => handleDateChange(time, 'end_time')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        margin="normal"
                        size="small"
                        error={!!errors.end_time}
                        helperText={errors.end_time}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    error={!!errors.duration}
                    helperText={errors.duration}
                    required
                    margin="normal"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Maximum Marks"
                    name="max_marks"
                    type="number"
                    value={formData.max_marks}
                    onChange={handleInputChange}
                    margin="normal"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Passing Marks"
                    name="passing_marks"
                    type="number"
                    value={formData.passing_marks}
                    onChange={handleInputChange}
                    margin="normal"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Status"
                    >
                      <MenuItem value="Draft">Draft</MenuItem>
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                      <MenuItem value="Ongoing">Ongoing</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {editingExam ? 'Update' : 'Create'}
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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ExamSchedule;
