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
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  FormControlLabel,
  Switch,
  FormGroup
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import NotificationService from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'email',
    category: 'announcement'
  });

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const filters = activeTab === 'all' ? {} : { type: activeTab };
      const { data, error } = await NotificationService.getNotifications(filters);
      
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showSnackbar('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const notificationData = {
        ...formData,
        sender_id: currentUser?.id
      };

      if (editingNotification) {
        const { data, error } = await NotificationService.updateNotification(
          editingNotification.id, 
          notificationData
        );
        if (error) throw error;
        showSnackbar('Notification updated successfully');
      } else {
        const { data, error } = await NotificationService.createNotification(notificationData);
        if (error) throw error;
        showSnackbar('Notification created successfully');
      }
      
      handleCloseDialog();
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      showSnackbar('Failed to save notification', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const { error } = await NotificationService.deleteNotification(id);
      if (error) throw error;
      
      showSnackbar('Notification deleted successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showSnackbar('Failed to delete notification', 'error');
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      message: '',
      type: 'email',
      category: 'announcement'
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  const getTypeIcon = (type) => {
    switch(type) {
      case 'email': return <EmailIcon fontSize="small" />;
      case 'sms': return <SmsIcon fontSize="small" />;
      default: return <NotificationsIcon fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Notification Center
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Notification
        </Button>
      </Box>

      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="all" />
          <Tab label="Email" value="email" icon={<EmailIcon />} iconPosition="start" />
          <Tab label="SMS" value="sms" icon={<SmsIcon />} iconPosition="start" />
        </Tabs>

        <Divider />

        {loading ? (
          <Box p={3} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText primary="No notifications found" />
              </ListItem>
            ) : (
              notifications.map((notification) => (
                <ListItem 
                  key={notification.id} 
                  divider
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {getTypeIcon(notification.type)}
                      <Typography variant="subtitle1" component="div" sx={{ ml: 1 }}>
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.category}
                        size="small"
                        sx={{ ml: 1 }}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {notification.message}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(notification.created_at), 'PPpp')}
                      </Typography>
                    </Box>
                  </Box>
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleEdit(notification)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDelete(notification.id)}
                      aria-label="delete"
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            )}
          </List>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit
        }}
      >
        <DialogTitle>
          {editingNotification ? 'Edit Notification' : 'Create New Notification'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="sms">SMS</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="reminder">Reminder</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            startIcon={editingNotification ? <EditIcon /> : <SendIcon />}
          >
            {editingNotification ? 'Update' : 'Send'}
          </Button>
        </DialogActions>
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
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationManagement;
