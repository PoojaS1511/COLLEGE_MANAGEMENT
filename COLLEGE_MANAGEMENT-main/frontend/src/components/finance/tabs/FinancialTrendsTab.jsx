import React from 'react';

const FinancialTrendsTab = ({ department }) => {
  console.log('FinancialTrendsTab rendering');
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Trends</h3>
        <p className="text-gray-600">Financial Trends charts are being implemented...</p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-green-800">✓ Component is loading correctly</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialTrendsTab;
