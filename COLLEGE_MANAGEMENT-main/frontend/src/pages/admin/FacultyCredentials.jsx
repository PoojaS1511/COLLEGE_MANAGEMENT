// In FacultyCredentials.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { supabase } from '../../services/supabaseClient';

const FacultyCredentials = () => {
  console.log('FacultyCredentials component mounted');
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCredential, setCurrentCredential] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'faculty',
    faculty_id: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();

  // Check if faculty_credentials table exists
  const checkFacultyCredentialsTable = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty_credentials')
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') { // Table doesn't exist
        setSnackbar({
          open: true,
          message: 'Faculty credentials table not found. Please contact administrator.',
          severity: 'error'
        });
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error checking faculty credentials table:', err);
      return false;
    }
  };

  // Fetch faculty data
  const fetchFacultyData = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*');
      
      if (error) throw error;
      
      setFaculty(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching faculty:', err);
      setError(err);
      return [];
    }
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tableExists = await checkFacultyCredentialsTable();
        
        // Always load faculty data
        const facultyData = await fetchFacultyData();
        
        if (tableExists) {
          // Load credentials from faculty_credentials table
          const { data, error } = await supabase
            .from('faculty_credentials')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setCredentials(data || []);
        } else {
          setCredentials([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err);
        setCredentials([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      
      if (currentCredential) {
        // Update existing credential
        const updateData = {
          username: formData.username,
          role: formData.role,
          last_updated: new Date().toISOString()
        };
        
        // Only update password if provided
        if (formData.password) {
          updateData.password_hash = formData.password; // In production, hash this password
        }
        
        const { data, error } = await supabase
          .from('faculty_credentials')
          .update(updateData)
          .eq('id', currentCredential.id)
          .select()
          .single();
          
        if (error) throw error;
        
        setCredentials(prev => prev.map(c => 
          c.id === currentCredential.id ? data : c
        ));
        
        setSnackbar({
          open: true,
          message: 'Credential updated successfully',
          severity: 'success'
        });
      } else {
        // Create new credential
        const newCredential = {
          faculty_id: formData.faculty_id,
          username: formData.username,
          password_hash: formData.password, // In production, hash this password
          role: formData.role,
          last_updated: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('faculty_credentials')
          .insert(newCredential)
          .select()
          .single();
          
        if (error) throw error;
        
        setCredentials(prev => [data, ...prev]);
        
        setSnackbar({
          open: true,
          message: 'Credential created successfully',
          severity: 'success'
        });
      }
      
      setOpenDialog(false);
      setCurrentCredential(null);
      setFormData({ username: '', password: '', role: 'faculty', faculty_id: '' });
    } catch (err) {
      console.error('Error saving credential:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to save credential',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading faculty credentials...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Faculty Credentials Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<KeyIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add New Credential
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Faculty Login Credentials
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Password Hash</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {credentials.length > 0 ? (
                credentials.map((cred) => {
                  const facultyMember = faculty.find(f => f.id === cred.faculty_id);
                  return (
                    <TableRow key={cred.id}>
                      <TableCell>
                        {cred.password_hash || 'No password hash'}
                      </TableCell>
                      <TableCell>{cred.username}</TableCell>
                      <TableCell>{cred.email || facultyMember?.email || 'No email'}</TableCell>
                      <TableCell>{cred.role}</TableCell>
                      <TableCell>
                        {cred.last_updated ? new Date(cred.last_updated).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        {cred.created_at ? new Date(cred.created_at).toLocaleString() : 'Unknown'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => {
                            setCurrentCredential(cred);
                            setFormData({
                              username: cred.username,
                              role: cred.role,
                              password: '',
                              faculty_id: cred.faculty_id
                            });
                            setOpenDialog(true);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this credential?')) {
                              try {
                                const { error } = await supabase
                                  .from('faculty_credentials')
                                  .delete()
                                  .eq('id', cred.id);
                                  
                                if (error) throw error;
                                
                                setCredentials(prev => prev.filter(c => c.id !== cred.id));
                                setSnackbar({
                                  open: true,
                                  message: 'Credential deleted successfully',
                                  severity: 'success'
                                });
                              } catch (err) {
                                console.error('Error deleting credential:', err);
                                setSnackbar({
                                  open: true,
                                  message: 'Failed to delete credential',
                                  severity: 'error'
                                });
                              }
                            }
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <KeyIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="subtitle1" color="textSecondary">
                        No credentials found
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        startIcon={<KeyIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        Add Credential
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setCurrentCredential(null);
          setFormData({ username: '', password: '', role: 'faculty', faculty_id: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentCredential ? 'Edit Credential' : 'Add New Credential'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Faculty Member</InputLabel>
                <Select
                  value={formData.faculty_id || ''}
                  onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}
                  label="Faculty Member"
                  required
                  disabled={!!currentCredential}
                >
                  {faculty.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.name} ({f.email || f.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                type="password"
                label={currentCredential ? 'New Password (leave blank to keep current)' : 'Password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                margin="normal"
                required={!currentCredential}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  label="Role"
                  required
                >
                  <MenuItem value="faculty">Faculty</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="hod">Head of Department</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenDialog(false);
                setCurrentCredential(null);
                setFormData({ username: '', password: '', role: 'faculty', faculty_id: '' });
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              color="primary"
              disabled={loading || !formData.username || (!currentCredential && !formData.password)}
            >
              {loading ? <CircularProgress size={24} /> : currentCredential ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({...prev, open: false}))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({...prev, open: false}))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacultyCredentials;
