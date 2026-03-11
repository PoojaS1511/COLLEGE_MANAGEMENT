import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TestFinance from '../components/finance/TestFinance';
import FinanceDashboard from '../components/finance/FinanceDashboard';
import StudentFees from '../components/finance/StudentFees';
import StaffPayroll from '../components/finance/StaffPayroll';
import Expenses from '../components/finance/Expenses';
import Vendors from '../components/finance/Vendors';
import BudgetAllocation from '../components/finance/BudgetAllocation';
import Maintenance from '../components/finance/Maintenance';
import AIAssistant from '../components/finance/AIAssistant';

const FinanceRoutes = () => {
  return (
    <Routes>
      <Route index element={<TestFinance />} />
      <Route path="dashboard" element={<FinanceDashboard />} />
      <Route path="test" element={<TestFinance />} />
      <Route path="student-fees" element={<StudentFees />} />
      <Route path="staff-payroll" element={<StaffPayroll />} />
      <Route path="expenses" element={<Expenses />} />
      <Route path="vendors" element={<Vendors />} />
      <Route path="budget" element={<BudgetAllocation />} />
      <Route path="maintenance" element={<Maintenance />} />
      <Route path="ai-assistant" element={<AIAssistant />} />
      <Route path="*" element={<TestFinance />} />
    </Routes>
  );
};

export default FinanceRoutes;
