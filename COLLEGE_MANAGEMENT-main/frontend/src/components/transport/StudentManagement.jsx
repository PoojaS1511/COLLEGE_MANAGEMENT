import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  MenuItem,
  CircularProgress,
  Alert,
  TablePagination
} from '@mui/material';
import { Search, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import TransportService from '../../services/transportService';

// Helper function to extract name from email
const extractNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return 'N/A';
  
  const localPart = email.split('@')[0];
  
  // Handle patterns like "firstname.lastname" or "firstname.year"
  if (localPart.includes('.')) {
    const parts = localPart.split('.');
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      // Remove numbers from second part and capitalize
      const secondPart = parts[1].replace(/\d+/g, '').charAt(0).toUpperCase() + parts[1].replace(/\d+/g, '').slice(1).toLowerCase();
      return `${firstName} ${secondPart}`.trim();
    }
  }
  
  // Handle patterns like "firstname_year" 
  if (/\d/.test(localPart)) {
    const nameMatch = localPart.match(/^([a-zA-Z._-]+)/);
    if (nameMatch) {
      const cleanName = nameMatch[1].replace(/[._-]/g, ' ');
      return cleanName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ').trim();
    }
  }
  
  // Simple case - capitalize and clean
  return localPart.replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim() || 'N/A';
};

