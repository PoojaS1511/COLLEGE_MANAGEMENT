import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Search as SearchIcon, 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';

const SignupCredentials = () => {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const navigate = useNavigate();

  // Toggle password visibility for a specific row
  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const fetchSignups = async () => {
    try {
      setLoading(true);
      
      // Fetch pending student signups from the database
      const { data, error } = await supabase
        .from('pending_student_signups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSignups(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching signup credentials:', err);
      setError('Failed to load signup credentials. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to load signup credentials',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignups();
  }, []);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this signup?')) {
      try {
        // Update the status to 'approved' in the database
        const { error } = await supabase
          .from('pending_student_signups')
          .update({ status: 'approved', updated_at: new Date() })
          .eq('id', id);

        if (error) throw error;

        // Refresh the list
        await fetchSignups();
        
        setSnackbar({
          open: true,
          message: 'Signup approved successfully',
          severity: 'success'
        });
      } catch (err) {
        console.error('Error approving signup:', err);
        setSnackbar({
          open: true,
          message: 'Failed to approve signup. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this signup?')) {
      try {
        // Update the status to 'rejected' in the database
        const { error } = await supabase
          .from('pending_student_signups')
          .update({ status: 'rejected', updated_at: new Date() })
          .eq('id', id);

        if (error) throw error;

        // Refresh the list
        await fetchSignups();
        
        setSnackbar({
          open: true,
          message: 'Signup rejected successfully',
          severity: 'success'
        });
      } catch (err) {
        console.error('Error rejecting signup:', err);
        setSnackbar({
          open: true,
          message: 'Failed to reject signup. Please try again.',
          severity: 'error'
        });
      }
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/admin/students/signup-credentials/${id}`);
  };

  const filteredSignups = signups.filter(signup => 
    signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signup.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signup.phone?.includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && signups.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchSignups}
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Student Signup Requests
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            placeholder="Search signups..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            onClick={fetchSignups}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Password</TableCell>
              <TableCell>Signup Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSignups.length > 0 ? (
              filteredSignups.map((signup) => (
                <TableRow key={signup.id} hover>
                  <TableCell>{signup.full_name || 'N/A'}</TableCell>
                  <TableCell>{signup.email}</TableCell>
                  <TableCell>{signup.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={signup.status || 'pending'} 
                      color={getStatusColor(signup.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {signup.plain_password ? (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" sx={{
                          fontFamily: 'monospace',
                          bgcolor: 'action.hover',
                          px: 1,
                          borderRadius: 1,
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {showPasswords[signup.id] ? signup.plain_password : '••••••••'}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePasswordVisibility(signup.id);
                          }}
                          aria-label={showPasswords[signup.id] ? 'Hide password' : 'Show password'}
                        >
                          {showPasswords[signup.id] ? <VisibilityOffIcon fontSize="small" /> : <ViewIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    ) : (
                      <Chip 
                        label="Not set" 
                        color="default" 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {signup.created_at 
                      ? format(new Date(signup.created_at), 'PPpp')
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(signup.id)}
                          color="primary"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {signup.status?.toLowerCase() === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              onClick={() => handleApprove(signup.id)}
                              color="success"
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              onClick={() => handleReject(signup.id)}
                              color="error"
                            >
                              <RejectIcon fontSize="small" />
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
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    {searchTerm ? 'No matching signups found' : 'No signup requests found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SignupCredentials;
