import React, { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabaseClient';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const DocumentManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('relieving_requests')
        .select(`
          *,
          faculty:faculty_id (
            id,
            full_name,
            employee_id,
            email,
            department_id,
            joining_date,
            departments (name)
          )
        `)
        .order('applied_date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load requests',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (requestId, field, value, remarks = '') => {
    try {
      const updates = { 
        [field]: value,
        ...(value === false && { 
          [`${field}_rejection_reason`]: remarks,
          [`${field}_rejected_at`]: new Date().toISOString()
        })
      };

      const { error } = await supabase
        .from('relieving_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;

      setSnackbar({
        open: true,
        message: value 
          ? 'Document issued successfully' 
          : 'Document rejected successfully',
        severity: 'success'
      });
      
      fetchRequests();
      
      // Update the selected request to reflect the change in the dialog
      if (selectedRequest) {
        setSelectedRequest({
          ...selectedRequest,
          ...updates
        });
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update document status',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const documentTypes = [
    { label: 'Relieving Letter', field: 'relieving_letter_ready' },
    { label: 'Experience Certificate', field: 'experience_cert_ready' },
    { label: 'Service Certificate', field: 'service_cert_ready' },
    { label: 'Settlement Statement', field: 'settlement_ready' }
  ];

  const calculateExperience = (joinDate, lastDate) => {
    if (!joinDate || !lastDate) return "N/A";
    
    const start = new Date(joinDate);
    const end = new Date(lastDate);
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return `${years}Y ${months}M ${days}D`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Document Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRequests}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Tenure</TableCell>
                {documentTypes.map((doc) => (
                  <TableCell key={doc.field} align="center">
                    {doc.label}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={documentTypes.length + 4} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>Loading requests...</Typography>
                  </TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {request.faculty?.full_name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {request.faculty?.employee_id || ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{request.faculty?.departments?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {calculateExperience(
                        request.faculty?.joining_date,
                        request.approved_last_working_day || request.proposed_last_working_day
                      )}
                    </TableCell>
                    {documentTypes.map((doc) => (
                      <TableCell key={doc.field} align="center">
                        {request[doc.field] ? (
                          <Chip
                            label="Issued"
                            color="success"
                            size="small"
                            variant="filled"
                          />
                        ) : (
                          <Box display="flex" gap={1} justifyContent="center">
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateDocumentStatus(request.id, doc.field, true);
                              }}
                              startIcon={<CheckIcon fontSize="small" />}
                              sx={{ 
                                minWidth: 'auto',
                                padding: '2px 8px',
                                fontSize: '0.7rem'
                              }}
                            >
                              Issue
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const remarks = prompt('Enter reason for rejection:');
                                if (remarks) {
                                  updateDocumentStatus(request.id, doc.field, false, remarks);
                                }
                              }}
                              startIcon={<CloseIcon fontSize="small" />}
                              sx={{ 
                                minWidth: 'auto',
                                padding: '2px 8px',
                                fontSize: '0.7rem'
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Tooltip title="Manage Documents">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRequest(request);
                            setOpenDialog(true);
                          }}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={documentTypes.length + 4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No relieving requests found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Document Management Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>
              Document Management - {selectedRequest.faculty?.full_name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Employee: {selectedRequest.faculty?.full_name} ({selectedRequest.faculty?.employee_id})
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Department: {selectedRequest.faculty?.departments?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tenure: {calculateExperience(
                    selectedRequest.faculty?.joining_date,
                    selectedRequest.approved_last_working_day || selectedRequest.proposed_last_working_day
                  )}
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }, 
                gap: 2,
                mb: 2
              }}>
                {documentTypes.map((doc) => (
                  <Paper
                    key={doc.field}
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      bgcolor: selectedRequest[doc.field] ? 'success.light' : 'background.paper',
                      border: `1px solid ${selectedRequest[doc.field] ? 'success.main' : 'divider'}`,
                      borderRadius: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom fontWeight="500">
                      {doc.label}
                    </Typography>
                    <Button
                      variant={selectedRequest[doc.field] ? "contained" : "outlined"}
                      color={selectedRequest[doc.field] ? "success" : "primary"}
                      size="small"
                      onClick={() => updateDocumentStatus(
                        selectedRequest.id,
                        doc.field,
                        !selectedRequest[doc.field]
                      )}
                      startIcon={selectedRequest[doc.field] ? <CheckIcon /> : null}
                      sx={{ mt: 1 }}
                    >
                      {selectedRequest[doc.field] ? 'Issued' : 'Mark as Issued'}
                    </Button>
                  </Paper>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} variant="outlined">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentManager;
