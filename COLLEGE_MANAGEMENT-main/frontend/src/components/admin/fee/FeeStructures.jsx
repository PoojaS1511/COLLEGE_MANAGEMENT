import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { supabase } from '../../../lib/supabase';

const FeeStructures = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [courses, setCourses] = useState([]);
  
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // Fetch fee structures
  const fetchFeeStructures = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('fee_structures')
        .select(`
          *,
          courses (id, name, code)
        `);

      // Apply filters
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      
      if (filterCourse !== 'all') {
        query = query.eq('course_id', filterCourse);
      }
      
      if (filterStatus !== 'all') {
        query = query.eq('is_active', filterStatus === 'active');
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setFeeStructures(data || []);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      showSnackbar('Failed to load fee structures', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for filter
  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showSnackbar('Failed to load courses', 'error');
    }
  };

  useEffect(() => {
    fetchFeeStructures();
    fetchCourses();
  }, [searchTerm, filterCourse, filterStatus]);

  const handleDeleteClick = (structure) => {
    setStructureToDelete(structure);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!structureToDelete) return;
    
    try {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', structureToDelete.id);
      
      if (error) throw error;
      
      showSnackbar('Fee structure deleted successfully', 'success');
      fetchFeeStructures();
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      showSnackbar('Failed to delete fee structure', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setStructureToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/admin/fees/edit/${id}`);
  };

  const handleAddNew = () => {
    navigate('/admin/fees/new');
  };

  // Filter and paginate data
  const filteredData = feeStructures.filter((structure) => {
    const matchesSearch = !searchTerm || 
      structure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = filterCourse === 'all' || structure.course_id === filterCourse;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && structure.is_active) ||
      (filterStatus === 'inactive' && !structure.is_active);
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search fee structures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Course</InputLabel>
            <Select
              value={filterCourse}
              label="Course"
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <MenuItem value="all">All Courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            New
          </Button>
        </Box>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No fee structures found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((structure) => (
                  <TableRow key={structure.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{structure.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {structure.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {structure.courses?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(structure.amount)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={structure.frequency || 'One-time'} 
                        size="small"
                        color={structure.frequency === 'monthly' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={structure.is_active ? 'Active' : 'Inactive'} 
                        color={structure.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(new Date(structure.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(structure.id)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(structure)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Fee Structure</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the fee structure "{structureToDelete?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeeStructures;
