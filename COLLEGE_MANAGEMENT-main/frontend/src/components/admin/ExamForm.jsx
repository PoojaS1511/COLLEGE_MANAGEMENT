import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examService } from '../../services/examService';
import {
  Box, Button, TextField, Typography, Paper, Grid, MenuItem,
  FormControl, InputLabel, Select, Chip, FormHelperText, Divider
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ExamForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
    status: 'upcoming',
    courses: [],
    total_marks: 100,
    passing_marks: 40,
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Fetch exam data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchExam = async () => {
        try {
          const exam = await examService.getExamById(id);
          setFormData({
            ...exam,
            start_date: new Date(exam.start_date),
            end_date: new Date(exam.end_date),
          });
        } catch (error) {
          console.error('Failed to fetch exam:', error);
          setFormError('Failed to load exam data');
        }
      };
      
      fetchExam();
    }
  }, [id, isEditMode]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  // Handle course selection changes
  const handleCourseChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      courses: value
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Exam name is required';
    }
    
    if (formData.courses.length === 0) {
      newErrors.courses = 'At least one course must be selected';
    }
    
    if (formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    if (formData.passing_marks > formData.total_marks) {
      newErrors.passing_marks = 'Passing marks cannot be greater than total marks';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setFormError('');
      
      // Prepare data for submission
      const submissionData = {
        ...formData,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString(),
      };
      
      if (isEditMode) {
        await examService.updateExam(id, submissionData);
      } else {
        await examService.createExam(submissionData);
      }
      
      // Redirect to exams list on success
      navigate('/admin/exams');
      
    } catch (error) {
      console.error('Failed to save exam:', error);
      setFormError(error.message || 'Failed to save exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get status options and course options from the service
  const statusOptions = examService.getStatusOptions();
  const courseOptions = examService.getMockCourses();
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            {isEditMode ? 'Edit Exam' : 'Add New Exam'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/exams')}
          >
            Back to List
          </Button>
        </Box>
        
        {formError && (
          <Box mb={3}>
            <Alert severity="error" onClose={() => setFormError('')}>
              {formError}
            </Alert>
          </Box>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Exam Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal" error={Boolean(errors.courses)}>
                <InputLabel id="courses-label">Courses *</InputLabel>
                <Select
                  labelId="courses-label"
                  id="courses"
                  name="courses"
                  multiple
                  value={formData.courses}
                  onChange={handleCourseChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {courseOptions.map((course) => (
                    <MenuItem key={course.value} value={course.value}>
                      {course.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.courses && <FormHelperText>{errors.courses}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <DateTimePicker
                  label="Start Date & Time *"
                  value={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
              
              <FormControl fullWidth margin="normal" error={Boolean(errors.end_date)}>
                <DateTimePicker
                  label="End Date & Time *"
                  value={formData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  minDateTime={formData.start_date}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      error={Boolean(errors.end_date)}
                      helperText={errors.end_date}
                    />
                  )}
                />
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status *</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status *"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box display="flex" gap={2} mt={2}>
                <TextField
                  fullWidth
                  label="Total Marks"
                  name="total_marks"
                  type="number"
                  value={formData.total_marks}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Passing Marks"
                  name="passing_marks"
                  type="number"
                  value={formData.passing_marks}
                  onChange={handleChange}
                  error={Boolean(errors.passing_marks)}
                  helperText={errors.passing_marks}
                  inputProps={{ min: 0, max: formData.total_marks }}
                  margin="normal"
                />
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/exams')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Exam'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default ExamForm;
