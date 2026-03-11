import React, { useState } from 'react';
import { Tabs, Tab, Container, Box } from '@mui/material';
import Courses from './academics/Courses';
import Subjects from './academics/Subjects';
import Faculty from './academics/Faculty';
import ExamSchedule from './academics/ExamSchedule';
import MarksEntry from './academics/MarksEntry';
import ExamAnalytics from './academics/ExamAnalytics';

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
    id: `academics-tab-${index}`,
    'aria-controls': `academics-tabpanel-${index}`,
  };
}

const Academics = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="academics tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Courses" {...a11yProps(0)} />
            <Tab label="Subjects" {...a11yProps(1)} />
            <Tab label="Faculty" {...a11yProps(2)} />
            <Tab label="Exam Schedule" {...a11yProps(3)} />
            <Tab label="Marks Entry" {...a11yProps(4)} />
            <Tab label="Exam Analytics" {...a11yProps(5)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Courses />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Subjects />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Faculty />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <ExamSchedule />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <MarksEntry />
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <ExamAnalytics />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Academics;
