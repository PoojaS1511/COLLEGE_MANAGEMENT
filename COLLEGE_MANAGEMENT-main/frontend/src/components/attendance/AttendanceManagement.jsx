import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box, Button } from '@mui/material';
import toast from 'react-hot-toast';

// Import attendance components
import DailyAttendance from './DailyAttendance';
import AttendanceReport from './AttendanceReport';
import AttendanceByStudent from './AttendanceByStudent';
import BulkAttendance from './BulkAttendance';
import AttendanceSettings from './AttendanceSettings';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `attendance-tab-${index}`,
    'aria-controls': `attendance-tabpanel-${index}`,
  };
}

const AttendanceManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define the order of tabs
  const tabs = [
    { path: 'daily', label: 'Daily Attendance' },
    { path: 'bulk', label: 'Bulk Upload' },
    { path: 'reports', label: 'Reports' },
    { path: 'by-student', label: 'By Student' },
    { path: 'settings', label: 'Settings' }
  ];

  // Get the current tab from the URL
  const currentPath = location.pathname.split('/').pop() || 'daily';
  const currentTab = tabs.findIndex(tab => tab.path === currentPath);
  const tabValue = currentTab !== -1 ? currentTab : 0;

  // Redirect to the first tab if the current path is not found
  useEffect(() => {
    if (currentTab === -1) {
      navigate(`/admin/attendance/${tabs[0].path}`, { replace: true });
    }
  }, [currentTab, navigate]);

  const handleTabChange = (event, newValue) => {
    navigate(`/admin/attendance/${tabs[newValue].path}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs 
            value={tabValue}
            onChange={handleTabChange}
            aria-label="attendance management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab.path}
                label={tab.label}
                component={Link}
                to={tab.path}
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
          
          {currentPath === 'daily' && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/admin/attendance/daily?mark=all')}
              sx={{ mr: 2 }}
            >
              Mark All Present
            </Button>
          )}
        </Box>
      </Box>

      <Routes>
        <Route index element={<Navigate to="daily" replace />} />
        <Route path="daily" element={<DailyAttendance />} />
        <Route path="bulk" element={<BulkAttendance />} />
        <Route path="reports" element={<AttendanceReport />} />
        <Route path="by-student" element={<AttendanceByStudent />} />
        <Route path="settings" element={<AttendanceSettings />} />
        <Route path="*" element={<Navigate to="daily" replace />} />
      </Routes>
    </Box>
  );
};

export default AttendanceManagement;
