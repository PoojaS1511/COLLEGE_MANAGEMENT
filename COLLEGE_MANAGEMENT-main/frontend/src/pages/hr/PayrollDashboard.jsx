/**
 * Payroll Dashboard Component
 * Displays payroll statistics and charts for HR view
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import DatePicker from '../../components/ui/date-picker';
import { StatCard } from '../../components/ui/stat-card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Row, Col } from '../../components/ui/grid';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import payrollService from '../../services/payrollService';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

const PayrollDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await payrollService.getPayrollDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  const formatCurrency = (amount) => {
    return payrollService.formatCurrency(amount);
  };

  // Prepare data for bar chart
  const getBarChartData = () => {
    if (!dashboardData) return [];
    
    return [
      { name: 'Pending', value: dashboardData.pending_payrolls, fill: '#FFBB28' },
      { name: 'Approved', value: dashboardData.approved_payrolls, fill: '#0088FE' },
      { name: 'Paid', value: dashboardData.paid_payrolls, fill: '#00C49F' },
    ];
  };

  // Prepare data for pie chart
  const getPieChartData = () => {
    if (!dashboardData) return [];
    
    const total = dashboardData.pending_payrolls + dashboardData.approved_payrolls + dashboardData.paid_payrolls;
    
    return [
      { name: 'Pending', value: dashboardData.pending_payrolls, percentage: total > 0 ? (dashboardData.pending_payrolls / total * 100).toFixed(1) : 0 },
      { name: 'Approved', value: dashboardData.approved_payrolls, percentage: total > 0 ? (dashboardData.approved_payrolls / total * 100).toFixed(1) : 0 },
      { name: 'Paid', value: dashboardData.paid_payrolls, percentage: total > 0 ? (dashboardData.paid_payrolls / total * 100).toFixed(1) : 0 },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-6">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and monitor payroll operations</p>
        </div>
        <div className="flex items-center space-x-4">
          <DatePicker
            value={selectedMonth}
            onChange={handleMonthChange}
            format="MMMM yyyy"
            picker="month"
            className="w-48"
          />
          <Button onClick={fetchDashboardData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row>
        <Col md={3}>
          <StatCard
            title="Total Payroll Cost"
            value={formatCurrency(dashboardData?.total_payroll_cost || 0)}
            icon={<DollarSign className="h-6 w-6" />}
            color="blue"
            trend={{ value: '+12%', direction: 'up' }}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Current Month Cost"
            value={formatCurrency(dashboardData?.current_month_cost || 0)}
            icon={<Calendar className="h-6 w-6" />}
            color="green"
            trend={{ value: '+8%', direction: 'up' }}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Pending Payrolls"
            value={dashboardData?.pending_payrolls || 0}
            icon={<Clock className="h-6 w-6" />}
            color="yellow"
            trend={{ value: '-5%', direction: 'down' }}
          />
        </Col>
        <Col md={3}>
          <StatCard
            title="Total Employees"
            value={dashboardData?.total_records || 0}
            icon={<Users className="h-6 w-6" />}
            color="purple"
            trend={{ value: '+2%', direction: 'up' }}
          />
        </Col>
      </Row>

      {/* Charts */}
      <Row>
        <Col md={8}>
          <Card>
            <CardHeader>
              <CardTitle>Payroll Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8">
                    {getBarChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <CardHeader>
              <CardTitle>Payroll Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getPieChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Col>
      </Row>

      {/* Status Summary */}
      <Row>
        <Col md={12}>
          <Card>
            <CardHeader>
              <CardTitle>Status Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {dashboardData?.pending_payrolls || 0}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData?.approved_payrolls || 0}
                  </div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData?.paid_payrolls || 0}
                  </div>
                  <div className="text-sm text-gray-600">Paid</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="default">
              <Link to="/admin/payroll/list">View All Payrolls</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin/payroll/calculation">Calculate Payroll</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/payroll/approval">Approve Payrolls</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/admin/payroll/reports">Generate Reports</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollDashboard;
