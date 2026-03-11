import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Faculty Admin Dashboard
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to Faculty Administration
          </Typography>
          <Typography variant="body1">
            This is the main dashboard for faculty administration. Use the navigation menu to access different sections.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