// Helper function to generate register number from email
const generateRegisterNumber = (email) => {
  if (!email || typeof email !== 'string') return 'N/A';
  
  const localPart = email.split('@')[0];
  
  // Extract year from email
  const yearMatch = localPart.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : '2025';
  
  // Extract name part
  const namePart = localPart.replace(/\d+/g, '').replace(/[._-]/g, '');
  
  // Generate unique suffix
  let hash = 0;
  for (let i = 0; i < namePart.length; i++) {
    const char = namePart.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashSuffix = Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
  return `REG${year}${hashSuffix}`;
};

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    total: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    student_id: '',
    gender: '',
    department_id: '',
    course_id: '',
    year: '',
    quota: '',
    category: '',
    hostel_required: false,
    transport_required: false,
    admission_year: '',
    current_semester: '',
    father_name: '',
    mother_name: '',
    address: '',
    route_id: '',
    route_name: '',
    pickup_point: '',
    fee_status: 'Pending',
    status: 'active',
  });

  useEffect(() => {
    loadStudents();
  }, [pagination.page, pagination.rowsPerPage, filterStatus, searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page + 1,
        limit: pagination.rowsPerPage
      };
      
      // Add filters if present
      if (filterStatus !== 'All') {
        params.status = filterStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const result = await TransportService.getTransportStudents(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setStudents(result.data);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        total: result.total || 0
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        student_id: student.student_id || '',
        gender: student.gender || '',
        department_id: student.department_id || '',
        course_id: student.course_id || '',
        year: student.year || '',
        quota: student.quota || '',
        category: student.category || '',
        hostel_required: student.hostel_required || false,
        transport_required: student.transport_required || false,
        admission_year: student.admission_year || '',
        current_semester: student.current_semester || '',
        father_name: student.father_name || '',
        mother_name: student.mother_name || '',
        address: student.address || '',
        route_id: student.route_id || '',
        route_name: student.route_name || '',
        pickup_point: student.pickup_point || '',
        fee_status: student.fee_status || 'Pending',
        status: student.status || 'active',
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        student_id: '',
        gender: '',
        department_id: '',
        course_id: '',
        year: '',
        quota: '',
        category: '',
        hostel_required: false,
        transport_required: false,
        admission_year: '',
        current_semester: '',
        father_name: '',
        mother_name: '',
        address: '',
        route_id: '',
        route_name: '',
        pickup_point: '',
        fee_status: 'Pending',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingStudent) {
        await TransportService.updateTransportStudent(editingStudent.id, formData);
      } else {
        await TransportService.addTransportStudent(formData);
      }
      handleCloseDialog();
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await TransportService.deleteTransportStudent(id);
        loadStudents();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const name = student.name || (student.email ? extractNameFromEmail(student.email) : '');
    const studentId = student.student_id || (student.email ? generateRegisterNumber(student.email) : '');
    
    const matchesSearch = (name && name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (studentId && studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (student.id && student.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  console.log('🔍 Filtered students count:', filteredStudents.length); // Debug log
  console.log('🔍 Sample filtered student:', filteredStudents[0]); // Debug log

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  // Debug: Show first student data
  if (students.length > 0) {
    console.log('🔍 First student data in render:', students[0]);
    console.log('🔍 First student register_number:', students[0].register_number);
    console.log('🔍 First student full_name:', students[0].full_name);
  }

  return (
    <Box className="p-6 space-y-6">
      {/* Header */}
      <Box className="flex justify-between items-center">
        <Box>
          <Typography variant="h4" className="font-bold mb-2">
            Student Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage students using transport services
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Student
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent>
          <Box className="flex gap-4">
            <TextField
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search size={20} className="mr-2 text-gray-400" />,
              }}
              className="flex-1"
              size="small"
            />
            <TextField
              select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              size="small"
              className="w-40"
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell className="font-semibold">ID</TableCell>
                <TableCell className="font-semibold">Student ID</TableCell>
                <TableCell className="font-semibold">Name</TableCell>
                <TableCell className="font-semibold">Email</TableCell>
                <TableCell className="font-semibold">Phone</TableCell>
                <TableCell className="font-semibold">Gender</TableCell>
                <TableCell className="font-semibold">Department</TableCell>
                <TableCell className="font-semibold">Course</TableCell>
                <TableCell className="font-semibold">Year</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Box className="font-mono text-xs">
                      {student.id || 'No ID'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className="font-mono text-xs">
                      {student.student_id || (student.email ? generateRegisterNumber(student.email) : 'No Student ID')}
                    </Box>
                  </TableCell>
                  <TableCell>{student.name || (student.email ? extractNameFromEmail(student.email) : 'No Name')}</TableCell>
                  <TableCell>{student.email || 'No Email'}</TableCell>
                  <TableCell>{student.phone || 'No Phone'}</TableCell>
                  <TableCell>{student.gender || 'N/A'}</TableCell>
                  <TableCell>{student.department_id || 'N/A'}</TableCell>
                  <TableCell>{student.course_id || 'N/A'}</TableCell>
                  <TableCell>{student.year || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.status || 'Active'}
                      color={student.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-2">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(student)}
                        className="text-blue-600"
                      >
                        <Edit size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination Controls */}
      <Card>
        <CardContent>
          <Box className="flex justify-between items-center">
            <Box className="flex items-center gap-4">
              <Typography variant="body2" color="text.secondary">
                Showing {students.length} of {pagination.total} students
              </Typography>
              <TextField
                select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                size="small"
                className="w-20"
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </TextField>
              <Typography variant="body2" color="text.secondary">
                per page
              </Typography>
            </Box>
            
            <Box className="flex items-center gap-2">
              <IconButton
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                size="small"
              >
                <ChevronLeft size={20} />
              </IconButton>
              
              <Typography variant="body2" className="mx-2">
                Page {pagination.page} of {pagination.pages}
              </Typography>
              
              <IconButton
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                size="small"
              >
                <ChevronRight size={20} />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">
            {editingStudent ? 'Edit Student' : 'Add Student'}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Student ID"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              fullWidth
            />
            <TextField
              label="Department ID"
              type="number"
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Course ID"
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              fullWidth
            />
            <TextField
              label="Quota"
              value={formData.quota}
              onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
              fullWidth
            />
            <TextField
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Hostel Required"
              value={formData.hostel_required}
              onChange={(e) => setFormData({ ...formData, hostel_required: e.target.value === 'true' })}
              fullWidth
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
            <TextField
              select
              label="Transport Required"
              value={formData.transport_required}
              onChange={(e) => setFormData({ ...formData, transport_required: e.target.value === 'true' })}
              fullWidth
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
            <TextField
              label="Admission Year"
              type="number"
              value={formData.admission_year}
              onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
              fullWidth
            />
            <TextField
              label="Current Semester"
              type="number"
              value={formData.current_semester}
              onChange={(e) => setFormData({ ...formData, current_semester: e.target.value })}
              fullWidth
            />
            <TextField
              label="Father Name"
              value={formData.father_name}
              onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mother Name"
              value={formData.mother_name}
              onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Route ID"
              value={formData.route_id}
              onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Route Name"
              value={formData.route_name}
              onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Pickup Point"
              value={formData.pickup_point}
              onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Fee Status"
              value={formData.fee_status}
              onChange={(e) => setFormData({ ...formData, fee_status: e.target.value })}
              fullWidth
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {editingStudent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement;