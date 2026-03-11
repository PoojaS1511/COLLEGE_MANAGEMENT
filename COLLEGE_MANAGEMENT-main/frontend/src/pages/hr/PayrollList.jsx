/**
 * Payroll List Page
 * Displays all payroll records in a data table with pagination and search
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
import Pagination from '../../components/ui/pagination';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Spinner } from '../../components/ui/spinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/modal';
import payrollService from '../../services/payrollService';
import { 
  Search,
  Filter,
  Eye,
  CheckCircle,
  DollarSign,
  Calendar,
  Download,
  Trash2,
  Edit,
  Users
} from 'lucide-react';

const PayrollList = () => {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    month: '',
    search: '',
  });
  const [selectedPayrolls, setSelectedPayrolls] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchPayrollData();
  }, [pagination.page, pagination.limit, filters]);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.month && { month: filters.month }),
      };

      const response = await payrollService.getPayrollList(params);
      
      if (response.success) {
        setPayrollData(response.data);
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      } else {
        setError(response.error || 'Failed to fetch payroll data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectPayroll = (payrollId) => {
    setSelectedPayrolls(prev => 
      prev.includes(payrollId)
        ? prev.filter(id => id !== payrollId)
        : [...prev, payrollId]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPayrolls(payrollData.map(p => p.id));
    } else {
      setSelectedPayrolls([]);
    }
  };

  const handleBulkApprove = async () => {
    try {
      const response = await payrollService.bulkApprovePayroll(selectedPayrolls);
      if (response.success) {
        setSelectedPayrolls([]);
        setShowBulkActions(false);
        fetchPayrollData();
        alert(`Successfully approved ${response.data.success_count} payrolls`);
      } else {
        alert('Failed to approve payrolls: ' + response.error);
      }
    } catch (err) {
      alert('Error approving payrolls: ' + err.message);
    }
  };

  const handleApprove = async (payrollId) => {
    try {
      const response = await payrollService.approvePayroll(payrollId);
      if (response.success) {
        fetchPayrollData();
      } else {
        alert('Failed to approve payroll: ' + response.error);
      }
    } catch (err) {
      alert('Error approving payroll: ' + err.message);
    }
  };

  const handleMarkAsPaid = async (payrollId) => {
    try {
      const response = await payrollService.markPayrollAsPaid(payrollId);
      if (response.success) {
        fetchPayrollData();
      } else {
        alert('Failed to mark as paid: ' + response.error);
      }
    } catch (err) {
      alert('Error marking as paid: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      const response = await payrollService.deletePayroll(deleteTarget);
      if (response.success) {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchPayrollData();
      } else {
        alert('Failed to delete payroll: ' + response.error);
      }
    } catch (err) {
      alert('Error deleting payroll: ' + err.message);
    }
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

  const formatCurrency = (amount) => {
    return payrollService.formatCurrency(amount);
  };

  const formatDate = (dateString) => {
    return payrollService.formatDate(dateString);
  };

  const filteredPayrollData = payrollData.filter(payroll => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      payroll.faculty_id?.toLowerCase().includes(searchLower) ||
      payroll.role?.toLowerCase().includes(searchLower) ||
      payroll.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-6">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll List</h1>
          <p className="text-gray-600 mt-1">Manage all payroll records</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button asChild variant="default">
            <Link to="/admin/payroll/calculation">Calculate Payroll</Link>
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by faculty ID, role..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <Input
                type="month"
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
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

      {/* Bulk Actions */}
      {selectedPayrolls.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedPayrolls.length} payroll(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleBulkApprove}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPayrolls([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Payroll Records ({pagination.total})
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/payroll/dashboard">View Dashboard</Link>
            </Button>
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
                      checked={selectedPayrolls.length === filteredPayrollData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>Faculty ID</TableHead>
                  <TableHead>Pay Month</TableHead>
                  <TableHead>Present Days</TableHead>
                  <TableHead>Absent Days</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayrollData.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedPayrolls.includes(payroll.id)}
                        onChange={() => handleSelectPayroll(payroll.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {payroll.faculty_id}
                    </TableCell>
                    <TableCell>
                      {formatDate(payroll.pay_month)}
                    </TableCell>
                    <TableCell>{payroll.present_days}</TableCell>
                    <TableCell>{payroll.absent_days}</TableCell>
                    <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                    <TableCell>{formatCurrency(payroll.deductions)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payroll.net_salary)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link to={`/admin/payroll/view/${payroll.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {payroll.status === 'Pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(payroll.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setDeleteTarget(payroll.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {payroll.status === 'Approved' && (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleMarkAsPaid(payroll.id)}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          href={`/payroll/payslip/${payroll.id}`}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                showSizeChanger
                pageSize={pagination.limit}
                onPageSizeChange={(size) => {
                  setPagination(prev => ({ ...prev, limit: size, page: 1 }));
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this payroll record? This action cannot be undone.
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PayrollList;
