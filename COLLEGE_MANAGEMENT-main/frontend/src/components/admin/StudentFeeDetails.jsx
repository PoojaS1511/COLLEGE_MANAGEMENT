import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FiDownload, FiPrinter, FiSearch, FiFilter, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

const StudentFeeDetails = ({ studentId, onBack }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch student data
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch this data from your API
        const mockStudent = {
          id: studentId,
          name: 'John Doe',
          admissionNo: 'ADM2023001',
          className: '12th Grade',
          section: 'A',
          totalFees: 50000,
          paidFees: 35000,
          balance: 15000,
          feeHistory: [
            { id: 1, date: '2023-04-15', description: 'Tuition Fee', amount: 10000, status: 'paid', receiptNo: 'RCPT001' },
            { id: 2, date: '2023-05-15', description: 'Tuition Fee', amount: 10000, status: 'paid', receiptNo: 'RCPT002' },
            { id: 3, date: '2023-06-15', description: 'Tuition Fee', amount: 10000, status: 'paid', receiptNo: 'RCPT003' },
            { id: 4, date: '2023-07-15', description: 'Tuition Fee', amount: 5000, status: 'partially_paid', receiptNo: 'RCPT004' },
            { id: 5, date: '2023-08-15', description: 'Tuition Fee', amount: 0, status: 'unpaid', receiptNo: null },
          ]
        };
        setStudent(mockStudent);
      } catch (err) {
        setError('Failed to load student data');
        console.error('Error fetching student data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handlePrintReceipt = (receiptNo) => {
    // Implement receipt printing logic
    console.log('Printing receipt:', receiptNo);
    // In a real app, this would open a print dialog with the receipt
  };

  const handleDownloadReceipt = (receiptNo) => {
    // Implement receipt download logic
    console.log('Downloading receipt:', receiptNo);
    // In a real app, this would generate and download a PDF receipt
  };

  const handleMakePayment = () => {
    // Implement payment flow
    console.log('Initiating payment for student:', studentId);
    // In a real app, this would open a payment modal or redirect to payment page
  };

  const filteredFeeHistory = student?.feeHistory?.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = record.date.startsWith(selectedYear);
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    
    return matchesSearch && matchesYear && matchesStatus;
  }) || [];

  if (loading) {
    return <div className="text-center p-5">Loading student data...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!student) {
    return <Alert variant="warning">Student not found</Alert>;
  }

  return (
    <div className="student-fee-details">
      <Button variant="outline-secondary" onClick={onBack} className="mb-3">
        &larr; Back to Fee Management
      </Button>
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Student Information</h5>
          <div>
            <Badge bg="info" className="me-2">Balance: ₹{student.balance.toLocaleString()}</Badge>
            <Badge bg={student.balance > 0 ? 'warning' : 'success'}>
              {student.balance > 0 ? 'Pending Dues' : 'No Dues'}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <p className="mb-1"><strong>Name:</strong> {student.name}</p>
              <p className="mb-1"><strong>Admission No:</strong> {student.admissionNo}</p>
            </Col>
            <Col md={3}>
              <p className="mb-1"><strong>Class:</strong> {student.className}</p>
              <p className="mb-1"><strong>Section:</strong> {student.section}</p>
            </Col>
            <Col md={3}>
              <p className="mb-1"><strong>Total Fees:</strong> ₹{student.totalFees.toLocaleString()}</p>
              <p className="mb-1"><strong>Paid Amount:</strong> ₹{student.paidFees.toLocaleString()}</p>
            </Col>
            <Col md={3} className="d-flex align-items-center justify-content-end">
              {student.balance > 0 && (
                <Button variant="primary" onClick={handleMakePayment}>
                  <FiDollarSign className="me-1" /> Make Payment
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Fee History</h5>
          <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ width: '250px' }}>
              <span className="input-group-text"><FiSearch /></span>
              <Form.Control
                type="text"
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Form.Select 
              size="sm" 
              style={{ width: '150px' }}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="all">All Years</option>
            </Form.Select>
            <Form.Select 
              size="sm" 
              style={{ width: '150px' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th className="text-end">Amount</th>
                <th>Status</th>
                <th>Receipt</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeeHistory.length > 0 ? (
                filteredFeeHistory.map((record) => (
                  <tr key={record.id}>
                    <td>{format(new Date(record.date), 'dd MMM yyyy')}</td>
                    <td>{record.description}</td>
                    <td className="text-end">₹{record.amount.toLocaleString()}</td>
                    <td>
                      <Badge 
                        bg={
                          record.status === 'paid' ? 'success' : 
                          record.status === 'partially_paid' ? 'warning' : 'danger'
                        }
                      >
                        {record.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>{record.receiptNo || '-'}</td>
                    <td className="text-center">
                      {record.receiptNo && (
                        <>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handlePrintReceipt(record.receiptNo)}
                          >
                            <FiPrinter size={14} />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleDownloadReceipt(record.receiptNo)}
                          >
                            <FiDownload size={14} />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No fee records found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentFeeDetails;
