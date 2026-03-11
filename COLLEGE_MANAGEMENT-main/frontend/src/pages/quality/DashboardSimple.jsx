import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, FileText, AlertTriangle, Award, Clock, CheckCircle } from 'lucide-react';
import { API_URL } from '../../config';

const DashboardSimple = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('DashboardSimple component mounted');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');
      
      // Fetch KPIs with simple fetch (no auth required)
      const kpiResponse = await fetch(`${API_URL}/quality/dashboard/kpis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!kpiResponse.ok) {
        throw new Error(`KPIs request failed: ${kpiResponse.status}`);
      }
      
      const kpiData = await kpiResponse.json();
      console.log('KPI Response:', kpiData);
      
      if (kpiData.success) {
        setKpis(kpiData.data);
      } else {
        setError('Failed to load KPI data');
      }

      // Fetch recent activity
      const activityResponse = await fetch(`${API_URL}/quality/dashboard/recent-activity`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!activityResponse.ok) {
        throw new Error(`Activity request failed: ${activityResponse.status}`);
      }
      
      const activityData = await activityResponse.json();
      console.log('Activity Response:', activityData);
      
      if (activityData.success) {
        setRecentActivity(activityData.data);
      } else {
        setError('Failed to load activity data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    return trend > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'audit': return <FileText className="w-4 h-4" />;
      case 'grievance': return <AlertTriangle className="w-4 h-4" />;
      case 'policy': return <Award className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error loading data</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">Quality & Accreditation Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time overview of institutional quality metrics</p>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Debug Information</h3>
        <div className="text-sm text-blue-800">
          <p>KPIs loaded: {kpis ? 'YES' : 'NO'}</p>
          <p>Activity loaded: {recentActivity.length > 0 ? 'YES' : 'NO'}</p>
          <p>Total Faculty: {kpis?.total_faculty || 'N/A'}</p>
          <p>Pending Audits: {kpis?.pending_audits || 'N/A'}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-900">{kpis?.total_faculty || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getTrendIcon(5)}
            <span className="ml-2 text-green-600">+5% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Audits</p>
              <p className="text-2xl font-bold text-gray-900">{kpis?.pending_audits || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getTrendIcon(-2)}
            <span className="ml-2 text-red-600">-2% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Grievances</p>
              <p className="text-2xl font-bold text-gray-900">{kpis?.open_grievances || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getTrendIcon(8)}
            <span className="ml-2 text-green-600">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Policy Compliance</p>
              <p className="text-2xl font-bold text-gray-900">{kpis?.overall_policy_compliance_rate || 0}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getTrendIcon(3)}
            <span className="ml-2 text-green-600">+3% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accreditation Score</p>
              <p className="text-2xl font-bold text-gray-900">{kpis?.accreditation_readiness_score || 0}</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-4 flex items-center text-sm">
            {getTrendIcon(7)}
            <span className="ml-2 text-green-600">+7% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={kpis?.monthly_trends?.faculty_performance?.map((score, index) => ({
              month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index],
              faculty: score,
              audit: kpis?.monthly_trends?.audit_completion_rate?.[index] || 0,
              grievance: kpis?.monthly_trends?.grievance_resolution_rate?.[index] || 0,
              policy: kpis?.monthly_trends?.policy_compliance?.[index] || 0
            })) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="faculty" stroke="#3B82F6" name="Faculty Performance" />
              <Line type="monotone" dataKey="audit" stroke="#10B981" name="Audit Completion" />
              <Line type="monotone" dataKey="grievance" stroke="#F59E0B" name="Grievance Resolution" />
              <Line type="monotone" dataKey="policy" stroke="#8B5CF6" name="Policy Compliance" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-500">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{activity.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent activity found</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Users className="w-5 h-5 mr-2" />
            Add Faculty
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
            <FileText className="w-5 h-5 mr-2" />
            New Audit
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Submit Grievance
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
            <Award className="w-5 h-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;
