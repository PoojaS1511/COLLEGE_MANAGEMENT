import React from 'react';
import { Card, Table, ProgressBar, Badge, Button } from 'react-bootstrap';
import { FiDollarSign, FiUsers, FiCreditCard, FiDownload } from 'react-icons/fi';
import { feesManagement, reports } from '../../data/mockData';

const FeeDashboard = () => {
  const totalStudents = reports.fees.totalStudents;
  const feeStats = reports.fees;
  const recentTransactions = feesManagement.feeTransactions.slice(0, 5);
  const pendingPayments = feesManagement.studentFees.filter(
    student => student.paymentStatus !== 'Paid'
  ).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container-fluid p-0">
      <h2 className="mb-4">Fee Management Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Collection</h6>
                  <h3 className="mb-0">{formatCurrency(feeStats.feesCollected)}</h3>
                  <small className="text-success">
                    {feeStats.collectionRate}% of target
                  </small>
                </div>
                <div className="bg-light rounded p-3">
                  <FiDollarSign size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-3 mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Pending Payments</h6>
                  <h3 className="mb-0">{formatCurrency(feeStats.feesPending)}</h3>
                  <small className="text-muted">
                    {pendingPayments} students
                  </small>
                </div>
                <div className="bg-light rounded p-3">
                  <FiCreditCard size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-3 mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Students</h6>
                  <h3 className="mb-0">{totalStudents}</h3>
                  <small className="text-muted">
                    {feeStats.collectionRate}% fee collected
                  </small>
                </div>
                <div className="bg-light rounded p-3">
                  <FiUsers size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-3 mb-3">
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Collection Target</h6>
                  <h3 className="mb-0">100%</h3>
                  <div className="mt-2">
                    <ProgressBar 
                      now={feeStats.collectionRate} 
                      variant={feeStats.collectionRate > 80 ? 'success' : feeStats.collectionRate > 50 ? 'warning' : 'danger'}
                      style={{ height: '6px' }}
                    />
                  </div>
                </div>
                <div className="bg-light rounded p-3">
                  <FiDownload size={24} className="text-info" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Recent Fee Transactions</h5>
          <Button variant="outline-primary" size="sm">
            View All
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Receipt No.</th>
                <th>Student</th>
                <th>Course</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.receiptNumber}</td>
                  <td>{txn.studentName}</td>
                  <td>{feesManagement.studentFees.find(s => s.studentId === txn.studentId)?.course || 'N/A'}</td>
                  <td>{new Date(txn.date).toLocaleDateString()}</td>
                  <td>{formatCurrency(txn.amount)}</td>
                  <td>
                    <Badge bg="success">Completed</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Fee Due Dates */}
      <div className="row">
        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Upcoming Fee Due Dates</h5>
            </Card.Header>
            <Card.Body>
              <div className="list-group list-group-flush">
                {feesManagement.feeDueDates.map((due, index) => (
                  <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{due.installment}</h6>
                      <small className="text-muted">
                        Due: {new Date(due.dueDate).toLocaleDateString()} • 
                        Late fee: ₹{due.lateFeeAmount} after {new Date(due.lateFeeAfter).toLocaleDateString()}
                      </small>
                    </div>
                    <Badge bg={new Date(due.dueDate) > new Date() ? 'primary' : 'danger'}>{
                      new Date(due.dueDate) > new Date() ? 'Upcoming' : 'Overdue'
                    }</Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Payment Methods</h5>
            </Card.Header>
            <Card.Body>
              <div className="list-group list-group-flush">
                {feesManagement.paymentModes.map((method) => (
                  <div key={method.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">{method.name}</h6>
                      <small className="text-muted">{method.description}</small>
                    </div>
                    <Button variant="outline-primary" size="sm">
                      Pay Now
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeeDashboard;
