import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '../../../services/supabaseClient';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const FeeAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('current_year');
  const [department, setDepartment] = useState('all');
  const [feeData, setFeeData] = useState({
    feeSummary: [],
    monthlyTrend: [],
    paymentStatus: [],
    feeTypeDistribution: [],
    departmentWise: [],
    lateFeeAnalysis: []
  });

  useEffect(() => {
    fetchFeeAnalytics();
    // Set up real-time subscription
    const subscription = supabase
      .channel('fee_payments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fee_payments' }, () => {
        fetchFeeAnalytics();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [timeRange, department]);

  const fetchFeeAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch fee summary
      const { data: summaryData } = await supabase.rpc('get_fee_summary', {
        p_time_range: timeRange,
        p_department: department === 'all' ? null : department
      });

      // Fetch monthly trend
      const { data: trendData } = await supabase.rpc('get_fee_trend', {
        p_time_range: timeRange,
        p_department: department === 'all' ? null : department
      });

      // Fetch payment status
      const { data: statusData } = await supabase.rpc('get_payment_status', {
        p_time_range: timeRange,
        p_department: department === 'all' ? null : department
      });

      // Fetch fee type distribution
      const { data: feeTypeData } = await supabase.rpc('get_fee_type_distribution', {
        p_time_range: timeRange,
        p_department: department === 'all' ? null : department
      });

      setFeeData({
        feeSummary: summaryData || [],
        monthlyTrend: trendData || [],
        paymentStatus: statusData || [],
        feeTypeDistribution: feeTypeData || [],
      });
    } catch (error) {
      console.error('Error fetching fee analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {feeData.feeSummary.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="h4">
                {item.currency ? `${item.currency} ${item.value.toLocaleString()}` : item.value.toLocaleString()}
              </Typography>
              <Typography 
                variant="body2" 
                color={item.change >= 0 ? 'success.main' : 'error.main'}
                sx={{ mt: 1 }}
              >
                {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change)}% from last period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderMonthlyTrend = () => (
    <Card sx={{ mb: 4 }}>
      <CardHeader title="Monthly Fee Collection Trend" />
      <Divider />
      <CardContent>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={feeData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total_amount" 
                name="Total Amount" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="transaction_count" 
                name="Number of Transactions" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPaymentStatus = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Payment Status Distribution" />
          <Divider />
          <CardContent>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feeData.paymentStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {feeData.paymentStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Fee Type Distribution" />
          <Divider />
          <CardContent>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeData.feeTypeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fee_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_amount" name="Total Amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fee Analytics Dashboard
      </Typography>
      
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="current_month">Current Month</MenuItem>
            <MenuItem value="last_month">Last Month</MenuItem>
            <MenuItem value="current_quarter">Current Quarter</MenuItem>
            <MenuItem value="current_year">Current Year</MenuItem>
            <MenuItem value="last_year">Last Year</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            label="Department"
          >
            <MenuItem value="all">All Departments</MenuItem>
            <MenuItem value="cse">Computer Science</MenuItem>
            <MenuItem value="ece">Electronics</MenuItem>
            <MenuItem value="mech">Mechanical</MenuItem>
            <MenuItem value="civil">Civil</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {renderSummaryCards()}
          {renderMonthlyTrend()}
          {renderPaymentStatus()}
        </>
      )}
    </Box>
  );
};

export default FeeAnalytics;
