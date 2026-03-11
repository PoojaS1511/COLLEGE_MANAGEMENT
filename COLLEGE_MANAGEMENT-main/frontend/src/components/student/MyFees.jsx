import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { feesService } from '../../services/feesService';
import { supabase } from '../../lib/supabase';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const MyFees = () => {
  const { user } = useAuth();
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyFees();
  }, [user]);

  const fetchMyFees = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      console.log('Fetching fees for student:', user.id);
      
      // First, get complete student data including course_id
      let studentData = user;
      if (!user.course_id) {
        console.log('No course_id in user object, fetching from database...');
        try {
          const { data: fullStudentData, error: studentError } = await supabase
            .from('students')
            .select('course_id, full_name, register_number, current_semester, department_id, branch')
            .eq('id', user.id)
            .single();

          if (!studentError && fullStudentData) {
            // If we have course_id, fetch the course name
            let courseName = fullStudentData.branch || 'N/A';
            if (fullStudentData.course_id) {
              try {
                const { data: courseData, error: courseError } = await supabase
                  .from('courses')
                  .select('name')
                  .eq('id', fullStudentData.course_id)
                  .single();
                
                if (!courseError && courseData) {
                  courseName = courseData.name;
                }
              } catch (error) {
                console.warn('Could not fetch course name:', error);
              }
            }
            
            studentData = { 
              ...user, 
              ...fullStudentData,
              course: courseName
            };
            console.log('Updated student data:', studentData);
          } else if (studentError) {
            console.warn('Error fetching student data:', studentError);
          }
        } catch (error) {
          console.warn('Could not fetch student data:', error);
        }
      }

      console.log('Final student data:', { 
        id: studentData.id, 
        course_id: studentData.course_id, 
        course: studentData.course,
        full_name: studentData.full_name 
      });
      
      // Get student's fee payments from fee_payments table
      const studentFees = await feesService.getFeesByStudentId(studentData.id);
      
      // Get fee structure for the student's course and academic year
      let totalFeeAmount = 0;
      let currentAcademicYear = new Date().getFullYear().toString();
      
      // Try different academic year formats
      const academicYearFormats = [
        currentAcademicYear,
        `${currentAcademicYear}-${parseInt(currentAcademicYear) + 1}`,
        `${parseInt(currentAcademicYear) - 1}-${currentAcademicYear}`
      ];
      
      if (studentData?.course_id) {
        console.log('Searching for fee structure with course_id:', studentData.course_id);
        
        for (const academicYear of academicYearFormats) {
          try {
            console.log('Trying academic year:', academicYear);
            
            const { data: feeStructures, error: feeStructureError } = await supabase
              .from('fee_structures')
              .select('amount, name, academic_year')
              .eq('course_id', studentData.course_id)
              .eq('academic_year', academicYear);

            console.log('Fee structure query result:', { feeStructures, feeStructureError });

            if (!feeStructureError && feeStructures && feeStructures.length > 0) {
              // Sum all fee structures for this academic year
              totalFeeAmount = feeStructures.reduce((sum, structure) => sum + parseFloat(structure.amount || 0), 0);
              console.log('Found fee structures amount:', totalFeeAmount, 'for year:', academicYear, 'from', feeStructures.length, 'structures');
              break;
            } else if (feeStructureError) {
              console.warn('Error fetching fee structure for year', academicYear, ':', feeStructureError);
            }
          } catch (error) {
            console.warn('Could not fetch fee structure for year', academicYear, ':', error);
          }
        }
        
        // If still no fee structure, try to get any fee structures for this course
        if (totalFeeAmount === 0) {
          console.log('No fee structure found for specific years, trying any fee structure for course');
          try {
            const { data: anyFeeStructures, error: anyFeeError } = await supabase
              .from('fee_structures')
              .select('amount, name, academic_year')
              .eq('course_id', studentData.course_id);

            console.log('Any fee structure result:', { anyFeeStructures, anyFeeError });

            if (!anyFeeError && anyFeeStructures && anyFeeStructures.length > 0) {
              // Sum all fee structures for this course
              totalFeeAmount = anyFeeStructures.reduce((sum, structure) => sum + parseFloat(structure.amount || 0), 0);
              console.log('Using all available fee structures amount:', totalFeeAmount, 'from', anyFeeStructures.length, 'structures');
            }
          } catch (error) {
            console.warn('Could not fetch any fee structure:', error);
          }
        }
      } else {
        console.warn('No course_id found in student data');
      }
      
      if (!studentFees) {
        // No payments found, but we have fee structure
        console.log('No payment history found, using fee structure only');
        setFeeData({
          studentName: studentData?.full_name || 'Student',
          enrollmentNumber: studentData?.register_number || 'N/A',
          course: studentData?.course || 'N/A',
          semester: studentData?.current_semester || 'N/A',
          totalAmount: totalFeeAmount,
          paidAmount: 0,
          balance: totalFeeAmount,
          status: totalFeeAmount > 0 ? 'pending' : 'no_fees',
          paymentHistory: []
        });
        return;
      }

      // Calculate paid amount from payment history
      const paidAmount = studentFees.paymentHistory
        .filter(payment => payment.status === 'paid')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      // Use fee structure amount as total, or fallback to sum of all payments
      const totalAmount = totalFeeAmount > 0 ? totalFeeAmount : 
        studentFees.paymentHistory.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      // Calculate balance
      const balance = totalAmount - paidAmount;

      // Enhance payment history with proper due dates
      const enhancedPaymentHistory = studentFees.paymentHistory.map(payment => {
        // If no due_date, set a reasonable default based on payment date or current date
        let dueDate = payment.dueDate;
        
        if (!dueDate && payment.date) {
          // If payment date exists, set due date 30 days before payment
          const paymentDate = new Date(payment.date);
          const dueDateCalc = new Date(paymentDate);
          dueDateCalc.setDate(dueDateCalc.getDate() - 30);
          dueDate = dueDateCalc.toISOString().split('T')[0];
        } else if (!dueDate) {
          // If no dates at all, set a default due date (start of current academic year)
          const currentYear = new Date().getFullYear();
          const academicYearStart = new Date(currentYear, 5, 1); // June 1st
          dueDate = academicYearStart.toISOString().split('T')[0];
        }
        
        return {
          ...payment,
          dueDate: dueDate
        };
      });

      console.log('Final fee calculation:', {
        totalFeeAmount,
        paidAmount,
        totalAmount,
        balance
      });

      setFeeData({
        studentName: studentFees.studentName || studentData?.full_name || 'Student',
        enrollmentNumber: studentFees.enrollmentNumber || studentData?.register_number || 'N/A',
        course: studentFees.course || studentData?.course || 'N/A',
        semester: studentFees.semester || studentData?.current_semester || 'N/A',
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        balance: balance,
        status: balance > 0 ? 'pending' : 'paid',
        paymentHistory: enhancedPaymentHistory
      });

    } catch (error) {
      console.error('Error fetching student fees:', error);
      setError(error.message || 'Failed to fetch fee details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Fees</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Fees</h2>
        <div className="text-gray-600">
          <p><strong>Student:</strong> {feeData?.studentName}</p>
          <p><strong>Enrollment:</strong> {feeData?.enrollmentNumber}</p>
          <p><strong>Course:</strong> {feeData?.course} • Semester {feeData?.semester}</p>
        </div>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">Total Amount</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(feeData?.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-900">Paid Amount</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(feeData?.paidAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-900">Balance Amount</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(feeData?.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        </div>
        
        {feeData?.paymentHistory?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feeData.paymentHistory.map((payment, index) => (
                  <tr key={payment.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.feeType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {payment.transactionId || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
            <p className="mt-1 text-sm text-gray-500">No fee records found for your account.</p>
          </div>
        )}
      </div>

      {/* Payment Reminder */}
      {feeData?.balance > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Payment Reminder</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have a pending balance of {formatCurrency(feeData.balance)}. 
                  Please complete your payment to avoid late fees.
                </p>
              </div>
              <div className="mt-3">
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Fees Message */}
      {feeData?.status === 'no_fees' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Fee Records</h3>
            <p className="mt-1 text-sm text-gray-500">No fee records found for your account. Please contact the administration if you think this is an error.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFees;
