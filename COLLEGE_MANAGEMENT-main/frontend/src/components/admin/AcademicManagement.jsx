import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import Courses from './Courses';
import Subjects from './Subjects';
import Faculty from './Faculty';
import ExamSchedule from './ExamSchedule';
import MarksEntry from './MarksEntry';
import toast from 'react-hot-toast';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`academics-tabpanel-${index}`}
      aria-labelledby={`academics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `academics-tab-${index}`,
    'aria-controls': `academics-tabpanel-${index}`,
  };
}

const AcademicManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define the order of tabs
  const tabs = [
    { path: 'courses', label: 'Courses' },
    { path: 'subjects', label: 'Subjects' },
    { path: 'faculty', label: 'Faculty' },
    { path: 'exam-schedule', label: 'Exam Schedule' },
    { path: 'marks-entry', label: 'Marks Entry' }
  ];

  // Get the current tab from the URL
  const currentPath = location.pathname.split('/').pop() || 'courses';
  const currentTab = tabs.findIndex(tab => tab.path === currentPath);
  const tabValue = currentTab !== -1 ? currentTab : 0;

  // Redirect to the first tab if the current path is not found
  useEffect(() => {
    if (currentTab === -1) {
      navigate(`/admin/academic/${tabs[0].path}`, { replace: true });
    }
  }, [currentTab, navigate]);

  const handleTabChange = (event, newValue) => {
    navigate(`/admin/academic/${tabs[newValue].path}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue}
          onChange={handleTabChange}
          aria-label="academic management tabs"
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
      </Box>

      <Routes>
        <Route index element={<Navigate to="courses" replace />} />
        <Route path="courses" element={<Courses />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="exam-schedule" element={<ExamSchedule />} />
        <Route path="marks-entry" element={<MarksEntry />} />
        {/* Redirect any unknown paths to courses */}
        <Route path="*" element={<Navigate to="courses" replace />} />
      </Routes>
    </Box>
  );
};

export default AcademicManagement;
