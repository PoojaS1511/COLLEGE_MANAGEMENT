import React from 'react';

const BudgetAnalysisTab = ({ department }) => {
  console.log('BudgetAnalysisTab rendering');
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Analysis</h3>
        <p className="text-gray-600">Budget Analysis charts are being implemented...</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <p className="text-blue-800">✓ Component is loading correctly</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalysisTab;
