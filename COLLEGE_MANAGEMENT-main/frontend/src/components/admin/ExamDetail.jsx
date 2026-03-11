import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/examService';
import {
  Box, Typography, Paper, Button, Chip, Divider,
  Grid, Card, CardContent, Alert, CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const ExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status configurations
  const statusConfig = {
    upcoming: {
      icon: <AccessTimeIcon color="info" />,
      color: 'info',
      label: 'Upcoming'
    },
    ongoing: {
      icon: <AccessTimeIcon color="warning" />,
      color: 'warning',
      label: 'Ongoing'
    },
    completed: {
      icon: <CheckCircleIcon color="success" />,
      color: 'success',
      label: 'Completed'
    },
    cancelled: {
      icon: <CancelIcon color="error" />,
      color: 'error',
      label: 'Cancelled'
    }
  };

  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const data = await examService.getExamById(id);
        setExam(data);
        setError('');
      } catch (err) {
        console.error('Failed to fetch exam:', err);
        setError('Failed to load exam details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!exam) {
    return (
      <Alert severity="warning">
        Exam not found.
      </Alert>
    );
  }

  const status = statusConfig[exam.status] || statusConfig.upcoming;

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Exam Details
        </Typography>
        <div>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/exams')}
            sx={{ mr: 2 }}
          >
            Back to List
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/admin/exams/${id}/edit`)}
          >
            Edit Exam
          </Button>
        </div>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
                {exam.name}
              </Typography>
              <Chip
                icon={status.icon}
                label={status.label}
                color={status.color}
                variant="outlined"
                size="small"
              />
            </Box>

            {exam.description && (
              <Box mb={3}>
                <Typography variant="subtitle1" color="textSecondary">
                  {exam.description}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Start Date & Time
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <CalendarIcon color="action" sx={{ mr: 1 }} />
                    <Typography>{formatDate(exam.start_date)}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box mb={2}>
                  <Typography variant="subtitle2" color="textSecondary">
                    End Date & Time
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <CalendarIcon color="action" sx={{ mr: 1 }} />
                    <Typography>{formatDate(exam.end_date)}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Courses Included
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {exam.courses?.map((course, index) => (
                  <Chip
                    key={index}
                    icon={<SchoolIcon />}
                    label={course}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exam Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Total Marks
                </Typography>
                <Typography variant="h5">{exam.total_marks}</Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Passing Marks
                </Typography>
                <Typography variant="h5" color={exam.passing_marks > exam.total_marks * 0.4 ? 'error' : 'inherit'}>
                  {exam.passing_marks}
                  {exam.passing_marks > exam.total_marks * 0.4 && (
                    <Typography variant="caption" color="error" display="block">
                      (High passing threshold)
                    </Typography>
                  )}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Duration
                </Typography>
                <Typography>
                  {Math.ceil((new Date(exam.end_date) - new Date(exam.start_date)) / (1000 * 60 * 60))} hours
                </Typography>
              </Box>
              
              <Box mt={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/admin/exams/${id}/edit`)}
                  startIcon={<EditIcon />}
                >
                  Edit Exam Details
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ExamDetail;
