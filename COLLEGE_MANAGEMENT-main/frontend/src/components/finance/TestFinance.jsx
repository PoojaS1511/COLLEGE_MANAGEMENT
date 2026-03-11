import React from 'react';
import { Box, Typography } from '@mui/material';

const TestFinance = () => {
  console.log('TestFinance component rendering!');
  
  return (
    <Box sx={{ p: 3, backgroundColor: 'lightblue' }}>
      <Typography variant="h4" sx={{ mb: 2, color: 'red' }}>
        FINANCE MODULE TEST PAGE
      </Typography>
      <Typography variant="body1" sx={{ color: 'blue' }}>
        Current URL: {window.location.pathname}
      </Typography>
      <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
        If you can see this page, finance routing is working!
      </Typography>
    </Box>
  );
};

export default TestFinance;
