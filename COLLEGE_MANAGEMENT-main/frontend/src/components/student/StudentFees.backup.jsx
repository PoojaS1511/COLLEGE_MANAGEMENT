import React, { useState, useEffect } from 'react';
import { useStudent } from '../../contexts/StudentContext';
import axios from 'axios';
import {
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ReceiptRefundIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const StudentFees = () => {
  const { student, isAuthenticated } = useStudent()
  
  // Debug: Log student data when it changes
  useEffect(() => {
    console.log('StudentFees - Student data:', {
      hasStudent: !!student,
      studentId: student?.id,
      isAuthenticated,
      studentData: student
    });
  }, [student, isAuthenticated]);
  const [feeData, setFeeData] = useState({ total: 0, paid: 0, balance: 0, student: {} })
  const [scholarships, setScholarships] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('fees') // fees, scholarships, payments, admission

  useEffect(() => {
    if (isAuthenticated && student?.id) {
      console.log('useEffect - Fetching fee data for student ID:', student.id);
      fetchFeeData();
    } else {
      console.log('useEffect - Cannot fetch fee data:', { 
        isAuthenticated, 
        hasStudent: !!student, 
        studentId: student?.id,
        studentData: student
      });
    }
  }, [isAuthenticated, student?.id])

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!student?.id) {
        console.error('No student data available');
        setError('Student not authenticated');
        return;
      }

      console.log('Fetching fee data for student ID:', student.id);
      
      // Use the correct API endpoint for student fee summary
      const feeSummaryUrl = `/api/fees/summary/student/${student.id}`;
      
      console.log('API Endpoint:', feeSummaryUrl);
      
      // Fetch fee summary from the API
      const response = await axios.get(feeSummaryUrl).catch(err => {
        console.error('Error fetching fee summary:', err.response?.data || err.message);
        throw err;
      });
      
      console.log('API Response:', response?.data);

      if (response.data.status === 'success') {
        const summary = response.data.data;
        
        // Transform fee structure data
        const feeStructure = summary.fee_structure || [];
        const totalFee = feeStructure.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
        const totalPaid = feeStructure.reduce((sum, fee) => sum + (parseFloat(fee.paid_amount) || 0), 0);
        const totalBalance = totalFee - totalPaid;

        // Transform payment history
        const paymentHistory = summary.payment_history?.map(payment => ({
          id: payment.id,
          date: payment.payment_date || payment.created_at,
          amount: parseFloat(payment.amount || 0),
          feeType: payment.fee_structure?.name || payment.fee_type || 'Tuition Fee',
          status: payment.status?.toLowerCase() || 'completed',
          transactionId: payment.transaction_id || 'N/A',
          semester: payment.semester || 'N/A',
          academicYear: payment.academic_year || 'N/A',
          dueDate: payment.due_date
        })) || [];

        setPaymentHistory(paymentHistory);

        // Set fee data
        setFeeData({
          fee_structure: feeStructure.map(fee => ({
            id: fee.id,
            item: fee.name || 'Tuition Fee',
            amount: parseFloat(fee.amount || 0),
            paid: parseFloat(fee.paid_amount || 0),
            status: fee.status?.toLowerCase() || 'pending',
            dueDate: fee.due_date
          })),
          total_fee: totalFee,
          paid_amount: totalPaid,
          pending_amount: totalBalance,
          payment_history: paymentHistory
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch fee data');
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
      toast.error(error.response?.data?.error || 'Failed to load fee data');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };



  const handlePayment = async (feeItem) => {
    try {
      // First, get the fee structure for the current academic year
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;
      
      const response = await axios.get('/api/fee-structures', {
        params: { academic_year: academicYear }
      });
      
      if (response.data.success && response.data.data.length > 0) {
        const feeStructure = response.data.data[0];
        
        // Create a new payment record
        const paymentResponse = await axios.post('/api/fee-payments', {
          fee_structure_id: feeStructure.id,
          amount: feeItem.amount - feeItem.paid,
          academic_year: academicYear,
          semester: student?.current_semester || 1,
          status: 'pending'
        });
        
        if (paymentResponse.data.success) {
          // Redirect to payment gateway or show payment form
          toast.success('Redirecting to payment gateway...');
          // Here you would typically integrate with a payment gateway
          // For now, we'll just refresh the fee data
          fetchFeeData();
        }
      } else {
        throw new Error('No fee structure found for the current academic year');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.error || 'Failed to process payment');
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      // This would typically be an API endpoint that generates a PDF receipt
      const response = await axios.get(`/api/fee-payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payment-receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const downloadAdmissionAck = () => {
    alert('Downloading admission acknowledgement...')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !feeData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fees & Admission</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!feeData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fees & Admission</h2>

    if (response.data.status === 'success') {
      const summary = response.data.data;
      
      // Transform fee structure data
      const feeStructure = summary.fee_structure || [];
      const totalFee = feeStructure.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
      const totalPaid = feeStructure.reduce((sum, fee) => sum + (parseFloat(fee.paid_amount) || 0), 0);
      const totalBalance = totalFee - totalPaid;
          
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Paid Amount</h3>
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{feeData.paid_amount?.toLocaleString('en-IN') || '0'}</p>
          </div>
          
          <div className={`p-6 rounded-lg border ${feeData.pending_amount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Pending Amount</h3>
              <ExclamationTriangleIcon className={`h-6 w-6 ${feeData.pending_amount > 0 ? 'text-red-500' : 'text-gray-500'}`} />
            </div>
            <p className={`text-2xl font-bold ${feeData.pending_amount > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              ₹{feeData.pending_amount?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <GiftIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-purple-900">Scholarships</h3>
              <p className="text-2xl font-bold text-purple-600">
                {scholarships.filter(s => s.status === 'eligible').length}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('fees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fees'
                    ? 'border-royal-500 text-royal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fee Structure
              </button>
              <button
                onClick={() => setActiveTab('scholarships')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scholarships'
                    ? 'border-royal-500 text-royal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scholarships
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-royal-500 text-royal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab('admission')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admission'
                    ? 'border-royal-500 text-royal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Admission Documents
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Fee Structure Tab */}
            {activeTab === 'fees' && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Fee Structure</h2>
                  <span className="text-sm text-gray-500">Academic Year: {new Date().getFullYear()}-{new Date().getFullYear() + 1}</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {feeData.fee_structure?.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feeData.fee_structure.map((fee, index) => {
                          const balance = fee.amount - fee.paid;
                          const isPaid = fee.status === 'paid' || balance <= 0;
                          
                          return (
                            <tr key={fee.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {fee.item}
                                {fee.dueDate && (
                                  <div className="text-xs text-gray-500">Due: {new Date(fee.dueDate).toLocaleDateString()}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                ₹{fee.amount?.toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                ₹{fee.paid?.toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                ₹{balance?.toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span 
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                >
                                  {isPaid ? 'Paid' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {!isPaid && balance > 0 && (
                                  <button
                                    onClick={() => handlePayment(fee)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm mr-2"
                                  >
                                    Pay Now
                                  </button>
                                )}
                                {fee.paid > 0 && (
                                  <button
                                    onClick={() => downloadReceipt(fee.id)}
                                    className="text-gray-600 hover:text-gray-900 text-sm"
                                  >
                                    Receipt
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No fee structure available for the current academic year.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scholarships Tab */}
            {activeTab === 'scholarships' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scholarships.map((scholarship) => (
                    <div key={scholarship.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">{scholarship.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scholarship.status === 'eligible' ? 'bg-green-100 text-green-800' :
                          scholarship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {scholarship.status === 'eligible' ? 'Eligible' :
                           scholarship.status === 'pending' ? 'Pending' : 'Not Eligible'}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-royal-600 mb-2">
                        ₹{scholarship.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">{scholarship.description}</p>
                      <div className="text-xs text-gray-500">
                        <strong>Criteria:</strong> {scholarship.criteria}
                      </div>
                      {scholarship.status === 'eligible' && (
                        <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
                      <li>• Sports quota students are eligible for sports scholarships</li>
                      <li>• Merit scholarships based on academic performance</li>
                      <li>• Apply before the deadline to be considered</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Admission Documents Tab */}
            {activeTab === 'admission' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admission Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <DocumentArrowDownIcon className="h-12 w-12 text-royal-600 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">Admission Acknowledgement</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Official admission confirmation document
                      </p>
                      <button
                        onClick={downloadAdmissionAck}
                        className="bg-royal-600 hover:bg-royal-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                      >
                        Download
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <DocumentArrowDownIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">Fee Receipt</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Consolidated fee payment receipt
                      </p>
                      <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <DocumentArrowDownIcon className="h-12 w-12 text-royal-600 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Admission Acknowledgement</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Official admission confirmation document
                </p>
                <button
                  onClick={downloadAdmissionAck}
                  className="bg-royal-600 hover:bg-royal-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                >
                  Download
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <DocumentArrowDownIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">Fee Receipt</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Consolidated fee payment receipt
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Student Information Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {feeData.student.full_name}</p>
                <p><strong>Register Number:</strong> {feeData.student.register_number}</p>
                <p><strong>Course:</strong> {feeData.student.course}</p>
              </div>
              <div>
                <p><strong>Admission Year:</strong> {feeData.student.admission_year}</p>
                <p><strong>Current Semester:</strong> {feeData.student.current_semester}</p>
                <p><strong>Quota:</strong> {feeData.student.quota_type}</p>
                <p><strong>Shift:</strong> {feeData.student.shift}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Reminder */}
      {feeData.due > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Payment Reminder
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have a pending fee payment of ₹{feeData.due.toLocaleString()}. 
                  Please complete the payment by {feeData.next_due_date} to avoid late fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Scholarship Information:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Scholarships are awarded based on merit and need</li>
          <li>• First generation graduates get additional benefits</li>
          <li>• Sports quota students are eligible for sports scholarships</li>
          <li>• Merit scholarships based on academic performance</li>
          <li>• Apply before the deadline to be considered</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentFees;
