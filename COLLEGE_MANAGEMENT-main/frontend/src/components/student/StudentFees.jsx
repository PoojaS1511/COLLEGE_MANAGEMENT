import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import apiService from '../../services/api'
import {
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const StudentFees = () => {
  const { user } = useAuth()
  const [feeData, setFeeData] = useState(null)
  const [scholarships, setScholarships] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('fees') // fees, scholarships, payments, admission

  useEffect(() => {
    fetchFeeData()
  }, [user])

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.error('No user data available');
        setError('User not authenticated');
        return;
      }

      // Get fees data from API
      const studentId = user.id || 1;
      
      try {
        console.log('Fetching fee data for student:', studentId);
        const response = await apiService.getStudentFees(studentId);
        console.log('Raw API response:', response);
        
        // If response is undefined or null, use mock data
        if (response === undefined || response === null) {
          console.warn('API returned undefined or null, using mock data');
          useMockData();
          return;
        }
        
        // If response has data property, use it
        if (response?.data) {
          console.log('Processing API response with data property');
          processFeeData(response.data);
        } 
        // If response is the data itself (mock data case)
        else if (response?.fee_structure) {
          console.log('Processing direct fee structure data');
          processFeeData(response);
        }
        // If response is already in the expected format
        else if (response) {
          console.log('Processing raw response data');
          processFeeData(response);
        }
        else {
          console.warn('Unexpected API response format, using mock data:', response);
          useMockData();
        }
      } catch (apiError) {
        console.error('API call failed, using mock data as fallback:', apiError);
        useMockData();
      }
    } catch (error) {
      console.error('Unexpected error in fetchFeeData, using mock data:', error);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process fee data
  const processFeeData = (feesData) => {
    console.log('Processing fee data:', feesData);
    
    // Transform API data to component format
    const feeStructure = [
      { 
        item: 'Tuition Fee', 
        amount: feesData.fee_structure?.tuition_fee || 0, 
        paid: feesData.fee_structure?.tuition_fee || 0, 
        status: 'paid' 
      },
      { 
        item: 'Lab Fee', 
        amount: feesData.fee_structure?.lab_fee || 0, 
        paid: feesData.fee_structure?.lab_fee || 0, 
        status: 'paid' 
      },
      { 
        item: 'Library Fee', 
        amount: feesData.fee_structure?.library_fee || 0, 
        paid: feesData.fee_structure?.library_fee || 0, 
        status: 'paid' 
      },
      { 
        item: 'Sports Fee', 
        amount: feesData.fee_structure?.sports_fee || 0, 
        paid: feesData.fee_structure?.sports_fee || 0, 
        status: 'paid' 
      },
      { 
        item: 'Development Fee', 
        amount: feesData.fee_structure?.development_fee || 0, 
        paid: 0, 
        status: 'pending' 
      },
      { 
        item: 'Exam Fee', 
        amount: feesData.fee_structure?.exam_fee || 0, 
        paid: 0, 
        status: 'pending' 
      }
    ];

    setFeeData({
      student: {
        full_name: user?.full_name || 'Student',
        register_number: user?.register_number || 'N/A',
        course: user?.course || 'N/A'
      },
      fee_structure: feeStructure,
      total: feesData.fee_structure?.total_fee || 
             feeStructure.reduce((sum, fee) => sum + (fee.amount || 0), 0),
      paid: feesData.paid_amount || 
            feeStructure.reduce((sum, fee) => sum + (fee.paid || 0), 0),
      due: feesData.due_amount || 0,
      last_payment_date: feesData.last_payment_date || 'N/A',
      next_due_date: feesData.next_due_date || 'N/A',
      payment_status: feesData.payment_status || 'pending'
    });
  };

  // Fallback to mock data
  const useMockData = () => {
    console.log('Using mock fee data');
    const mockData = {
      fee_structure: {
        tuition_fee: 50000,
        lab_fee: 10000,
        library_fee: 2000,
        sports_fee: 1500,
        development_fee: 5000,
        exam_fee: 3000,
        total_fee: 71500
      },
      paid_amount: 61500,
      due_amount: 10000,
      last_payment_date: '2023-12-15',
      next_due_date: '2024-01-31',
      payment_status: 'partially_paid'
    };
    processFeeData(mockData);
  };

  const handlePayment = (feeItem) => {
    alert(`Payment gateway integration for ${feeItem.item} - ₹${feeItem.amount - feeItem.paid}`)
  }

  const downloadReceipt = (receiptId) => {
    alert(`Downloading receipt: ${receiptId}`)
  }

  const downloadAdmissionAck = () => {
    alert('Downloading admission acknowledgement...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    )
  }

  if (error) {
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
        <p className="text-gray-600">No fee data found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Fees & Admission</h2>
        <p className="text-gray-600">
          {feeData.student.course} • Semester {feeData.student.current_semester}
        </p>
      </div>

      {/* Fee Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">Total Fee</h3>
              <p className="text-2xl font-bold text-blue-600">₹{feeData.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-900">Paid Amount</h3>
              <p className="text-2xl font-bold text-green-600">₹{feeData.paid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-900">Pending Amount</h3>
              <p className="text-2xl font-bold text-red-600">₹{feeData.due.toLocaleString()}</p>
            </div>
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
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeData.fee_structure.map((fee, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fee.item}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ₹{fee.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ₹{fee.paid.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          ₹{(fee.amount - fee.paid).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            fee.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {fee.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {fee.status === 'pending' ? (
                            <button
                              onClick={() => handlePayment(fee)}
                              className="bg-royal-600 hover:bg-royal-700 text-white px-3 py-1 rounded text-xs font-medium flex items-center"
                            >
                              <CreditCardIcon className="h-3 w-3 mr-1" />
                              Pay Now
                            </button>
                          ) : (
                            <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-xs font-medium">
                              Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                        Apply Now
                      </button>
                    )}
                  </div>
                ))}
              </div>

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
          )}

          {/* Payment History Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {payment.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => downloadReceipt(payment.receipt)}
                            className="text-royal-600 hover:text-royal-700 text-sm font-medium flex items-center"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        </div>
      </div>

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
    </div>
  )
}

export default StudentFees
