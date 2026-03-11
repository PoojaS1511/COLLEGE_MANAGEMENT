import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText, 
  TextField, 
  Button, 
  Divider, 
  IconButton,
  Grid
} from '@mui/material';
import { Send, Refresh, Delete, MarkEmailRead } from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`communication-tabpanel-${index}`}
      aria-labelledby={`communication-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `communication-tab-${index}`,
    'aria-controls': `communication-tabpanel-${index}`,
  };
}

const CommunicationCenter = () => {
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState('');
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Welcome Back!', date: '2025-08-01', read: true },
    { id: 2, title: 'System Maintenance', date: '2025-08-05', read: false },
  ]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to a backend API
      console.log('Message sent:', message);
      setMessage('');
      // Show success message or update UI
    }
  };

  const markAsRead = (id) => {
    setAnnouncements(announcements.map(announcement => 
      announcement.id === id ? { ...announcement, read: true } : announcement
    ));
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Communication Center
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="communication tabs"
          variant="fullWidth"
        >
          <Tab label="Announcements" {...a11yProps(0)} />
          <Tab label="Send Message" {...a11yProps(1)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Recent Announcements</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Box>
          
          <List>
            {announcements.length > 0 ? (
              announcements.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem 
                    secondaryAction={
                      <Box>
                        <IconButton 
                          edge="end" 
                          aria-label="mark as read"
                          onClick={() => markAsRead(item.id)}
                          color="primary"
                        >
                          <MarkEmailRead />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => deleteAnnouncement(item.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText 
                      primary={item.title} 
                      secondary={`Posted on ${item.date}`}
                      sx={{ 
                        textDecoration: item.read ? 'none' : 'underline',
                        fontWeight: item.read ? 'normal' : 'bold'
                      }}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
                No announcements available
              </Typography>
            )}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Recipients"
                fullWidth
                margin="normal"
                variant="outlined"
                placeholder="Select recipients..."
                select
                SelectProps={{ multiple: true, native: true }}
              >
                <option value="all">All Users</option>
                <option value="students">Students</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message"
                fullWidth
                multiline
                rows={6}
                margin="normal"
                variant="outlined"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Send />}
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Send Message
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default CommunicationCenter;
