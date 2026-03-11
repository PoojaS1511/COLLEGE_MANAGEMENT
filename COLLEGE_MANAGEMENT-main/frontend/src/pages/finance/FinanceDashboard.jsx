import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Tabs,
  Tab,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { 
  DollarSign, 
  TrendingDown, 
  Wallet, 
  AlertCircle 
} from 'lucide-react';
import MetricCard from '../../components/finance/MetricCard';
import { 
  dashboardMetrics, 
  DEPARTMENTS 
} from '../../data/finance/mockData';
import RevenueExpensesTab from '../../components/finance/tabs/RevenueExpensesTab';
import FeeCollectionTab from '../../components/finance/tabs/FeeCollectionTab';
import BudgetAnalysisTab from '../../components/finance/tabs/BudgetAnalysisTab';
import FinancialTrendsTab from '../../components/finance/tabs/FinancialTrendsTab';
import SalaryDistributionTab from '../../components/finance/tabs/SalaryDistributionTab';

const FinanceDashboard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const metrics = [
    {
      title: 'Total Revenue',
      value: dashboardMetrics.totalRevenue,
      icon: DollarSign,
      trend: 'up',
      trendValue: dashboardMetrics.revenueGrowth,
      color: 'primary',
      prefix: '₹',
    },
    {
      title: 'Total Expenses',
      value: dashboardMetrics.totalExpenses,
      icon: TrendingDown,
      trend: 'up',
      trendValue: dashboardMetrics.expenseGrowth,
      color: 'error',
      prefix: '₹',
    },
    {
      title: 'Net Balance',
      value: dashboardMetrics.netBalance,
      icon: Wallet,
      trend: 'up',
      trendValue: dashboardMetrics.revenueGrowth - dashboardMetrics.expenseGrowth,
      color: 'secondary',
      prefix: '₹',
    },
    {
      title: 'Pending Dues',
      value: dashboardMetrics.pendingDues,
      icon: AlertCircle,
      trend: 'down',
      trendValue: Math.abs(dashboardMetrics.dueGrowth),
      color: 'warning',
      prefix: '₹',
    },
  ];

  const tabs = [
    { label: 'Revenue & Expenses', component: RevenueExpensesTab },
    { label: 'Fee Collection', component: FeeCollectionTab },
    { label: 'Budget Analysis', component: BudgetAnalysisTab },
    { label: 'Financial Trends', component: FinancialTrendsTab },
    { label: 'Salary Distribution', component: SalaryDistributionTab },
  ];

  const TabComponent = tabs[selectedTab].component;

  return (
    <Box className="p-6 space-y-6">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-900">
            Finance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            Real-time financial overview and analytics
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            label="Department"
            size="small"
          >
            {DEPARTMENTS.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Metrics Grid */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </Box>

      {/* Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <CardContent className="p-6">
          <TabComponent department={selectedDepartment} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinanceDashboard;