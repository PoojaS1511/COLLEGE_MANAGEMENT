import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { LayoutDashboard, Users, UserCheck, Bus, UserCircle, MapPin, DollarSign, Calendar, Radio, FileText } from 'lucide-react';
import { TransportProvider } from '../../contexts/TransportContext';

const TransportManagement = () => {
  const location = useLocation();
  
  const tabs = [
    { label: 'Dashboard', path: '/admin/transport', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/transport/students', icon: Users },
    { label: 'Faculty', path: '/admin/transport/faculty', icon: UserCheck },
    { label: 'Buses', path: '/admin/transport/buses', icon: Bus },
    { label: 'Drivers', path: '/admin/transport/drivers', icon: UserCircle },
    { label: 'Routes', path: '/admin/transport/routes', icon: MapPin },
    { label: 'Fees', path: '/admin/transport/fees', icon: DollarSign },
    { label: 'Attendance', path: '/admin/transport/attendance', icon: Calendar },
    { label: 'Live Tracking', path: '/admin/transport/tracking', icon: Radio },
    { label: 'Reports', path: '/admin/transport/reports', icon: FileText },
  ];

  const getCurrentTab = () => {
    const currentPath = location.pathname;
    const index = tabs.findIndex(tab => tab.path === currentPath);
    return index !== -1 ? index : 0;
  };

  return (
    <TransportProvider>
      <Box className="min-h-screen bg-gray-50">
        <Box className="bg-white border-b sticky top-0 z-10">
          <Box className="max-w-7xl mx-auto px-4">
            <Tabs
              value={getCurrentTab()}
              variant="scrollable"
              scrollButtons="auto"
              className="border-b-0"
            >
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.path}
                    label={
                      <Box className="flex items-center gap-2">
                        <Icon size={18} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </Box>
                    }
                    component={Link}
                    to={tab.path}
                    className="min-w-0"
                  />
                );
              })}
            </Tabs>
          </Box>
        </Box>
        
        <Box className="max-w-7xl mx-auto">
          <Outlet />
        </Box>
      </Box>
    </TransportProvider>
  );
};

export default TransportManagement;