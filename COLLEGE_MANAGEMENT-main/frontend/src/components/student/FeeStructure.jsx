import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { feesService } from '../../services/feesService';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  BeakerIcon,
  BuildingLibraryIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const FeeStructure = () => {
  const { user } = useAuth();
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeeData();
  }, [user]);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        console.error('No user data available');
        setError('User not authenticated');
        return;
      }

      const studentId = user.id;
      
      try {
        console.log('Fetching fee structure data for student:', studentId);
        const response = await feesService.getStudentFeeStructure(studentId);
        
        if (response?.success && response?.data) {
          processFeeData(response.data);
        } else {
          console.error('API response unsuccessful:', response);
          setError(response?.message || 'Failed to fetch fee structure data');
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
        setError(apiError.message || 'Failed to connect to the database');
      }
    } catch (error) {
      console.error('Unexpected error in fetchFeeData:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const processFeeData = (data) => {
    console.log('Processing fee structure data:', data);
    
    if (!data || !data.feeStructures || !Array.isArray(data.feeStructures)) {
      console.log('No fee structures found in response:', data);
      setError('No fee structure found. Please contact the administration.');
      return;
    }

    // Process each fee structure
    const processedFeeStructures = data.feeStructures.map(feeStructure => {
      const totalAmount = Number(feeStructure.amount) || 0;
      const totalPaid = Number(feeStructure.totalPaid) || 0;
      const pendingAmount = Number(feeStructure.pendingAmount) || 0;
      
      // Categorize fees based on name
      let category = 'Other';
      let icon = DocumentTextIcon;
      let description = 'Miscellaneous fee component';
      const nameLower = feeStructure.name?.toLowerCase() || '';
      
      if (nameLower.includes('tuit') || nameLower.includes('academic')) {
        category = 'Academic';
        icon = AcademicCapIcon;
        description = 'Core academic instruction and faculty costs';
      } else if (nameLower.includes('lab')) {
        category = 'Academic';
        icon = BeakerIcon;
        description = 'Laboratory equipment, materials, and maintenance';
      } else if (nameLower.includes('lib')) {
        category = 'Academic';
        icon = BuildingLibraryIcon;
        description = 'Access to library resources and materials';
      } else if (nameLower.includes('sport')) {
        category = 'Co-curricular';
        icon = TrophyIcon;
        description = 'Sports facilities and event participation';
      } else if (nameLower.includes('develop') || nameLower.includes('infra')) {
        category = 'Infrastructure';
        icon = BuildingOfficeIcon;
        description = 'Campus infrastructure development and maintenance';
      } else if (nameLower.includes('exam')) {
        category = 'Academic';
        icon = DocumentTextIcon;
        description = 'Examination and evaluation costs';
      } else if (nameLower.includes('hostel')) {
        category = 'Infrastructure';
        icon = BuildingOfficeIcon;
        description = 'Accommodation and hostel facilities';
      }

      return {
        ...feeStructure,
        id: feeStructure.id || `fee-${Math.random().toString(36).substr(2, 9)}`,
        name: feeStructure.name || 'Fee Component',
        description: feeStructure.description || description,
        amount: totalAmount,
        icon,
        category,
        mandatory: feeStructure.mandatory !== undefined ? feeStructure.mandatory : true,
        totalAmount,
        totalPaid,
        pendingAmount,
        status: feeStructure.status || (pendingAmount <= 0 ? 'paid' : 'unpaid'),
        academic_year: feeStructure.academic_year || new Date().getFullYear().toString()
      };
    });

    // Calculate totals across all fee structures
    const totalAmount = processedFeeStructures.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const academicFees = processedFeeStructures
      .filter(fee => fee.category === 'Academic')
      .reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const infrastructureFees = processedFeeStructures
      .filter(fee => fee.category === 'Infrastructure')
      .reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const cocurricularFees = processedFeeStructures
      .filter(fee => fee.category === 'Co-curricular')
      .reduce((sum, fee) => sum + (fee.amount || 0), 0);

    setFeeData({
      student: data.student || {
        id: user?.id || '',
        full_name: user?.full_name || user?.name || 'Student',
        register_number: user?.registerNumber || 'N/A',
        course: user?.course || 'N/A',
        semester: user?.current_semester || 'N/A',
        department: data.student?.department || 'N/A'
      },
      fee_structures: processedFeeStructures,
      total_amount: totalAmount,
      academic_fees: academicFees,
      infrastructure_fees: infrastructureFees,
      cocurricular_fees: cocurricularFees,
      academic_year: processedFeeStructures[0]?.academic_year || new Date().getFullYear().toString(),
      paymentHistory: data.paymentHistory || []
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-royal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fee Structure</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Fee Structure
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">Please contact the administration if this problem persists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feeData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Fee Structure</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No Fee Structure Available
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Fee structure data is not available at the moment.</p>
                <p className="mt-2">Please contact the administration for fee information.</p>
              </div>
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
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fee Structure</h2>
            <p className="text-gray-600">
              {feeData.student.course} • Semester {feeData.student.semester} • {feeData.student.department}
            </p>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-md">
            <p className="text-sm text-blue-700 font-medium">
              Academic Year: {feeData.academic_year}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-blue-900">Total Fee</h3>
              <p className="text-2xl font-bold text-blue-600">₹{feeData.total_amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <AcademicCapIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-900">Academic Fees</h3>
              <p className="text-2xl font-bold text-green-600">₹{feeData.academic_fees.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-purple-900">Infrastructure</h3>
              <p className="text-2xl font-bold text-purple-600">₹{feeData.infrastructure_fees.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-orange-900">Co-curricular</h3>
              <p className="text-2xl font-bold text-orange-600">₹{feeData.cocurricular_fees.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Structure Details */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Fee Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {feeData.fee_structures.map((fee, index) => (
              <div key={`${fee.id || 'fee'}-${index}`} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${
                        fee.category === 'Academic' ? 'bg-green-100' :
                        fee.category === 'Infrastructure' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        {React.createElement(fee.icon || DocumentTextIcon, {
                          className: `h-6 w-6 ${
                            fee.category === 'Academic' ? 'text-green-600' :
                            fee.category === 'Infrastructure' ? 'text-purple-600' :
                            'text-orange-600'
                          }`
                        })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-medium text-gray-900">{fee.name}</h4>
                        <div className="flex flex-wrap gap-1">
                          {fee.mandatory && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Mandatory
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                            fee.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {fee.status === 'paid' ? 'Paid' : fee.status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {fee.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{fee.description}</p>
                      {fee.academic_year && (
                        <p className="text-xs text-gray-500 mt-1">
                          Academic Year: {fee.academic_year}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₹{fee.amount.toLocaleString()}</p>
                    {fee.totalPaid > 0 && (
                      <p className="text-sm text-green-600">
                        Paid: ₹{fee.totalPaid.toLocaleString()}
                      </p>
                    )}
                    {fee.pendingAmount > 0 && (
                      <p className="text-sm text-red-600">
                        Pending: ₹{fee.pendingAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="mt-8 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Fee Amount:</span>
                  <span className="font-medium">₹{feeData.total_amount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>Total Paid:</span>
                  <span className="font-medium">₹{feeData.fee_structures.reduce((sum, fee) => sum + (fee.totalPaid || 0), 0).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-red-600">
                  <span>Total Pending:</span>
                  <span className="font-medium">₹{feeData.fee_structures.reduce((sum, fee) => sum + (fee.pendingAmount || 0), 0).toLocaleString()}</span>
                </div>
                
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex justify-between font-semibold">
                    <span>Net Payable:</span>
                    <span className="text-lg">
                      ₹{feeData.fee_structures.reduce((sum, fee) => sum + (fee.pendingAmount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Academic Year: {feeData.academic_year}
                </p>
                <p className="text-sm text-gray-500">
                  Last Updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h5 className="font-medium mb-2">Payment Schedule:</h5>
                <ul className="space-y-1">
                  <li>• First installment: Beginning of semester</li>
                  <li>• Late payment fee: 5% per month</li>
                  <li>• Payment methods: Online, Bank transfer, Cash</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Important Notes:</h5>
                <ul className="space-y-1">
                  <li>• Mandatory fees must be paid every semester</li>
                  <li>• Co-curricular fees are optional</li>
                  <li>• Scholarships available for eligible students</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeStructure;