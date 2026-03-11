import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Payroll utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatMonth = (monthString) => {
  return new Date(monthString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
  });
};

export const calculateSalary = (basicSalary, totalDays, presentDays) => {
  const absentDays = totalDays - presentDays;
  const perDaySalary = basicSalary / totalDays;
  const lopAmount = perDaySalary * absentDays;
  
  // Calculate deductions
  const pfDeduction = basicSalary * 0.12; // 12% PF
  const esiDeduction = basicSalary * 0.0175; // 1.75% ESI
  const taxDeduction = basicSalary * 0.10; // 10% Tax (simplified)
  
  const totalDeductions = pfDeduction + esiDeduction + taxDeduction + lopAmount;
  const netSalary = basicSalary - totalDeductions;
  
  return {
    basicSalary,
    totalDays,
    presentDays,
    absentDays,
    perDaySalary,
    lopAmount,
    pfDeduction,
    esiDeduction,
    taxDeduction,
    totalDeductions,
    netSalary
  };
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    'Pending': 'warning',
    'Approved': 'info',
    'Paid': 'success',
    'Cancelled': 'danger'
  };
  return colors[status] || 'secondary';
};

export const canApprove = (status, userRole = 'HR') => {
  return status === 'Pending' && userRole === 'HR';
};

export const canMarkAsPaid = (status, userRole = 'HR') => {
  return status === 'Approved' && userRole === 'HR';
};

export const canEdit = (status, userRole = 'HR') => {
  return status === 'Pending' && userRole === 'HR';
};

export const canDelete = (status, userRole = 'HR') => {
  return status === 'Pending' && userRole === 'HR';
};
