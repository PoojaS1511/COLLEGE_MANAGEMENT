import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const FeeCollectionTab = ({ department }) => {
  // Mock data for fee collection
  const feeCollectionData = [
    { month: 'Jan', collected: 2800000, pending: 450000, overdue: 120000 },
    { month: 'Feb', collected: 3100000, pending: 380000, overdue: 95000 },
    { month: 'Mar', collected: 2900000, pending: 420000, overdue: 110000 },
    { month: 'Apr', collected: 3300000, pending: 350000, overdue: 80000 },
    { month: 'May', collected: 3500000, pending: 320000, overdue: 75000 },
    { month: 'Jun', collected: 3200000, pending: 400000, overdue: 90000 },
  ];

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value}`;
  };

  console.log('FeeCollectionTab rendering with data:', feeCollectionData);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection Overview</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={feeCollectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#d1d5db' }}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar 
              dataKey="collected" 
              fill="#16a34a" 
              radius={[8, 8, 0, 0]}
              name="Collected"
            />
            <Bar 
              dataKey="pending" 
              fill="#f59e0b" 
              radius={[8, 8, 0, 0]}
              name="Pending"
            />
            <Bar 
              dataKey="overdue" 
              fill="#dc2626" 
              radius={[8, 8, 0, 0]}
              name="Overdue"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Simple Test Chart</h3>
        <p className="text-gray-600 mb-4">If you can see this chart, the component is working correctly.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={feeCollectionData.slice(0, 3)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="collected" fill="#16a34a" name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeeCollectionTab;
