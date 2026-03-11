import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { getSupabase } from '../../lib/supabase';
const supabase = getSupabase();
import { useNavigate } from 'react-router-dom';

const AdminOverview = () => {
  const { user, session, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalFaculty: 0,
    pendingFees: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let isMounted = true;

    const fetchDashboardData = async () => {
      console.log('[AdminOverview] Fetching dashboard data...');
      console.log('  - isAuthenticated:', isAuthenticated);
      console.log('  - hasSession:', !!session?.access_token);

      if (!isAuthenticated || !session?.access_token) {
        console.log('[AdminOverview] Not authenticated or no session token, skipping data fetch');
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        console.log('[AdminOverview] Making API request to /api/admin/dashboard');
        const response = await fetch('http://localhost:5001/api/admin/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'X-Request-ID': `dashboard-${Date.now()}`
          },
          signal // Pass the abort signal to the fetch request
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `HTTP error! status: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('[AdminOverview] API response:', data);

        if (!isMounted) return;

        if (data.success && data.data) {
          const statsData = {
            totalStudents: data.data.students?.total ?? 0,
            activeCourses: data.data.courses?.total ?? 0,
            totalFaculty: data.data.faculty?.total ?? 0,
            pendingFees: data.data.admissions?.pending ?? 0,
          };
          
          console.log('[AdminOverview] Dashboard data updated:', statsData);
          setStats(statsData);
        } else {
          throw new Error(data.error || 'Invalid response format from server');
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('[AdminOverview] Request was aborted');
          return;
        }
        
        console.error('[AdminOverview] Error fetching dashboard data:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data');
          // Don't reset stats to 0 on error to avoid UI flicker
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Add a small delay to prevent rapid successive calls
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 100);

    // Cleanup function
    return () => {
      console.log('[AdminOverview] Cleaning up...');
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [session, isAuthenticated]);

  // Handle auth loading state
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated || !session) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', mt: 4 }}>
        <Alert
          severity="warning"
          sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/login', { state: { from: '/admin/dashboard' } })}
            >
              Login
            </Button>
          }
        >
          Please log in to view dashboard data
        </Alert>
      </Box>
    );
  }

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show dashboard even if there was an error (with default data)
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user?.full_name || user?.email?.split('@')[0] || 'Admin'}
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Showing default data. Some features may not be available due to database connectivity issues.
        </Alert>
      )}

      <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Total Students</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'primary.main' }}>
                {stats.totalStudents}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Active Courses</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'success.main' }}>
                {stats.activeCourses}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Total Faculty</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'info.main' }}>
                {stats.totalFaculty}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.secondary">Pending Fees</Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color: 'warning.main' }}>
                {stats.pendingFees}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, minHeight: 200 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Recent Activity</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
                <Typography color="text.secondary">No recent activity</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
    </Box>
  );
};

export default AdminOverview;
