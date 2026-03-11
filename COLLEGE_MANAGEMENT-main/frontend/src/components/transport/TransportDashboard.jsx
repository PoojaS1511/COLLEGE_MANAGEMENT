import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bus, Users, UserCheck, TrendingUp, DollarSign, MapPin, Calendar } from 'lucide-react';
import TransportService from '../../services/transportService';

const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent>
      <Box className="flex items-center justify-between">
        <Box>
          <Typography color="text.secondary" className="text-sm font-medium mb-1">
            {title}
          </Typography>
          <Typography variant="h4" className="font-bold mb-1" style={{ color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={24} style={{ color }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TransportDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const result = await TransportService.getDashboardMetrics();
      if (!result.success) {
        throw new Error(result.error);
      }
      setMetrics(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Alert severity="error">Error loading dashboard: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="p-6 space-y-6">
      {/* Header */}
      <Box>
        <Typography variant="h4" className="font-bold mb-2">
          Transport Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of transport operations and key metrics
        </Typography>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Students"
            value={metrics.totalStudents}
            icon={Users}
            color="#3b82f6"
            subtitle="Using Transport"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Faculty Users"
            value={metrics.facultyUsers}
            icon={UserCheck}
            color="#8b5cf6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Buses"
            value={metrics.activeBuses}
            icon={Bus}
            color="#10b981"
            subtitle={`Total: ${metrics.activeBuses + 5}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Drivers"
            value={metrics.totalDrivers}
            icon={UserCheck}
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Attendance Rate"
            value={`${metrics.attendancePercentage}%`}
            icon={Calendar}
            color="#06b6d4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Fee Collection"
            value={`${metrics.feeCollectionRate}%`}
            icon={DollarSign}
            color="#ec4899"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Routes"
            value={metrics.activeRoutes}
            icon={MapPin}
            color="#14b8a6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Fees"
            value={TransportService.formatCurrency(metrics.pendingFees)}
            icon={TrendingUp}
            color="#ef4444"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Monthly Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="students" 
                    stroke="#3b82f6" 
                    name="Students"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="fees" 
                    stroke="#10b981" 
                    name="Fees Collected"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#f59e0b" 
                    name="Attendance %"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Recent Activities
              </Typography>
              <Box className="space-y-3">
                {metrics.recentActivities.map((activity) => (
                  <Box 
                    key={activity.id}
                    className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Box className="flex-1">
                      <Typography variant="body2" className="font-medium">
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats Bar Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Performance Overview
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart 
                  data={[
                    { name: 'Students', value: metrics.totalStudents, color: '#3b82f6' },
                    { name: 'Faculty', value: metrics.facultyUsers, color: '#8b5cf6' },
                    { name: 'Buses', value: metrics.activeBuses, color: '#10b981' },
                    { name: 'Drivers', value: metrics.totalDrivers, color: '#f59e0b' },
                    { name: 'Routes', value: metrics.activeRoutes, color: '#14b8a6' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransportDashboard;