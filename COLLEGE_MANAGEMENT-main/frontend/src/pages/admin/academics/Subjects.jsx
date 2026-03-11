import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ErrorBoundary from '../../../components/ErrorBoundary';
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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import apiService from '../../../services/api';

const Subjects = () => {
  // State management - ensure subjects is always an array
  const [subjects, setSubjects] = useState(() => []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    credits: 3,
    type: 'Theory'
  });

  // Safe subjects array - guaranteed to be an array
  const safeSubjects = useMemo(() => {
    try {
      // Ensure subjects is an array and filter out any null/undefined values
      if (!Array.isArray(subjects)) {
        console.warn('subjects is not an array, converting to empty array');
        return [];
      }
      return subjects.filter(subject =>
        subject && typeof subject === 'object' && subject.id
      );
    } catch (err) {
      console.error('Error in safeSubjects:', err);
      return [];
    }
  }, [subjects]);

  // State for departments
  const [departments, setDepartments] = useState([]);
  
  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiService.getAllDepartments();
        if (response.success) {
          setDepartments(response.data || []);
        } else {
          console.error('Failed to fetch departments:', response.message);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  // Fetch subjects from API
  const fetchSubjects = useCallback(async () => {
    try {
      console.log('Starting to fetch subjects...');
      setIsLoading(true);
      setError(null);

      try {
        // Get all subjects with their course relationships
        const subjectsResponse = await apiService.getSubjects();
        
        if (subjectsResponse.success) {
          // Log the raw response for debugging
          console.log('Raw subjects response:', subjectsResponse.data);
          
          // The data is already in the correct format from supabaseService
          const processedSubjects = subjectsResponse.data || [];
          console.log('Processed subjects:', processedSubjects);
          
          // Set the subjects state
          setSubjects(processedSubjects);
        } else {
          throw new Error(subjectsResponse.error || 'Failed to fetch subjects');
        }
      } catch (apiError) {
        console.error('API request failed:', apiError);
        throw new Error(`Failed to load subjects: ${apiError.message}`);
      }

      // No need for additional processing as we've already set the subjects

      try {
        // Handle different response formats
        if (Array.isArray(response)) {
          // Case 1: Response is already an array
          data = Array.isArray(response) ? response : [];
        } else if (response && typeof response === 'object') {
          // Case 2: Response has a data property (Supabase format)
          if ('data' in response) {
            // If data is an array, use it directly
            if (Array.isArray(response.data)) {
              data = response.data;
            } 
            // If data is an object with a results array
            else if (response.data && Array.isArray(response.data.results)) {
              data = response.data.results;
            }
            // If data is an object but not an array, convert to array
            else if (response.data && typeof response.data === 'object') {
              data = [response.data];
            } else {
              console.warn('Unexpected data format in response.data:', response.data);
              data = [];
            }
          } 
          // Case 3: Response is a single object
          else {
            data = [response];
          }
        } else {
          console.warn('Unexpected response format:', response);
          data = [];
        }

        console.log('Processed subjects data:', data);

        // Ensure we have a valid array before proceeding
        if (!Array.isArray(data)) {
          console.error('Processed data is not an array:', data);
          throw new Error('Invalid data format: expected an array');
        }

        // Process and validate subjects
        const validSubjects = (data || [])
          .filter(subject => {
            try {
              const isValid = subject && 
                            typeof subject === 'object' && 
                            subject.id !== undefined && 
                            subject.id !== null;
              if (!isValid) {
                console.warn('Skipping invalid subject:', subject);
              }
              return isValid;
            } catch (err) {
              console.error('Error validating subject:', err, subject);
              return false;
            }
          })
          .map(subject => ({
            ...subject,
            // Ensure all required fields have default values
            name: subject.name || 'Unnamed Subject',
            code: subject.code || 'NOC',
            credits: typeof subject.credits === 'number' ? subject.credits : 3,
            type: ['Theory', 'Practical', 'Lab', 'Project'].includes(subject.type) 
              ? subject.type 
              : 'Theory'
          }));

        console.log('Valid subjects:', validSubjects);

        // Update state with the processed subjects
        setSubjects(validSubjects);
        setError(null);
      } catch (error) {
        console.error('Error processing subjects:', error);
        
        // In development, provide some mock data for testing
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data due to error:', error.message);
          const mockData = [
            {
              id: '1',
              name: 'Introduction to Programming',
              code: 'CS101',
              department_id: '1',
              credits: 4,
              type: 'Theory'
            },
            {
              id: '2',
              name: 'Database Systems',
              code: 'CS202',
              department_id: '1',
              credits: 4,
              type: 'Theory'
            }
          ];
          setSubjects(mockData);
        } else {
          // In production, set empty array instead of mock data
          setSubjects([]);
        }
        
        setError(`Failed to load subjects. ${error.message || 'Please try again later.'}`);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      
      // Fallback to mock data in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using mock data as fallback');
        const mockData = [
          {
            id: '1',
            name: 'Data Structures',
            code: 'CS201',
            department_id: '1',
            credits: 4,
            type: 'Theory'
          },
          {
            id: '2',
            name: 'Database Systems',
            code: 'CS202',
            department_id: '1',
            credits: 4,
            type: 'Theory'
          }
        ];
        setSubjects(mockData);
      } else {
        // In production, set empty array instead of mock data
        setSubjects([]);
      }
      
      setError(`Failed to load subjects. ${error.message || 'Please try again later.'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show snackbar notification
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Handle snackbar close
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleOpen = (subject = null) => {
    if (subject) {
      // Ensure numeric fields are numbers when editing
      setFormData({
        id: subject.id,
        name: subject.name || '',
        code: subject.code || '',
        department_id: subject.department_id || '',
        credits: subject.credits || 3,
        type: subject.type || 'Theory'
      });
      setEditing(true);
    } else {
      setFormData({
        name: '',
        code: '',
        department_id: '',
        credits: 3,
        type: 'Theory'
      });
      setEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.department_id) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    const subjectToSubmit = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      department_id: formData.department_id,
      credits: formData.credits
    };

    try {
      setIsLoading(true);

      if (editing) {
        await apiService.put(`/academics/subjects/${subjectToSubmit.id}`, subjectToSubmit);
      } else {
        await apiService.post('/academics/subjects', subjectToSubmit);
      }

      showSnackbar(`Subject ${editing ? 'updated' : 'added'} successfully!`);
      fetchSubjects();
      handleClose();

    } catch (error) {
      console.error('Error saving subject:', error);

      let errorMessage = `Failed to ${editing ? 'update' : 'add'} subject. Please try again later.`;

      if (error.response?.data?.code === '23505') {
        errorMessage = 'A subject with this code already exists. Please use a different code.';
      } else if (error.response?.data?.code === '22P02') {
        errorMessage = 'Invalid input. Please check all fields and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showSnackbar(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await apiService.delete(`/academics/subjects/${id}`);
        fetchSubjects();
        showSnackbar('Subject deleted successfully!');
      } catch (error) {
        console.error('Error deleting subject:', error);
        showSnackbar(
          error.response?.data?.message || 'Failed to delete subject. Please try again later.',
          'error'
        );
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' || name === 'department_id' ? parseInt(value, 10) : value
    }));
  };

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(safeSubjects)) {
    console.error('safeSubjects is not an array, rendering empty state');
    return (
      <Box p={3}>
        <Alert severity="error">Error loading subjects. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h5">Subjects</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            Add Subject
          </Button>
        </Box>

        {error ? (
          <Alert severity="error">
            {error}
            <Box mt={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={fetchSubjects}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeSubjects.length > 0 ? (
                  safeSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>
                        {subject.department?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>{subject.type || 'Theory'}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleOpen(subject)}
                          color="primary"
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(subject.id)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No subjects found. Click "Add Subject" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add/Edit Subject Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editing ? 'Edit Subject' : 'Add New Subject'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Subject Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
                <TextField
                  label="Subject Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                />
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    label="Department"
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Credits"
                  name="credits"
                  type="number"
                  value={formData.credits}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  margin="normal"
                  inputProps={{ min: 1, max: 10 }}
                />

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    label="Type"
                  >
                    <MenuItem value="Theory">Theory</MenuItem>
                    <MenuItem value="Practical">Practical</MenuItem>
                    <MenuItem value="Lab">Lab</MenuItem>
                    <MenuItem value="Project">Project</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleClose} disabled={formLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formLoading}
                startIcon={formLoading ? <CircularProgress size={20} /> : null}
              >
                {editing ? 'Update' : 'Add'} Subject
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
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ErrorBoundary>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3} bgcolor="error.light" color="error.contrastText">
          <Typography variant="h6">Something went wrong.</Typography>
          <Typography variant="body2">{this.state.error?.toString()}</Typography>
          <Button
            variant="contained"
            color="primary"            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrap the component with ErrorBoundary
export default function SubjectsWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Subjects />
    </ErrorBoundary>
  );
}
