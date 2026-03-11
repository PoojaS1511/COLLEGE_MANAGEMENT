import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TablePagination,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CurrencyRupee as CurrencyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { feesService } from '../../services/feesService';

const statusColors = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'error'
};

const FeesList = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('FeesList mounted, loading data...');
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching fees data...');
      const data = await feesService.getAllFees();
      console.log('Fetched fees data:', data);
      setFees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading fees:', err);
      setError(err.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = 
      fee.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.course?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredFees.length) : 0;

  const paginatedFees = filteredFees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading fee records...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">Error loading fee records</Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={loadFees}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (fees.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No fee records found
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          No fee payment records are currently available.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/fees/new')}
        >
          Record New Payment
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1">
            Fee Management
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/fees/new')}
              sx={{ whiteSpace: 'nowrap' }}
            >
              New Fee Record
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReceiptIcon />}
              onClick={() => navigate('/admin/fees')}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Record Payment
            </Button>
          </Box>
        </Box>
        <Card>
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 3 }}>
              <TextField
                variant="outlined"
                placeholder="Search by student name, register number, or course..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box mt={3}>
                            
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student Name</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedFees.map((fee) => (
                      <TableRow key={fee.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{fee.studentName}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {fee.registerNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{fee.course}</TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <CurrencyIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            {formatCurrency(fee.amount)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={fee.status?.charAt(0)?.toUpperCase() + fee.status?.slice(1) || 'N/A'}
                            color={statusColors[fee.status] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => fee.id && navigate(`/admin/fees/${fee.id}`)}
                                color="primary"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Record Payment">
                              <IconButton
                                size="small"
                                onClick={() => fee.id && navigate(`/admin/fees/${fee.id}/pay`)}
                                color="secondary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredFees.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default FeesList;
