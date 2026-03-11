import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  LinearProgress 
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
  Line 
} from 'recharts';
import AnalyticsService from '../../../services/analyticsService';

const UtilizationAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await AnalyticsService.getUtilizationAnalytics();
        setData(response.data);
      } catch (err) {
        console.error('Error fetching utilization analytics:', err);
        setError('Failed to load utilization analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) return null;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Room Utilization */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Room Utilization</Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.room_utilization}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="room" type="category" />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="utilization" name="Utilization %" fill="#8884d8">
                    {data.room_utilization.map((entry, index) => (
                      <text
                        key={`label-${index}`}
                        x={entry.utilization + 5}
                        y={index * 20 + 25}
                        fill="#666"
                        fontSize={12}
                        textAnchor="start"
                      >
                        {`${entry.peak_hours}`}
                      </text>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Resource Utilization */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Resource Utilization</Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.resource_utilization}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="resource" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value, name) => 
                    name === 'utilization' ? [`${value}%`, 'Utilization'] : [value, 'Available']
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="utilization" name="Utilization %" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="available" name="Available Units" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Daily Utilization Trend */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Daily Utilization Trend</Typography>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.daily_utilization}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                  <Legend />
                  <Line type="monotone" dataKey="utilization" name="Average Utilization" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Utilization Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Highest Utilization</Typography>
              <Typography variant="h5" component="h2">
                {data.room_utilization.reduce((max, room) => 
                  room.utilization > max.utilization ? room : max
                ).room}
              </Typography>
              <Box display="flex" alignItems="center" mt={2}>
                <Box width="100%" mr={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.max(...data.room_utilization.map(r => r.utilization))} 
                  />
                </Box>
                <Box minWidth={35}>
                  <Typography variant="body2" color="textSecondary">
                    {`${Math.round(Math.max(...data.room_utilization.map(r => r.utilization)))}%`}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Average Room Utilization</Typography>
              <Typography variant="h5" component="h2">
                {Math.round(data.room_utilization.reduce((sum, room) => sum + room.utilization, 0) / data.room_utilization.length)}%
              </Typography>
              <Box display="flex" alignItems="center" mt={2}>
                <Box width="100%" mr={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={data.room_utilization.reduce((sum, room) => sum + room.utilization, 0) / data.room_utilization.length} 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Peak Utilization Day</Typography>
              <Typography variant="h5" component="h2">
                {data.daily_utilization.reduce((max, day) => 
                  day.utilization > max.utilization ? day : max
                ).day}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {`${Math.round(Math.max(...data.daily_utilization.map(d => d.utilization)))}% utilization`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UtilizationAnalytics;
