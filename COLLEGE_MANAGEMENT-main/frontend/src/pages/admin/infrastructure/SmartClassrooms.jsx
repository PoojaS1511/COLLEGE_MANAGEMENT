import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Computer as ComputerIcon,
  Build as BuildIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SmartClassroomService from '../../../services/smartClassroomService';

const SmartClassrooms = () => {
  const [smartClassrooms, setSmartClassrooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [classroomUsage, setClassroomUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [formData, setFormData] = useState({
    classroom_id: '',
    type_id: '',
    is_active: true,
    installation_date: null,
    last_maintenance_date: null,
    next_maintenance_date: null,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    fetchSmartClassrooms();
    fetchEquipment();
    fetchMaintenanceTickets();
    fetchClassroomUsage();
  }, []);

  const fetchSmartClassrooms = async () => {
    setLoading(true);
    const { data, error } = await SmartClassroomService.getSmartClassrooms();
    if (error) {
      setError(error);
    } else {
      setSmartClassrooms(data);
    }
    setLoading(false);
  };

  const fetchEquipment = async () => {
    const { data } = await SmartClassroomService.getEquipment();
    if (data) setEquipment(data);
  };

  const fetchMaintenanceTickets = async () => {
    const { data } = await SmartClassroomService.getMaintenanceTickets();
    if (data) setMaintenanceTickets(data);
  };

  const fetchClassroomUsage = async () => {
    const { data } = await SmartClassroomService.getClassroomUsage();
    if (data) setClassroomUsage(data);
  };

  const handleOpenDialog = (classroom = null) => {
    if (classroom) {
      setCurrentClassroom(classroom.id);
      setFormData({
        classroom_id: classroom.classroom_id,
        type_id: classroom.type_id,
        is_active: classroom.is_active,
        installation_date: classroom.installation_date,
        last_maintenance_date: classroom.last_maintenance_date,
        next_maintenance_date: classroom.next_maintenance_date,
        notes: classroom.notes || ''
      });
    } else {
      setCurrentClassroom(null);
      setFormData({
        classroom_id: '',
        type_id: '',
        is_active: true,
        installation_date: null,
        last_maintenance_date: null,
        next_maintenance_date: null,
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.classroom_id) errors.classroom_id = 'Classroom is required';
    if (!formData.type_id) errors.type_id = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (currentClassroom) {
        await SmartClassroomService.updateSmartClassroom(currentClassroom, formData);
      } else {
        await SmartClassroomService.createSmartClassroom(formData);
      }
      fetchSmartClassrooms();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving smart classroom:', error);
      setError(error.message);
    }
  };

  const getStatusChip = (classroom) => {
    if (!classroom.is_active) {
      return <Chip icon={<ErrorIcon />} label="Inactive" color="error" size="small" />;
    }
    
    // Check for maintenance needed
    const needsMaintenance = maintenanceTickets.some(
      ticket => ticket.classroom_id === classroom.id && 
      ['open', 'in_progress'].includes(ticket.status)
    );
    
    if (needsMaintenance) {
      return <Chip icon={<WarningIcon />} label="Needs Maintenance" color="warning" size="small" />;
    }
    
    // Check if in use
    const isInUse = classroomUsage.some(
      usage => usage.classroom_id === classroom.id && 
      usage.status === 'in_use'
    );
    
    if (isInUse) {
      return <Chip icon={<InfoIcon />} label="In Use" color="info" size="small" />;
    }
    
    return <Chip icon={<CheckCircleIcon />} label="Available" color="success" size="small" />;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Smart Classrooms
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Smart Classroom
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ComputerIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Classrooms</Typography>
                    <Typography variant="h4">{smartClassrooms.length}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <BuildIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Active Maintenance</Typography>
                    <Typography variant="h4">
                      {maintenanceTickets.filter(t => ['open', 'in_progress'].includes(t.status)).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <EventIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Active Bookings</Typography>
                    <Typography variant="h4">
                      {classroomUsage.filter(u => u.status === 'in_use').length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ComputerIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Available Now</Typography>
                    <Typography variant="h4">
                      {smartClassrooms.filter(c => 
                        c.is_active && 
                        !maintenanceTickets.some(t => 
                          t.classroom_id === c.id && 
                          ['open', 'in_progress'].includes(t.status)
                        ) &&
                        !classroomUsage.some(u => 
                          u.classroom_id === c.id && 
                          u.status === 'in_use'
                        )
                      ).length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Smart Classrooms Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Classroom</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Building</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Maintenance</TableCell>
                    <TableCell>Next Maintenance</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {smartClassrooms.map((classroom) => (
                    <TableRow key={classroom.id}>
                      <TableCell>
                        <Typography fontWeight="bold">{classroom.classroom?.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Floor: {classroom.classroom?.floor}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {classroom.type?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {classroom.classroom?.building?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(classroom)}
                      </TableCell>
                      <TableCell>
                        {classroom.last_maintenance_date 
                          ? new Date(classroom.last_maintenance_date).toLocaleDateString() 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {classroom.next_maintenance_date 
                          ? new Date(classroom.next_maintenance_date).toLocaleDateString() 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(classroom)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentClassroom ? 'Edit Smart Classroom' : 'Add New Smart Classroom'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.classroom_id}>
                  <InputLabel>Classroom</InputLabel>
                  <Select
                    name="classroom_id"
                    value={formData.classroom_id}
                    onChange={handleInputChange}
                    label="Classroom"
                  >
                    {/* This should be populated with actual classrooms from your database */}
                    <MenuItem value="">Select a classroom</MenuItem>
                    <MenuItem value="classroom1">Classroom 1</MenuItem>
                    <MenuItem value="classroom2">Classroom 2</MenuItem>
                  </Select>
                  {formErrors.classroom_id && (
                    <FormHelperText>{formErrors.classroom_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.type_id}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type_id"
                    value={formData.type_id}
                    onChange={handleInputChange}
                    label="Type"
                  >
                    {/* This should be populated with actual types from your database */}
                    <MenuItem value="">Select a type</MenuItem>
                    <MenuItem value="type1">Standard Smart Classroom</MenuItem>
                    <MenuItem value="type2">Advanced Smart Classroom</MenuItem>
                  </Select>
                  {formErrors.type_id && (
                    <FormHelperText>{formErrors.type_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Installation Date"
                    value={formData.installation_date}
                    onChange={handleDateChange('installation_date')}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Last Maintenance Date"
                    value={formData.last_maintenance_date}
                    onChange={handleDateChange('last_maintenance_date')}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Next Maintenance Date"
                    value={formData.next_maintenance_date}
                    onChange={handleDateChange('next_maintenance_date')}
                    renderInput={(params) => (
                      <TextField {...params} fullWidth />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {currentClassroom ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default SmartClassrooms;
