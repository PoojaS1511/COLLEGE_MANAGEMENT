import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  AccessTime as DurationIcon
} from '@mui/icons-material';

const ExamScheduleTable = ({
  exams = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  viewMode = 'admin', // 'admin' or 'student'
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      // Handle both Date objects and ISO strings
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Format time to a readable format (HH:MM AM/PM)
  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'N/A';
      // If timeString is already in HH:MM format
      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      }
      // Try to parse as date
      const date = new Date(`2000-01-01T${timeString}`);
      if (!isNaN(date)) {
        return format(date, 'h:mm a');
      }
      return timeString; // Return as is if we can't parse it
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString || 'N/A';
    }
  };

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedExams = exams.slice(startIndex, endIndex);
  const totalRows = exams.length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          {loading ? 'Loading exams...' : 'No exams scheduled yet.'}
          {viewMode === 'admin' && !loading && ' Click the \'Schedule Exam\' button to add a new exam.'}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Exam Name</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            {viewMode === 'admin' && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedExams.map((exam) => (
            <TableRow key={exam.id} hover>
              <TableCell>
                <Typography variant="body1" fontWeight="medium">
                  {exam.name}
                </Typography>
                {exam.description && (
                  <Typography variant="caption" color="textSecondary">
                    {exam.description}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {exam.subject?.name || 'N/A'}
                  </Typography>
                  {exam.subject?.code && (
                    <Typography variant="caption" color="textSecondary">
                      {exam.subject.code}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formatDate(exam.date)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <ScheduleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <DurationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {exam.duration} min
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={exam.exam_type}
                  size="small"
                  color={getExamTypeColor(exam.exam_type)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={exam.status}
                  size="small"
                  variant={exam.status === 'Published' ? 'filled' : 'outlined'}
                  color={getStatusColor(exam.status)}
                />
              </TableCell>
              {viewMode === 'admin' && (
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onView && onView(exam)}
                        color="primary"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit && onEdit(exam)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => onDelete && onDelete(exam.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

// Helper functions for styling
const getExamTypeColor = (type) => {
  if (!type) return 'default';
  
  const typeMap = {
    'midterm': 'primary',
    'final': 'secondary',
    'quiz': 'info',
    'assignment': 'warning',
    'project': 'success',
    'semester 1': 'primary',
    'semester 2': 'secondary',
    'semester1': 'primary',
    'semester2': 'secondary',
    '1': 'primary',
    '2': 'secondary'
  };
  
  return typeMap[type.toLowerCase()] || 'default';
};

const getStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusMap = {
    'published': 'success',
    'draft': 'default',
    'cancelled': 'error',
    'ongoing': 'info',
    'completed': 'primary',
    'active': 'success',
    'inactive': 'default',
    'pending': 'warning'
  };
  
  return statusMap[status.toLowerCase()] || 'default';
};

export default ExamScheduleTable;
