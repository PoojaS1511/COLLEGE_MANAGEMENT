import React from 'react';

const SalaryDistributionTab = ({ department }) => {
  console.log('SalaryDistributionTab rendering');
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Distribution</h3>
        <p className="text-gray-600">Salary Distribution charts are being implemented...</p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
          <p className="text-purple-800">✓ Component is loading correctly</p>
        </div>
      </div>
    </div>
  );
};

export default SalaryDistributionTab;
