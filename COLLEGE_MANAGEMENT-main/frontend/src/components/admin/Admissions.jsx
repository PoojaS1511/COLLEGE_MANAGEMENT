import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  InputAdornment, 
  Button, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { admissionsService } from '../../services/admissionsService';

const statusColors = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
  'Under Review': 'info',
  Waitlisted: 'default'
};

const statusIcons = {
  Pending: <PendingIcon fontSize="small" />,
  Approved: <CheckCircleIcon fontSize="small" color="success" />,
  Rejected: <CancelIcon fontSize="small" color="error" />,
  'Under Review': <PendingIcon fontSize="small" color="info" />,
  Waitlisted: <PendingIcon fontSize="small" color="action" />
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const Admissions = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch applications from Supabase
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const response = await admissionsService.getAdmissions({
          status: statusFilter === 'all' ? null : statusFilter,
          search: searchTerm,
          page: page + 1,
          pageSize: rowsPerPage
        });
        
        if (response) {
          setApplications(response.data || []);
          setTotalCount(response.count || 0);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [statusFilter, searchTerm, page, rowsPerPage]);

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admission Applications
        </Typography>

        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search by name..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />

          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Applications Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Previous School</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'error.main' }}>
                      {error}
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {app.first_name} {app.last_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {app.gender}, {app.date_of_birth ? new Date().getFullYear() - new Date(app.date_of_birth).getFullYear() + ' years' : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{app.email}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {app.phone || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{app.previous_school || 'N/A'}</Typography>
                          {app.year_completed && (
                            <Typography variant="caption" color="textSecondary">
                              Graduated: {app.year_completed}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={app.status || 'Pending'}
                          color={statusColors[app.status] || 'default'}
                          size="small"
                          icon={statusIcons[app.status]}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(app.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default Admissions;