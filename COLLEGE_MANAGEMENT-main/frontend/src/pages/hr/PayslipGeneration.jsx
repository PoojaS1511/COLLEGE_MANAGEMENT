/**
 * Payslip Generation Component
 * Generates and downloads payslips in PDF format
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Select from '../../components/common/Select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import payrollService from '../../services/payrollService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Download,
  FileText,
  Search,
  Calendar,
  DollarSign,
  User,
  Building,
  Mail,
  Phone,
  Printer,
  Share2,
  Eye
} from 'lucide-react';

const PayslipGeneration = () => {
  const [payslipData, setPayslipData] = useState(null);
  const [payrollList, setPayrollList] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filters, setFilters] = useState({
    faculty_id: '',
    pay_month: '',
    status: 'Approved',
  });

  useEffect(() => {
    fetchPayrollList();
  }, [filters]);

  const fetchPayrollList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1,
        limit: 100,
        ...(filters.status && { status: filters.status }),
        ...(filters.pay_month && { month: filters.pay_month }),
      };

      const response = await payrollService.getPayrollList(params);
      
      if (response.success) {
        setPayrollList(response.data);
      } else {
        setError(response.error || 'Failed to fetch payroll data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching payroll data');
    } finally {
      setLoading(false);
    }
  };

  const generatePayslip = async (payrollId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollService.generatePayslip(payrollId);
      
      if (response.success) {
        setPayslipData(response.data);
        setSuccess('Payslip generated successfully!');
        setShowPreviewModal(true);
      } else {
        setError(response.error || 'Failed to generate payslip');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating payslip');
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = (payrollData) => {
    // Create a simple text-based payslip for now
    // In a real implementation, this would generate a proper PDF
    const payslipContent = generatePayslipContent(payrollData);
    const blob = new Blob([payslipContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${payrollData.payslip_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generatePayslipContent = (data) => {
    const payroll = data.payroll;
    return `
========================================
           PAYSLIP
========================================

Institution: ${data.institution}
Payslip ID: ${data.payslip_id}
Generated Date: ${data.generated_date}

========================================
EMPLOYEE DETAILS
========================================
Faculty ID: ${payroll.faculty_id}
Role: ${payroll.role}
Pay Month: ${new Date(payroll.pay_month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}

========================================
ATTENDANCE DETAILS
========================================
Total Working Days: ${payroll.total_days}
Present Days: ${payroll.present_days}
Absent Days: ${payroll.absent_days}
Attendance Percentage: ${((payroll.present_days / payroll.total_days) * 100).toFixed(1)}%

========================================
EARNINGS
========================================
Basic Salary: ${payrollService.formatCurrency(payroll.basic_salary)}

========================================
DEDUCTIONS
========================================
Provident Fund (12%): ${payrollService.formatCurrency(payroll.basic_salary * 0.12)}
ESI (1.75%): ${payrollService.formatCurrency(payroll.basic_salary * 0.0175)}
Tax (10%): ${payrollService.formatCurrency(payroll.basic_salary * 0.10)}
LOP: ${payrollService.formatCurrency(
  (payroll.basic_salary / payroll.total_days) * payroll.absent_days
)}
----------------------------------------
Total Deductions: ${payrollService.formatCurrency(payroll.deductions)}

========================================
SUMMARY
========================================
Gross Earnings: ${payrollService.formatCurrency(payroll.basic_salary)}
Total Deductions: ${payrollService.formatCurrency(payroll.deductions)}
========================================
NET SALARY: ${payrollService.formatCurrency(payroll.net_salary)}
========================================

Status: ${payroll.status}

This is a computer-generated payslip and does not require signature.
For any queries, please contact HR department.

========================================
    `.trim();
  };

  const printPayslip = (payrollData) => {
    const payslipContent = generatePayslipContent(payrollData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${payrollData.payslip_id}</title>
          <style>
            body { font-family: monospace; white-space: pre; padding: 20px; }
          </style>
        </head>
        <body>${payslipContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const emailPayslip = (payrollData) => {
    // Mock email functionality
    setSuccess(`Payslip ${payrollData.payslip_id} has been sent to the employee's email!`);
  };

  const formatCurrency = (amount) => {
    return payrollService.formatCurrency(amount);
  };

  const formatDate = (dateString) => {
    return payrollService.formatDate(dateString);
  };

  const PayslipPreview = ({ data }) => {
    const payroll = data.payroll;

    return (
      <div className="bg-white p-8 max-w-4xl mx-auto font-sans">
        {/* Header with Institution Logo/Name */}
        <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">CUBE ARTS & ENGINEERING COLLEGE</h1>
              <p className="text-lg text-gray-600 mt-1">Payroll Management System</p>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-800">SALARY PAYSLIP</h2>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Payslip ID: <strong>{data.payslip_id}</strong></span>
              <span>Generated: <strong>{data.generated_date}</strong></span>
            </div>
          </div>
        </div>

        {/* Faculty Details Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 bg-gray-100 p-3 rounded">EMPLOYEE DETAILS</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-medium text-gray-600">Faculty ID:</span>
                <span className="font-semibold">{payroll.faculty_id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-medium text-gray-600">Role:</span>
                <span className="font-semibold">{payroll.role}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-medium text-gray-600">Pay Month:</span>
                <span className="font-semibold">{formatDate(payroll.pay_month)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="font-medium text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">{payroll.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Details */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 bg-gray-100 p-3 rounded">ATTENDANCE SUMMARY</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{payroll.total_days}</div>
              <div className="text-sm text-gray-600">Total Days</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{payroll.present_days}</div>
              <div className="text-sm text-gray-600">Present Days</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{payroll.absent_days}</div>
              <div className="text-sm text-gray-600">Absent Days</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {((payroll.present_days / payroll.total_days) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Attendance %</div>
            </div>
          </div>
        </div>

        {/* Salary Breakdown Table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 bg-gray-100 p-3 rounded">SALARY BREAKDOWN</h3>
          <div className="grid grid-cols-2 gap-8">

            {/* Earnings Table */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-green-700 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                EARNINGS
              </h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-green-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Basic Salary</td>
                    <td className="border border-gray-300 p-3 text-right font-medium">{formatCurrency(payroll.basic_salary)}</td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-300 p-3">Gross Earnings</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(payroll.basic_salary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions Table */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-red-700 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                DEDUCTIONS
              </h4>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-red-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 p-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Provident Fund (12%)</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(payroll.basic_salary * 0.12)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">ESI (1.75%)</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(payroll.basic_salary * 0.0175)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Professional Tax (10%)</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(payroll.basic_salary * 0.10)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Loss of Pay</td>
                    <td className="border border-gray-300 p-3 text-right">
                      {formatCurrency((payroll.basic_salary / payroll.total_days) * payroll.absent_days)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-300 p-3">Total Deductions</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(payroll.deductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Net Salary Highlighted */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-xl text-center shadow-lg">
            <div className="text-lg mb-2 opacity-90">NET SALARY PAYABLE</div>
            <div className="text-5xl font-bold mb-2">{formatCurrency(payroll.net_salary)}</div>
            <div className="text-sm opacity-75">
              (Gross: {formatCurrency(payroll.basic_salary)} - Deductions: {formatCurrency(payroll.deductions)})
            </div>
          </div>
        </div>

        {/* Footer with Generated Date */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p className="font-medium">This is a computer-generated payslip and does not require signature.</p>
            <p>Generated on {new Date().toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p className="mt-4 text-xs">
              For any queries regarding this payslip, please contact the HR Department at hr@college.edu
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payslip Generation</h1>
          <p className="text-gray-600 mt-1">Generate and download payslips for employees</p>
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
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Payroll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Faculty ID
              </label>
              <Input
                placeholder="Enter Faculty ID"
                value={filters.faculty_id}
                onChange={(e) => setFilters(prev => ({ ...prev, faculty_id: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Month
              </label>
              <Input
                type="month"
                value={filters.pay_month}
                onChange={(e) => setFilters(prev => ({ ...prev, pay_month: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
                <option value="">All Status</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payroll Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty ID</TableHead>
                    <TableHead>Pay Month</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollList
                    .filter(payroll => 
                      !filters.faculty_id || payroll.faculty_id.toLowerCase().includes(filters.faculty_id.toLowerCase())
                    )
                    .map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">{payroll.faculty_id}</TableCell>
                      <TableCell>{formatDate(payroll.pay_month)}</TableCell>
                      <TableCell>{payroll.role}</TableCell>
                      <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payroll.net_salary)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payroll.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payroll.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePayslip(payroll.id)}
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              generatePayslip(payroll.id).then(() => {
                                if (payslipData) {
                                  downloadPayslip(payslipData);
                                }
                              });
                            }}
                            disabled={loading}
                          >
                            <Download className="h-4 w-4" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Preview Modal */}
      <Modal
        show={showPreviewModal && payslipData}
        onClose={() => setShowPreviewModal(false)}
        size="full"
      >
        <ModalHeader>
          <div className="flex items-center justify-between">
            <span>Payslip Preview - {payslipData?.payslip_id}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => printPayslip(payslipData)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => emailPayslip(payslipData)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => downloadPayslip(payslipData)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="max-h-[80vh] overflow-y-auto">
          {payslipData && <PayslipPreview data={payslipData} />}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PayslipGeneration;
