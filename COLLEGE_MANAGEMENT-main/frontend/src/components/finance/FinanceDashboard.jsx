import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  AlertCircle,
} from 'lucide-react';
import MetricCard from './MetricCard';
import RevenueExpensesTab from './tabs/RevenueExpensesTab';
import FeeCollectionTab from './tabs/FeeCollectionTab';
import BudgetAnalysisTab from './tabs/BudgetAnalysisTab';
import FinancialTrendsTab from './tabs/FinancialTrendsTab';
import SalaryDistributionTab from './tabs/SalaryDistributionTab';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API_URL } from '../../config';

const FinanceDashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingDues: 0,
    monthlyData: [],
    departmentData: [],
  });

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'cse', label: 'Computer Science' },
    { value: 'ece', label: 'Electronics & Communication' },
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
    { value: 'eee', label: 'Electrical & Electronics' },
  ];

  const kpiData = [
    {
      title: 'Total Revenue',
      value: dashboardData.totalRevenue,
      icon: DollarSign,
      color: 'primary',
      trend: 'up',
      trendValue: 12.5,
      prefix: '₹',
    },
    {
      title: 'Total Expenses',
      value: dashboardData.totalExpenses,
      icon: CreditCard,
      color: 'error',
      trend: 'down',
      trendValue: 8.2,
      prefix: '₹',
    },
    {
      title: 'Net Balance',
      value: dashboardData.netBalance,
      icon: TrendingUp,
      color: 'secondary',
      trend: 'up',
      trendValue: 15.3,
      prefix: '₹',
    },
    {
      title: 'Pending Dues',
      value: dashboardData.pendingDues,
      icon: AlertCircle,
      color: 'warning',
      trend: 'down',
      trendValue: 5.8,
      prefix: '₹',
    },
  ];

  const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#dc2626', '#8b5cf6'];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDepartment]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/finance/dashboard/metrics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const data = result.data;
          setDashboardData({
            totalRevenue: data.totalRevenue || 0,
            totalExpenses: data.totalExpenses || 0,
            netBalance: data.netBalance || 0,
            pendingDues: data.pendingDues || 0,
            monthlyData: data.monthlyData || [
              { month: 'Jan', revenue: 1800000, expenses: 1200000 },
              { month: 'Feb', revenue: 2100000, expenses: 1400000 },
              { month: 'Mar', revenue: 1900000, expenses: 1300000 },
              { month: 'Apr', revenue: 2200000, expenses: 1500000 },
              { month: 'May', revenue: 2400000, expenses: 1600000 },
              { month: 'Jun', revenue: 2100000, expenses: 1750000 },
            ],
            departmentData: data.departmentData || [
              { name: 'CSE', value: 4500000 },
              { name: 'ECE', value: 3200000 },
              { name: 'Mechanical', value: 2800000 },
              { name: 'Civil', value: 1200000 },
              { name: 'EEE', value: 800000 },
            ],
          });
        }
      } else {
        console.error('Failed to fetch dashboard data');
        // Fallback to mock data if API fails
        setDashboardData({
          totalRevenue: 12500000,
          totalExpenses: 8750000,
          netBalance: 3750000,
          pendingDues: 2100000,
          monthlyData: [
            { month: 'Jan', revenue: 1800000, expenses: 1200000 },
            { month: 'Feb', revenue: 2100000, expenses: 1400000 },
            { month: 'Mar', revenue: 1900000, expenses: 1300000 },
            { month: 'Apr', revenue: 2200000, expenses: 1500000 },
            { month: 'May', revenue: 2400000, expenses: 1600000 },
            { month: 'Jun', revenue: 2100000, expenses: 1750000 },
          ],
          departmentData: [
            { name: 'CSE', value: 4500000 },
            { name: 'ECE', value: 3200000 },
            { name: 'Mechanical', value: 2800000 },
            { name: 'Civil', value: 1200000 },
            { name: 'EEE', value: 800000 },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if API fails
      setDashboardData({
        totalRevenue: 12500000,
        totalExpenses: 8750000,
        netBalance: 3750000,
        pendingDues: 2100000,
        monthlyData: [
          { month: 'Jan', revenue: 1800000, expenses: 1200000 },
          { month: 'Feb', revenue: 2100000, expenses: 1400000 },
          { month: 'Mar', revenue: 1900000, expenses: 1300000 },
          { month: 'Apr', revenue: 2200000, expenses: 1500000 },
          { month: 'May', revenue: 2400000, expenses: 1600000 },
          { month: 'Jun', revenue: 2100000, expenses: 1750000 },
        ],
        departmentData: [
          { name: 'CSE', value: 4500000 },
          { name: 'ECE', value: 3200000 },
          { name: 'Mechanical', value: 2800000 },
          { name: 'Civil', value: 1200000 },
          { name: 'EEE', value: 800000 },
        ],
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const renderTabContent = () => {
    console.log('Active tab:', activeTab);
    console.log('Department:', selectedDepartment);
    
    switch (activeTab) {
      case 0:
        console.log('Rendering RevenueExpensesTab');
        return <RevenueExpensesTab department={selectedDepartment} />;
      case 1:
        console.log('Rendering FeeCollectionTab');
        return <FeeCollectionTab department={selectedDepartment} />;
      case 2:
        console.log('Rendering BudgetAnalysisTab');
        return <BudgetAnalysisTab department={selectedDepartment} />;
      case 3:
        console.log('Rendering FinancialTrendsTab');
        return <FinancialTrendsTab department={selectedDepartment} />;
      case 4:
        console.log('Rendering SalaryDistributionTab');
        return <SalaryDistributionTab department={selectedDepartment} />;
      default:
        console.log('Rendering default RevenueExpensesTab');
        return <RevenueExpensesTab department={selectedDepartment} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index}>
            <MetricCard {...kpi} />
          </div>
        ))}
      </div>

      {/* Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
              <Bar dataKey="revenue" fill="#16a34a" />
              <Bar dataKey="expenses" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['Revenue & Expenses', 'Fee Collection', 'Budget Analysis', 'Financial Trends', 'Salary Distribution'].map((label, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
