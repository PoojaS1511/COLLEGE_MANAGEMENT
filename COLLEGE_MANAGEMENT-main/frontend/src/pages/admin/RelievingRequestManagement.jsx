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
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {
  getRelievingRequests,
  getRelievingRequestById,
  createRelievingRequest,
  updateRelievingRequest,
  deleteRelievingRequest,
  updateRequestStatus
} from '../../services/relievingRequestService';

const RelievingRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    faculty_id: '',
    proposed_last_working_day: null,
    reason: '',
    resignation_letter_url: '',
    status: 'Pending',
    relieving_letter_ready: false,
    experience_cert_ready: false,
    service_cert_ready: false,
    settlement_ready: false
  });

  // Fetch all relieving requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getRelievingRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching relieving requests:', error);
      showSnackbar('Failed to load relieving requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle date change
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle dialog open for new request
  const handleOpenNewDialog = () => {
    setFormData({
      faculty_id: '',
      proposed_last_working_day: null,
      reason: '',
      resignation_letter_url: '',
      status: 'Pending',
      relieving_letter_ready: false,
      experience_cert_ready: false,
      service_cert_ready: false,
      settlement_ready: false
    });
    setIsEditing(false);
    setCurrentRequest(null);
    setOpenDialog(true);
  };

  // Handle dialog open for editing
  const handleOpenEditDialog = async (request) => {
    try {
      setLoading(true);
      const data = await getRelievingRequestById(request.id);
      setCurrentRequest(data);
      setFormData({
        faculty_id: data.faculty_id,
        proposed_last_working_day: data.proposed_last_working_day ? new Date(data.proposed_last_working_day) : null,
        reason: data.reason || '',
        resignation_letter_url: data.resignation_letter_url || '',
        status: data.status || 'Pending',
        relieving_letter_ready: data.relieving_letter_ready || false,
        experience_cert_ready: data.experience_cert_ready || false,
        service_cert_ready: data.service_cert_ready || false,
        settlement_ready: data.settlement_ready || false
      });
      setIsEditing(true);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
      showSnackbar('Failed to load request details', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const requestData = {
        ...formData,
        proposed_last_working_day: formData.proposed_last_working_day?.toISOString().split('T')[0]
      };

      if (isEditing && currentRequest) {
        await updateRelievingRequest(currentRequest.id, requestData);
        showSnackbar('Request updated successfully');
      } else {
        await createRelievingRequest(requestData);
        showSnackbar('Request created successfully');
      }
      fetchRequests();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving request:', error);
      showSnackbar(`Failed to ${isEditing ? 'update' : 'create'} request`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete request
  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        setLoading(true);
        await deleteRelievingRequest(id);
        showSnackbar('Request deleted successfully');
        fetchRequests();
      } catch (error) {
        console.error('Error deleting request:', error);
        showSnackbar('Failed to delete request', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (id, status, remarks = '') => {
    try {
      setLoading(true);
      await updateRequestStatus(id, status, remarks);
      showSnackbar(`Request ${status.toLowerCase()} successfully`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      showSnackbar('Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRequest(null);
  };

  // Download resignation letter
  const handleDownloadLetter = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      showSnackbar('No document available', 'warning');
    }
  };

  // Initialize component
  useEffect(() => {
    fetchRequests();
  }, []);

  // Status colors for chips
  const statusColors = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'error',
    'In Progress': 'info'
  };

  if (loading && !openDialog) {
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
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenNewDialog}
            sx={{ mr: 1 }}
          >
            New Request
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRequests}
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
                  <TableCell>Request ID</TableCell>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Proposed Last Day</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>#{request.id.substring(0, 8)}</TableCell>
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
                      <TableCell>
                        {request.applied_date ? format(new Date(request.applied_date), 'PP') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {request.proposed_last_working_day
                          ? format(new Date(request.proposed_last_working_day), 'PP')
                          : 'N/A'}
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
                              onClick={() => handleOpenEditDialog(request)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {request.status === 'Pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleStatusUpdate(request.id, 'Approved')}
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
                                    if (remarks) {
                                      handleStatusUpdate(request.id, 'Rejected', remarks);
                                    }
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRequest(request.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {isEditing ? 'Edit Relieving Request' : 'New Relieving Request'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                    disabled={!isEditing}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Proposed Last Working Day"
                      value={formData.proposed_last_working_day}
                      onChange={(date) => handleDateChange(date, 'proposed_last_working_day')}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </FormControl>

                <TextField
                  fullWidth
                  margin="normal"
                  name="resignation_letter_url"
                  label="Resignation Letter URL"
                  value={formData.resignation_letter_url}
                  onChange={handleInputChange}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.relieving_letter_ready || false}
                      onChange={handleInputChange}
                      name="relieving_letter_ready"
                      color="primary"
                    />
                  }
                  label="Relieving Letter Ready"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.experience_cert_ready || false}
                      onChange={handleInputChange}
                      name="experience_cert_ready"
                      color="primary"
                    />
                  }
                  label="Experience Certificate Ready"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.service_cert_ready || false}
                      onChange={handleInputChange}
                      name="service_cert_ready"
                      color="primary"
                    />
                  }
                  label="Service Certificate Ready"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.settlement_ready || false}
                      onChange={handleInputChange}
                      name="settlement_ready"
                      color="primary"
                    />
                  }
                  label="Settlement Ready"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  name="reason"
                  label="Reason for Leaving"
                  multiline
                  rows={6}
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                />

                {formData.resignation_letter_url && (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadLetter(formData.resignation_letter_url)}
                    sx={{ mt: 2 }}
                  >
                    View Resignation Letter
                  </Button>
                )}

                {currentRequest?.admin_remarks && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Admin Remarks:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {currentRequest.admin_remarks}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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
