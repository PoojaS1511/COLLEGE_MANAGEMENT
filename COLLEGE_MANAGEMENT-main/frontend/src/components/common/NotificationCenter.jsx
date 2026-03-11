import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  Typography,
  Avatar,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  NotificationsNone as NotificationsNoneIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import NotificationService from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const notificationIcons = {
  error: <ErrorIcon color="error" />,
  warning: <WarningIcon sx={{ color: 'warning.main' }} />,
  info: <InfoIcon color="info" />,
  success: <CheckCircleIcon color="success" />,
  default: <NotificationsNoneIcon />
};

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const open = Boolean(anchorEl);

  // Load notifications when the component mounts or when the menu is opened
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotificationHistory({ 
        limit: 10,
        userId: user?.id
      });
      
      if (response.success) {
        setNotifications(response.data);
        const unread = response.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async (notificationId) => {
    try {
      // This would call an API endpoint to mark the notification as read
      // For now, we'll just update the local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // This would call an API endpoint to mark all notifications as read
      // For now, we'll just update the local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // This would call an API endpoint to delete the notification
      // For now, we'll just update the local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => 
        notifications.some(n => n.id === notificationId && !n.read) 
          ? Math.max(0, prev - 1) 
          : prev
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.link) {
      // Use your routing logic here, e.g., navigate(notification.link);
      console.log('Navigating to:', notification.link);
    }
    
    handleClose();
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="show notifications"
          aria-controls="notification-menu"
          aria-haspopup="true"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: {
            width: 400,
            maxHeight: 500,
          },
        }}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              color="primary"
              onClick={markAllAsRead}
              disabled={loading}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
          {loading ? (
            <Box p={3} textAlign="center">
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box p={3} textAlign="center">
              <NotificationsNoneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                No notifications to display
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    button 
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.read ? 'background.paper' : 'action.hover',
                      '&:hover': {
                        bgcolor: notification.read ? 'action.hover' : 'action.selected',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {notificationIcons[notification.type] || notificationIcons.default}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body2" 
                          component="span" 
                          fontWeight={notification.read ? 'normal' : 'bold'}
                          noWrap
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="caption"
                            display="block"
                            noWrap
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="textSecondary"
                            display="block"
                          >
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {!notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <MarkEmailReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
        
        {notifications.length > 0 && (
          <Box p={1} textAlign="center">
            <Button size="small" color="primary">
              View All Notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationCenter;
