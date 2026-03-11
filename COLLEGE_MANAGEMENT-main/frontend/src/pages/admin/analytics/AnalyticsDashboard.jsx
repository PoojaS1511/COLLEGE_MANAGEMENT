import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
// Using mock data version of PerformanceAnalytics
import PerformanceAnalytics from './MockPerformanceAnalytics';
import EnrollmentAnalytics from './EnrollmentAnalytics';
import FeeAnalytics from './FeeAnalytics';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        transition: 'opacity 0.3s ease-in-out',
        opacity: value === index ? 1 : 0,
        position: value === index ? 'relative' : 'absolute',
        visibility: value === index ? 'visible' : 'hidden'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          p: { xs: 1, sm: 2 },
          width: '100%',
          height: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.grey[100],
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.grey[400],
            borderRadius: '10px',
            '&:hover': {
              background: theme.palette.grey[500],
            },
          },
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

const AnalyticsDashboard = () => {
  const [value, setValue] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Available analytics tabs
  const tabs = [
    { label: 'Performance', component: <PerformanceAnalytics /> },
    { label: 'Fee Analytics', component: <FeeAnalytics /> },
    { label: 'Enrollments', component: <EnrollmentAnalytics /> },
  ];

  // Update tab based on URL
  useEffect(() => {
    const path = location.pathname.split('/');
    const lastSegment = path[path.length - 1];
    const tabIndex = ['performance', 'fee', 'enrollment'].indexOf(lastSegment);
    
    if (tabIndex !== -1) {
      setValue(tabIndex);
    } else if (lastSegment === 'analytics' || lastSegment === 'admission' || lastSegment === 'utilization') {
      // Redirect to performance analytics if accessing removed tabs or base path
      navigate('performance', { replace: true });
    } else if (location.pathname.endsWith('analytics/')) {
      // Handle trailing slash case
      navigate('performance', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const tabNames = ['performance', 'fee', 'enrollment'];
    // Use relative navigation to avoid full path issues
    navigate(tabNames[newValue]);
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: 'calc(100vh - 120px)',
      p: isMobile ? 1 : 3,
      backgroundColor: theme.palette.background.default
    }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          color: theme.palette.primary.main,
          fontWeight: 'bold',
          mb: 3
        }}>
          College Analytics Dashboard
        </Typography>
        
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: '4px 4px 0 0',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 'auto',
            px: 3,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
        }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="analytics tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-scroller': {
                overflowX: 'auto !important',
              },
            }}
          >
            <Tab 
              label="Performance Analytics" 
              {...a11yProps(0)} 
              sx={{ 
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                minWidth: isMobile ? '120px' : 'auto'
              }}
            />
            <Tab 
              label="Fee Analytics" 
              {...a11yProps(1)}
              sx={{ 
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                minWidth: isMobile ? '100px' : 'auto'
              }}
            />
            <Tab 
              label="Enrollment Analytics" 
              {...a11yProps(2)}
              sx={{ 
                fontSize: isMobile ? '0.8rem' : '0.875rem',
                minWidth: isMobile ? '120px' : 'auto'
              }}
            />
          </Tabs>
        </Box>
        
        <Box sx={{ 
          minHeight: '60vh',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          p: isMobile ? 1 : 3,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={value} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;
