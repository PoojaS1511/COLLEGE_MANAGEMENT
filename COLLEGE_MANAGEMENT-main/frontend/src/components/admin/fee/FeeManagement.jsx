import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Tabs, 
  Tab, 
  Container, 
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Assessment as AnalyticsIcon,
  Add as AddIcon
} from '@mui/icons-material';
import FeeStructures from './FeeStructures';
import FeePayments from './FeePayments';
import FeeAnalytics from './FeeAnalytics';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { useAuth } from '../../../contexts/AuthContext';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSnackbar } = useSnackbar();
  const { hasRole } = useAuth();

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/payments')) setActiveTab(1);
    else if (path.includes('/analytics')) setActiveTab(2);
    else setActiveTab(0);
  }, [location]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update URL based on tab
    switch(newValue) {
      case 1:
        navigate('/admin/fees/payments');
        break;
      case 2:
        navigate('/admin/fees/analytics');
        break;
      default:
        navigate('/admin/fees');
    }
  };

  const handleAddFeeStructure = () => {
    navigate('/admin/fees/new');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Fee Management
        </Typography>
        {hasRole('admin') && activeTab === 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddFeeStructure}
          >
            Add Fee Structure
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTabs-flexContainer': {
              px: { xs: 1, sm: 3 },
            },
          }}
        >
          <Tab 
            icon={<ReceiptIcon />} 
            label={isMobile ? null : 'Fee Structures'} 
            iconPosition="start" 
          />
          <Tab 
            icon={<PaymentIcon />} 
            label={isMobile ? null : 'Payments'} 
            iconPosition="start" 
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            label={isMobile ? null : 'Analytics'} 
            iconPosition="start" 
          />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && <FeeStructures />}
        {activeTab === 1 && <FeePayments />}
        {activeTab === 2 && <FeeAnalytics />}
      </Box>
    </Container>
  );
};

export default FeeManagement;
