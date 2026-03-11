/**
 * HR Approval Workflow Component
 * Handles payroll approval with step indicators and confirmation modals
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/modal';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import Select from '../../components/common/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import payrollService from '../../services/payrollService';
import { 
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  AlertTriangle,
  Users,
  Calendar,
  Filter,
  Search,
  TrendingUp,
  Shield
} from 'lucide-react';

const HRApprovalWorkflow = () => {
  const [pendingPayrolls, setPendingPayrolls] = useState([]);
  const [approvedPayrolls, setApprovedPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedPayrolls, setSelectedPayrolls] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [filters, setFilters] = useState({
    status: 'Pending',
    month: '',
    search: '',
  });
  const [approvalStats, setApprovalStats] = useState({
    pending: 0,
    approved: 0,
    paid: 0,
    total: 0,
  });

  useEffect(() => {
    fetchPayrollData();
  }, [filters]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1,
        limit: 100,
        ...(filters.status && { status: filters.status }),
        ...(filters.month && { month: filters.month }),
      };

      const response = await payrollService.getPayrollList(params);
      
      if (response.success) {
        const allPayrolls = response.data;
        setPendingPayrolls(allPayrolls.filter(p => p.status === 'Pending'));
        setApprovedPayrolls(allPayrolls.filter(p => p.status === 'Approved'));
        
        // Calculate stats
        const stats = {
          pending: allPayrolls.filter(p => p.status === 'Pending').length,
          approved: allPayrolls.filter(p => p.status === 'Approved').length,
          paid: allPayrolls.filter(p => p.status === 'Paid').length,
          total: allPayrolls.length,
        };
        setApprovalStats(stats);
      } else {
        setError(response.error || 'Failed to fetch payroll data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayroll = async (payrollId) => {
    try {
      const response = await payrollService.approvePayroll(payrollId);
      if (response.success) {
        setSuccess('Payroll approved successfully!');
        fetchPayrollData();
      } else {
        setError('Failed to approve payroll: ' + response.error);
      }
    } catch (err) {
      setError('Error approving payroll: ' + err.message);
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    try {
      const response = await payrollService.markPayrollAsPaid(payrollId);
      if (response.success) {
        setSuccess('Payroll marked as paid successfully!');
        fetchPayrollData();
      } else {
        setError('Failed to mark as paid: ' + response.error);
      }
    } catch (err) {
      setError('Error marking as paid: ' + err.message);
    }
  };

  const handleBulkApprove = async () => {
    try {
      const response = await payrollService.bulkApprovePayroll(selectedPayrolls);
      if (response.success) {
        setSuccess(`Successfully approved ${response.data.success_count} payrolls!`);
        setSelectedPayrolls([]);
        fetchPayrollData();
      } else {
        setError('Failed to bulk approve: ' + response.error);
      }
    } catch (err) {
      setError('Error in bulk approval: ' + err.message);
    }
  };

  const handleViewPayroll = (payroll) => {
    setCurrentPayroll(payroll);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Approved': 'info',
      'Paid': 'success',
      'Cancelled': 'danger'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getWorkflowStep = (status) => {
    const steps = {
      'Pending': 1,
      'Approved': 2,
      'Paid': 3,
    };
    return steps[status] || 0;
  };

  const formatCurrency = (amount) => {
    return payrollService.formatCurrency(amount);
  };

  const formatDate = (dateString) => {
    return payrollService.formatDate(dateString);
  };

  const WorkflowStepIndicator = ({ status }) => {
    const currentStep = getWorkflowStep(status);
    const steps = [
      { name: 'Pending', icon: Clock, color: 'warning' },
      { name: 'Approved', icon: CheckCircle, color: 'info' },
      { name: 'Paid', icon: DollarSign, color: 'success' },
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index + 1 <= currentStep;
          const isCurrent = index + 1 === currentStep;
          
          return (
            <div key={step.name} className="flex items-center flex-1">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2
                ${isActive ? `border-${step.color}-500 bg-${step.color}-50` : 'border-gray-300 bg-gray-50'}
                ${isCurrent ? 'ring-2 ring-offset-2 ring-' + step.color + '-500' : ''}
              `}>
                <Icon className={`h-5 w-5 ${isActive ? `text-${step.color}-600` : 'text-gray-400'}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${isActive ? `text-${step.color}-900` : 'text-gray-500'}`}>
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${isActive ? 'bg-' + step.color + '-500' : 'bg-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Approval Workflow</h1>
          <p className="text-gray-600 mt-1">Review and approve payroll records</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline">
            <Link to="/admin/payroll/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/payroll/list">All Payrolls</Link>
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

      {/* Approval Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{approvalStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{approvalStats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{approvalStats.paid}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-purple-600">{approvalStats.total}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
                <option value="">All Status</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <Input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={fetchPayrollData}>
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payrolls */}
      {pendingPayrolls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Approval ({pendingPayrolls.length})
              </span>
              {selectedPayrolls.length > 0 && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setShowApprovalModal(true)}
                >
                  Approve Selected ({selectedPayrolls.length})
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedPayrolls.length === pendingPayrolls.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPayrolls(pendingPayrolls.map(p => p.id));
                          } else {
                            setSelectedPayrolls([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Faculty ID</TableHead>
                    <TableHead>Pay Month</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedPayrolls.includes(payroll.id)}
                          onChange={() => {
                            setSelectedPayrolls(prev =>
                              prev.includes(payroll.id)
                                ? prev.filter(id => id !== payroll.id)
                                : [...prev, payroll.id]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{payroll.faculty_id}</TableCell>
                      <TableCell>{formatDate(payroll.pay_month)}</TableCell>
                      <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payroll.net_salary)}</TableCell>
                      <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayroll(payroll)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprovePayroll(payroll.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Payrolls */}
      {approvedPayrolls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Approved - Ready for Payment ({approvedPayrolls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty ID</TableHead>
                    <TableHead>Pay Month</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedPayrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">{payroll.faculty_id}</TableCell>
                      <TableCell>{formatDate(payroll.pay_month)}</TableCell>
                      <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payroll.net_salary)}</TableCell>
                      <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayroll(payroll)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleMarkAsPaid(payroll.id)}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll Detail Modal */}
      {currentPayroll && (
        <Modal
          show={!!currentPayroll}
          onClose={() => setCurrentPayroll(null)}
          size="lg"
        >
          <ModalHeader>
            Payroll Details - {currentPayroll.faculty_id}
          </ModalHeader>
          <ModalBody>
            <WorkflowStepIndicator status={currentPayroll.status} />
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pay Month</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(currentPayroll.pay_month)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900">{currentPayroll.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Days</label>
                <p className="mt-1 text-sm text-gray-900">{currentPayroll.total_days}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Present Days</label>
                <p className="mt-1 text-sm text-gray-900">{currentPayroll.present_days}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                <p className="mt-1 text-sm text-gray-900">{formatCurrency(currentPayroll.basic_salary)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deductions</label>
                <p className="mt-1 text-sm text-gray-900">{formatCurrency(currentPayroll.deductions)}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Net Salary</label>
                <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(currentPayroll.net_salary)}</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setCurrentPayroll(null)}>
              Close
            </Button>
            {currentPayroll.status === 'Pending' && (
              <Button
                variant="success"
                onClick={() => {
                  handleApprovePayroll(currentPayroll.id);
                  setCurrentPayroll(null);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Payroll
              </Button>
            )}
            {currentPayroll.status === 'Approved' && (
              <Button
                variant="info"
                onClick={() => {
                  handleMarkAsPaid(currentPayroll.id);
                  setCurrentPayroll(null);
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}

      {/* Bulk Approval Modal */}
      <Modal show={showApprovalModal} onClose={() => setShowApprovalModal(false)}>
        <ModalHeader>Bulk Approval Confirmation</ModalHeader>
        <ModalBody>
          Are you sure you want to approve {selectedPayrolls.length} payroll record(s)? 
          This action will move them to "Approved" status and make them ready for payment.
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleBulkApprove}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve {selectedPayrolls.length} Records
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default HRApprovalWorkflow;
