/**
 * Payroll Calculation Engine
 * Handles payroll calculation with auto-calculation logic
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Select from '../../components/common/Select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Form, FormGroup, Label } from '../../components/ui/form';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/modal';
import payrollService from '../../services/payrollService';
import { 
  Calculator,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Info
} from 'lucide-react';

const PayrollCalculation = () => {
  const [calculationData, setCalculationData] = useState({
    faculty_id: '',
    pay_month: '',
    basic_salary: '',
    total_days: '',
    present_days: '',
    role: '',
  });
  
  const [calculatedPayroll, setCalculatedPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    fetchAvailableMonths();
    fetchFacultyList();
  }, []);

  const fetchAvailableMonths = async () => {
    try {
      const response = await payrollService.getAvailableMonths();
      if (response.success) {
        setAvailableMonths(response.data);
      }
    } catch (err) {
      console.error('Error fetching available months:', err);
    }
  };

  const fetchFacultyList = async () => {
    try {
      // Mock faculty data - in real app, this would come from an API
      const mockFaculty = [
        { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Dr. John Smith', role: 'Professor' },
        { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Dr. Jane Doe', role: 'Associate Professor' },
        { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Dr. Robert Johnson', role: 'Assistant Professor' },
      ];
      setFacultyList(mockFaculty);
    } catch (err) {
      console.error('Error fetching faculty list:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setCalculationData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate when relevant fields change
    if (['basic_salary', 'total_days', 'present_days'].includes(field)) {
      setTimeout(() => calculatePayroll(), 500);
    }
  };

  const calculatePayroll = async () => {
    // Validate required fields
    const requiredFields = ['faculty_id', 'pay_month', 'basic_salary', 'total_days', 'present_days', 'role'];
    const missingFields = requiredFields.filter(field => !calculationData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollService.calculatePayroll(calculationData);
      
      if (response.success) {
        setCalculatedPayroll(response.data);
        setSuccess('Payroll calculated successfully!');
      } else {
        setError(response.error || 'Failed to calculate payroll');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while calculating payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayroll = async () => {
    if (!calculatedPayroll) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollService.createPayroll(calculatedPayroll);
      
      if (response.success) {
        setSuccess('Payroll saved successfully!');
        setShowSaveModal(false);
        // Reset form
        setCalculationData({
          faculty_id: '',
          pay_month: '',
          basic_salary: '',
          total_days: '',
          present_days: '',
          role: '',
        });
        setCalculatedPayroll(null);
      } else {
        setError(response.error || 'Failed to save payroll');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving payroll');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return payrollService.formatCurrency(amount);
  };

  const getAttendancePercentage = () => {
    if (!calculationData.total_days || !calculationData.present_days) return 0;
    return ((calculationData.present_days / calculationData.total_days) * 100).toFixed(1);
  };

  const getAttendanceColor = () => {
    const percentage = getAttendancePercentage();
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Calculation</h1>
          <p className="text-gray-600 mt-1">Calculate and process payroll with automatic deductions</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline">
            <Link to="/admin/payroll/list">View Payroll List</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/payroll/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-6">
          <CheckCircle className="h-4 w-4" />
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Payroll Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form>
              <FormGroup>
                <Label htmlFor="faculty_id">Faculty</Label>
                <Select
                  id="faculty_id"
                  value={calculationData.faculty_id}
                  onChange={(e) => {
                    const faculty = facultyList.find(f => f.id === e.target.value);
                    handleInputChange('faculty_id', e.target.value);
                    if (faculty) {
                      handleInputChange('role', faculty.role);
                    }
                  }}
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} - {faculty.role}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="pay_month">Pay Month</Label>
                <Input
                  id="pay_month"
                  type="month"
                  value={calculationData.pay_month}
                  onChange={(e) => handleInputChange('pay_month', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={calculationData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="e.g., Professor, Associate Professor"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="basic_salary">Basic Salary (₹)</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  value={calculationData.basic_salary}
                  onChange={(e) => handleInputChange('basic_salary', e.target.value)}
                  placeholder="50000"
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup>
                  <Label htmlFor="total_days">Total Working Days</Label>
                  <Input
                    id="total_days"
                    type="number"
                    value={calculationData.total_days}
                    onChange={(e) => handleInputChange('total_days', e.target.value)}
                    placeholder="22"
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="present_days">Present Days</Label>
                  <Input
                    id="present_days"
                    type="number"
                    value={calculationData.present_days}
                    onChange={(e) => handleInputChange('present_days', e.target.value)}
                    placeholder="20"
                  />
                </FormGroup>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Attendance Percentage</span>
                  <Badge variant={getAttendanceColor()}>
                    {getAttendancePercentage()}%
                  </Badge>
                </div>
                <Progress
                  value={getAttendancePercentage()}
                  variant={getAttendanceColor()}
                  className="h-2"
                />
              </div>

              <div className="mt-6 flex gap-4">
                <Button
                  variant="primary"
                  onClick={calculatePayroll}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
                  Calculate Payroll
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCalculationData({
                      faculty_id: '',
                      pay_month: '',
                      basic_salary: '',
                      total_days: '',
                      present_days: '',
                      role: '',
                    });
                    setCalculatedPayroll(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Calculation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculatedPayroll ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Total Days:</span>
                      <span className="ml-2 font-medium">{calculatedPayroll.total_days}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Present Days:</span>
                      <span className="ml-2 font-medium">{calculatedPayroll.present_days}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Absent Days:</span>
                      <span className="ml-2 font-medium">{calculatedPayroll.absent_days}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Per Day Salary:</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(calculatedPayroll.basic_salary / calculatedPayroll.total_days)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary:</span>
                      <span className="font-medium">{formatCurrency(calculatedPayroll.basic_salary)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Deductions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">PF (12%):</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedPayroll.basic_salary * 0.12)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ESI (1.75%):</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedPayroll.basic_salary * 0.0175)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%):</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedPayroll.basic_salary * 0.10)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">LOP:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          (calculatedPayroll.basic_salary / calculatedPayroll.total_days) * 
                          calculatedPayroll.absent_days
                        )}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Deductions:</span>
                      <span>{formatCurrency(calculatedPayroll.deductions)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 text-white p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Net Salary:</span>
                    <span className="text-2xl font-bold">{formatCurrency(calculatedPayroll.net_salary)}</span>
                  </div>
                </div>

                <Button
                  variant="success"
                  className="w-full"
                  onClick={() => setShowSaveModal(true)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Payroll Record
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Fill in the payroll details and click "Calculate Payroll" to see the breakdown.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Calculation Logic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Salary Calculation</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Per Day Salary = Basic Salary ÷ Total Working Days</li>
                <li>• LOP = Per Day Salary × Absent Days</li>
                <li>• Net Salary = Basic Salary - Total Deductions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Standard Deductions</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Provident Fund (PF): 12% of Basic Salary</li>
                <li>• ESI: 1.75% of Basic Salary</li>
                <li>• Tax: 10% of Basic Salary (simplified)</li>
                <li>• LOP: Based on absent days</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Confirmation Modal */}
      <Modal show={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <ModalHeader>Save Payroll Record</ModalHeader>
        <ModalBody>
          Are you sure you want to save this payroll record? Once saved, it will be available for approval.
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSaveModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSavePayroll} disabled={loading}>
            {loading ? <Spinner size="sm" className="mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Save Payroll
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PayrollCalculation;
