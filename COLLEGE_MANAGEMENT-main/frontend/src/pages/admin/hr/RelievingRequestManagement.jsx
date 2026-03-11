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
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  DialogContentText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { supabase } from '../../../services/supabaseClient';

const RelievingRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch all relieving requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('relieving_requests')
        .select(`
          *,
          faculty:faculty_id (id, full_name, employee_id, email, department_id, departments (name))
        `)
        .order('applied_date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching relieving requests:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load relieving requests',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle request status update
  const updateRequestStatus = async (requestId, status, remarks = '') => {
    try {
      const { error } = await supabase
        .from('relieving_requests')
        .update({ 
          status,
          remarks,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user.id
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, update faculty status
      if (status === 'Approved') {
        const { data: request } = await supabase
          .from('relieving_requests')
          .select('faculty_id')
          .eq('id', requestId)
          .single();

        if (request) {
          await supabase
            .from('faculties')
            .update({ status: 'Inactive' })
            .eq('id', request.faculty_id);
        }
      }

      setSnackbar({
        open: true,
        message: `Request ${status.toLowerCase()} successfully`,
        severity: 'success'
      });
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update request status',
        severity: 'error'
      });
    }
  };

  // View request details
  const handleViewRequest = (request) => {
    setCurrentRequest(request);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRequest(null);
  };

  // Download relieving letter
  const handleDownloadLetter = async (requestId) => {
    try {
      // In a real app, this would generate and download a PDF
      const { data } = await supabase
        .from('relieving_requests')
        .select('relieving_letter_url')
        .eq('id', requestId)
        .single();

      if (data?.relieving_letter_url) {
        window.open(data.relieving_letter_url, '_blank');
      } else {
        throw new Error('Relieving letter not found');
      }
    } catch (error) {
      console.error('Error downloading letter:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download relieving letter',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusColors = {
    Pending: 'warning',
    SUBMITTED: 'warning',
    Approved: 'success',
    APPROVED: 'success',
    Rejected: 'error',
    REJECTED: 'error',
    'In Progress': 'info'
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Relieving Request Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRequests}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Last Working Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {request.faculty?.full_name?.[0] || 'F'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {request.faculty?.full_name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {request.faculty?.employee_id || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{request.faculty?.departments?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {request.applied_date ? format(new Date(request.applied_date), 'PPpp') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {request.proposed_last_working_day
                          ? format(new Date(request.proposed_last_working_day), 'PP')
                          : 'Not specified'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={statusColors[request.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewRequest(request)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {request.status === 'Approved' && (
                            <Tooltip title="Download Relieving Letter">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadLetter(request.id)}
                                color="primary"
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(request.status === 'Pending' || request.status === 'SUBMITTED') && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => updateRequestStatus(request.id, 'APPROVED')}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const remarks = prompt('Enter reason for rejection:');
                                    if (remarks !== null) { // Check if user didn't click cancel
                                      updateRequestStatus(request.id, 'REJECTED', remarks);
                                    }
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No relieving requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {currentRequest && (
          <>
            <DialogTitle>Relieving Request Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Request ID</Typography>
                  <Typography variant="body1">#{currentRequest.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={currentRequest.status}
                    color={statusColors[currentRequest.status] || 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Faculty</Typography>
                  <Typography variant="body1">
                    {currentRequest.faculty?.full_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {currentRequest.faculty?.employee_id || ''}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Department</Typography>
                  <Typography variant="body1">
                    {currentRequest.faculty?.departments?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Request Date
                  </Typography>
                  <Typography variant="body1">
                    {currentRequest.created_at
                      ? format(new Date(currentRequest.created_at), 'PPpp')
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Working Day
                  </Typography>
                  <Typography variant="body1">
                    {currentRequest.last_working_day
                      ? format(new Date(currentRequest.last_working_day), 'PP')
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Reason for Leaving
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentRequest.reason || 'Not specified'}
                  </Typography>
                </Grid>
                {currentRequest.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Admin Remarks
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {currentRequest.remarks}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {currentRequest.status === 'Approved' && (
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownloadLetter(currentRequest.id)}
                  color="primary"
                >
                  Download Relieving Letter
                </Button>
              )}
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RelievingRequestManagement;
