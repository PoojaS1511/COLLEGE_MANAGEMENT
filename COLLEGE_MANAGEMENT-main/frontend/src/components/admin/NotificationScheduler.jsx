import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import NotificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const NOTIFICATION_TYPES = {
  EXAM_REMINDER: 'exam_reminder',
  FEE_DUE_REMINDER: 'fee_due_reminder',
  PAYMENT_RECEIPT: 'payment_receipt',
  GENERAL: 'general'
};

const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  BOTH: 'both'
};

const NOTIFICATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SENT: 'sent',
  FAILED: 'failed'
};

const NotificationScheduler = () => {
  const { hasPermission } = useAuth();
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    type: NOTIFICATION_TYPES.EXAM_REMINDER,
    title: '',
    message: '',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    channels: [NOTIFICATION_CHANNELS.EMAIL],
    recipients: [],
    isRecurring: false,
    recurrence: null,
    status: NOTIFICATION_STATUS.ACTIVE
  });

  // Load scheduled notifications
  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getScheduledNotifications();
      if (response.success) {
        setScheduledNotifications(response.data);
      }
    } catch (error) {
      showSnackbar('Failed to load scheduled notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (notification = null) => {
    if (notification) {
      setEditingId(notification.id);
      setFormData({
        ...notification,
        scheduledAt: new Date(notification.scheduledAt)
      });
    } else {
      setEditingId(null);
      setFormData({
        type: NOTIFICATION_TYPES.EXAM_REMINDER,
        title: '',
        message: '',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        channels: [NOTIFICATION_CHANNELS.EMAIL],
        recipients: [],
        isRecurring: false,
        recurrence: null,
        status: NOTIFICATION_STATUS.ACTIVE
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChannelsChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      channels: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message || !formData.scheduledAt) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (editingId) {
        response = await NotificationService.updateScheduledNotification(editingId, formData);
      } else {
        response = await NotificationService.scheduleNotification(formData);
      }
      
      if (response.success) {
        showSnackbar(
          `Notification ${editingId ? 'updated' : 'scheduled'} successfully`,
          'success'
        );
        loadScheduledNotifications();
        handleCloseDialog();
      }
    } catch (error) {
      showSnackbar(
        `Failed to ${editingId ? 'update' : 'schedule'} notification: ${error.message}`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scheduled notification?')) {
      try {
        setLoading(true);
        const response = await NotificationService.deleteScheduledNotification(id);
        if (response.success) {
          showSnackbar('Notification deleted successfully', 'success');
          loadScheduledNotifications();
        }
      } catch (error) {
        showSnackbar(`Failed to delete notification: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      [NOTIFICATION_STATUS.ACTIVE]: { label: 'Active', color: 'success' },
      [NOTIFICATION_STATUS.INACTIVE]: { label: 'Inactive', color: 'default' },
      [NOTIFICATION_STATUS.SENT]: { label: 'Sent', color: 'info' },
      [NOTIFICATION_STATUS.FAILED]: { label: 'Failed', color: 'error' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'default' };
    return (
      <Chip 
        label={config.label} 
        size="small" 
        color={config.color}
        variant="outlined"
      />
    );
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case NOTIFICATION_CHANNELS.EMAIL:
        return <EmailIcon fontSize="small" />;
      case NOTIFICATION_CHANNELS.SMS:
        return <SmsIcon fontSize="small" />;
      case NOTIFICATION_CHANNELS.BOTH:
        return <NotificationsIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Scheduled Notifications
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!hasPermission('canSendNotifications')}
          >
            Schedule Notification
          </Button>
        </Box>

        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Scheduled For</TableCell>
                    <TableCell>Channels</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : scheduledNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <NotificationsIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          No scheduled notifications found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    scheduledNotifications.map((notification) => (
                      <TableRow key={notification.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" noWrap>
                            {notification.message.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={notification.type.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {format(new Date(notification.scheduledAt), 'PPpp')}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            {notification.channels.map(channel => (
                              <Tooltip key={channel} title={channel}>
                                <span>{getChannelIcon(channel)}</span>
                              </Tooltip>
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(notification.status)}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(notification)}
                              disabled={!hasPermission('canSendNotifications')}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(notification.id)}
                              disabled={!hasPermission('canSendNotifications')}
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
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingId ? 'Edit Scheduled Notification' : 'Schedule New Notification'}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Notification Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      label="Notification Type"
                      disabled={!!editingId}
                    >
                      {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                        <MenuItem key={key} value={value}>
                          {value.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    size="small"
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    size="small"
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Scheduled Time"
                    value={formData.scheduledAt}
                    onChange={(newValue) => 
                      setFormData(prev => ({ ...prev, scheduledAt: newValue }))
                    }
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        size="small" 
                        required 
                      />
                    )}
                    minDateTime={new Date()}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" required>
                    <InputLabel>Channels</InputLabel>
                    <Select
                      name="channels"
                      multiple
                      value={formData.channels}
                      onChange={handleChannelsChange}
                      label="Channels"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={value} 
                              size="small"
                              icon={getChannelIcon(value)}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.entries(NOTIFICATION_CHANNELS).map(([key, value]) => (
                        <MenuItem key={key} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isRecurring}
                        onChange={(e) => 
                          setFormData(prev => ({ 
                            ...prev, 
                            isRecurring: e.target.checked 
                          }))
                        }
                        name="isRecurring"
                        color="primary"
                      />
                    }
                    label="Recurring Notification"
                  />
                </Grid>
                
                {formData.isRecurring && (
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Recurrence</InputLabel>
                      <Select
                        name="recurrence"
                        value={formData.recurrence || ''}
                        onChange={handleInputChange}
                        label="Recurrence"
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {editingId ? 'Update' : 'Schedule'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default NotificationScheduler;
