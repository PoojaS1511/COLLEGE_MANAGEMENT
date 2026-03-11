import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, IconButton, Tooltip, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  MenuItem, FormControl, InputLabel, Select, Chip, Snackbar, Alert,
  CircularProgress, InputAdornment, FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  School as SchoolIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import { API_URL } from '../../config';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCourses, setTotalCourses] = useState(0);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    department: null, // Store full department object
    credits: 3, // Default credits set to 3
    description: ''
  });
  
  const [departmentSearch, setDepartmentSearch] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First fetch all departments for the form
      const deptResponse = await axios.get(`${API_URL}/academics/departments`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        withCredentials: true,
        params: {
          limit: 1000 // Get all departments
        }
      });
      
      // Store departments for later use
      let departmentsList = [];
      if (Array.isArray(deptResponse.data)) {
        departmentsList = deptResponse.data;
      } else if (deptResponse.data && Array.isArray(deptResponse.data.data)) {
        departmentsList = deptResponse.data.data;
      } else if (deptResponse.data?.data && Array.isArray(deptResponse.data.data)) {
        departmentsList = deptResponse.data.data;
      }
      
      // Create a map for quick department lookups
      const departmentsMap = {};
      departmentsList.forEach(dept => {
        departmentsMap[dept.id] = {
          ...dept,
          duration: dept.duration || '4 years',
          duration_years: dept.duration_years || 4,
          total_semesters: dept.total_semesters || 8
        };
      });

      // Set departments state
      setDepartments(departmentsList);

      // Fetch courses with pagination
      const params = {
        include: 'department',
        page: page + 1, // Backend is 1-indexed
        limit: rowsPerPage === -1 ? 'all' : rowsPerPage
      };

      const response = await axios.get(`${API_URL}/academics/courses`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true,
        params
      });

      // Handle different response formats
      let responseData = response.data;
      let coursesData = [];
      let totalCount = 0;

      if (Array.isArray(responseData)) {
        coursesData = responseData;
        totalCount = responseData.length;
      } else if (responseData && Array.isArray(responseData.data)) {
        coursesData = responseData.data;
        totalCount = responseData.pagination?.total || responseData.data.length;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        coursesData = responseData.data;
        totalCount = responseData.pagination?.total || responseData.data.length;
      }

      // Process courses with department info
      const processedCourses = coursesData.map(course => {
        // Use department from the included data if available
        let department = null;
        if (course.department) {
          department = {
            id: course.department.id,
            name: course.department.name || 'Unknown Department',
            code: course.department.code || 'UNK',
            duration: course.department.duration || '4 years',
            duration_years: course.department.duration_years || 4,
            total_semesters: course.department.total_semesters || 8
          };
        } else if (course.department_id) {
          // Fallback to department map if no included department
          const dept = departmentsMap[course.department_id];
          if (dept) {
            department = { ...dept };
          } else {
            department = {
              id: course.department_id,
              name: `Department ${course.department_id}`,
              code: `DEPT${course.department_id}`,
              duration: '4 years',
              duration_years: 4,
              total_semesters: 8
            };
          }
        }

        return {
          ...course,
          credits: course.credits || 3,
          department: department || null
        };
      });
      
      setCourses(processedCourses);
      setTotalCourses(totalCount);
      
    } catch (error) {
      console.error('Error loading courses:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Failed to fetch courses. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/academics/departments?limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        withCredentials: true,
        validateStatus: () => true
      });

      let departmentsData = [];
      if (Array.isArray(response.data)) {
        departmentsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        departmentsData = response.data.data;
      }
      
      setDepartments(departmentsData);
      return departmentsData;
      
    } catch (error) {
      console.error('Error fetching departments:', error);
      showSnackbar('Error fetching departments', 'error');
      return [];
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = event.target.value === 'all' ? -1 : parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  // Re-fetch courses when pagination changes
  useEffect(() => {
    fetchCourses();
  }, [page, rowsPerPage]);

  // Calculate empty rows for pagination (client-side for current page)
  const emptyRows = rowsPerPage > 0 && rowsPerPage !== -1 
    ? Math.max(0, (1 + page) * rowsPerPage - totalCourses)
    : 0;

  // Initial data fetch
  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Special handling for department selection
    if (name === 'department_id') {
      const selectedDept = departments.find(dept => dept.id === value) || null;
      setFormData(prev => ({
        ...prev,
        department_id: value,
        department: selectedDept
      }));
    } else if (name === 'credits') {
      // Handle credits input specifically
      const numValue = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? '' : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleDepartmentSearch = (e) => {
    setDepartmentSearch(e.target.value);
  };
  
  // Filter departments based on search input
  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(departmentSearch.toLowerCase()) ||
    (dept.code && dept.code.toLowerCase().includes(departmentSearch.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const url = `${API_URL}/academics/courses${editingId ? `/${editingId}` : ''}`;
      const method = editingId ? 'put' : 'post';
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        withCredentials: true
      });

      const successMessage = editingId 
        ? 'Course updated successfully' 
        : 'Course created successfully';
      
      showSnackbar(successMessage, 'success');
      fetchCourses();
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving course:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Failed to save course. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFormData({
      name: '',
      code: '',
      department_id: '',
      department: null,
      duration: '4 years',
      credits: 3,
      description: ''
    });
    setDepartmentSearch('');
    setEditingId(null);
    setError(null);
  };

  const handleEdit = (course) => {
    const selectedDept = departments.find(dept => dept.id === course.department_id) || null;
    setFormData({
      name: course.name,
      code: course.code,
      department_id: course.department_id || '',
      department: selectedDept,
      duration: course.duration || '4 years',
      credits: course.credits || 3,
      description: course.description || ''
    });
    setDepartmentSearch(selectedDept ? selectedDept.name : '');
    setEditingId(course.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? This will also delete all associated subjects and student enrollments.')) {
      try {
        const response = await axios.delete(`${API_URL}/academics/courses/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          withCredentials: true
        });

        if (response.data.status === 'success') {
          showSnackbar('Course deleted successfully');
          fetchCourses();
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        showSnackbar(error.response?.data?.error || 'Failed to delete course', 'error');
      }
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>Courses</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Course
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Credits</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                <TableCell sx={{ width: 100 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={20} />
                    <Box mt={1} fontSize="0.875rem">Loading courses...</Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'error.main' }}>
                    <Box>
                      <ErrorOutlineIcon />
                      <Box mt={1} mb={2}>{error}</Box>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={fetchCourses}
                      >
                        Retry
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box sx={{ color: 'text.secondary' }}>
                      <SchoolIcon fontSize="large" />
                      <Box mt={1}>No courses found</Box>
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setOpen(true)}
                        sx={{ mt: 2 }}
                      >
                        Add Course
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {courses.map((course) => (
                  <TableRow key={course.id} hover>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>
                      <Box>
                        <div style={{ fontWeight: 500 }}>{course.name}</div>
                        {course.description && (
                          <div style={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {course.description.length > 40 
                              ? `${course.description.substring(0, 40)}...` 
                              : course.description}
                          </div>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {course.department ? (
                        <Tooltip title={course.department.name} arrow>
                          <Chip 
                            label={course.department.code ? `${course.department.code}` : `Dept ${course.department_id}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Tooltip>
                      ) : course.department_id ? (
                        <Chip 
                          label={`Dept ${course.department_id}`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ) : (
                        <Chip 
                          label="No Dept"
                          size="small"
                          variant="outlined"
                          color="error"
                        />
                      )}
                    </TableCell>
                    <TableCell>{course.credits || 3}</TableCell>
                    <TableCell>
                      {course.department?.duration || 'N/A'}
                      {course.department?.duration_years && ` (${course.department.duration_years} years)`}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(course)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(course.id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                  ))}
                </>
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100, { label: 'All', value: -1 }]}
          component="div"
          count={totalCourses}
          rowsPerPage={rowsPerPage === -1 ? totalCourses : rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          labelDisplayedRows={({ from, to, count }) => {
            if (rowsPerPage === -1) {
              return `All ${totalCourses} courses`;
            }
            const start = page * rowsPerPage + 1;
            const end = Math.min(start + rowsPerPage - 1, totalCourses);
            return `${start}-${end} of ${totalCourses}`;
          }}
          sx={{
            '& .MuiTablePagination-toolbar': {
              minHeight: 'auto',
              padding: '8px 16px',
              flexWrap: 'wrap',
              gap: 1
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0
            },
            borderTop: '1px solid rgba(224, 224, 224, 1)'
          }}
        />
      </Paper>

      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: '500px',
            mx: 'auto',
            width: '100%',
            boxShadow: 3
          }
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ 
            py: 2, 
            px: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <SchoolIcon color="primary" />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {editingId ? 'Edit Course' : 'Add New Course'}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <FormControl fullWidth required size="small" sx={{ mb: 2 }}>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    label="Department *"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250
                        }
                      }
                    }}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <em>Select a department</em>;
                      }
                      const dept = departments.find(d => d.id === selected);
                      return dept ? `${dept.code} - ${dept.name}` : 'Unknown Department';
                    }}
                  >
                    <Box sx={{ p: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search departments..."
                        value={departmentSearch}
                        onChange={handleDepartmentSearch}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          <Box>
                            <Box fontWeight="medium">{dept.name}</Box>
                            <Box variant="caption" color="text.secondary" fontSize="0.75rem">
                              {dept.code} • {dept.head_of_department || 'No HOD assigned'}
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No departments found</MenuItem>
                    )}
                  </Select>
                </FormControl>

                {formData.department && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="subtitle2">Department Details</Typography>
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Code</Typography>
                        <Typography variant="body2">{formData.department.code || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">HOD</Typography>
                        <Typography variant="body2">
                          {formData.department.head_of_department || 'Not assigned'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" display="block">Contact</Typography>
                        <Typography variant="body2">
                          {formData.department.contact_email || 'N/A'}
                        </Typography>
                      </Grid>
                      {formData.department.description && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">About</Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            {formData.department.description.length > 100 
                              ? `${formData.department.description.substring(0, 100)}...` 
                              : formData.department.description}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  margin="none"
                  name="code"
                  label="Course Code *"
                  variant="outlined"
                  size="small"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., CS101"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ mb: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  margin="none"
                  name="name"
                  label="Course Name *"
                  variant="outlined"
                  size="small"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to Computer Science"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ mb: 1 }}
                />
              </Grid>

              <Grid item xs={6} sm={4}>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    label="Duration"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250
                        }
                      }
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((years) => (
                      <MenuItem key={years} value={`${years} ${years === 1 ? 'year' : 'years'}`}>
                        {years} {years === 1 ? 'Year' : 'Years'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={4}>
                <TextField
                  fullWidth
                  margin="none"
                  name="credits"
                  label="Credits"
                  type="number"
                  variant="outlined"
                  size="small"
                  value={formData.credits}
                  onChange={handleChange}
                  inputProps={{
                    min: 0,
                    step: 0.5,
                    inputMode: 'decimal',
                    pattern: '^\\d*\\.?\\d*$' // Allows numbers and decimals
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="caption" color="text.secondary">
                          credits
                        </Typography>
                      </InputAdornment>
                    ),
                    inputProps: { 
                      min: 0, 
                      max: 100,
                      step: 0.5
                    }
                  }}
                  sx={{ mb: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="none"
                  name="description"
                  label="Course Description"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter course description (optional)"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    style: {
                      resize: 'vertical',
                      minHeight: '80px',
                      maxHeight: '150px'
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Provide a brief description of the course (optional)
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 2, 
            px: 3, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            justifyContent: 'space-between'
          }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              size="small"
              color="inherit"
              sx={{ minWidth: '100px' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              size="small"
              color="primary"
              disabled={!formData.name?.trim() || !formData.code?.trim() || !formData.department_id}
              sx={{ 
                minWidth: '120px',
                fontWeight: 500,
                textTransform: 'none'
              }}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {editingId ? 'Update' : 'Add Course'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
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
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Courses;
